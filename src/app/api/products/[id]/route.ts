export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateProductSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const log = logger.child({ tenantId, path: `/api/products/${id}` });

  try {
    // Write operations only permitted on tenant-owned products.
    // Do NOT include { tenantId: null } here — that would allow mutating
    // the shared global catalog which is read-only for all tenants.
    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateProductSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    // Build update payload — only include fields that were explicitly sent
    const updateData: Record<string, unknown> = {};
    const fields = [
      "category", "name", "description", "station", "personType", "tier",
      "includesHelmet", "price", "priceType", "sortOrder", "isActive",
      "slug", "fiscalRegime", "productType", "providerPercent",
      "agencyMarginPercent", "supplierCommissionPercent", "supplierCostType",
      "settlementFrequency", "isSettlable", "isFeatured", "isPublished",
      "isPresentialSale", "discountPercent", "discountExpiresAt",
      "coverImageUrl", "metaTitle", "metaDescription", "difficulty",
    ] as const;
    for (const f of fields) {
      if (data[f] !== undefined) updateData[f] = data[f];
    }
    // JSON fields need serialization
    if (data.pricingMatrix !== undefined) updateData.pricingMatrix = data.pricingMatrix ? JSON.parse(JSON.stringify(data.pricingMatrix)) : null;
    if (data.images !== undefined) updateData.images = JSON.parse(JSON.stringify(data.images));
    if (data.includes !== undefined) updateData.includes = data.includes ? JSON.parse(JSON.stringify(data.includes)) : null;
    if (data.excludes !== undefined) updateData.excludes = data.excludes ? JSON.parse(JSON.stringify(data.excludes)) : null;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    log.info({ productId: id }, "Product updated");
    return NextResponse.json({ product });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to update product", code: "PRODUCTS_ERROR", logContext: { tenantId } });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const log = logger.child({ tenantId, path: `/api/products/${id}` });

  try {
    // Write operations only permitted on tenant-owned products.
    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    log.info({ productId: id }, "Product deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to delete product", code: "PRODUCTS_ERROR", logContext: { tenantId } });
  }
}
