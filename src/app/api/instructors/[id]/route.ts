export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateInstructorSchema } from "@/lib/validation";

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
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        availability: { orderBy: { dayOfWeek: "asc" } },
      },
    });

    if (!instructor) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ instructor });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener profesor",
      code: "INSTRUCTOR_GET_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/instructors/${id}` });

  try {
    const existing = await prisma.instructor.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateInstructorSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const updateData: Record<string, unknown> = {};
    if (data.tdLevel !== undefined) updateData.tdLevel = data.tdLevel;
    if (data.certExpiry !== undefined) updateData.certExpiry = data.certExpiry;
    if (data.certNumber !== undefined) updateData.certNumber = data.certNumber;
    if (data.disciplines !== undefined) updateData.disciplines = data.disciplines;
    if (data.specialties !== undefined) updateData.specialties = data.specialties;
    if (data.languages !== undefined) updateData.languages = data.languages;
    if (data.maxLevel !== undefined) updateData.maxLevel = data.maxLevel;
    if (data.hourlyRate !== undefined) updateData.hourlyRate = data.hourlyRate;
    if (data.perStudentBonus !== undefined) updateData.perStudentBonus = data.perStudentBonus;
    if (data.contractType !== undefined) updateData.contractType = data.contractType;
    if (data.station !== undefined) updateData.station = data.station;
    if (data.seasonStart !== undefined) updateData.seasonStart = data.seasonStart;
    if (data.seasonEnd !== undefined) updateData.seasonEnd = data.seasonEnd;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const instructor = await prisma.instructor.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    log.info({ instructorId: id }, "Instructor updated");
    return NextResponse.json({ instructor });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar profesor",
      code: "INSTRUCTOR_UPDATE_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/instructors/${id}` });

  try {
    const existing = await prisma.instructor.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    await prisma.instructor.delete({ where: { id } });

    log.info({ instructorId: id }, "Instructor deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar profesor",
      code: "INSTRUCTOR_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
