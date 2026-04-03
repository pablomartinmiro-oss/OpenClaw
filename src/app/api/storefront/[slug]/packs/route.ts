export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { requireModule } from "@/lib/modules/guard";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const modErr = await requireModule(tenant.id, "packs");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/packs`,
  });

  try {
    const packs = await prisma.legoPack.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        images: true,
        description: true,
        lines: {
          select: {
            id: true,
            productId: true,
            roomTypeId: true,
            treatmentId: true,
            quantity: true,
            isRequired: true,
            isOptional: true,
            isClientEditable: true,
            overridePrice: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });

    log.info({ count: packs.length }, "Public packs fetched");
    return NextResponse.json({
      packs,
      tenant: { name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener packs",
      code: "STOREFRONT_PACKS_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
