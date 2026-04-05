export interface QueuedRequest {
  id: string;
  timestamp: string;
  toolName: string;
  params: Record<string, unknown>;
  status: "queued" | "replaying" | "completed" | "failed";
  result?: unknown;
  error?: string;
}

class RequestQueue {
  private queues = new Map<string, QueuedRequest[]>();

  enqueue(userId: string, req: Pick<QueuedRequest, "toolName" | "params">): QueuedRequest {
    const entry: QueuedRequest = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      status: "queued",
      ...req,
    };
    const q = this.queues.get(userId) ?? [];
    q.push(entry);
    this.queues.set(userId, q);
    return entry;
  }

  getPending(userId: string) {
    return (this.queues.get(userId) ?? []).filter((r) => r.status === "queued");
  }

  update(userId: string, id: string, status: QueuedRequest["status"], result?: unknown, error?: string) {
    const entry = (this.queues.get(userId) ?? []).find((r) => r.id === id);
    if (!entry) return;
    entry.status = status;
    if (result !== undefined) entry.result = result;
    if (error !== undefined) entry.error = error;
  }

  getAll(userId: string) { return this.queues.get(userId) ?? []; }
}

export const requestQueue = new RequestQueue();
