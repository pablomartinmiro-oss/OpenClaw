export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth/config";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  const rl = await rateLimit(getClientIP(req), "auth");
  if (rl) return rl;
  return handlers.POST(req);
}
