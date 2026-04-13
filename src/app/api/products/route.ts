export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createProductSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/products" });
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const station = searchParams.get("station");

  try {
    // Products are tenant-scoped OR global (tenantId=null for shared catalog)
    const where: Record<string, unknown> = {
      OR: [{ tenantId }, { tenantId: null }],
    };
    if (category) where.category = category;
    if (station) where.station = station;

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { category: "asc" }, { name: "asc" }],
    });

    log.info({ count: products.length }, "Products fetched");
    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to fetch products", code: "PRODUCTS_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/products" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createProductSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const product = await prisma.product.create({
      data: {
        tenantId,
        category: data.category,
        name: data.name,
        station: data.station || "all",
        description: data.description || null,
        personType: data.personType || null,
        tier: data.tier || null,
        includesHelmet: data.includesHelmet ?? false,
        price: data.price,
        priceType: data.priceType,
        pricingMatrix: data.pricingMatrix ? JSON.parse(JSON.stringify(data.pricingMatrix)) : null,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        // PORT-04 enrichment fields
        slug: data.slug || null,
        fiscalRegime: data.fiscalRegime ?? "general",
        productType: data.productType || null,
        providerPercent: data.providerPercent ?? null,
        agencyMarginPercent: data.agencyMarginPercent ?? null,
        supplierCommissionPercent: data.supplierCommissionPercent ?? null,
        supplierCostType: data.supplierCostType || null,
        settlementFrequency: data.settlementFrequency || null,
        isSettlable: data.isSettlable ?? false,
        isFeatured: data.isFeatured ?? false,
        isPublished: data.isPublished ?? true,
        isPresentialSale: data.isPresentialSale ?? false,
        discountPercent: data.discountPercent ?? null,
        discountExpiresAt: data.discountExpiresAt ?? null,
        coverImageUrl: data.coverImageUrl || null,
        images: data.images ? JSON.parse(JSON.stringify(data.images)) : [],
        includes: data.includes ? JSON.parse(JSON.stringify(data.includes)) : null,
        excludes: data.excludes ? JSON.parse(JSON.stringify(data.excludes)) : null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        difficulty: data.difficulty || null,
      },
    });

    log.info({ productId: product.id }, "Product created");
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to create product", code: "PRODUCTS_ERROR", logContext: { tenantId } });
  }
}
