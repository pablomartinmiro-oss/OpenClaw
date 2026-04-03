export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { searchParams } = request.nextUrl;
  const station = searchParams.get("station");
  const date = searchParams.get("date");

  if (!station || !date) {
    return NextResponse.json({ error: "station and date required" }, { status: 400 });
  }

  try {
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const capacities = await prisma.stationCapacity.findMany({
      where: { tenantId, station, date: queryDate },
    });

    const result: Record<string, { booked: number; max: number; available: number }> = {};
    for (const cap of capacities) {
      result[cap.serviceType] = {
        booked: cap.booked,
        max: cap.maxCapacity,
        available: cap.maxCapacity - cap.booked,
      };
    }

    return NextResponse.json({ station, date, capacity: result });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch capacity",
      code: "CAPACITY_ERROR",
      logContext: { tenantId },
    });
  }
}
