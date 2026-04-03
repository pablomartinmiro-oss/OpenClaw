export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

interface AvailabilityDay {
  date: string;
  dayOfWeek: number;
  baseCapacity: number;
  blockedUnits: number;
  available: number;
  rate: { price: number; supplement: number; seasonName: string } | null;
}

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: "/api/hotel/availability",
  });
  const { searchParams } = request.nextUrl;
  const roomTypeId = searchParams.get("roomTypeId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!roomTypeId || !from || !to) {
    return NextResponse.json(
      { error: "roomTypeId, from, and to are required" },
      { status: 400 }
    );
  }

  try {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Limit range to 90 days to prevent abuse
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays < 0 || diffDays > 90) {
      return NextResponse.json(
        { error: "Date range must be 0-90 days" },
        { status: 400 }
      );
    }

    // Fetch room type, blocks, seasons, and rates in parallel
    const [roomType, blocks, seasons, rates] = await Promise.all([
      prisma.roomType.findFirst({
        where: { id: roomTypeId, tenantId },
      }),
      prisma.roomBlock.findMany({
        where: {
          tenantId,
          roomTypeId,
          date: { gte: fromDate, lte: toDate },
        },
      }),
      prisma.roomRateSeason.findMany({
        where: { tenantId },
        orderBy: { startDate: "asc" },
      }),
      prisma.roomRate.findMany({
        where: { tenantId, roomTypeId },
        include: { season: { select: { name: true } } },
      }),
    ]);

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    // Index blocks by date string for O(1) lookup
    const blockMap = new Map(
      blocks.map((b) => [b.date.toISOString().split("T")[0], b])
    );

    // Index rates by seasonId+dayOfWeek
    const rateMap = new Map(
      rates.map((r) => [`${r.seasonId}-${r.dayOfWeek}`, r])
    );

    // Build daily availability array
    const availability: AvailabilityDay[] = [];
    const cursor = new Date(fromDate);

    while (cursor <= toDate) {
      const dateStr = cursor.toISOString().split("T")[0];
      const dayOfWeek = cursor.getDay(); // 0=Sun, 6=Sat
      const block = blockMap.get(dateStr);
      const blockedUnits = block ? block.unitCount : 0;

      // Find matching season for this date
      let rateInfo: AvailabilityDay["rate"] = null;
      for (const season of seasons) {
        if (cursor >= season.startDate && cursor <= season.endDate) {
          const rate = rateMap.get(`${season.id}-${dayOfWeek}`);
          if (rate) {
            rateInfo = {
              price: rate.price,
              supplement: rate.supplement,
              seasonName: rate.season.name,
            };
          }
          break;
        }
      }

      availability.push({
        date: dateStr,
        dayOfWeek,
        baseCapacity: roomType.capacity,
        blockedUnits,
        available: Math.max(0, roomType.capacity - blockedUnits),
        rate: rateInfo,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    log.info(
      { roomTypeId, days: availability.length },
      "Availability calculated"
    );
    return NextResponse.json({ roomTypeId, availability });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to calculate availability",
      code: "AVAILABILITY_ERROR",
      logContext: { tenantId },
    });
  }
}
