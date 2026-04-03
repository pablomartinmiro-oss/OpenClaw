export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createRoomRateSchema,
  bulkSetRatesSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/hotel/rates" });
  const { searchParams } = request.nextUrl;
  const roomTypeId = searchParams.get("roomTypeId");
  const seasonId = searchParams.get("seasonId");

  try {
    const where: Prisma.RoomRateWhereInput = { tenantId };
    if (roomTypeId) where.roomTypeId = roomTypeId;
    if (seasonId) where.seasonId = seasonId;

    const rates = await prisma.roomRate.findMany({
      where,
      include: {
        roomType: { select: { id: true, title: true } },
        season: { select: { id: true, name: true } },
      },
      orderBy: [
        { roomTypeId: "asc" },
        { seasonId: "asc" },
        { dayOfWeek: "asc" },
      ],
    });

    log.info({ count: rates.length }, "Rates fetched");
    return NextResponse.json({ rates });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch rates",
      code: "RATES_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/hotel/rates" });

  try {
    const body = await request.json();

    // Detect bulk vs single by presence of "rates" array
    if ("rates" in body && Array.isArray(body.rates)) {
      return handleBulkRates(body, tenantId, log);
    }
    return handleSingleRate(body, tenantId, log);
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create rate(s)",
      code: "RATES_ERROR",
      logContext: { tenantId },
    });
  }
}

async function handleSingleRate(
  body: unknown,
  tenantId: string,
  log: Pick<typeof logger, "info" | "error" | "warn">
) {
  const validated = validateBody(body, createRoomRateSchema);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.error },
      { status: 400 }
    );
  }
  const data = validated.data;

  const rate = await prisma.roomRate.upsert({
    where: {
      tenantId_roomTypeId_seasonId_dayOfWeek: {
        tenantId,
        roomTypeId: data.roomTypeId,
        seasonId: data.seasonId,
        dayOfWeek: data.dayOfWeek,
      },
    },
    update: { price: data.price, supplement: data.supplement },
    create: {
      tenantId,
      roomTypeId: data.roomTypeId,
      seasonId: data.seasonId,
      dayOfWeek: data.dayOfWeek,
      price: data.price,
      supplement: data.supplement,
    },
  });

  log.info({ rateId: rate.id }, "Rate upserted");
  return NextResponse.json({ rate }, { status: 201 });
}

async function handleBulkRates(
  body: unknown,
  tenantId: string,
  log: Pick<typeof logger, "info" | "error" | "warn">
) {
  const validated = validateBody(body, bulkSetRatesSchema);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.error },
      { status: 400 }
    );
  }
  const { roomTypeId, seasonId, rates: rateItems } = validated.data;

  const results = await prisma.$transaction(
    rateItems.map((item) =>
      prisma.roomRate.upsert({
        where: {
          tenantId_roomTypeId_seasonId_dayOfWeek: {
            tenantId,
            roomTypeId,
            seasonId,
            dayOfWeek: item.dayOfWeek,
          },
        },
        update: {
          price: item.price,
          supplement: item.supplement,
        },
        create: {
          tenantId,
          roomTypeId,
          seasonId,
          dayOfWeek: item.dayOfWeek,
          price: item.price,
          supplement: item.supplement,
        },
      })
    )
  );

  log.info(
    { roomTypeId, seasonId, count: results.length },
    "Bulk rates upserted"
  );
  return NextResponse.json({ rates: results }, { status: 201 });
}
