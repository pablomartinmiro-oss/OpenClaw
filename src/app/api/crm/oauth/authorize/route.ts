export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { getAuthorizeUrl, buildOAuthState } from "@/lib/ghl/oauth";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const rl = await rateLimit(getClientIP(req), "api");
  if (rl) return rl;

  const [session, authError] = await requireTenant();
  if (authError) return authError;

  // Determine origin: if referer contains /settings, redirect back there after OAuth
  const referer = req.headers.get("referer") ?? "";
  const origin = referer.includes("/settings") ? "settings" : "onboarding";

  // Build HMAC-signed state: tenantId.origin.hmac
  const state = buildOAuthState(session.tenantId, origin);
  const authorizeUrl = getAuthorizeUrl(state);

  logger.info(
    { tenantId: session.tenantId, origin },
    "Redirecting to GHL OAuth authorization"
  );

  return NextResponse.redirect(authorizeUrl);
}
