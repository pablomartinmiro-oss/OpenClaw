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

  const modErr = await requireModule(tenant.id, "hotel");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId: tenant.id,
    path: `/api/storefront/${slug}/hotel`,
  });
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const guestsParam = searchParams.get("guests");
  const guests = guestsParam ? parseInt(guestsParam, 10) : undefined;

  try {
    const where: Record<string, unknown> = {
      tenantId: tenant.id,
      active: true,
    };
    if (guests) where.capacity = { gte: guests };

    const roomTypes = await prisma.roomType.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        capacity: true,
        basePrice: true,
        description: true,
        images: true,
      },
      orderBy: { basePrice: "asc" },
    });

    // If date range provided, check for blocked dates
    let availability: Record<string, boolean> | undefined;
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      const blocks = await prisma.roomBlock.findMany({
        where: {
          tenantId: tenant.id,
          date: { gte: fromDate, lte: toDate },
        },
        select: { roomTypeId: true },
      });
      const blockedIds = new Set(blocks.map((b) => b.roomTypeId));
      availability = {};
      for (const rt of roomTypes) {
        availability[rt.id] = !blockedIds.has(rt.id);
      }
    }

    log.info({ count: roomTypes.length }, "Public hotel rooms fetched");
    return NextResponse.json({
      roomTypes,
      availability,
      tenant: { name: tenant.name, slug: tenant.slug },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener habitaciones",
      code: "STOREFRONT_HOTEL_ERROR",
      logContext: { tenantId: tenant.id },
    });
  }
}
