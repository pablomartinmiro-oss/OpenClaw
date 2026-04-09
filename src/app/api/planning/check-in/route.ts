export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, classCheckInSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const groupCellId = new URL(request.url).searchParams.get("groupCellId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (groupCellId) where.groupCellId = groupCellId;

    const checkIns = await prisma.classCheckIn.findMany({
      where,
      include: { participant: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ checkIns });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "CHECKIN_LIST_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/check-in" });

  try {
    const body = await request.json();
    const validated = validateBody(body, classCheckInSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const checkIn = await prisma.classCheckIn.upsert({
      where: {
        tenantId_groupCellId_participantId: {
          tenantId,
          groupCellId: data.groupCellId,
          participantId: data.participantId,
        },
      },
      create: {
        tenantId,
        groupCellId: data.groupCellId,
        participantId: data.participantId,
        status: data.status,
        checkedAt: data.status !== "pending" ? new Date() : null,
        checkedBy: session.userId,
        notes: data.notes ?? null,
      },
      update: {
        status: data.status,
        checkedAt: data.status !== "pending" ? new Date() : null,
        checkedBy: session.userId,
        notes: data.notes ?? null,
      },
    });

    log.info({ checkInId: checkIn.id, status: data.status }, "Check-in recorded");
    return NextResponse.json({ checkIn });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al registrar asistencia", code: "CHECKIN_ERROR", logContext: { tenantId } });
  }
}
