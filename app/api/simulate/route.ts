import { NextRequest, NextResponse } from "next/server";
import { runSimulation, getScenarios } from "@/lib/simulator";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId = "sim_user";
  const attackIndex = typeof body.attackIndex === "number" ? body.attackIndex : undefined;

  const results = await runSimulation(userId, attackIndex);
  return NextResponse.json({ results });
}

export async function GET() {
  return NextResponse.json({ scenarios: getScenarios() });
}
