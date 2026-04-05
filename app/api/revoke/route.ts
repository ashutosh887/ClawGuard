import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { revokeAllTokens } from "@/lib/token-vault";

export async function POST() {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const results = await revokeAllTokens(session.user.sub);
    return NextResponse.json({
      success: true,
      message: "All tokens revoked. Agent bridge severed.",
      timestamp: new Date().toISOString(),
      results: results.map((r) => r.status === "fulfilled" ? r.value : { error: String(r.reason) }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "revocation_failed", details: String(error) },
      { status: 500 }
    );
  }
}
