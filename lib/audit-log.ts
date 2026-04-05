export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  connection: string;
  scopes: string[];
  riskLevel?: "low" | "medium" | "high";
  cibaStatus?: "pending" | "approved" | "denied";
  revoked?: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

type AuditListener = (entry: AuditEntry) => void;

class AuditLog {
  private entries: AuditEntry[] = [];
  private listeners = new Set<AuditListener>();
  private counter = 0;

  async record(partial: Omit<AuditEntry, "id" | "timestamp">): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: `aud_${++this.counter}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...partial,
    };
    this.entries.push(entry);
    if (this.entries.length > 1000) this.entries = this.entries.slice(-1000);

    for (const fn of this.listeners) {
      try { fn(entry); } catch { this.listeners.delete(fn); }
    }
    return entry;
  }

  getEntries(userId?: string, limit = 50): AuditEntry[] {
    const filtered = userId ? this.entries.filter((e) => e.userId === userId) : this.entries;
    return filtered.slice(-limit).reverse();
  }

  subscribe(fn: AuditListener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }
}

export const auditLog = new AuditLog();
