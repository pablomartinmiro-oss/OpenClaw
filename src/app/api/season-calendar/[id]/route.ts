export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/season-calendar/${id}` });

  try {
    const existing = await prisma.seasonCalendar.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const entry = await prisma.seasonCalendar.update({
      where: { id },
      data: {
        ...(body.station !== undefined && { station: body.station }),
        ...(body.season !== undefined && { season: body.season }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: new Date(body.endDate) }),
        ...(body.label !== undefined && { label: body.label || null }),
      },
    });

    log.info({ entryId: id }, "Season calendar entry updated");
    return NextResponse.json({ entry });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar entrada de calendario",
      code: "SEASON_CALENDAR_UPDATE_FAILED",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/season-calendar/${id}` });

  try {
    const existing = await prisma.seasonCalendar.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.seasonCalendar.delete({ where: { id } });

    log.info({ entryId: id }, "Season calendar entry deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar entrada de calendario",
      code: "SEASON_CALENDAR_DELETE_FAILED",
      logContext: { tenantId },
    });
  }
}
