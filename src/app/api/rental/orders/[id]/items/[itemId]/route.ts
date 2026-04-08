export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateRentalOrderItemSchema,
} from "@/lib/validation";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id, itemId } = await ctx.params;
  const log = logger.child({
    tenantId,
    path: `/api/rental/orders/${id}/items/${itemId}`,
  });

  try {
    // Verify order belongs to tenant
    const order = await prisma.rentalOrder.findFirst({
      where: { id, tenantId },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Rental order not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.rentalOrderItem.findFirst({
      where: { id: itemId, rentalOrderId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateRentalOrderItemSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const item = await prisma.rentalOrderItem.update({
      where: { id: itemId },
      data: validated.data,
    });

    log.info({ itemId: item.id }, "Rental order item updated");
    return NextResponse.json({ item });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update order item",
      code: "RENTAL_ORDER_ITEMS_ERROR",
      logContext: { tenantId, orderId: id, itemId },
    });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id, itemId } = await ctx.params;
  const log = logger.child({
    tenantId,
    path: `/api/rental/orders/${id}/items/${itemId}`,
  });

  try {
    const order = await prisma.rentalOrder.findFirst({
      where: { id, tenantId },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Rental order not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.rentalOrderItem.findFirst({
      where: { id: itemId, rentalOrderId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    await prisma.rentalOrderItem.delete({ where: { id: itemId } });
    log.info({ itemId }, "Rental order item deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete order item",
      code: "RENTAL_ORDER_ITEMS_ERROR",
      logContext: { tenantId, orderId: id, itemId },
    });
  }
}
