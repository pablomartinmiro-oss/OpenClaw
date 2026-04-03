export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateReviewSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "reviews");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/reviews/${id}`,
  });

  try {
    const existing = await prisma.review.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateReviewSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.reply !== undefined && {
          reply: data.reply ?? null,
        }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.title !== undefined && {
          title: data.title ?? null,
        }),
        ...(data.body !== undefined && { body: data.body }),
      },
    });

    log.info({ reviewId: id }, "Review updated");
    return NextResponse.json({ review });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update review",
      code: "REVIEWS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "reviews");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/reviews/${id}`,
  });

  try {
    const existing = await prisma.review.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    await prisma.review.delete({ where: { id } });

    log.info({ reviewId: id }, "Review deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete review",
      code: "REVIEWS_ERROR",
      logContext: { tenantId },
    });
  }
}
