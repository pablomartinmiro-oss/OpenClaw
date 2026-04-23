export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { bulkImportProductSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/products/bulk-import" });

  try {
    const body = await req.json();
    const parsed = bulkImportProductSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => {
        const rowIndex =
          issue.path.length > 1 && typeof issue.path[1] === "number"
            ? issue.path[1]
            : null;
        const field = issue.path.slice(rowIndex !== null ? 2 : 0).join(".");
        return {
          ...(rowIndex !== null ? { row: rowIndex } : {}),
          ...(field ? { field } : {}),
          message: issue.message,
        };
      });
      return NextResponse.json(
        { error: "Datos de importación inválidos", details },
        { status: 400 }
      );
    }
    const data = parsed.data;

    let imported = 0;
    let updated = 0;

    for (const p of data.products) {
      // Only match tenant-owned products for updates.
      // Global catalog entries (tenantId: null) must never be mutated here.
      const existing = await prisma.product.findFirst({
        where: { name: p.name, tenantId },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            price: p.price,
            ...(p.category ? { category: p.category } : {}),
            ...(p.station ? { station: p.station } : {}),
            ...(p.priceType ? { priceType: p.priceType } : {}),
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            tenantId,
            name: p.name,
            category: p.category || "alquiler",
            station: p.station || "all",
            price: p.price,
            priceType: p.priceType || "fixed",
            isActive: true,
          },
        });
        imported++;
      }
    }

    log.info({ imported, updated }, "Bulk import completed");
    return NextResponse.json({ imported: imported + updated, created: imported, updated });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to import products", code: "PRODUCTS_ERROR", logContext: { tenantId } });
  }
}
