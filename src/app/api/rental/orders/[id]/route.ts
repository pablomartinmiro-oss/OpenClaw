export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateRentalOrderSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;

  try {
    const order = await prisma.rentalOrder.findFirst({
      where: { id, tenantId },
      include: {
        items: true,
        reservation: {
          select: {
            id: true,
            clientName: true,
            activityDate: true,
            station: true,
          },
        },
      },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Rental order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ order });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch rental order",
      code: "RENTAL_ORDERS_ERROR",
      logContext: { tenantId, id },
    });
  }
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;
  const log = logger.child({
    tenantId,
    path: `/api/rental/orders/${id}`,
  });

  try {
    const existing = await prisma.rentalOrder.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Rental order not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateRentalOrderSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Handle status-specific timestamps
    const timestamps: Record<string, unknown> = {};
    if (data.status === "CANCELLED") timestamps.cancelledAt = new Date();
    if (data.status === "PREPARED") {
      timestamps.preparedAt = new Date();
      timestamps.preparedBy = session.userId;
    }
    if (data.status === "INSPECTED") {
      timestamps.inspectedAt = new Date();
      timestamps.inspectedBy = session.userId;
    }

    const order = await prisma.rentalOrder.update({
      where: { id },
      data: { ...data, ...timestamps },
      include: { items: true },
    });

    log.info(
      { orderId: order.id, status: order.status },
      "Rental order updated"
    );
    return NextResponse.json({ order });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update rental order",
      code: "RENTAL_ORDERS_ERROR",
      logContext: { tenantId, id },
    });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;
  const log = logger.child({
    tenantId,
    path: `/api/rental/orders/${id}`,
  });

  try {
    const existing = await prisma.rentalOrder.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Rental order not found" },
        { status: 404 }
      );
    }

    // Soft-delete: set status to CANCELLED
    const order = await prisma.rentalOrder.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    log.info({ orderId: id }, "Rental order cancelled");
    return NextResponse.json({ order });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete rental order",
      code: "RENTAL_ORDERS_ERROR",
      logContext: { tenantId, id },
    });
  }
}
