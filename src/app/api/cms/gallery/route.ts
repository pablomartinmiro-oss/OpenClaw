export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createGalleryItemSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/gallery" });
  const category = request.nextUrl.searchParams.get("category");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (category) where.category = category;

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });
    log.info({ count: items.length }, "Gallery items fetched");
    return NextResponse.json({ items });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener galería", code: "CMS_GALLERY_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/gallery" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createGalleryItemSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const item = await prisma.galleryItem.create({
      data: { tenantId, ...validated.data },
    });
    log.info({ itemId: item.id }, "Gallery item created");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear item de galería", code: "CMS_GALLERY_ERROR", logContext: { tenantId } });
  }
}
