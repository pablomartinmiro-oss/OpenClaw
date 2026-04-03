export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createRoomRateSeasonSchema,
} from "@/lib/validation";

export async function GET(_request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/hotel/seasons" });

  try {
    const seasons = await prisma.roomRateSeason.findMany({
      where: { tenantId },
      orderBy: { startDate: "asc" },
    });

    log.info({ count: seasons.length }, "Rate seasons fetched");
    return NextResponse.json({ seasons });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch rate seasons",
      code: "RATE_SEASONS_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/hotel/seasons" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRoomRateSeasonSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const season = await prisma.roomRateSeason.create({
      data: {
        tenantId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    log.info({ seasonId: season.id }, "Rate season created");
    return NextResponse.json({ season }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create rate season",
      code: "RATE_SEASONS_ERROR",
      logContext: { tenantId },
    });
  }
}
