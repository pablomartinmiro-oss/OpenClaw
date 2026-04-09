export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createParticipantSchema } from "@/lib/validation";
import { computeAgeBracket } from "@/lib/planning/types";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get("reservationId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (reservationId) where.reservationId = reservationId;

    const participants = await prisma.participant.findMany({
      where,
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ participants });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener participantes",
      code: "PARTICIPANTS_LIST_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/planning/participants" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createParticipantSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify reservation belongs to tenant
    const reservation = await prisma.reservation.findFirst({
      where: { id: data.reservationId, tenantId },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // Auto-compute age bracket from birthDate or age
    let ageBracket = data.ageBracket;
    if (!ageBracket && data.age) {
      ageBracket = computeAgeBracket(data.age);
    } else if (!ageBracket && data.birthDate) {
      const age = Math.floor(
        (Date.now() - new Date(data.birthDate).getTime()) / (365.25 * 86400000)
      );
      ageBracket = computeAgeBracket(age);
    }

    const participant = await prisma.participant.create({
      data: {
        tenantId,
        reservationId: data.reservationId,
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        birthDate: data.birthDate ?? null,
        age: data.age ?? null,
        ageBracket: ageBracket ?? null,
        discipline: data.discipline,
        level: data.level,
        language: data.language,
        specialNeeds: data.specialNeeds ?? null,
        relationship: data.relationship ?? null,
      },
    });

    log.info({ participantId: participant.id }, "Participant created");
    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear participante",
      code: "PARTICIPANT_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
