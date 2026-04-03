export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rl = await rateLimit(getClientIP(request), "public");
  if (rl) return rl;
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
      commit: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 7) ?? "local",
      node: process.version,
    },
    { status: 200 }
  );
}
