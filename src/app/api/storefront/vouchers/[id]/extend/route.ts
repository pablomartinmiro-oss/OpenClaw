export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, extendVoucherSchema } from "@/lib/validation";

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
    path: `/api/storefront/vouchers/${id}/extend`,
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

    if (existing.isUsed) {
      return NextResponse.json(
        { error: "No se puede extender un bono ya utilizado" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, extendVoucherSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const voucher = await prisma.compensationVoucher.update({
      where: { id },
      data: { expirationDate: validated.data.newExpirationDate },
    });

    // Also extend linked discount code if exists
    if (existing.linkedDiscountCodeId) {
      await prisma.discountCode.update({
        where: { id: existing.linkedDiscountCodeId },
        data: { expirationDate: validated.data.newExpirationDate },
      });
    }

    log.info(
      { voucherId: id, newDate: validated.data.newExpirationDate },
      "Voucher expiration extended"
    );
    return NextResponse.json({ voucher });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al extender fecha del bono",
      code: "VOUCHER_EXTEND_ERROR",
      logContext: { tenantId },
    });
  }
}
