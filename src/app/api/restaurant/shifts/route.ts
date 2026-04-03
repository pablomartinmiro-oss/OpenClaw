export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createShiftSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: "/api/restaurant/shifts",
  });
  const { searchParams } = request.nextUrl;
  const restaurantId = searchParams.get("restaurantId");

  try {
    const where: Prisma.RestaurantShiftWhereInput = { tenantId };
    if (restaurantId) where.restaurantId = restaurantId;

    const shifts = await prisma.restaurantShift.findMany({
      where,
      include: {
        restaurant: { select: { id: true, title: true } },
      },
      orderBy: [{ restaurantId: "asc" }, { startTime: "asc" }],
    });

    log.info({ count: shifts.length }, "Shifts fetched");
    return NextResponse.json({ shifts });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch shifts",
      code: "RESTAURANT_SHIFT_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: "/api/restaurant/shifts",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, createShiftSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify restaurant belongs to tenant
    const restaurant = await prisma.restaurant.findFirst({
      where: { id: data.restaurantId, tenantId },
    });
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const shift = await prisma.restaurantShift.create({
      data: {
        tenantId,
        restaurantId: data.restaurantId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: data.maxCapacity,
        duration: data.duration,
      },
    });

    log.info({ shiftId: shift.id }, "Shift created");
    return NextResponse.json({ shift }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create shift",
      code: "RESTAURANT_SHIFT_ERROR",
      logContext: { tenantId },
    });
  }
}
