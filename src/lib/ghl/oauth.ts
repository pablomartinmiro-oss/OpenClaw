import axios from "axios";
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
  "campaigns.readonly",
  "funnels.readonly",
].join(" ");

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

  const res = await axios.post(GHL_TOKEN_URL, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  logger.info(
    { locationId: res.data.locationId },
    "GHL tokens obtained successfully"
  );

  return res.data as GHLTokenResponse;
}
