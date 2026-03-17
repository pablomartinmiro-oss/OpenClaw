import axios, { AxiosError } from "axios";
import crypto from "crypto";
import { env } from "@/lib/env";
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
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.GHL_CLIENT_ID,
    redirect_uri: env.GHL_REDIRECT_URI,
    scope: SCOPES,
    state,
  });

  return `${GHL_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GHLTokenResponse> {
  const log = logger.child({ fn: "exchangeCodeForTokens" });

  log.info(
    { redirectUri: env.GHL_REDIRECT_URI },
    "Exchanging authorization code for tokens"
  );

  const body = new URLSearchParams({
    client_id: env.GHL_CLIENT_ID,
    client_secret: env.GHL_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: env.GHL_REDIRECT_URI,
  });

  try {
    const res = await axios.post(GHL_TOKEN_URL, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    log.info(
      { locationId: res.data.locationId },
      "GHL tokens obtained successfully"
    );

    return res.data as GHLTokenResponse;
  } catch (err) {
    if (err instanceof AxiosError) {
      log.error(
        {
          status: err.response?.status,
          body: err.response?.data,
          redirectUri: env.GHL_REDIRECT_URI,
        },
        "GHL token exchange failed — HTTP %d",
        err.response?.status ?? 0
      );
    }
    throw err;
  }
}
