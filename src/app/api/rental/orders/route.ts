export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createRentalOrderSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/rental/orders" });
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const stationSlug = searchParams.get("stationSlug");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");

  try {
    const where: Prisma.RentalOrderWhereInput = { tenantId };
    if (status) where.status = status;
    if (stationSlug) where.stationSlug = stationSlug;
    if (dateFrom || dateTo) {
      where.pickupDate = {};
      if (dateFrom) where.pickupDate.gte = new Date(dateFrom);
      if (dateTo) where.pickupDate.lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
        { clientPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.rentalOrder.findMany({
      where,
      include: {
        items: true,
        reservation: {
          select: { id: true, clientName: true, activityDate: true },
        },
      },
      orderBy: { pickupDate: "desc" },
    });

    log.info({ count: orders.length }, "Rental orders fetched");
    return NextResponse.json({ orders });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch rental orders",
      code: "RENTAL_ORDERS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/rental/orders" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRentalOrderSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // If linked to a reservation, verify it belongs to this tenant
    if (data.reservationId) {
      const reservation = await prisma.reservation.findFirst({
        where: { id: data.reservationId, tenantId },
      });
      if (!reservation) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }
    }

    const order = await prisma.rentalOrder.create({
      data: {
        tenantId,
        reservationId: data.reservationId ?? null,
        clientName: data.clientName,
        clientEmail: data.clientEmail ?? null,
        clientPhone: data.clientPhone ?? null,
        stationSlug: data.stationSlug,
        pickupDate: data.pickupDate,
        returnDate: data.returnDate,
        totalPrice: data.totalPrice,
        discount: data.discount,
        notes: data.notes ?? null,
        internalNotes: data.internalNotes ?? null,
        createdBy: session.userId,
      },
      include: { items: true },
    });

    log.info({ orderId: order.id }, "Rental order created");
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create rental order",
      code: "RENTAL_ORDERS_ERROR",
      logContext: { tenantId },
    });
  }
}
