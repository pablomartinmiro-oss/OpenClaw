export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createRentalOrderItemSchema,
} from "@/lib/validation";

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
    });
    if (!order) {
      return NextResponse.json(
        { error: "Rental order not found" },
        { status: 404 }
      );
    }

    const items = await prisma.rentalOrderItem.findMany({
      where: { rentalOrderId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch order items",
      code: "RENTAL_ORDER_ITEMS_ERROR",
      logContext: { tenantId, orderId: id },
    });
  }
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;
  const log = logger.child({
    tenantId,
    path: `/api/rental/orders/${id}/items`,
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

    const body = await request.json();
    const validated = validateBody(body, createRentalOrderItemSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const item = await prisma.rentalOrderItem.create({
      data: {
        rentalOrderId: id,
        participantName: data.participantName,
        equipmentType: data.equipmentType,
        size: data.size ?? null,
        qualityTier: data.qualityTier,
        dinSetting: data.dinSetting ?? null,
        unitPrice: data.unitPrice,
      },
    });

    log.info(
      { itemId: item.id, orderId: id },
      "Rental order item created"
    );
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create order item",
      code: "RENTAL_ORDER_ITEMS_ERROR",
      logContext: { tenantId, orderId: id },
    });
  }
}
