import { getManagementToken } from "./auth0";
import { auditLog } from "./audit-log";
import config from "@/config";

const HIGH_RISK = ["events.create", "events.delete", "mail.send", "repo.delete", "admin"];
const MED_RISK = ["events.read", "mail.read", "repo.write", "chat:write"];

export function assessRisk(scopes: string[]): "low" | "medium" | "high" {
  const joined = scopes.join(" ");
  if (HIGH_RISK.some((h) => joined.includes(h))) return "high";
  if (MED_RISK.some((m) => joined.includes(m))) return "medium";
  return "low";
}

export async function previewExchange(params: {
  userId: string;
  connection: string;
  scopes: string[];
}) {
  const risk = assessRisk(params.scopes);
  await auditLog.record({
    userId: params.userId, action: "preview", connection: params.connection,
    scopes: params.scopes, riskLevel: risk,
  });
  return { permitted: true, scopes: params.scopes, connection: params.connection, riskLevel: risk };
}

export async function revokeAllTokens(userId: string) {
  const mgmt = await getManagementToken();
  const connections = [
    config.connections.google,
    config.connections.slack,
    config.connections.github,
  ];

  const results = await Promise.allSettled(
    connections.map(async (conn) => {
      const res = await fetch(
        `https://${config.auth0.domain}/api/v2/users/${encodeURIComponent(userId)}/federated-connections/${conn}/tokens`,
        { method: "DELETE", headers: { Authorization: `Bearer ${mgmt}` } }
      );
      return { connection: conn, ok: res.ok, status: res.status };
    })
  );

  await auditLog.record({
    userId, action: "bulk_revoke", connection: "all", scopes: [], revoked: true, riskLevel: "high",
    meta: { results: results.map((r) => r.status === "fulfilled" ? r.value : { error: String(r) }) },
  });

  return results;
}
