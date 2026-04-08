export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateRentalInventorySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;

  try {
    const item = await prisma.rentalInventory.findFirst({
      where: { id, tenantId },
    });
    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ item });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch inventory item",
      code: "RENTAL_INVENTORY_ERROR",
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
    path: `/api/rental/inventory/${id}`,
  });

  try {
    const existing = await prisma.rentalInventory.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateRentalInventorySchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const item = await prisma.rentalInventory.update({
      where: { id },
      data: validated.data,
    });

    log.info({ itemId: item.id }, "Rental inventory updated");
    return NextResponse.json({ item });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update inventory item",
      code: "RENTAL_INVENTORY_ERROR",
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
    path: `/api/rental/inventory/${id}`,
  });

  try {
    const existing = await prisma.rentalInventory.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    await prisma.rentalInventory.delete({ where: { id } });
    log.info({ itemId: id }, "Rental inventory deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete inventory item",
      code: "RENTAL_INVENTORY_ERROR",
      logContext: { tenantId, id },
    });
  }
}
