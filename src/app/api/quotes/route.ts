import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const log = logger.child({ tenantId, path: "/api/quotes" });
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const destination = searchParams.get("destination");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;
    if (destination) where.destination = destination;

    const quotes = await prisma.quote.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: quotes.length }, "Quotes fetched");
    return NextResponse.json({ quotes });
  } catch (error) {
    log.error({ error }, "Failed to fetch quotes");
    return NextResponse.json(
      { error: "Failed to fetch quotes", code: "QUOTES_ERROR" },
      { status: 500 }
    );
  }
}
