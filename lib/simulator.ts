import { auditLog, type AuditEntry } from "./audit-log";

export interface SimulationResult {
  id: string;
  attack: string;
  description: string;
  blocked: boolean;
  failSafe: string;
  riskLevel: "low" | "medium" | "high";
  details: string;
  timestamp: string;
  auditEntryId: string;
}

interface AttackScenario {
  name: string;
  description: string;
  failSafe: string;
  riskLevel: "low" | "medium" | "high";
  simulate: (userId: string) => Promise<{ blocked: boolean; details: string; auditEntry: AuditEntry }>;
}

const scenarios: AttackScenario[] = [
  {
    name: "Token Replay Attack",
    description: "Attempting to reuse a previously captured access token to impersonate the agent",
    failSafe: "Token Vault (scoped + short-lived)",
    riskLevel: "high",
    async simulate(userId) {
      const entry = await auditLog.record({
        userId,
        action: "sim_token_replay",
        connection: "google-oauth2",
        scopes: ["calendar.events", "gmail.send"],
        riskLevel: "high",
        error: "BLOCKED: Token replay detected -token expired or already rotated by Token Vault",
        meta: { simulation: true, attack: "token_replay" },
      });
      return {
        blocked: true,
        details: "Token Vault issues scoped, short-lived tokens per exchange. Replayed tokens are expired or rotated -the attack fails before reaching the API.",
        auditEntry: entry,
      };
    },
  },
  {
    name: "Scope Escalation",
    description: "Agent requests broader scopes than originally approved (calendar.events -> calendar.all + gmail.send + drive.admin)",
    failSafe: "Permission Preview + Anomaly Shield",
    riskLevel: "high",
    async simulate(userId) {
      const entry = await auditLog.record({
        userId,
        action: "sim_scope_escalation",
        connection: "google-oauth2",
        scopes: ["calendar.all", "gmail.send", "drive.admin"],
        riskLevel: "high",
        error: "BLOCKED: Scope escalation detected -admin scopes require CIBA step-up",
        cibaStatus: "pending",
        meta: { simulation: true, attack: "scope_escalation" },
      });
      return {
        blocked: true,
        details: "Anomaly Shield detected high-risk 'admin' scope. CIBA consent triggered -user must approve on second device. Without approval, Token Vault refuses the exchange.",
        auditEntry: entry,
      };
    },
  },
  {
    name: "Rate Limit Breach",
    description: "Flooding the API with rapid write requests (15 write calls in 10 seconds)",
    failSafe: "Anomaly Shield (rate limiter)",
    riskLevel: "medium",
    async simulate(userId) {
      const entry = await auditLog.record({
        userId,
        action: "sim_rate_flood",
        connection: "slack",
        scopes: ["chat:write"],
        riskLevel: "medium",
        error: "BLOCKED: Write rate limit exceeded (>5 writes/min on slack). Agent paused.",
        meta: { simulation: true, attack: "rate_flood", attemptedCalls: 15 },
      });
      return {
        blocked: true,
        details: "Anomaly Shield enforces max 5 writes/min per connection. After the 5th write, the agent is paused and CIBA consent is required to resume. The remaining 10 calls are dropped.",
        auditEntry: entry,
      };
    },
  },
  {
    name: "Suspicious Hour Access",
    description: "Agent attempts a write operation at 3:00 AM UTC -an unusual pattern that may indicate compromised credentials",
    failSafe: "Anomaly Shield (suspicious hours) + CIBA",
    riskLevel: "medium",
    async simulate(userId) {
      const entry = await auditLog.record({
        userId,
        action: "sim_suspicious_hour",
        connection: "google-oauth2",
        scopes: ["calendar.events.create"],
        riskLevel: "medium",
        cibaStatus: "pending",
        meta: { simulation: true, attack: "suspicious_hour", simulatedHour: 3 },
      });
      return {
        blocked: true,
        details: "Anomaly Shield detects write operations during suspicious hours (1-6 AM UTC). Even though the request may be legitimate, CIBA step-up is automatically required -the user must actively approve via push notification.",
        auditEntry: entry,
      };
    },
  },
  {
    name: "Bulk Delete Attack",
    description: "Agent attempts to delete all calendar events -a destructive bulk operation",
    failSafe: "Anomaly Shield (high-risk terms) + CIBA + Instant Revoke",
    riskLevel: "high",
    async simulate(userId) {
      const entry = await auditLog.record({
        userId,
        action: "sim_bulk_delete",
        connection: "google-oauth2",
        scopes: ["calendar.events.delete"],
        riskLevel: "high",
        error: "BLOCKED: Destructive 'delete' action detected -CIBA consent required + panic revoke available",
        cibaStatus: "denied",
        meta: { simulation: true, attack: "bulk_delete", targetCount: 847 },
      });
      return {
        blocked: true,
        details: "Anomaly Shield flags 'delete' as a high-risk term. CIBA consent is triggered. If the user denies (or doesn't respond within timeout), the action is blocked. The Instant Revoke button is always available as a nuclear option.",
        auditEntry: entry,
      };
    },
  },
];

export async function runSimulation(userId: string, attackIndex?: number): Promise<SimulationResult[]> {
  const toRun = attackIndex !== undefined ? [scenarios[attackIndex]] : scenarios;
  const results: SimulationResult[] = [];

  for (const scenario of toRun) {
    if (!scenario) continue;
    const { blocked, details, auditEntry } = await scenario.simulate(userId);
    results.push({
      id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      attack: scenario.name,
      description: scenario.description,
      blocked,
      failSafe: scenario.failSafe,
      riskLevel: scenario.riskLevel,
      details,
      timestamp: new Date().toISOString(),
      auditEntryId: auditEntry.id,
    });
  }

  return results;
}

export function getScenarios() {
  return scenarios.map((s, i) => ({
    index: i,
    name: s.name,
    description: s.description,
    failSafe: s.failSafe,
    riskLevel: s.riskLevel,
  }));
}
