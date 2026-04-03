import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

interface RestaurantAvailabilityResult {
  available: boolean;
  reason?: string;
  shift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    currentGuests: number;
  };
}

/**
 * Check restaurant availability for a date, time, and guest count.
 * Verifies no closures, finds matching shift, checks capacity.
 */
export async function checkRestaurantAvailability(
  tenantId: string,
  restaurantId: string,
  date: Date,
  time: string,
  guestCount: number
): Promise<RestaurantAvailabilityResult> {
  const log = logger.child({ tenantId, restaurantId, fn: "checkRestaurantAvailability" });

  // 1. Verify restaurant exists and is active
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, tenantId, active: true },
  });

  if (!restaurant) {
    return { available: false, reason: "Restaurante no encontrado" };
  }

  // 2. Check for closures on that date
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const closure = await prisma.restaurantClosure.findFirst({
    where: {
      tenantId,
      restaurantId,
      date: { gte: dayStart, lt: dayEnd },
    },
  });

  if (closure) {
    return {
      available: false,
      reason: closure.reason
        ? `Restaurante cerrado: ${closure.reason}`
        : "Restaurante cerrado en esa fecha",
    };
  }

  // 3. Check operating days
  const operatingDays = restaurant.operatingDays as number[];
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

  if (operatingDays.length > 0 && !operatingDays.includes(dayOfWeek)) {
    return {
      available: false,
      reason: "El restaurante no opera ese dia de la semana",
    };
  }

  // 4. Find matching shift for the requested time
  const shifts = await prisma.restaurantShift.findMany({
    where: { tenantId, restaurantId },
  });

  const matchingShift = shifts.find((s) => {
    return time >= s.startTime && time <= s.endTime;
  });

  if (!matchingShift) {
    return {
      available: false,
      reason: "No hay turno disponible para esa hora",
    };
  }

  // 5. Count existing confirmed bookings for that shift + date
  const existingBookings = await prisma.restaurantBooking.findMany({
    where: {
      tenantId,
      restaurantId,
      date: { gte: dayStart, lt: dayEnd },
      time: { gte: matchingShift.startTime, lte: matchingShift.endTime },
      status: { not: "cancelled" },
    },
    select: { guestCount: true },
  });

  const currentGuests = existingBookings.reduce(
    (sum, b) => sum + b.guestCount,
    0
  );

  // 6. Check if adding guestCount exceeds shift capacity
  if (matchingShift.maxCapacity > 0 && currentGuests + guestCount > matchingShift.maxCapacity) {
    const remaining = matchingShift.maxCapacity - currentGuests;
    return {
      available: false,
      reason: `Capacidad excedida. Disponible: ${remaining} comensales`,
      shift: {
        id: matchingShift.id,
        name: matchingShift.name,
        startTime: matchingShift.startTime,
        endTime: matchingShift.endTime,
        maxCapacity: matchingShift.maxCapacity,
        currentGuests,
      },
    };
  }

  log.info(
    { shift: matchingShift.name, currentGuests, guestCount },
    "Restaurant available"
  );

  return {
    available: true,
    shift: {
      id: matchingShift.id,
      name: matchingShift.name,
      startTime: matchingShift.startTime,
      endTime: matchingShift.endTime,
      maxCapacity: matchingShift.maxCapacity,
      currentGuests,
    },
  };
}
