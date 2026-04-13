export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const log = logger.child({ tenantId, path: `/api/products/${id}/clone` });

  try {
    const source = await prisma.product.findFirst({
      where: { id, OR: [{ tenantId }, { tenantId: null }] },
    });
    if (!source) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Strip fields that should not be copied
    const { id: _id, createdAt: _ca, updatedAt: _ua, slug: _slug, ...rest } = source;

    const cloned = await prisma.product.create({
      data: {
        ...rest,
        tenantId, // always owned by current tenant
        name: `${source.name} (copia)`,
        slug: null, // slug must be unique — leave null for clone
        isActive: false, // clones start inactive
        pricingMatrix: source.pricingMatrix ? JSON.parse(JSON.stringify(source.pricingMatrix)) : null,
        images: source.images ? JSON.parse(JSON.stringify(source.images)) : [],
        includes: source.includes ? JSON.parse(JSON.stringify(source.includes)) : null,
        excludes: source.excludes ? JSON.parse(JSON.stringify(source.excludes)) : null,
      },
    });

    log.info({ sourceId: id, clonedId: cloned.id }, "Product cloned");
    return NextResponse.json({ product: cloned }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to clone product", code: "PRODUCT_CLONE_ERROR", logContext: { tenantId } });
  }
}
