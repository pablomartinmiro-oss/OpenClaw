export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, returnActionSchema } from "@/lib/validation";

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
    path: `/api/rental/orders/${id}/return`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, returnActionSchema);
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
    if (order.status !== "PICKED_UP" && order.status !== "IN_USE") {
      return NextResponse.json(
        { error: `No se puede devolver un pedido con estado ${order.status}` },
        { status: 400 }
      );
    }

    // Atomic transaction: update items + increment inventory (if OK) + update order
    const result = await prisma.$transaction(async (tx) => {
      for (const returnItem of items) {
        const orderItem = order.items.find(
          (i) => i.id === returnItem.itemId
        );
        if (!orderItem) {
          throw new Error(
            `Item ${returnItem.itemId} not found in order`
          );
        }

        // Update item condition
        await tx.rentalOrderItem.update({
          where: { id: returnItem.itemId },
          data: {
            itemStatus:
              returnItem.conditionOnReturn === "DAMAGED"
                ? "DAMAGED"
                : "RETURNED",
            conditionOnReturn: returnItem.conditionOnReturn,
            damageNotes: returnItem.damageNotes ?? null,
          },
        });

        // Only increment inventory if equipment is OK
        // NEEDS_SERVICE and DAMAGED items stay out of available pool
        if (
          returnItem.conditionOnReturn === "OK" &&
          orderItem.size
        ) {
          const inventory = await tx.rentalInventory.findFirst({
            where: {
              tenantId,
              stationSlug: order.stationSlug,
              equipmentType: orderItem.equipmentType,
              size: orderItem.size,
              qualityTier: orderItem.qualityTier,
            },
          });

          if (inventory) {
            await tx.rentalInventory.update({
              where: { id: inventory.id },
              data: {
                availableQuantity: {
                  increment: 1,
                },
              },
            });
          }
        }
      }

      // Update order status
      const updated = await tx.rentalOrder.update({
        where: { id },
        data: {
          status: "RETURNED",
          returnedAt: new Date(),
          returnedBy: session.userId,
          notes: notes ? notes : order.notes,
        },
        include: { items: true },
      });

      return updated;
    });

    log.info(
      { orderId: id, itemCount: items.length },
      "Rental return completed"
    );
    return NextResponse.json({ order: result });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to process return",
      code: "RENTAL_RETURN_ERROR",
      logContext: { tenantId, orderId: id },
    });
  }
}
