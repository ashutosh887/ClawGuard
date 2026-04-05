import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { checkAnomaly } from "@/lib/anomaly-shield";
import { auditLog } from "@/lib/audit-log";
import { assessRisk } from "@/lib/token-vault";
import { getCalendarTool, getGmailTool, getSlackTool } from "@/lib/langgraph/agent";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.sub;
  const { tool: toolName, params, connection, scopes } = await req.json();

  const anomaly = await checkAnomaly({ userId, connection, action: toolName, scopes });
  if (!anomaly.allowed) {
    return NextResponse.json(
      { error: "blocked", reason: anomaly.reason, requiresApproval: true },
      { status: 429 }
    );
  }

  let result: unknown;
  try {
    if (toolName === "create_calendar_event") {
      result = await getCalendarTool().invoke(params);
    } else if (toolName === "send_gmail") {
      result = await getGmailTool().invoke(params);
    } else if (toolName === "post_slack_message") {
      result = await getSlackTool().invoke(params);
    } else {
      return NextResponse.json(
        { error: "unknown_tool", available: ["create_calendar_event", "send_gmail", "post_slack_message"] },
        { status: 400 }
      );
    }

    await auditLog.record({
      userId,
      action: `${toolName}_success`,
      connection,
      scopes,
      riskLevel: assessRisk(scopes),
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await auditLog.record({
      userId, action: `${toolName}_failed`, connection, scopes,
      riskLevel: assessRisk(scopes), error: message,
    });
    return NextResponse.json({ error: "tool_failed", details: message }, { status: 502 });
  }
}
