export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createVariantSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/catalog/variants" });
  const { searchParams } = request.nextUrl;
  const productId = searchParams.get("productId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (productId) where.productId = productId;

    const variants = await prisma.experienceVariant.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    log.info({ count: variants.length }, "Variants fetched");
    return NextResponse.json({ variants });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch variants",
      code: "VARIANTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/catalog/variants" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createVariantSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    // Verify product exists for this tenant
    const product = await prisma.product.findFirst({
      where: { id: data.productId, OR: [{ tenantId }, { tenantId: null }] },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variant = await prisma.experienceVariant.create({
      data: {
        tenantId,
        productId: data.productId,
        label: data.label,
        priceModifier: data.priceModifier ?? 0,
        priceType: data.priceType ?? "fixed",
      },
    });

    log.info({ variantId: variant.id }, "Variant created");
    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create variant",
      code: "VARIANTS_ERROR",
      logContext: { tenantId },
    });
  }
}
