export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, applyDiscountSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: "/api/storefront/discount-codes/apply",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, applyDiscountSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const { code: inputCode, amount } = validated.data;

    // Find the discount code
    const discountCode = await prisma.discountCode.findUnique({
      where: { tenantId_code: { tenantId, code: inputCode } },
    });

    if (!discountCode) {
      return NextResponse.json(
        { valid: false, error: "Codigo de descuento no encontrado" },
        { status: 404 }
      );
    }

    // Check active
    if (!discountCode.isActive) {
      return NextResponse.json(
        { valid: false, error: "El codigo de descuento esta desactivado" },
        { status: 400 }
      );
    }

    // Check expiration
    if (
      discountCode.expirationDate &&
      new Date(discountCode.expirationDate) < new Date()
    ) {
      return NextResponse.json(
        { valid: false, error: "El codigo de descuento ha caducado" },
        { status: 400 }
      );
    }

    // Check max uses (0 = unlimited)
    if (
      discountCode.maxUses > 0 &&
      discountCode.usedCount >= discountCode.maxUses
    ) {
      return NextResponse.json(
        {
          valid: false,
          error: "El codigo ha alcanzado el limite de usos",
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount: number;
    if (discountCode.type === "percentage") {
      discountAmount = Math.round(amount * (discountCode.value / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(discountCode.value, amount);
    }
    const finalAmount = Math.max(0, Math.round((amount - discountAmount) * 100) / 100);

    log.info(
      { code: inputCode, amount, discountAmount, finalAmount },
      "Discount code applied"
    );

    return NextResponse.json({
      valid: true,
      discountAmount,
      finalAmount,
      code: discountCode,
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al aplicar codigo de descuento",
      code: "DISCOUNT_APPLY_ERROR",
      logContext: { tenantId },
    });
  }
}
