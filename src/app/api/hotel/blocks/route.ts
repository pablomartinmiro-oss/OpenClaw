export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createRoomBlockSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/hotel/blocks" });
  const { searchParams } = request.nextUrl;
  const roomTypeId = searchParams.get("roomTypeId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const where: Prisma.RoomBlockWhereInput = { tenantId };
    if (roomTypeId) where.roomTypeId = roomTypeId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const blocks = await prisma.roomBlock.findMany({
      where,
      include: {
        roomType: { select: { id: true, title: true } },
      },
      orderBy: { date: "asc" },
    });

    log.info({ count: blocks.length }, "Blocks fetched");
    return NextResponse.json({ blocks });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch blocks",
      code: "BLOCKS_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/hotel/blocks" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRoomBlockSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Upsert to handle unique constraint (tenantId, roomTypeId, date)
    const block = await prisma.roomBlock.upsert({
      where: {
        tenantId_roomTypeId_date: {
          tenantId,
          roomTypeId: data.roomTypeId,
          date: data.date,
        },
      },
      update: {
        unitCount: data.unitCount,
        reason: data.reason,
      },
      create: {
        tenantId,
        roomTypeId: data.roomTypeId,
        date: data.date,
        unitCount: data.unitCount,
        reason: data.reason,
      },
    });

    log.info({ blockId: block.id }, "Block upserted");
    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create block",
      code: "BLOCKS_ERROR",
      logContext: { tenantId },
    });
  }
}
