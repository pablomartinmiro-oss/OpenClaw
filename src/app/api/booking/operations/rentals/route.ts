export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/booking/operations/rentals" });
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) {
    return NextResponse.json(
      { error: "Parametro date requerido" },
      { status: 400 }
    );
  }

  const dayStart = new Date(dateStr);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dateStr);
  dayEnd.setHours(0, 0, 0, 0);
  dayEnd.setDate(dayEnd.getDate() + 1);

  try {
    // If rental module isn't installed yet, fail soft and return empty arrays.
    type RentalOrderWithItems = Awaited<
      ReturnType<typeof prisma.rentalOrder.findMany<{ include: { items: true } }>>
    >;
    let pickups: RentalOrderWithItems = [];
    let returns: RentalOrderWithItems = [];

    try {
      [pickups, returns] = await Promise.all([
        prisma.rentalOrder.findMany({
          where: {
            tenantId,
            pickupDate: { gte: dayStart, lt: dayEnd },
            status: { notIn: ["cancelled", "returned"] },
          },
          include: { items: true },
          orderBy: { pickupDate: "asc" },
        }),
        prisma.rentalOrder.findMany({
          where: {
            tenantId,
            returnDate: { gte: dayStart, lt: dayEnd },
            status: { notIn: ["cancelled", "returned"] },
          },
          include: { items: true },
          orderBy: { returnDate: "asc" },
        }),
      ]);
    } catch (err) {
      log.warn({ err }, "Rental module unavailable, returning empty");
    }

    const totalUnits =
      pickups.reduce((s, o) => s + o.items.length, 0) +
      returns.reduce((s, o) => s + o.items.length, 0);

    return NextResponse.json({
      pickups: pickups.map((o) => ({
        id: o.id,
        clientName: o.clientName,
        stationSlug: o.stationSlug,
        pickupDate: o.pickupDate,
        returnDate: o.returnDate,
        status: o.status,
        itemCount: o.items.length,
      })),
      returns: returns.map((o) => ({
        id: o.id,
        clientName: o.clientName,
        stationSlug: o.stationSlug,
        pickupDate: o.pickupDate,
        returnDate: o.returnDate,
        status: o.status,
        itemCount: o.items.length,
      })),
      summary: {
        pickupCount: pickups.length,
        returnCount: returns.length,
        totalUnits,
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener alquileres del dia",
      code: "OPS_RENTALS_ERROR",
      logContext: { tenantId },
    });
  }
}
