export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateDailyOrderSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/daily-orders/${id}`,
  });

  try {
    const existing = await prisma.dailyOrder.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Daily order not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateDailyOrderSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const order = await prisma.dailyOrder.update({
      where: { id },
      data: {
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
      },
    });

    log.info({ orderId: id }, "Daily order updated");
    return NextResponse.json({ order });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update daily order",
      code: "DAILY_ORDERS_ERROR",
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
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/daily-orders/${id}`,
  });

  try {
    const existing = await prisma.dailyOrder.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Daily order not found" },
        { status: 404 }
      );
    }

    await prisma.dailyOrder.delete({ where: { id } });

    log.info({ orderId: id }, "Daily order deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete daily order",
      code: "DAILY_ORDERS_ERROR",
      logContext: { tenantId },
    });
  }
}
