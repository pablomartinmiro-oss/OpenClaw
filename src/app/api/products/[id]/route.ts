import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/products/${id}` });

  try {
    // Verify product belongs to tenant
    const existing = await prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.category !== undefined && { category: body.category }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.destination !== undefined && { destination: body.destination || null }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.priceType !== undefined && { priceType: body.priceType }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    log.info({ productId: id }, "Product updated");
    return NextResponse.json({ product });
  } catch (error) {
    log.error({ error }, "Failed to update product");
    return NextResponse.json(
      { error: "Failed to update product", code: "PRODUCTS_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/products/${id}` });

  try {
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
    log.error({ error }, "Failed to delete product");
    return NextResponse.json(
      { error: "Failed to delete product", code: "PRODUCTS_ERROR" },
      { status: 500 }
    );
  }
}
