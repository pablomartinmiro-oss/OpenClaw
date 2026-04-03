export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createRestaurantSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: "/api/restaurant/venues",
  });
  const { searchParams } = request.nextUrl;
  const activeParam = searchParams.get("active");

  try {
    const where: Prisma.RestaurantWhereInput = { tenantId };
    if (activeParam === "true") where.active = true;
    if (activeParam === "false") where.active = false;

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        _count: {
          select: {
            shifts: true,
            closures: true,
            bookings: true,
            staff: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });

    log.info({ count: restaurants.length }, "Restaurants fetched");
    return NextResponse.json({ restaurants });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch restaurants",
      code: "RESTAURANT_ERROR",
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
    path: "/api/restaurant/venues",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRestaurantSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const slug = data.slug || generateSlug(data.title);

    const restaurant = await prisma.restaurant.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        capacity: data.capacity,
        depositPerGuest: data.depositPerGuest,
        operatingDays: JSON.parse(
          JSON.stringify(data.operatingDays)
        ) as Prisma.InputJsonValue,
        description: data.description ?? null,
        active: data.active,
      },
    });

    log.info(
      { restaurantId: restaurant.id },
      "Restaurant created"
    );
    return NextResponse.json({ restaurant }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create restaurant",
      code: "RESTAURANT_ERROR",
      logContext: { tenantId },
    });
  }
}
