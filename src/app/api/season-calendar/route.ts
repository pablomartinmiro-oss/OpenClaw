export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, seasonCalendarSchema } from "@/lib/validation";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/season-calendar" });

  try {
    const entries = await prisma.seasonCalendar.findMany({
      where: { tenantId },
      orderBy: [{ station: "asc" }, { startDate: "asc" }],
    });

    log.info({ count: entries.length }, "Season calendar fetched");
    return NextResponse.json({ entries });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cargar calendario de temporadas",
      code: "SEASON_CALENDAR_FETCH_FAILED",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/season-calendar" });

  try {
    const body = await request.json();
    const validation = validateBody(body, seasonCalendarSchema);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { station, season, startDate, endDate, label } = validation.data;

    const entry = await prisma.seasonCalendar.create({
      data: {
        tenantId,
        station,
        season,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        label: label || null,
      },
    });

    log.info({ entryId: entry.id }, "Season calendar entry created");
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear entrada de calendario",
      code: "SEASON_CALENDAR_CREATE_FAILED",
      logContext: { tenantId },
    });
  }
}
