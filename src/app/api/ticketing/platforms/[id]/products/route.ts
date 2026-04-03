export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createPlatformProductSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id: platformId } = await params;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/platforms/${platformId}/products`,
  });

  try {
    // Verify platform belongs to tenant
    const platform = await prisma.externalPlatform.findFirst({
      where: { id: platformId, tenantId },
    });
    if (!platform) {
      return NextResponse.json(
        { error: "Plataforma no encontrada" },
        { status: 404 }
      );
    }

    const products = await prisma.platformProduct.findMany({
      where: { tenantId, platformId },
      include: {
        product: { select: { id: true, name: true, category: true, station: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: products.length }, "Platform products fetched");
    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener productos de plataforma",
      code: "TICKETING_PLATFORM_PRODUCTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id: platformId } = await params;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/platforms/${platformId}/products`,
  });

  try {
    // Verify platform belongs to tenant
    const platform = await prisma.externalPlatform.findFirst({
      where: { id: platformId, tenantId },
    });
    if (!platform) {
      return NextResponse.json(
        { error: "Plataforma no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, createPlatformProductSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id: data.productId, tenantId },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const platformProduct = await prisma.platformProduct.create({
      data: {
        tenantId,
        platformId,
        productId: data.productId,
        externalId: data.externalId ?? null,
        externalUrl: data.externalUrl ?? null,
        status: data.status,
      },
      include: {
        product: { select: { id: true, name: true, category: true, station: true } },
      },
    });

    log.info({ platformProductId: platformProduct.id }, "Platform product linked");
    return NextResponse.json({ product: platformProduct }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al vincular producto a plataforma",
      code: "TICKETING_PLATFORM_PRODUCTS_ERROR",
      logContext: { tenantId },
    });
  }
}
