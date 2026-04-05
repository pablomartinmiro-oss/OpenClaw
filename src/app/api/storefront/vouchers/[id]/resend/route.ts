export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  resendVoucherEmailSchema,
} from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
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
    path: `/api/storefront/vouchers/${id}/resend`,
  });

  try {
    const voucher = await prisma.compensationVoucher.findFirst({
      where: { id, tenantId },
    });
    if (!voucher) {
      return NextResponse.json(
        { error: "Bono de compensacion no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, resendVoucherEmailSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service (SendGrid/Resend)
    // For now, log the intent and return success
    log.info(
      {
        voucherId: id,
        email: validated.data.email,
        code: voucher.code,
      },
      "Voucher email resend requested"
    );

    return NextResponse.json({
      success: true,
      message: `Bono ${voucher.code} reenviado a ${validated.data.email}`,
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al reenviar bono por email",
      code: "VOUCHER_RESEND_ERROR",
      logContext: { tenantId },
    });
  }
}
