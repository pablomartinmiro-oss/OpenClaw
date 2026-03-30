import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PABLO_USER_ID = "pablo";

export async function GET() {
  try {
    const integration = await (prisma as any).integration.findUnique({
      where: { userId_provider: { userId: PABLO_USER_ID, provider: "gmail" } },
      select: {
        accessToken: true,
        tokenExpiry: true,
        metadata: true,
        updatedAt: true,
      },
    });

    if (!integration || !integration.accessToken) {
      return NextResponse.json({ connected: false });
    }

    const isExpired = integration.tokenExpiry
      ? new Date(integration.tokenExpiry) < new Date()
      : false;

    return NextResponse.json({
      connected: true,
      isExpired,
      lastSync: (integration.metadata as Record<string, unknown>)?.lastSync || null,
      updatedAt: integration.updatedAt,
    });
  } catch (err) {
    console.error("Gmail status error:", err);
    return NextResponse.json({ connected: false });
  }
}
