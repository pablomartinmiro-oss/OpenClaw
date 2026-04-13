export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const log = logger.child({ slug, path: "/api/storefront/public/slideshow" });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const items = await prisma.slideshowItem.findMany({
      where: { tenantId: tenant.id, isActive: true },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        linkUrl: true,
        sortOrder: true,
        badge: true,
        title: true,
        subtitle: true,
        description: true,
        ctaText: true,
        ctaUrl: true,
        reserveUrl: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: items.length }, "Public slideshow fetched");
    return NextResponse.json({ items });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public slideshow");
    return NextResponse.json({ error: "Error al obtener slideshow" }, { status: 500 });
  }
}
