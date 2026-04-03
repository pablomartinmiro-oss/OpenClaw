export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateCompensationVoucherSchema,
} from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/storefront/vouchers/${id}`,
  });

  try {
    const existing = await prisma.compensationVoucher.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Bono de compensacion no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateCompensationVoucherSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const voucher = await prisma.compensationVoucher.update({
      where: { id },
      data: {
        ...(data.isUsed !== undefined && { isUsed: data.isUsed }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.expirationDate !== undefined && {
          expirationDate: data.expirationDate ?? null,
        }),
        ...(data.linkedDiscountCodeId !== undefined && {
          linkedDiscountCodeId: data.linkedDiscountCodeId ?? null,
        }),
      },
    });

    log.info({ voucherId: id }, "Compensation voucher updated");
    return NextResponse.json({ voucher });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar bono de compensacion",
      code: "VOUCHER_UPDATE_ERROR",
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
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/storefront/vouchers/${id}`,
  });

  try {
    const existing = await prisma.compensationVoucher.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Bono de compensacion no encontrado" },
        { status: 404 }
      );
    }

    await prisma.compensationVoucher.delete({ where: { id } });

    log.info({ voucherId: id }, "Compensation voucher deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar bono de compensacion",
      code: "VOUCHER_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
