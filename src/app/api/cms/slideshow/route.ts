export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createSlideshowItemSchema } from "@/lib/validation";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/slideshow" });

  try {
    const items = await prisma.slideshowItem.findMany({
      where: { tenantId },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: items.length }, "Slideshow items fetched");
    return NextResponse.json({ items });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener slideshow",
      code: "CMS_SLIDESHOW_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/slideshow" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createSlideshowItemSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const item = await prisma.slideshowItem.create({
      data: {
        tenantId,
        imageUrl: data.imageUrl,
        caption: data.caption ?? null,
        linkUrl: data.linkUrl || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        // PORT-05 enrichment
        badge: data.badge ?? null,
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        description: data.description ?? null,
        ctaText: data.ctaText ?? null,
        ctaUrl: data.ctaUrl || null,
        reserveUrl: data.reserveUrl || null,
      },
    });

    log.info({ itemId: item.id }, "Slideshow item created");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear slide",
      code: "CMS_SLIDESHOW_ERROR",
      logContext: { tenantId },
    });
  }
}
