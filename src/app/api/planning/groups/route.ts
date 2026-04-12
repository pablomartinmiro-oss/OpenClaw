export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createGroupCellSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const station = searchParams.get("station");
  const instructorId = searchParams.get("instructorId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (station) where.station = station;
    if (instructorId) where.instructorId = instructorId;
    if (date) {
      const d = new Date(date);
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      where.activityDate = { gte: dayStart, lte: dayEnd };
    } else if (startDate && endDate) {
      const s = new Date(startDate); s.setHours(0, 0, 0, 0);
      const e = new Date(endDate); e.setHours(23, 59, 59, 999);
      where.activityDate = { gte: s, lte: e };
    }

    const groups = await prisma.groupCell.findMany({
      where,
      include: {
        instructor: { select: { id: true, tdLevel: true, user: { select: { name: true } } } },
        units: { include: { participant: true } },
        meetingPoint: { select: { id: true, name: true } },
        _count: { select: { units: true, incidents: true } },
      },
      orderBy: [{ timeSlotStart: "asc" }, { discipline: "asc" }],
    });

    return NextResponse.json({ groups });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener grupos", code: "GROUPS_LIST_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/groups" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createGroupCellSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const group = await prisma.groupCell.create({
      data: { tenantId, ...data, activityDate: data.activityDate },
      include: {
        instructor: { select: { id: true, tdLevel: true, user: { select: { name: true } } } },
        _count: { select: { units: true } },
      },
    });

    log.info({ groupId: group.id }, "GroupCell created");
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear grupo", code: "GROUP_CREATE_ERROR", logContext: { tenantId } });
  }
}
