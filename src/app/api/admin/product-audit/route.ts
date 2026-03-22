import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/product-audit
 * Returns duplicate products, test products, and zero-price products.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  const log = logger.child({ tenantId, path: "/api/admin/product-audit" });

  try {
    const products = await prisma.product.findMany({
      where: { OR: [{ tenantId }, { tenantId: null }] },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Find duplicates (same name, different IDs)
    const nameMap = new Map<string, typeof products>();
    for (const p of products) {
      const key = p.name.toLowerCase().trim();
      if (!nameMap.has(key)) nameMap.set(key, []);
      nameMap.get(key)!.push(p);
    }
    const duplicates = Array.from(nameMap.entries())
      .filter(([, prods]) => prods.length > 1)
      .map(([name, prods]) => ({ name, count: prods.length, products: prods.map((p) => ({ id: p.id, name: p.name, station: p.station, price: p.price })) }));

    // Find zero-price products
    const zeroPriceProducts = products.filter((p) => p.price === 0 && p.isActive);

    // Find test products (name contains "test" or "prueba")
    const testProducts = products.filter((p) => {
      const lower = p.name.toLowerCase();
      return lower.includes("test") || lower.includes("prueba") || lower.includes("xxx");
    });

    // Find inactive products
    const inactiveProducts = products.filter((p) => !p.isActive);

    log.info({
      total: products.length,
      duplicates: duplicates.length,
      zeroPrice: zeroPriceProducts.length,
      test: testProducts.length,
      inactive: inactiveProducts.length,
    }, "Product audit completed");

    return NextResponse.json({
      total: products.length,
      duplicates: duplicates.map((d) => ({ name: d.name, count: d.count, products: d.products })),
      zeroPriceProducts: zeroPriceProducts.map((p) => ({ id: p.id, name: p.name, category: p.category, station: p.station })),
      testProducts: testProducts.map((p) => ({ id: p.id, name: p.name, category: p.category })),
      inactiveProducts: inactiveProducts.map((p) => ({ id: p.id, name: p.name, category: p.category })),
    });
  } catch (error) {
    log.error({ error }, "Product audit failed");
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
