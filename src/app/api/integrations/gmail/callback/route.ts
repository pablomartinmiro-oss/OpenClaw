import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PABLO_USER_ID = "pablo";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/chief-of-staff?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/chief-of-staff?error=no_code", request.url)
    );
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || "https://openclaw-production-50e4.up.railway.app/api/integrations/gmail/callback";

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/chief-of-staff?error=missing_credentials", request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("Token exchange failed:", err);
      return NextResponse.redirect(
        new URL("/chief-of-staff?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
    };

    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    // Save or update integration
    await (prisma as any).integration.upsert({
      where: { userId_provider: { userId: PABLO_USER_ID, provider: "gmail" } },
      create: {
        userId: PABLO_USER_ID,
        provider: "gmail",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry,
        metadata: { connectedAt: new Date().toISOString() },
      },
      update: {
        accessToken: tokens.access_token,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        tokenExpiry,
        updatedAt: new Date(),
      },
    });

    // Redirect to chief-of-staff page with success
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openclaw-production-50e4.up.railway.app";
    return NextResponse.redirect(`${baseUrl}/chief-of-staff?gmail=connected`);
  } catch (err) {
    console.error("Gmail callback error:", err);
    return NextResponse.redirect(
      new URL("/chief-of-staff?error=callback_failed", request.url)
    );
  }
}
