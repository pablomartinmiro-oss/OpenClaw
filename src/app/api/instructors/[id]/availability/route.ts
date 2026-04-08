export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, instructorAvailabilitySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { id } = await context.params;

  try {
    const instructor = await prisma.instructor.findFirst({
      where: { id, tenantId },
    });
    if (!instructor) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    const slots = await prisma.instructorAvailability.findMany({
      where: { tenantId, instructorId: id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener disponibilidad",
      code: "INSTRUCTOR_AVAIL_GET_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PUT(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/instructors/${id}/availability` });

  try {
    const instructor = await prisma.instructor.findFirst({
      where: { id, tenantId },
    });
    if (!instructor) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, instructorAvailabilitySchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    // Replace all availability: delete existing, create new
    await prisma.$transaction([
      prisma.instructorAvailability.deleteMany({
        where: { tenantId, instructorId: id },
      }),
      ...validated.data.slots.map((slot) =>
        prisma.instructorAvailability.create({
          data: {
            tenantId,
            instructorId: id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: slot.isActive,
          },
        })
      ),
    ]);

    const slots = await prisma.instructorAvailability.findMany({
      where: { tenantId, instructorId: id },
      orderBy: { dayOfWeek: "asc" },
    });

    log.info({ instructorId: id, slotCount: slots.length }, "Availability updated");
    return NextResponse.json({ slots });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar disponibilidad",
      code: "INSTRUCTOR_AVAIL_UPDATE_ERROR",
      logContext: { tenantId },
    });
  }
}
