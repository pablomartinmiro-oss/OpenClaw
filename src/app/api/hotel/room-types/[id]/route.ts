export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateRoomTypeSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/hotel/room-types/${id}`,
  });

  try {
    const roomType = await prisma.roomType.findFirst({
      where: { id, tenantId },
      include: {
        rates: {
          include: { season: { select: { id: true, name: true } } },
          orderBy: [{ seasonId: "asc" }, { dayOfWeek: "asc" }],
        },
        blocks: { orderBy: { date: "asc" } },
      },
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    log.info({ roomTypeId: id }, "Room type fetched");
    return NextResponse.json({ roomType });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch room type",
      code: "ROOM_TYPES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/hotel/room-types/${id}`,
  });

  try {
    const existing = await prisma.roomType.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateRoomTypeSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const roomType = await prisma.roomType.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.images !== undefined && {
          images: JSON.parse(
            JSON.stringify(data.images)
          ) as Prisma.InputJsonValue,
        }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    log.info({ roomTypeId: id }, "Room type updated");
    return NextResponse.json({ roomType });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update room type",
      code: "ROOM_TYPES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/hotel/room-types/${id}`,
  });

  try {
    const existing = await prisma.roomType.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 }
      );
    }

    // Cascade: Prisma onDelete Cascade handles rates + blocks
    await prisma.roomType.delete({ where: { id } });

    log.info({ roomTypeId: id }, "Room type deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete room type",
      code: "ROOM_TYPES_ERROR",
      logContext: { tenantId },
    });
  }
}
