export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const log = logger.child({ slug, path: "/api/storefront/public/gallery" });
  const category = request.nextUrl.searchParams.get("category");

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const where: Record<string, unknown> = {
      tenantId: tenant.id,
      isActive: true,
    };
    if (category) where.category = category;

    const items = await prisma.galleryItem.findMany({
      where,
      select: {
        id: true,
        imageUrl: true,
        title: true,
        category: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: items.length }, "Public gallery fetched");
    return NextResponse.json({ items });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public gallery");
    return NextResponse.json({ error: "Error al obtener galería" }, { status: 500 });
  }
}
