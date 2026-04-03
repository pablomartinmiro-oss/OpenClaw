export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createSettlementSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/suppliers/settlements" });
  const { searchParams } = request.nextUrl;
  const supplierId = searchParams.get("supplierId");
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const settlements = await prisma.supplierSettlement.findMany({
      where,
      include: {
        supplier: {
          select: { id: true, fiscalName: true, commercialName: true },
        },
        _count: { select: { lines: true, documents: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: settlements.length }, "Settlements fetched");
    return NextResponse.json({ settlements });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener liquidaciones",
      code: "SETTLEMENTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/suppliers/settlements" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createSettlementSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify supplier belongs to tenant
    const supplier = await prisma.supplier.findFirst({
      where: { id: data.supplierId, tenantId },
    });
    if (!supplier) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }

    // Auto-generate settlement number LIQ-YYYY-NNNN
    const year = new Date().getFullYear();
    const last = await prisma.supplierSettlement.findFirst({
      where: { tenantId, number: { startsWith: `LIQ-${year}-` } },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const seq = last ? parseInt(last.number.split("-")[2]) + 1 : 1;
    const number = `LIQ-${year}-${String(seq).padStart(4, "0")}`;

    const settlement = await prisma.supplierSettlement.create({
      data: {
        tenantId,
        supplierId: data.supplierId,
        number,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        pdfUrl: data.pdfUrl ?? null,
        grossAmount: 0,
        commissionAmount: 0,
        netAmount: 0,
      },
    });

    log.info({ settlementId: settlement.id, number }, "Settlement created");
    return NextResponse.json({ settlement }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear liquidacion",
      code: "SETTLEMENT_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
