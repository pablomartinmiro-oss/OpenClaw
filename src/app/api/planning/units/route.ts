export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");
  const reservationId = searchParams.get("reservationId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status;
    if (reservationId) where.reservationId = reservationId;
    if (date) {
      const d = new Date(date);
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      where.activityDate = { gte: dayStart, lte: dayEnd };
    }

    const units = await prisma.operationalUnit.findMany({
      where,
      include: {
        participant: true,
        reservation: { select: { clientName: true, station: true } },
        groupCell: { select: { id: true, discipline: true, level: true, timeSlotStart: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ units });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "UNITS_LIST_ERROR", logContext: { tenantId } });
  }
}
