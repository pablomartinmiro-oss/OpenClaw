export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, closeCashSessionSchema } from "@/lib/validation";

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
    path: `/api/tpv/sessions/${id}`,
  });

  try {
    const cashSession = await prisma.cashSession.findFirst({
      where: { id, tenantId },
      include: {
        register: { select: { id: true, name: true } },
        openedBy: { select: { id: true, name: true } },
        movements: { orderBy: { timestamp: "desc" } },
        sales: {
          include: { items: true },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!cashSession) {
      return NextResponse.json(
        { error: "Sesion no encontrada" },
        { status: 404 }
      );
    }

    log.info({ sessionId: id }, "Cash session detail fetched");
    return NextResponse.json({ session: cashSession });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener sesion de caja",
      code: "SESSION_DETAIL_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
  request: NextRequest,
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
    path: `/api/tpv/sessions/${id}`,
  });

  try {
    const existing = await prisma.cashSession.findFirst({
      where: { id, tenantId },
      include: {
        sales: { select: { paymentMethods: true } },
        movements: { select: { type: true, amount: true } },
      },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Sesion no encontrada" },
        { status: 404 }
      );
    }
    if (existing.status === "closed") {
      return NextResponse.json(
        { error: "La sesion ya esta cerrada" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, closeCashSessionSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Calculate totals from sales
    let calcCash = 0;
    let calcCard = 0;
    let calcBizum = 0;
    for (const sale of existing.sales) {
      const pm = sale.paymentMethods as {
        cash?: number;
        card?: number;
        bizum?: number;
      };
      calcCash += pm.cash ?? 0;
      calcCard += pm.card ?? 0;
      calcBizum += pm.bizum ?? 0;
    }

    // Add movements
    for (const mov of existing.movements) {
      if (mov.type === "in") calcCash += mov.amount;
      else calcCash -= mov.amount;
    }

    const totalCash = data.totalCash ?? calcCash;
    const totalCard = data.totalCard ?? calcCard;
    const totalBizum = data.totalBizum ?? calcBizum;

    // Discrepancy = closing amount - (opening + cash sales + movements)
    const expectedCash = existing.openingAmount + calcCash;
    const discrepancy =
      Math.round((data.closingAmount - expectedCash) * 100) / 100;

    const cashSession = await prisma.cashSession.update({
      where: { id },
      data: {
        closingAmount: data.closingAmount,
        totalCash,
        totalCard,
        totalBizum,
        discrepancy,
        status: "closed",
        closedAt: new Date(),
      },
      include: {
        register: { select: { id: true, name: true } },
        openedBy: { select: { id: true, name: true } },
      },
    });

    log.info(
      { sessionId: id, discrepancy },
      "Cash session closed"
    );
    return NextResponse.json({ session: cashSession });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cerrar sesion de caja",
      code: "SESSION_CLOSE_ERROR",
      logContext: { tenantId },
    });
  }
}
