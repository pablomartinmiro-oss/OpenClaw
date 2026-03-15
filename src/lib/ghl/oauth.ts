import axios from "axios";
import crypto from "crypto";
import { logger } from "@/lib/logger";
import type { GHLTokenResponse } from "./types";

const GHL_AUTH_URL = "https://marketplace.gohighlevel.com/oauth/chooselocation";
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";

const SCOPES = [
  "contacts.readonly",
  "contacts.write",
  "conversations.readonly",
  "conversations.write",
  "conversations/message.readonly",
  "conversations/message.write",
  "opportunities.readonly",
  "opportunities.write",
  "locations.readonly",
  "users.readonly",
].join(" ");

/**
 * Build a signed state param: tenantId.origin.hmac
 * origin = "onboarding" | "settings" (where to redirect after callback)
 */
export function buildOAuthState(
  tenantId: string,
  origin: "onboarding" | "settings"
): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
  const payload = `${tenantId}.${origin}`;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .slice(0, 16); // 16 hex chars is plenty for CSRF
  return `${payload}.${hmac}`;
}

/**
 * Verify and parse a signed state param.
 * Returns { tenantId, origin } or null if invalid.
 */
export function verifyOAuthState(
  state: string
): { tenantId: string; origin: "onboarding" | "settings" } | null {
  const parts = state.split(".");
  if (parts.length !== 3) return null;

  const [tenantId, origin, hmac] = parts;
  if (origin !== "onboarding" && origin !== "settings") return null;

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
  const expectedHmac = crypto
    .createHmac("sha256", secret)
    .update(`${tenantId}.${origin}`)
    .digest("hex")
    .slice(0, 16);

  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
    return null;
  }

  return { tenantId, origin };
}

export function getAuthorizeUrl(state: string): string {
  const clientId = process.env.GHL_CLIENT_ID;
  const redirectUri = process.env.GHL_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("GHL_CLIENT_ID and GHL_REDIRECT_URI must be set");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });

  return `${GHL_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GHLTokenResponse> {
  const clientId = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;
  const redirectUri = process.env.GHL_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("GHL OAuth env vars not configured");
  }

  logger.info("Exchanging authorization code for tokens");

  // GHL token endpoint requires x-www-form-urlencoded
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await axios.post(GHL_TOKEN_URL, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  logger.info(
    { locationId: res.data.locationId },
    "GHL tokens obtained successfully"
  );

  return res.data as GHLTokenResponse;
}
