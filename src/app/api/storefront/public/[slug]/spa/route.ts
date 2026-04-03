export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const log = logger.child({ slug, path: "/api/storefront/public/spa" });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const categories = await prisma.spaCategory.findMany({
      where: { tenantId: tenant.id },
      include: {
        treatments: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            slug: true,
            duration: true,
            price: true,
            description: true,
            images: true,
            capacity: true,
          },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: categories.length }, "Public spa categories fetched");
    return NextResponse.json({ categories });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public spa data");
    return NextResponse.json(
      { error: "Error al obtener tratamientos" },
      { status: 500 }
    );
  }
}
