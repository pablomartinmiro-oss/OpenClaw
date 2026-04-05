export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, flagActivityIncidentSchema } from "@/lib/validation";

export async function POST(
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
    path: `/api/booking/activities/${id}/incident`,
  });

  try {
    const existing = await prisma.activityBooking.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Actividad no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, flagActivityIncidentSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { incidentNotes } = validated.data;
    const timestamp = new Date().toLocaleString("es-ES", {
      timeZone: "Europe/Madrid",
    });

    // Build new operational notes with incident prefix
    const incidentEntry = `[INCIDENCIA ${timestamp}] ${incidentNotes}`;
    const updatedNotes = existing.operationalNotes
      ? `${incidentEntry}\n---\n${existing.operationalNotes}`
      : incidentEntry;

    const booking = await prisma.activityBooking.update({
      where: { id },
      data: {
        status: "incident",
        operationalNotes: updatedNotes,
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

    log.info(
      { bookingId: id },
      "Activity booking flagged as incident"
    );

    return NextResponse.json({ booking });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al registrar incidencia",
      code: "BOOKING_INCIDENT_ERROR",
      logContext: { tenantId },
    });
  }
}
