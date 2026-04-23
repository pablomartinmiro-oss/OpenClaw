export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rl = await rateLimit(getClientIP(request), "public");
  if (rl) return rl;

  const { slug } = await params;
  const log = logger.child({ slug, path: "/api/storefront/public/rooms" });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const roomTypes = await prisma.roomType.findMany({
      where: { tenantId: tenant.id, active: true },
      select: {
        id: true,
        title: true,
        slug: true,
        capacity: true,
        basePrice: true,
        description: true,
        images: true,
      },
      orderBy: { title: "asc" },
    });

    log.info({ count: roomTypes.length }, "Public room types fetched");
    return NextResponse.json({ roomTypes });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public room types");
    return NextResponse.json(
      { error: "Error al obtener habitaciones" },
      { status: 500 }
    );
  }
}
