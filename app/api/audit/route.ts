import { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0";
import { auditLog, type AuditEntry } from "@/lib/audit-log";

export async function GET(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.sub;
  const stream = req.nextUrl.searchParams.get("stream") === "true";

  if (!stream) {
    return Response.json({ entries: auditLog.getEntries(userId) });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      for (const entry of auditLog.getEntries(userId, 20).reverse()) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(entry)}\n\n`));
      }

      const unsub = auditLog.subscribe((entry: AuditEntry) => {
        if (entry.userId === userId) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(entry)}\n\n`));
          } catch { unsub(); }
        }
      });

      req.signal.addEventListener("abort", () => { unsub(); controller.close(); });
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
