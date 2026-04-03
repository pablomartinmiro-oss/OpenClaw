export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";

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

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/categories`,
  });

  try {
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        sortOrder: true,
        image: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    log.info({ count: categories.length }, "Public categories fetched");
    return NextResponse.json({
      categories,
      tenant: { name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener categorias",
      code: "STOREFRONT_CATEGORIES_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
