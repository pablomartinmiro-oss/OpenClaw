export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createReviewSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "reviews");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/reviews" });
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const entityType = searchParams.get("entityType");

  try {
    const where: Prisma.ReviewWhereInput = { tenantId };
    if (status) where.status = status;
    if (entityType) where.entityType = entityType;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: reviews.length }, "Reviews fetched");
    return NextResponse.json({ reviews });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch reviews",
      code: "REVIEWS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "reviews");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/reviews" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createReviewSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const review = await prisma.review.create({
      data: {
        tenantId,
        entityType: data.entityType,
        entityId: data.entityId,
        rating: data.rating,
        authorName: data.authorName,
        authorEmail: data.authorEmail ?? null,
        title: data.title ?? null,
        body: data.body,
        stayDate: data.stayDate ?? null,
        status: data.status,
      },
    });

    log.info({ reviewId: review.id }, "Review created");
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create review",
      code: "REVIEWS_ERROR",
      logContext: { tenantId },
    });
  }
}
