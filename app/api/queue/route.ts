import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { requestQueue } from "@/lib/queue";
import { auditLog } from "@/lib/audit-log";
import config from "@/config";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.sub;
  const body = await req.json();
  const requests: Array<{ toolName: string; params: Record<string, unknown> }> =
    Array.isArray(body) ? body : [body];

  const queued = requests.map((r) => requestQueue.enqueue(userId, r));

  await auditLog.record({
    userId, action: "queue_received", connection: "local", scopes: [],
    meta: { count: queued.length },
  });

  const results = [];
  for (const entry of queued) {
    requestQueue.update(userId, entry.id, "replaying");
    try {
      const toolRes = await fetch(new URL("/api/tool-request", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
        body: JSON.stringify({
          tool: entry.toolName,
          params: entry.params,
          connection: (entry.params.connection as string) ?? config.connections.google,
          scopes: (entry.params.scopes as string[]) ?? [],
        }),
      });
      const result = await toolRes.json();
      requestQueue.update(userId, entry.id, "completed", result);
      results.push({ id: entry.id, status: "completed", result });
    } catch (error) {
      requestQueue.update(userId, entry.id, "failed", undefined, String(error));
      results.push({ id: entry.id, status: "failed", error: String(error) });
    }
  }

  return NextResponse.json({ replayed: results.length, results });
}

export async function GET() {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.sub;
  return NextResponse.json({ pending: requestQueue.getPending(userId), all: requestQueue.getAll(userId) });
}
