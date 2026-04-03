import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

interface DailyRate {
  date: string;
  price: number;
}

interface HotelAvailabilityResult {
  available: boolean;
  nights: number;
  totalPrice: number;
  dailyRates: DailyRate[];
  reason?: string;
}

/**
 * Check real availability and compute nightly pricing for a hotel room type.
 * Iterates each night in the range, finds the matching rate season,
 * looks up the day-of-week rate, and checks for blocks.
 */
export async function checkHotelAvailability(
  tenantId: string,
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  guests: number
): Promise<HotelAvailabilityResult> {
  const log = logger.child({ tenantId, roomTypeId, fn: "checkHotelAvailability" });

  // 1. Verify room type exists and check capacity
  const roomType = await prisma.roomType.findFirst({
    where: { id: roomTypeId, tenantId, active: true },
  });

  if (!roomType) {
    return { available: false, nights: 0, totalPrice: 0, dailyRates: [], reason: "Tipo de habitacion no encontrado" };
  }

  if (guests > roomType.capacity) {
    return {
      available: false,
      nights: 0,
      totalPrice: 0,
      dailyRates: [],
      reason: `Capacidad maxima: ${roomType.capacity} personas`,
    };
  }

  // 2. Calculate number of nights
  const msPerDay = 86_400_000;
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);

  if (nights <= 0) {
    return { available: false, nights: 0, totalPrice: 0, dailyRates: [], reason: "Rango de fechas invalido" };
  }

  // 3. Fetch blocks for the date range
  const blocks = await prisma.roomBlock.findMany({
    where: {
      tenantId,
      roomTypeId,
      date: { gte: checkIn, lt: checkOut },
    },
  });

  const blockedDates = new Set(
    blocks
      .filter((b) => b.reason === "closure")
      .map((b) => b.date.toISOString().split("T")[0])
  );

  // 4. Fetch rate seasons that overlap the date range
  const seasons = await prisma.roomRateSeason.findMany({
    where: {
      tenantId,
      startDate: { lte: checkOut },
      endDate: { gte: checkIn },
    },
    orderBy: { startDate: "asc" },
  });

  // 5. Fetch all rates for this room type within those seasons
  const seasonIds = seasons.map((s) => s.id);
  const rates = await prisma.roomRate.findMany({
    where: {
      tenantId,
      roomTypeId,
      seasonId: { in: seasonIds },
    },
  });

  // Build lookup: seasonId -> dayOfWeek -> price
  const rateLookup = new Map<string, Map<number, number>>();
  for (const rate of rates) {
    let dayMap = rateLookup.get(rate.seasonId);
    if (!dayMap) {
      dayMap = new Map();
      rateLookup.set(rate.seasonId, dayMap);
    }
    dayMap.set(rate.dayOfWeek, rate.price + rate.supplement);
  }

  // 6. For each night, find matching season and rate
  const dailyRates: DailyRate[] = [];
  let totalPrice = 0;

  for (let i = 0; i < nights; i++) {
    const nightDate = new Date(checkIn.getTime() + i * msPerDay);
    const dateStr = nightDate.toISOString().split("T")[0];

    // Check if blocked
    if (blockedDates.has(dateStr)) {
      log.info({ date: dateStr }, "Night blocked — not available");
      return {
        available: false,
        nights,
        totalPrice: 0,
        dailyRates: [],
        reason: `Habitacion no disponible el ${dateStr}`,
      };
    }

    // Find matching season for this night
    const matchingSeason = seasons.find(
      (s) => nightDate >= s.startDate && nightDate <= s.endDate
    );

    let nightPrice: number;

    if (matchingSeason) {
      const dayOfWeek = nightDate.getDay(); // 0=Sun, 6=Sat
      const dayMap = rateLookup.get(matchingSeason.id);
      const ratePrice = dayMap?.get(dayOfWeek);
      nightPrice = ratePrice ?? roomType.basePrice;
    } else {
      // No season defined — use base price
      nightPrice = roomType.basePrice;
    }

    dailyRates.push({ date: dateStr, price: nightPrice });
    totalPrice += nightPrice;
  }

  log.info({ nights, totalPrice }, "Hotel availability checked");

  return {
    available: true,
    nights,
    totalPrice,
    dailyRates,
  };
}
