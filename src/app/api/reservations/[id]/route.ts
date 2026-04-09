export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

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

    const body = await request.json() as Record<string, unknown>;

    const ALLOWED_FIELDS = [
      "status", "notes", "internalNotes", "notificationType",
      "clientName", "clientPhone", "clientEmail", "couponCode",
      "station", "activityDate", "schedule", "language",
      "totalPrice", "discount", "paymentMethod", "paymentRef",
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    if (body.participants !== undefined) {
      updateData.participants = JSON.parse(JSON.stringify(body.participants));
    }
    if (body.services !== undefined) {
      updateData.services = JSON.parse(JSON.stringify(body.services));
    }

    // Track notification sending
    const status = updateData.status as string | undefined;
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
