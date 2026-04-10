export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateReservationSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
      include: { quote: { select: { id: true, clientName: true } } },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch reservation",
      code: "RESERVATION_GET_ERROR",
      logContext: { tenantId, reservationId: id },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const log = logger.child({ tenantId, reservationId: id });

  try {
    const existing = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const raw = await request.json();
    const validation = validateBody(raw, updateReservationSchema);
    if (!validation.ok) {
      return NextResponse.json({ error: "Datos de entrada inválidos", details: validation.error }, { status: 400 });
    }

    const {
      participants, services,
      status,
      ...scalarFields
    } = validation.data;

    const updateData: Record<string, unknown> = { ...scalarFields };
    if (participants !== undefined) {
      updateData.participants = participants ? JSON.parse(JSON.stringify(participants)) : null;
    }
    if (services !== undefined) {
      updateData.services = services ? JSON.parse(JSON.stringify(services)) : null;
    }

    if (status !== undefined) updateData.status = status;

    // Track notification sending
    if (status === "confirmada" || status === "sin_disponibilidad") {
      if (updateData.notificationType) {
        updateData.emailSentAt = new Date();
        updateData.whatsappSentAt = new Date();
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    // Planning engine: generate operational units when confirmed
    if (status === "confirmada") {
      try {
        const { onReservationConfirmed } = await import("@/lib/planning/operational-units");
        await onReservationConfirmed(tenantId, id);
      } catch (e) {
        log.warn(e, "Failed to generate OUs (non-blocking)");
      }
    }

    log.info({ status }, "Reservation updated");
    return NextResponse.json({ reservation });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update reservation",
      code: "RESERVATION_UPDATE_ERROR",
      logContext: { tenantId, reservationId: id },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const log = logger.child({ tenantId, reservationId: id });

  try {
    const existing = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.reservation.delete({ where: { id } });

    log.info({ reservationId: id }, "Reservation deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete reservation",
      code: "RESERVATION_DELETE_ERROR",
      logContext: { tenantId, reservationId: id },
    });
  }
}
