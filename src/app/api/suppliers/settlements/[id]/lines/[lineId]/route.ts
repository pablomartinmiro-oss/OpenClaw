export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string; lineId: string }> };

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id, lineId } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}/lines/${lineId}`,
  });

  try {
    const line = await prisma.settlementLine.findFirst({
      where: { id: lineId, settlementId: id, tenantId },
    });
    if (!line) {
      return NextResponse.json(
        { error: "Linea no encontrada" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.settlementLine.delete({ where: { id: lineId } });

      // Recalculate settlement totals
      const agg = await tx.settlementLine.aggregate({
        where: { settlementId: id, tenantId },
        _sum: { saleAmount: true, commissionAmount: true },
      });
      const gross = agg._sum.saleAmount ?? 0;
      const commission = agg._sum.commissionAmount ?? 0;
      await tx.supplierSettlement.update({
        where: { id },
        data: {
          grossAmount: gross,
          commissionAmount: commission,
          netAmount: gross - commission,
        },
      });
    });

    log.info({ lineId }, "Settlement line deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar linea de liquidacion",
      code: "SETTLEMENT_LINE_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
