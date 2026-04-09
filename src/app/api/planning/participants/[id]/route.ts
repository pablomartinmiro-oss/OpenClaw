export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateParticipantSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const { id } = await context.params;

  try {
    const participant = await prisma.participant.findFirst({
      where: { id, tenantId },
    });
    if (!participant) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ participant });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "PARTICIPANT_GET_ERROR", logContext: { tenantId } });
  }
}

export async function PATCH(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/planning/participants/${id}` });

  try {
    const existing = await prisma.participant.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
    }
    const body = await request.json();
    const validated = validateBody(body, updateParticipantSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const participant = await prisma.participant.update({ where: { id }, data: validated.data });
    log.info({ participantId: id }, "Participant updated");
    return NextResponse.json({ participant });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar", code: "PARTICIPANT_UPDATE_ERROR", logContext: { tenantId } });
  }
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/planning/participants/${id}` });

  try {
    const existing = await prisma.participant.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });
    }
    await prisma.participant.delete({ where: { id } });
    log.info({ participantId: id }, "Participant deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar", code: "PARTICIPANT_DELETE_ERROR", logContext: { tenantId } });
  }
}
