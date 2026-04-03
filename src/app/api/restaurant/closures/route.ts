export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createClosureSchema,
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
    path: "/api/restaurant/closures",
  });
  const { searchParams } = request.nextUrl;
  const restaurantId = searchParams.get("restaurantId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const where: Prisma.RestaurantClosureWhereInput = { tenantId };
    if (restaurantId) where.restaurantId = restaurantId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const closures = await prisma.restaurantClosure.findMany({
      where,
      include: {
        restaurant: { select: { id: true, title: true } },
      },
      orderBy: { date: "asc" },
    });

    log.info({ count: closures.length }, "Closures fetched");
    return NextResponse.json({ closures });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch closures",
      code: "RESTAURANT_CLOSURE_ERROR",
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
    path: "/api/restaurant/closures",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, createClosureSchema);
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

    const closure = await prisma.restaurantClosure.create({
      data: {
        tenantId,
        restaurantId: data.restaurantId,
        date: data.date,
        reason: data.reason ?? null,
      },
    });

    log.info({ closureId: closure.id }, "Closure created");
    return NextResponse.json({ closure }, { status: 201 });
  } catch (error) {
    // Handle unique constraint (same restaurant + date)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un cierre para esta fecha" },
        { status: 409 }
      );
    }
    return apiError(error, {
      publicMessage: "Failed to create closure",
      code: "RESTAURANT_CLOSURE_ERROR",
      logContext: { tenantId },
    });
  }
}
