import { auditLog } from "./audit-log";

export interface AnomalyResult {
  allowed: boolean;
  reason?: string;
  requiresCiba: boolean;
}

const windows = new Map<string, { count: number; start: number }>();

const RULES = {
  maxWritesPerMinute: 5,
  maxCallsPerMinute: 20,
  suspiciousHours: { start: 1, end: 6 },
  highRiskTerms: ["delete", "admin", "transfer", "remove", "drop"],
} as const;

function rateOk(key: string, max: number): boolean {
  const now = Date.now();
  const w = windows.get(key);
  if (!w || now - w.start > 60_000) {
    windows.set(key, { count: 1, start: now });
    return true;
  }
  return ++w.count <= max;
}

function isSuspiciousHour(): boolean {
  const h = new Date().getUTCHours();
  return h >= RULES.suspiciousHours.start && h < RULES.suspiciousHours.end;
}

function isHighRisk(action: string, scopes: string[]): boolean {
  const all = [action, ...scopes].join(" ").toLowerCase();
  return RULES.highRiskTerms.some((t) => all.includes(t));
}

export async function checkAnomaly(params: {
  userId: string;
  connection: string;
  action: string;
  scopes: string[];
}): Promise<AnomalyResult> {
  const { userId, connection, action, scopes } = params;
  const isWrite = scopes.some((s) =>
    /write|create|send|post|delete/.test(s)
  );

  if (isWrite && !rateOk(`${userId}:${connection}:write`, RULES.maxWritesPerMinute)) {
    await auditLog.record({
      userId, action: "anomaly_blocked", connection, scopes, riskLevel: "high",
      error: `>${RULES.maxWritesPerMinute} writes/min on ${connection}`,
    });
    return { allowed: false, reason: `Write rate limit exceeded on ${connection}. Agent paused.`, requiresCiba: true };
  }

  if (!rateOk(`${userId}:all:overall`, RULES.maxCallsPerMinute)) {
    await auditLog.record({
      userId, action: "anomaly_throttled", connection, scopes, riskLevel: "medium",
      error: "Overall rate limit exceeded",
    });
    return { allowed: false, reason: "Too many API calls/min. Agent paused.", requiresCiba: true };
  }

  if (isSuspiciousHour() && isWrite) {
    await auditLog.record({
      userId, action: "anomaly_suspicious_hour", connection, scopes, riskLevel: "medium",
    });
    return { allowed: true, reason: "Unusual hour — CIBA step-up required.", requiresCiba: true };
  }

  if (isHighRisk(action, scopes)) {
    return { allowed: true, reason: "High-risk action — CIBA step-up required.", requiresCiba: true };
  }

  return { allowed: true, requiresCiba: false };
}
