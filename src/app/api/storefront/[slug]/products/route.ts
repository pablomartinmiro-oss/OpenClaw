export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/products`,
  });
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const station = searchParams.get("station");

  try {
    const where: Record<string, unknown> = {
      isActive: true,
      OR: [{ tenantId: tenant.id }, { tenantId: null }],
    };
    if (category) where.category = category;
    if (station) where.station = station;
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        category: true,
        name: true,
        station: true,
        description: true,
        personType: true,
        tier: true,
        includesHelmet: true,
        priceType: true,
        price: true,
        pricingMatrix: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    log.info({ count: products.length }, "Public products fetched");
    return NextResponse.json({
      products,
      tenant: { name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener productos",
      code: "STOREFRONT_PRODUCTS_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
