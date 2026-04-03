export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateRoomRateSeasonSchema,
} from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

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
    path: `/api/hotel/seasons/${id}`,
  });

  try {
    const existing = await prisma.roomRateSeason.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Rate season not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateRoomRateSeasonSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const season = await prisma.roomRateSeason.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
      },
    });

    log.info({ seasonId: id }, "Rate season updated");
    return NextResponse.json({ season });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update rate season",
      code: "RATE_SEASONS_ERROR",
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
    path: `/api/hotel/seasons/${id}`,
  });

  try {
    const existing = await prisma.roomRateSeason.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Rate season not found" },
        { status: 404 }
      );
    }

    await prisma.roomRateSeason.delete({ where: { id } });

    log.info({ seasonId: id }, "Rate season deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete rate season",
      code: "RATE_SEASONS_ERROR",
      logContext: { tenantId },
    });
  }
}
