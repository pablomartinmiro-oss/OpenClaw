export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createAssignmentSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const instructorId = searchParams.get("instructorId");
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (instructorId) where.instructorId = instructorId;
    if (status) where.status = status;

    // Filter by activity date via the booking relation
    const assignments = await prisma.instructorAssignment.findMany({
      where,
      include: {
        instructor: {
          select: { id: true, tdLevel: true, user: { select: { id: true, name: true, email: true } } },
        },
        booking: {
          select: {
            id: true,
            activityDate: true,
            status: true,
            reservation: { select: { id: true, clientName: true, clientEmail: true } },
          },
        },
      },
      orderBy: { scheduledStart: "asc" },
    });

    // Filter by date in-memory if provided
    const filtered = date
      ? assignments.filter((a) => a.booking.activityDate.toISOString().startsWith(date))
      : assignments;

    return NextResponse.json({ assignments: filtered });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener asignaciones",
      code: "ASSIGNMENTS_LIST_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/instructors/assignments" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createAssignmentSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify instructor and booking belong to tenant
    const [instructor, booking] = await Promise.all([
      prisma.instructor.findFirst({ where: { id: data.instructorId, tenantId } }),
      prisma.activityBooking.findFirst({ where: { id: data.bookingId, tenantId } }),
    ]);
    if (!instructor) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }
    if (!booking) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 });
    }

    // Snapshot rates from instructor profile
    const assignment = await prisma.instructorAssignment.create({
      data: {
        tenantId,
        instructorId: data.instructorId,
        bookingId: data.bookingId,
        lessonType: data.lessonType,
        studentCount: data.studentCount,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        hourlyRate: instructor.hourlyRate,
        bonusPerStudent: instructor.perStudentBonus,
        surcharge: data.surcharge,
        surchargeReason: data.surchargeReason ?? null,
        notes: data.notes ?? null,
      },
      include: {
        instructor: {
          select: { id: true, tdLevel: true, user: { select: { id: true, name: true, email: true } } },
        },
        booking: {
          select: {
            id: true,
            activityDate: true,
            status: true,
            reservation: { select: { id: true, clientName: true, clientEmail: true } },
          },
        },
      },
    });

    log.info({ assignmentId: assignment.id }, "Instructor assignment created");
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear asignacion",
      code: "ASSIGNMENT_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
