export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createCashMovementSchema } from "@/lib/validation";

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
    path: `/api/tpv/sessions/${id}/movements`,
  });

  try {
    // Verify session belongs to tenant
    const cashSession = await prisma.cashSession.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!cashSession) {
      return NextResponse.json(
        { error: "Sesion no encontrada" },
        { status: 404 }
      );
    }

    const movements = await prisma.cashMovement.findMany({
      where: { tenantId, sessionId: id },
      orderBy: { timestamp: "desc" },
    });

    log.info({ count: movements.length }, "Movements fetched");
    return NextResponse.json({ movements });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener movimientos",
      code: "MOVEMENTS_ERROR",
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
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/tpv/sessions/${id}/movements`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCashMovementSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify session belongs to tenant and is open
    const cashSession = await prisma.cashSession.findFirst({
      where: { id, tenantId },
    });
    if (!cashSession) {
      return NextResponse.json(
        { error: "Sesion no encontrada" },
        { status: 404 }
      );
    }
    if (cashSession.status === "closed") {
      return NextResponse.json(
        { error: "No se pueden agregar movimientos a una sesion cerrada" },
        { status: 400 }
      );
    }

    const movement = await prisma.cashMovement.create({
      data: {
        tenantId,
        sessionId: id,
        type: data.type,
        amount: data.amount,
        reason: data.reason,
      },
    });

    log.info({ movementId: movement.id }, "Cash movement created");
    return NextResponse.json({ movement }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear movimiento de caja",
      code: "MOVEMENT_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
