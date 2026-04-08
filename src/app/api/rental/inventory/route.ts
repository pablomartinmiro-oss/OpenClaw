export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createRentalInventorySchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/rental/inventory" });
  const { searchParams } = request.nextUrl;
  const stationSlug = searchParams.get("stationSlug");
  const equipmentType = searchParams.get("equipmentType");
  const qualityTier = searchParams.get("qualityTier");

  try {
    const where: Prisma.RentalInventoryWhereInput = { tenantId };
    if (stationSlug) where.stationSlug = stationSlug;
    if (equipmentType) where.equipmentType = equipmentType;
    if (qualityTier) where.qualityTier = qualityTier;

    const inventory = await prisma.rentalInventory.findMany({
      where,
      orderBy: [
        { stationSlug: "asc" },
        { equipmentType: "asc" },
        { size: "asc" },
      ],
    });

    log.info({ count: inventory.length }, "Rental inventory fetched");
    return NextResponse.json({ inventory });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch rental inventory",
      code: "RENTAL_INVENTORY_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/rental/inventory" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createRentalInventorySchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const item = await prisma.rentalInventory.create({
      data: {
        tenantId,
        stationSlug: data.stationSlug,
        equipmentType: data.equipmentType,
        size: data.size,
        qualityTier: data.qualityTier,
        totalQuantity: data.totalQuantity,
        availableQuantity: data.availableQuantity,
        minStockAlert: data.minStockAlert,
        notes: data.notes ?? null,
      },
    });

    log.info({ itemId: item.id }, "Rental inventory created");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create rental inventory",
      code: "RENTAL_INVENTORY_ERROR",
      logContext: { tenantId },
    });
  }
}
