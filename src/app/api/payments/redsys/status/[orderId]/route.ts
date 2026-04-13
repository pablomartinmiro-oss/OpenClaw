export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/db";

/**
 * GET /api/payments/redsys/status/[orderId]
 * Check payment status for a Redsys order.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const [session, authError] = await requireTenant();
    if (authError) return authError;

    const { tenantId } = session;
    const { orderId } = await params;

    const quote = await prisma.quote.findFirst({
      where: { redsysOrderId: orderId, tenantId },
      select: {
        id: true,
        redsysOrderId: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentRef: true,
        paidAt: true,
        totalAmount: true,
        clientName: true,
      },
    });

    if (!quote) return notFound("Pedido Redsys");

    return NextResponse.json({ payment: quote });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al consultar estado del pago",
      code: "REDSYS_STATUS_ERROR",
    });
  }
}
