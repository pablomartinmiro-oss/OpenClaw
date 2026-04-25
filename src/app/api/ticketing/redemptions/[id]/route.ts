export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateCouponRedemptionSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/redemptions/${id}`,
  });

  try {
    const existing = await prisma.couponRedemption.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Canje no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateCouponRedemptionSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const updateData: Prisma.CouponRedemptionUpdateInput = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.financialStatus !== undefined)
      updateData.financialStatus = data.financialStatus;
    if (data.ocrExtraction !== undefined)
      updateData.ocrExtraction = data.ocrExtraction
        ? (JSON.parse(JSON.stringify(data.ocrExtraction)) as Prisma.InputJsonValue)
        : Prisma.DbNull;
    if (data.reservationId !== undefined)
      updateData.reservationId = data.reservationId;
    if (data.redeemedAt !== undefined) updateData.redeemedAt = data.redeemedAt;
    if (data.customerName !== undefined) updateData.customerName = data.customerName;
    if (data.platformId !== undefined) {
      updateData.platform = data.platformId
        ? { connect: { id: data.platformId } }
        : { disconnect: true };
    }
    if (data.productId !== undefined) {
      updateData.product = data.productId
        ? { connect: { id: data.productId } }
        : { disconnect: true };
    }
    if (data.skiLevel !== undefined) updateData.skiLevel = data.skiLevel;
    if (data.bootSize !== undefined) updateData.bootSize = data.bootSize;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.numPeople !== undefined) updateData.numPeople = data.numPeople;
    if (data.preferredDate !== undefined) updateData.preferredDate = data.preferredDate;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const redemption = await prisma.couponRedemption.update({
      where: { id },
      data: updateData,
    });

    log.info({ redemptionId: id }, "Redemption updated");
    return NextResponse.json({ redemption });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar canje",
      code: "TICKETING_REDEMPTIONS_ERROR",
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
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/redemptions/${id}`,
  });

  try {
    const existing = await prisma.couponRedemption.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Canje no encontrado" },
        { status: 404 }
      );
    }

    await prisma.couponRedemption.delete({ where: { id } });

    log.info({ redemptionId: id }, "Redemption deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar canje",
      code: "TICKETING_REDEMPTIONS_ERROR",
      logContext: { tenantId },
    });
  }
}
