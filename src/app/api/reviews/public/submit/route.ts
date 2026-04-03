export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  publicSubmitReviewSchema,
} from "@/lib/validation";
import { redis } from "@/lib/cache/redis";

/**
 * Public route — NO AUTH required.
 * Rate limited: 5 submissions per IP per hour.
 */
export async function POST(request: NextRequest) {
  const log = logger.child({ path: "/api/reviews/public/submit" });

  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const rateLimitKey = `review-submit:${ip}`;

    if (redis) {
      const count = await redis.incr(rateLimitKey);
      if (count === 1) {
        await redis.expire(rateLimitKey, 3600); // 1 hour
      }
      if (count > 5) {
        return NextResponse.json(
          { error: "Demasiados envios. Intenta de nuevo mas tarde." },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const validated = validateBody(body, publicSubmitReviewSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant not found" },
        { status: 404 }
      );
    }

    // Verify module is enabled
    const moduleConfig = await prisma.moduleConfig.findFirst({
      where: {
        tenantId: data.tenantId,
        module: "reviews",
        isEnabled: true,
      },
    });
    if (!moduleConfig) {
      return NextResponse.json(
        { error: "Reviews not enabled for this tenant" },
        { status: 403 }
      );
    }

    const review = await prisma.review.create({
      data: {
        tenantId: data.tenantId,
        entityType: data.entityType,
        entityId: data.entityId,
        rating: data.rating,
        authorName: data.authorName,
        authorEmail: data.authorEmail ?? null,
        title: data.title ?? null,
        body: data.body,
        stayDate: data.stayDate ?? null,
        status: "pending",
      },
    });

    log.info(
      { reviewId: review.id, tenantId: data.tenantId },
      "Public review submitted"
    );
    return NextResponse.json(
      { success: true, reviewId: review.id },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to submit review",
      code: "REVIEWS_PUBLIC_SUBMIT_ERROR",
    });
  }
}
