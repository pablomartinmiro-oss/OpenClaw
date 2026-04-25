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
  const log = logger.child({ slug, path: "/api/storefront/public/categories" });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: categories.length }, "Public categories fetched");
    return NextResponse.json({ categories });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public categories");
    return NextResponse.json(
      { error: "Error al obtener categorias" },
      { status: 500 }
    );
  }
}
