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
  const log = logger.child({ slug, path: "/api/storefront/public/platforms" });

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const platforms = await prisma.externalPlatform.findMany({
      where: { tenantId: tenant.id, active: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ platforms });
  } catch (error) {
    log.error({ err: error }, "Failed to fetch public platforms");
    return NextResponse.json(
      { error: "Error al obtener plataformas" },
      { status: 500 }
    );
  }
}
