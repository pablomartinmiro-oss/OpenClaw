export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const instructorId = new URL(request.url).searchParams.get("instructorId");
  const participantId = new URL(request.url).searchParams.get("participantId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (instructorId) where.instructorId = instructorId;
    if (participantId) where.participantId = participantId;

    const diplomas = await prisma.diploma.findMany({
      where,
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json({ diplomas });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "DIPLOMAS_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/diplomas" });

  try {
    const body = await request.json();
    const { participantId, instructorId, groupCellId, level, discipline, station, participantName, instructorName, notes } = body;

    if (!participantId || !level || !discipline || !station || !participantName || !instructorName) {
      return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
    }

    const diploma = await prisma.diploma.create({
      data: { tenantId, participantId, instructorId: instructorId ?? session.userId, groupCellId, level, discipline, station, participantName, instructorName, notes },
    });

    log.info({ diplomaId: diploma.id }, "Diploma issued");
    return NextResponse.json({ diploma }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al emitir diploma", code: "DIPLOMA_CREATE_ERROR", logContext: { tenantId } });
  }
}
