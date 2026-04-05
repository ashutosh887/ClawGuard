import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { previewExchange } from "@/lib/token-vault";
import { checkAnomaly } from "@/lib/anomaly-shield";

export async function POST(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tool, connection, scopes } = await req.json();
  const userId = session.user.sub;

  const preview = await previewExchange({ userId, connection, scopes });
  const anomaly = await checkAnomaly({ userId, connection, action: tool, scopes });

  const riskLabel = preview.riskLevel === "high" ? "HIGH RISK" : preview.riskLevel === "medium" ? "MEDIUM RISK" : "LOW RISK";

  return NextResponse.json({
    tool,
    connection: preview.connection,
    scopes: preview.scopes,
    riskLevel: preview.riskLevel,
    permitted: preview.permitted,
    requiresCiba: anomaly.requiresCiba,
    anomalyWarning: anomaly.reason ?? null,
    message: `This will use: ${scopes.join(", ")} via ${connection} (${riskLabel})`,
  });
}
