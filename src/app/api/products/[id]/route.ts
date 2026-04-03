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
    const existing = await prisma.product.findFirst({
      where: { id, OR: [{ tenantId }, { tenantId: null }] },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateProductSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.category !== undefined && { category: data.category }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.station !== undefined && { station: data.station || "all" }),
        ...(data.personType !== undefined && { personType: data.personType || null }),
        ...(data.tier !== undefined && { tier: data.tier || null }),
        ...(data.includesHelmet !== undefined && { includesHelmet: data.includesHelmet }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.priceType !== undefined && { priceType: data.priceType }),
        ...(data.pricingMatrix !== undefined && { pricingMatrix: data.pricingMatrix ? JSON.parse(JSON.stringify(data.pricingMatrix)) : null }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
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
    const existing = await prisma.product.findFirst({
      where: { id, OR: [{ tenantId }, { tenantId: null }] },
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
