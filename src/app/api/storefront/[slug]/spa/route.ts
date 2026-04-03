export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { lookupTenant } from "@/lib/storefront/tenant-lookup";
import { requireModule } from "@/lib/modules/guard";

type RouteCtx = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const tenant = await lookupTenant(slug);
  if (!tenant) {
    return NextResponse.json(
      { error: "Tienda no encontrada" },
      { status: 404 }
    );
  }

  const modErr = await requireModule(tenant.id, "spa");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/spa`,
  });
  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("categoryId");

  try {
    const treatmentWhere: Record<string, unknown> = {
      tenantId: tenant.id,
      active: true,
    };
    if (categoryId) treatmentWhere.categoryId = categoryId;

    const [categories, treatments] = await Promise.all([
      prisma.spaCategory.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, name: true, slug: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.spaTreatment.findMany({
        where: treatmentWhere,
        select: {
          id: true,
          categoryId: true,
          title: true,
          slug: true,
          duration: true,
          capacity: true,
          price: true,
          images: true,
          description: true,
        },
        orderBy: [{ title: "asc" }],
      }),
    ]);

    log.info(
      { treatments: treatments.length },
      "Public spa treatments fetched"
    );
    return NextResponse.json({
      categories,
      treatments,
      tenant: { name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener tratamientos spa",
      code: "STOREFRONT_SPA_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
