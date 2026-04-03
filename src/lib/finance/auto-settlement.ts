import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { SupplierSettlement } from "@/generated/prisma/client";

/**
 * Generate a settlement for a supplier over a date range.
 * Finds confirmed reservations whose quotes contain products
 * linked to this supplier, calculates commission per line,
 * and creates a draft SupplierSettlement.
 */
export async function generateSettlement(
  tenantId: string,
  supplierId: string,
  startDate: Date,
  endDate: Date
): Promise<SupplierSettlement> {
  const log = logger.child({ tenantId, supplierId, fn: "generateSettlement" });

  // 1. Verify supplier exists
  const supplier = await prisma.supplier.findFirst({
    where: { id: supplierId, tenantId },
  });

  if (!supplier) {
    throw new Error("Proveedor no encontrado");
  }

  // 2. Find products linked to this supplier
  const products = await prisma.product.findMany({
    where: { supplierId, tenantId },
    select: { id: true, name: true, price: true, category: true },
  });

  const productIds = products.map((p) => p.id);
  const productMap = new Map(products.map((p) => [p.id, p]));

  // 3. Find confirmed reservations in range that have a quote with supplier products
  const reservations = await prisma.reservation.findMany({
    where: {
      tenantId,
      status: "confirmada",
      activityDate: { gte: startDate, lte: endDate },
      quoteId: { not: null },
    },
    select: {
      id: true,
      activityDate: true,
      totalPrice: true,
      quote: {
        select: {
          items: {
            where: { productId: { in: productIds } },
            select: {
              productId: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
        },
      },
    },
  });

  // 4. Build settlement lines from matching quote items
  type LineData = {
    serviceType: string;
    productId: string | null;
    serviceDate: Date;
    paxCount: number;
    saleAmount: number;
    commissionPercentage: number;
    commissionAmount: number;
    reservationId: string;
  };

  const lines: LineData[] = [];
  let grossAmount = 0;
  let commissionTotal = 0;

  for (const reservation of reservations) {
    const items = reservation.quote?.items ?? [];
    for (const item of items) {
      if (!item.productId) continue;
      const product = productMap.get(item.productId);
      if (!product) continue;

      const saleAmount = item.totalPrice;
      const commPct = supplier.commissionPercentage;
      const commAmount = Math.round(saleAmount * commPct) / 100;

      lines.push({
        serviceType: product.category === "spa" ? "spa" : "activity",
        productId: item.productId,
        serviceDate: reservation.activityDate,
        paxCount: item.quantity,
        saleAmount,
        commissionPercentage: commPct,
        commissionAmount: commAmount,
        reservationId: reservation.id,
      });

      grossAmount += saleAmount;
      commissionTotal += commAmount;
    }
  }

  // 5. Generate settlement number: LIQ-YYYY-NNNN
  const year = new Date().getFullYear();
  const count = await prisma.supplierSettlement.count({
    where: { tenantId },
  });
  const number = `LIQ-${year}-${String(count + 1).padStart(4, "0")}`;

  const netAmount = grossAmount - commissionTotal;

  // 6. Create settlement + lines + status log in a transaction
  const settlement = await prisma.$transaction(async (tx) => {
    const created = await tx.supplierSettlement.create({
      data: {
        tenantId,
        supplierId,
        number,
        startDate,
        endDate,
        status: "draft",
        grossAmount,
        commissionAmount: commissionTotal,
        netAmount,
      },
    });

    if (lines.length > 0) {
      await tx.settlementLine.createMany({
        data: lines.map((line) => ({
          tenantId,
          settlementId: created.id,
          ...line,
        })),
      });
    }

    await tx.settlementStatusLog.create({
      data: {
        tenantId,
        settlementId: created.id,
        previousStatus: "",
        newStatus: "draft",
        actorId: "system",
      },
    });

    return created;
  });

  log.info(
    { settlementId: settlement.id, lines: lines.length, grossAmount, netAmount },
    "Settlement generated"
  );

  return settlement;
}
