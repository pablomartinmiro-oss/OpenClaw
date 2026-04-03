export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/tpv/sales/${id}`,
  });

  try {
    const sale = await prisma.tpvSale.findFirst({
      where: { id, tenantId },
      include: {
        items: true,
        session: {
          select: {
            id: true,
            register: { select: { name: true } },
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    log.info({ saleId: id }, "TPV sale detail fetched");
    return NextResponse.json({ sale });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener venta",
      code: "SALE_DETAIL_ERROR",
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
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/tpv/sales/${id}`,
  });

  try {
    const existing = await prisma.tpvSale.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    // Cascade: Prisma onDelete Cascade handles TpvSaleItem
    await prisma.tpvSale.delete({ where: { id } });

    log.info({ saleId: id }, "TPV sale deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar venta",
      code: "SALE_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
