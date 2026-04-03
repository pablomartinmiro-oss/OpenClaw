export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createRoomTypeSchema } from "@/lib/validation";
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
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/hotel/room-types" });
  const { searchParams } = request.nextUrl;
  const activeParam = searchParams.get("active");

  try {
    const where: Prisma.RoomTypeWhereInput = { tenantId };
    if (activeParam === "true") where.active = true;
    if (activeParam === "false") where.active = false;

    const roomTypes = await prisma.roomType.findMany({
      where,
      include: {
        _count: { select: { rates: true, blocks: true } },
      },
      orderBy: { title: "asc" },
    });

    log.info({ count: roomTypes.length }, "Room types fetched");
    return NextResponse.json({ roomTypes });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch room types",
      code: "ROOM_TYPES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/hotel/room-types" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRoomTypeSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const slug = data.slug || generateSlug(data.title);

    const roomType = await prisma.roomType.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        capacity: data.capacity,
        basePrice: data.basePrice,
        description: data.description ?? null,
        images: JSON.parse(JSON.stringify(data.images)) as Prisma.InputJsonValue,
        active: data.active,
      },
    });

    log.info({ roomTypeId: roomType.id }, "Room type created");
    return NextResponse.json({ roomType }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create room type",
      code: "ROOM_TYPES_ERROR",
      logContext: { tenantId },
    });
  }
}
