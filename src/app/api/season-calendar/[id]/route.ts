import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { hasPermission } from "@/lib/auth/permissions";
import type { PermissionKey } from "@/types/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId, permissions } = session.user;
  if (!hasPermission(permissions as PermissionKey[], "settings:tenant")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    log.error({ error }, "Failed to update season calendar entry");
    return NextResponse.json(
      { error: "Failed to update season calendar entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId, permissions } = session.user;
  if (!hasPermission(permissions as PermissionKey[], "settings:tenant")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    log.error({ error }, "Failed to delete season calendar entry");
    return NextResponse.json(
      { error: "Failed to delete season calendar entry" },
      { status: 500 }
    );
  }
}
