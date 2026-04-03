export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateTimeSlotSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: `/api/catalog/timeslots/${id}` });

  try {
    const existing = await prisma.productTimeSlot.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Time slot not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateTimeSlotSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const timeSlot = await prisma.productTimeSlot.update({
      where: { id, tenantId },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek ?? null }),
        ...(data.priceOverride !== undefined && { priceOverride: data.priceOverride ?? null }),
      },
    });

    log.info({ timeSlotId: id }, "Time slot updated");
    return NextResponse.json({ timeSlot });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update time slot",
      code: "TIMESLOTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: `/api/catalog/timeslots/${id}` });

  try {
    const existing = await prisma.productTimeSlot.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Time slot not found" }, { status: 404 });
    }

    await prisma.productTimeSlot.delete({ where: { id } });

    log.info({ timeSlotId: id }, "Time slot deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete time slot",
      code: "TIMESLOTS_ERROR",
      logContext: { tenantId },
    });
  }
}
