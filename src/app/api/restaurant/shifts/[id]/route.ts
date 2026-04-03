export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateShiftSchema,
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
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/restaurant/shifts/${id}`,
  });

  try {
    const existing = await prisma.restaurantShift.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateShiftSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const shift = await prisma.restaurantShift.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.startTime !== undefined && {
          startTime: data.startTime,
        }),
        ...(data.endTime !== undefined && {
          endTime: data.endTime,
        }),
        ...(data.maxCapacity !== undefined && {
          maxCapacity: data.maxCapacity,
        }),
        ...(data.duration !== undefined && {
          duration: data.duration,
        }),
      },
    });

    log.info({ shiftId: id }, "Shift updated");
    return NextResponse.json({ shift });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update shift",
      code: "RESTAURANT_SHIFT_ERROR",
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
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/restaurant/shifts/${id}`,
  });

  try {
    const existing = await prisma.restaurantShift.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    await prisma.restaurantShift.delete({ where: { id } });

    log.info({ shiftId: id }, "Shift deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete shift",
      code: "RESTAURANT_SHIFT_ERROR",
      logContext: { tenantId },
    });
  }
}
