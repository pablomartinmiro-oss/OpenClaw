export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateActivityBookingSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/activities/${id}`,
  });

  try {
    const existing = await prisma.activityBooking.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Activity booking not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateActivityBookingSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const booking = await prisma.activityBooking.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.operationalNotes !== undefined && {
          operationalNotes: data.operationalNotes ?? null,
        }),
        ...(data.arrivedClient !== undefined && {
          arrivedClient: data.arrivedClient,
        }),
      },
      include: {
        reservation: {
          select: { clientName: true, station: true, clientPhone: true },
        },
        monitors: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    log.info({ bookingId: id }, "Activity booking updated");
    return NextResponse.json({ booking });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update activity booking",
      code: "BOOKING_ACTIVITIES_ERROR",
      logContext: { tenantId },
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
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/activities/${id}`,
  });

  try {
    const existing = await prisma.activityBooking.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Activity booking not found" },
        { status: 404 }
      );
    }

    await prisma.activityBooking.delete({ where: { id } });

    log.info({ bookingId: id }, "Activity booking deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete activity booking",
      code: "BOOKING_ACTIVITIES_ERROR",
      logContext: { tenantId },
    });
  }
}
