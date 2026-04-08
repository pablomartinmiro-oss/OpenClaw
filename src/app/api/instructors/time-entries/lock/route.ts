export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, lockTimeEntriesSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId, userId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/instructors/time-entries/lock" });

  try {
    const body = await request.json();
    const validated = validateBody(body, lockTimeEntriesSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { startDate, endDate, instructorId } = validated.data;

    const where: Record<string, unknown> = {
      tenantId,
      lockedAt: null,
      date: { gte: startDate, lte: endDate },
    };
    if (instructorId) where.instructorId = instructorId;

    const result = await prisma.instructorTimeEntry.updateMany({
      where,
      data: { lockedAt: new Date(), lockedBy: userId },
    });

    log.info({ locked: result.count, startDate, endDate }, "Time entries locked");
    return NextResponse.json({ locked: result.count });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al bloquear fichajes",
      code: "LOCK_TIME_ENTRIES_ERROR",
      logContext: { tenantId },
    });
  }
}
