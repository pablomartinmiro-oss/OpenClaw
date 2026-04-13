export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateGalleryItemSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/cms/gallery/${id}` });

  try {
    const existing = await prisma.galleryItem.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });

    const body = await request.json();
    const validated = validateBody(body, updateGalleryItemSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const item = await prisma.galleryItem.update({ where: { id }, data: validated.data });
    log.info({ itemId: id }, "Gallery item updated");
    return NextResponse.json({ item });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al actualizar item", code: "CMS_GALLERY_ERROR", logContext: { tenantId } });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/cms/gallery/${id}` });

  try {
    const existing = await prisma.galleryItem.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });

    await prisma.galleryItem.delete({ where: { id } });
    log.info({ itemId: id }, "Gallery item deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar item", code: "CMS_GALLERY_ERROR", logContext: { tenantId } });
  }
}
