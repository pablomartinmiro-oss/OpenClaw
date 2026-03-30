export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getAuthorizeUrl, buildOAuthState } from "@/lib/ghl/oauth";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Determine origin: if referer contains /settings, redirect back there after OAuth
  const referer = req.headers.get("referer") ?? "";
  const origin = referer.includes("/settings") ? "settings" : "onboarding";

  // Build HMAC-signed state: tenantId.origin.hmac
  const state = buildOAuthState(session.user.tenantId, origin);
  const authorizeUrl = getAuthorizeUrl(state);

  logger.info(
    { tenantId: session.user.tenantId, origin },
    "Redirecting to GHL OAuth authorization"
  );

  return NextResponse.redirect(authorizeUrl);
}
