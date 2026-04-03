export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateRoomRateSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/hotel/rates/${id}`,
  });

  try {
    const existing = await prisma.roomRate.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Rate not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateRoomRateSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const rate = await prisma.roomRate.update({
      where: { id },
      data: {
        ...(data.price !== undefined && { price: data.price }),
        ...(data.supplement !== undefined && {
          supplement: data.supplement,
        }),
      },
    });

    log.info({ rateId: id }, "Rate updated");
    return NextResponse.json({ rate });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update rate",
      code: "RATES_ERROR",
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
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/hotel/rates/${id}`,
  });

  try {
    const existing = await prisma.roomRate.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Rate not found" },
        { status: 404 }
      );
    }

    await prisma.roomRate.delete({ where: { id } });

    log.info({ rateId: id }, "Rate deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete rate",
      code: "RATES_ERROR",
      logContext: { tenantId },
    });
  }
}
