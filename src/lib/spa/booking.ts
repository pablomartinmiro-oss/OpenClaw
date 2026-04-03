import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

interface SpaAvailabilityResult {
  available: boolean;
  slot: {
    id: string;
    date: Date;
    time: string;
    capacity: number;
    booked: number;
  } | null;
  treatment: {
    id: string;
    title: string;
    duration: number;
    price: number;
  } | null;
  reason?: string;
}

/**
 * Check spa treatment availability for a given date and time.
 * Finds a matching slot, verifies it has remaining capacity.
 */
export async function checkSpaAvailability(
  tenantId: string,
  treatmentId: string,
  date: Date,
  time: string
): Promise<SpaAvailabilityResult> {
  const log = logger.child({ tenantId, treatmentId, fn: "checkSpaAvailability" });

  // 1. Verify treatment exists and is active
  const treatment = await prisma.spaTreatment.findFirst({
    where: { id: treatmentId, tenantId, active: true },
    select: { id: true, title: true, duration: true, price: true },
  });

  if (!treatment) {
    return {
      available: false,
      slot: null,
      treatment: null,
      reason: "Tratamiento no encontrado",
    };
  }

  // 2. Normalize date to start of day for comparison
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // 3. Find slot for this date + time + treatment
  const slot = await prisma.spaSlot.findFirst({
    where: {
      tenantId,
      treatmentId,
      date: { gte: dayStart, lt: dayEnd },
      time,
    },
  });

  if (!slot) {
    log.info({ date: dayStart, time }, "No slot found for date/time");
    return {
      available: false,
      slot: null,
      treatment,
      reason: "No hay horario disponible para esa fecha y hora",
    };
  }

  // 4. Check slot status and capacity
  if (slot.status === "blocked") {
    return {
      available: false,
      slot: {
        id: slot.id,
        date: slot.date,
        time: slot.time,
        capacity: slot.capacity,
        booked: slot.booked,
      },
      treatment,
      reason: "Horario bloqueado",
    };
  }

  if (slot.booked >= slot.capacity) {
    return {
      available: false,
      slot: {
        id: slot.id,
        date: slot.date,
        time: slot.time,
        capacity: slot.capacity,
        booked: slot.booked,
      },
      treatment,
      reason: "Horario completo",
    };
  }

  log.info({ slotId: slot.id, remaining: slot.capacity - slot.booked }, "Spa slot available");

  return {
    available: true,
    slot: {
      id: slot.id,
      date: slot.date,
      time: slot.time,
      capacity: slot.capacity,
      booked: slot.booked,
    },
    treatment,
  };
}

/**
 * Increment booked count on a slot. Updates status to "full" if capacity reached.
 */
export async function bookSpaSlot(
  tenantId: string,
  slotId: string
): Promise<void> {
  const slot = await prisma.spaSlot.update({
    where: { id: slotId },
    data: { booked: { increment: 1 } },
  });

  // If now full, update status
  if (slot.booked >= slot.capacity) {
    await prisma.spaSlot.update({
      where: { id: slotId },
      data: { status: "full" },
    });
  }
}
