export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productSlug: string }> }
) {
  const { slug, productSlug } = await params;
  const log = logger.child({ slug, productSlug, path: "/api/storefront/public/products/[productSlug]" });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const product = await prisma.product.findFirst({
      where: {
        tenantId: tenant.id,
        slug: productSlug,
        isActive: true,
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        station: true,
        description: true,
        personType: true,
        priceType: true,
        price: true,
        coverImageUrl: true,
        images: true,
        includes: true,
        excludes: true,
        difficulty: true,
        metaTitle: true,
        metaDescription: true,
        isFeatured: true,
        sortOrder: true,
        variants: { select: { id: true, label: true, priceModifier: true, priceType: true } },
        timeSlots: { select: { id: true, type: true, startTime: true, endTime: true, capacity: true, dayOfWeek: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    log.info({ productId: product.id }, "Public product fetched by slug");
    return NextResponse.json({ product });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public product by slug");
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}
