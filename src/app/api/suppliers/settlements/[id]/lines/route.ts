export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createSettlementLineSchema,
} from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}/lines`,
  });

  try {
    const settlement = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!settlement) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    const lines = await prisma.settlementLine.findMany({
      where: { settlementId: id, tenantId },
      orderBy: { serviceDate: "asc" },
    });

    log.info({ count: lines.length }, "Settlement lines fetched");
    return NextResponse.json({ lines });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener lineas de liquidacion",
      code: "SETTLEMENT_LINES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}/lines`,
  });

  try {
    const settlement = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
    });
    if (!settlement) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, createSettlementLineSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const line = await prisma.$transaction(async (tx) => {
      const created = await tx.settlementLine.create({
        data: {
          tenantId,
          settlementId: id,
          serviceType: data.serviceType,
          productId: data.productId ?? null,
          serviceDate: data.serviceDate,
          paxCount: data.paxCount,
          saleAmount: data.saleAmount,
          commissionPercentage: data.commissionPercentage,
          commissionAmount: data.commissionAmount,
          reservationId: data.reservationId ?? null,
          invoiceId: data.invoiceId ?? null,
        },
      });

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

      return created;
    });

    log.info({ lineId: line.id }, "Settlement line created");
    return NextResponse.json({ line }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear linea de liquidacion",
      code: "SETTLEMENT_LINE_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
