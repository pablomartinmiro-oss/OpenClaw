export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, pickupActionSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;
  const log = logger.child({
    tenantId,
    path: `/api/rental/orders/${id}/pickup`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, pickupActionSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const { items, notes } = validated.data;

    // Verify order exists and is in valid status
    const order = await prisma.rentalOrder.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Rental order not found" },
        { status: 404 }
      );
    }
    if (order.status !== "RESERVED" && order.status !== "PREPARED") {
      return NextResponse.json(
        { error: `No se puede recoger un pedido con estado ${order.status}` },
        { status: 400 }
      );
    }

    // Atomic transaction: update items + decrement inventory + update order
    const result = await prisma.$transaction(async (tx) => {
      for (const pickupItem of items) {
        const orderItem = order.items.find(
          (i) => i.id === pickupItem.itemId
        );
        if (!orderItem) {
          throw new Error(
            `Item ${pickupItem.itemId} not found in order`
          );
        }

        // Update item with assigned size and DIN
        await tx.rentalOrderItem.update({
          where: { id: pickupItem.itemId },
          data: {
            size: pickupItem.size,
            dinSetting: pickupItem.dinSetting ?? null,
            itemStatus: "PICKED_UP",
          },
        });

        // Decrement available inventory
        const inventory = await tx.rentalInventory.findFirst({
          where: {
            tenantId,
            stationSlug: order.stationSlug,
            equipmentType: orderItem.equipmentType,
            size: pickupItem.size,
            qualityTier: orderItem.qualityTier,
          },
        });

        if (inventory && inventory.availableQuantity > 0) {
          await tx.rentalInventory.update({
            where: { id: inventory.id },
            data: {
              availableQuantity: { decrement: 1 },
            },
          });
        }
      }

      // Update order status
      const updated = await tx.rentalOrder.update({
        where: { id },
        data: {
          status: "PICKED_UP",
          pickedUpAt: new Date(),
          pickedUpBy: session.userId,
          notes: notes ? notes : order.notes,
        },
        include: { items: true },
      });

      return updated;
    });

    log.info(
      { orderId: id, itemCount: items.length },
      "Rental pickup completed"
    );
    return NextResponse.json({ order: result });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to process pickup",
      code: "RENTAL_PICKUP_ERROR",
      logContext: { tenantId, orderId: id },
    });
  }
}
