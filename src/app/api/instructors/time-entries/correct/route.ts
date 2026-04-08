export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, timeEntryCorrectionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/instructors/time-entries/correct" });

  try {
    const body = await request.json();
    const validated = validateBody(body, timeEntryCorrectionSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Find original entry
    const original = await prisma.instructorTimeEntry.findFirst({
      where: { id: data.correctionOf, tenantId },
    });
    if (!original) {
      return NextResponse.json({ error: "Fichaje original no encontrado" }, { status: 404 });
    }

    const totalMinutes = Math.round(
      (data.clockOut.getTime() - data.clockIn.getTime()) / 60000
    );
    const brkMin = data.breakMinutes ?? 0;
    const netMinutes = Math.max(0, totalMinutes - brkMin);

    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null;

    const correction = await prisma.instructorTimeEntry.create({
      data: {
        tenantId,
        instructorId: original.instructorId,
        date: original.date,
        clockIn: data.clockIn,
        clockOut: data.clockOut,
        totalMinutes,
        breakMinutes: brkMin,
        netMinutes,
        source: "manual",
        ipAddress: ip,
        correctionOf: data.correctionOf,
        correctionReason: data.correctionReason,
      },
      include: {
        instructor: {
          select: { id: true, user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    log.info(
      { correctionId: correction.id, originalId: data.correctionOf },
      "Time entry correction created"
    );
    return NextResponse.json({ entry: correction }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear correccion",
      code: "TIME_ENTRY_CORRECTION_ERROR",
      logContext: { tenantId },
    });
  }
}
