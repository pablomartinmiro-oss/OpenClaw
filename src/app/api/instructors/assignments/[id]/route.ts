export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateAssignmentSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/instructors/assignments/${id}` });

  try {
    const existing = await prisma.instructorAssignment.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Asignacion no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateAssignmentSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "completed") updateData.completedAt = new Date();
    }
    if (data.studentCount !== undefined) updateData.studentCount = data.studentCount;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const assignment = await prisma.instructorAssignment.update({
      where: { id },
      data: updateData,
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

    log.info({ assignmentId: id, status: data.status }, "Assignment updated");
    return NextResponse.json({ assignment });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar asignacion",
      code: "ASSIGNMENT_UPDATE_ERROR",
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
  const log = logger.child({ tenantId, path: `/api/instructors/assignments/${id}` });

  try {
    const existing = await prisma.instructorAssignment.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Asignacion no encontrada" }, { status: 404 });
    }

    await prisma.instructorAssignment.delete({ where: { id } });

    log.info({ assignmentId: id }, "Assignment deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar asignacion",
      code: "ASSIGNMENT_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
