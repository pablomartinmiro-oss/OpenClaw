export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  assignStaffSchema,
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
    path: "/api/restaurant/staff",
  });
  const { searchParams } = request.nextUrl;
  const restaurantId = searchParams.get("restaurantId");

  try {
    const where: Prisma.RestaurantStaffWhereInput = { tenantId };
    if (restaurantId) where.restaurantId = restaurantId;

    const staff = await prisma.restaurantStaff.findMany({
      where,
      include: {
        restaurant: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: staff.length }, "Staff fetched");
    return NextResponse.json({ staff });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch staff",
      code: "RESTAURANT_STAFF_ERROR",
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
    path: "/api/restaurant/staff",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, assignStaffSchema);
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

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: data.userId, tenantId },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const assignment = await prisma.restaurantStaff.create({
      data: {
        tenantId,
        restaurantId: data.restaurantId,
        userId: data.userId,
        role: data.role,
      },
    });

    log.info(
      { staffId: assignment.id },
      "Staff assigned to restaurant"
    );
    return NextResponse.json(
      { staff: assignment },
      { status: 201 }
    );
  } catch (error) {
    // Handle unique constraint (same user + restaurant)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Este usuario ya esta asignado a este restaurante",
        },
        { status: 409 }
      );
    }
    return apiError(error, {
      publicMessage: "Failed to assign staff",
      code: "RESTAURANT_STAFF_ERROR",
      logContext: { tenantId },
    });
  }
}
