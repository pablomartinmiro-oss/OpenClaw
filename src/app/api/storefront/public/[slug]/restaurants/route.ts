export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const log = logger.child({ slug, path: "/api/storefront/public/restaurants" });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const restaurants = await prisma.restaurant.findMany({
      where: { tenantId: tenant.id, active: true },
      include: {
        shifts: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            maxCapacity: true,
          },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { title: "asc" },
    });

    log.info({ count: restaurants.length }, "Public restaurants fetched");
    return NextResponse.json({ restaurants });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public restaurants");
    return NextResponse.json(
      { error: "Error al obtener restaurantes" },
      { status: 500 }
    );
  }
}
