export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, applyReservationDiscountSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const log = logger.child({ tenantId, reservationId: id });

  try {
    const body = await request.json();
    const validated = validateBody(body, applyReservationDiscountSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { code } = validated.data;

    // Verify reservation exists and belongs to tenant
    const reservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // 1. Try DiscountCode first
    const discountCode = await prisma.discountCode.findUnique({
      where: { tenantId_code: { tenantId, code } },
    });

    if (discountCode) {
      return await applyDiscountCode(discountCode, reservation, tenantId, log);
    }

    // 2. Try CompensationVoucher
    const voucher = await prisma.compensationVoucher.findUnique({
      where: { tenantId_code: { tenantId, code } },
    });

    if (voucher) {
      return await applyVoucher(voucher, reservation, tenantId, log);
    }

    return NextResponse.json(
      { error: "Codigo no encontrado. Verifica que el codigo es correcto." },
      { status: 404 }
    );
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al aplicar descuento",
      code: "APPLY_DISCOUNT_ERROR",
      logContext: { tenantId, reservationId: id },
    });
  }
}

// ---------- Discount Code ----------
async function applyDiscountCode(
  discountCode: { id: string; code: string; type: string; value: number; expirationDate: Date | null; maxUses: number; usedCount: number; isActive: boolean },
  reservation: { id: string; totalPrice: number; discount: number },
  tenantId: string,
  log: Pick<typeof logger, "info" | "error" | "warn">
) {
  // Validations
  if (!discountCode.isActive) {
    return NextResponse.json({ error: "Este codigo esta desactivado" }, { status: 400 });
  }
  if (discountCode.expirationDate && discountCode.expirationDate < new Date()) {
    return NextResponse.json({ error: "Este codigo ha expirado" }, { status: 400 });
  }
  if (discountCode.maxUses > 0 && discountCode.usedCount >= discountCode.maxUses) {
    return NextResponse.json({ error: "Este codigo ha alcanzado el limite de usos" }, { status: 400 });
  }

  // Calculate discount
  const originalTotal = reservation.totalPrice;
  let discountAmount: number;

  if (discountCode.type === "percentage") {
    discountAmount = Math.round((originalTotal * discountCode.value) / 100 * 100) / 100;
  } else {
    discountAmount = Math.min(discountCode.value, originalTotal);
  }

  const newTotal = Math.max(0, Math.round((originalTotal - discountAmount) * 100) / 100);

  // Apply in transaction
  const [updated] = await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        totalPrice: newTotal,
        discount: reservation.discount + discountAmount,
        couponCode: discountCode.code,
      },
      include: { quote: { select: { id: true, clientName: true } } },
    }),
    prisma.discountCode.update({
      where: { id: discountCode.id },
      data: { usedCount: { increment: 1 } },
    }),
    prisma.discountCodeUse.create({
      data: {
        tenantId,
        codeId: discountCode.id,
        originalAmount: originalTotal,
        finalAmount: newTotal,
        discountAmount,
        channel: "crm",
        reservationId: reservation.id,
      },
    }),
  ]);

  log.info(
    { code: discountCode.code, discountAmount, newTotal },
    "Discount code applied to reservation"
  );

  return NextResponse.json({
    reservation: updated,
    discount: {
      type: "discount_code",
      code: discountCode.code,
      discountType: discountCode.type,
      value: discountCode.value,
      discountAmount,
      originalTotal,
      newTotal,
    },
  });
}

// ---------- Compensation Voucher ----------
async function applyVoucher(
  voucher: { id: string; code: string; type: string; value: number; expirationDate: Date | null; isUsed: boolean },
  reservation: { id: string; totalPrice: number; discount: number },
  tenantId: string,
  log: Pick<typeof logger, "info" | "error" | "warn">
) {
  if (voucher.isUsed) {
    return NextResponse.json({ error: "Este bono ya ha sido utilizado" }, { status: 400 });
  }
  if (voucher.expirationDate && voucher.expirationDate < new Date()) {
    return NextResponse.json({ error: "Este bono ha expirado" }, { status: 400 });
  }

  const originalTotal = reservation.totalPrice;
  const discountAmount = Math.min(voucher.value, originalTotal);
  const newTotal = Math.max(0, Math.round((originalTotal - discountAmount) * 100) / 100);

  const [updated] = await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        totalPrice: newTotal,
        discount: reservation.discount + discountAmount,
        couponCode: voucher.code,
      },
      include: { quote: { select: { id: true, clientName: true } } },
    }),
    prisma.compensationVoucher.update({
      where: { id: voucher.id },
      data: { isUsed: true },
    }),
  ]);

  log.info(
    { code: voucher.code, discountAmount, newTotal },
    "Compensation voucher applied to reservation"
  );

  return NextResponse.json({
    reservation: updated,
    discount: {
      type: "compensation_voucher",
      code: voucher.code,
      voucherType: voucher.type,
      value: voucher.value,
      discountAmount,
      originalTotal,
      newTotal,
    },
  });
}
