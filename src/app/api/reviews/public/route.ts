export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

/**
 * Public route — NO AUTH required.
 * Returns only approved reviews for a given tenant + entity.
 */
export async function GET(request: NextRequest) {
  const log = logger.child({ path: "/api/reviews/public" });
  const { searchParams } = request.nextUrl;
  const tenantId = searchParams.get("tenantId");
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  if (!tenantId) {
    return NextResponse.json(
      { error: "tenantId is required" },
      { status: 400 }
    );
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        tenantId,
        status: "approved",
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
      },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        rating: true,
        authorName: true,
        title: true,
        body: true,
        stayDate: true,
        reply: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    log.info(
      { tenantId, count: reviews.length },
      "Public reviews fetched"
    );
    return NextResponse.json({ reviews });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch reviews",
      code: "REVIEWS_PUBLIC_ERROR",
      logContext: { tenantId: tenantId ?? "unknown" },
    });
  }
}
