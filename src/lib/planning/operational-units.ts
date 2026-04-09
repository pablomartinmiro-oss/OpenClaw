/**
 * Planning Engine — Operational Unit Generation
 *
 * When a reservation is confirmed, generate one OperationalUnit
 * per participant per activity date. The OU is the atomic piece
 * that the grouping engine works with.
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { PLANNING_MODES, TIME_SLOTS } from "./types";

const log = logger.child({ module: "planning:units" });

/**
 * Generate OperationalUnits from a confirmed reservation's participants.
 * Each participant produces one OU per activity date.
 */
export async function generateOperationalUnits(
  tenantId: string,
  reservationId: string
): Promise<{ created: number }> {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, tenantId },
    include: { structuredParticipants: true },
  });

  if (!reservation) throw new Error("Reserva no encontrada");
  if (reservation.structuredParticipants.length === 0) {
    log.warn({ reservationId }, "No participants found for reservation");
    return { created: 0 };
  }

  // Determine planning mode from service type
  const services = (reservation.services as Array<{ type: string }>) ?? [];
  const isPrivate = services.some(
    (s) => s.type === "clase_particular" || s.type === "private"
  );
  const planningMode = isPrivate
    ? PLANNING_MODES.FIXED_SLOT
    : PLANNING_MODES.DYNAMIC_GROUPING;

  // Determine time slot for dynamic grouping
  const schedule = reservation.schedule ?? "";
  const isAfternoon = schedule.includes("tarde") || schedule.includes("13:");

  // Find matching product for metadata
  const product = await prisma.product.findFirst({
    where: {
      station: reservation.station,
      category: { in: ["escuela", "clase_particular"] },
      isActive: true,
    },
  });

  const units = reservation.structuredParticipants.map((p) => ({
    tenantId,
    participantId: p.id,
    reservationId,
    productId: product?.id ?? null,
    activityDate: reservation.activityDate,
    planningMode,
    status: "pending" as const,
  }));

  // Batch create
  const result = await prisma.operationalUnit.createMany({ data: units });

  log.info(
    { reservationId, created: result.count, planningMode },
    "Operational units generated"
  );

  return { created: result.count };
}

/**
 * Called when a reservation status changes to "confirmada".
 * Generates OUs if participants exist.
 */
export async function onReservationConfirmed(
  tenantId: string,
  reservationId: string
): Promise<void> {
  // Check if OUs already exist (idempotent)
  const existing = await prisma.operationalUnit.count({
    where: { tenantId, reservationId },
  });
  if (existing > 0) {
    log.info({ reservationId }, "OUs already exist, skipping");
    return;
  }

  await generateOperationalUnits(tenantId, reservationId);
}
