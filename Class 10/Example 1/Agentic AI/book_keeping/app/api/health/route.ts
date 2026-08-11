import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch {
    checks.database = "disconnected";
  }

  checks.agent = process.env.OPENROUTER_API_KEY ? "configured" : "not configured (set OPENROUTER_API_KEY)";

  const allOk = Object.values(checks).every((v) => v === "connected" || v === "configured");

  return NextResponse.json({
    status: allOk ? "ok" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
}
