export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const log = logger.child({ slug, path: "/api/storefront/public/products" });
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = {
      tenantId: tenant.id,
      isActive: true,
    };
    if (category) where.category = category;
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        station: true,
        description: true,
        personType: true,
        priceType: true,
        price: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
      take: Math.min(limit, 100),
    });

    log.info({ count: products.length }, "Public products fetched");
    return NextResponse.json({ products });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public products");
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}
