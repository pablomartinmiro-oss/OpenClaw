export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || "https://openclaw-production-50e4.up.railway.app/api/integrations/gmail/callback";

  if (!clientId) {
    return NextResponse.json({ error: "Gmail client ID not configured" }, { status: 500 });
  }

  const scopes = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/userinfo.email",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent",
    state: "pablo-chief-of-staff",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  return NextResponse.redirect(authUrl);
}
