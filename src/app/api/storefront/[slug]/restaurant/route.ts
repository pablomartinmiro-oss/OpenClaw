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

  const modErr = await requireModule(tenant.id, "restaurant");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/restaurant`,
  });

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { tenantId: tenant.id, active: true },
      select: {
        id: true,
        title: true,
        slug: true,
        capacity: true,
        depositPerGuest: true,
        operatingDays: true,
        description: true,
        shifts: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            maxCapacity: true,
            duration: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });

    log.info(
      { count: restaurants.length },
      "Public restaurants fetched"
    );
    return NextResponse.json({
      restaurants,
      tenant: { name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener restaurantes",
      code: "STOREFRONT_RESTAURANT_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
