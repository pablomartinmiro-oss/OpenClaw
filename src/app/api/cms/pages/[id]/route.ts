export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateStaticPageSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/cms/pages/${id}` });

  try {
    const page = await prisma.staticPage.findFirst({
      where: { id, tenantId },
      include: {
        blocks: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!page) {
      return NextResponse.json(
        { error: "Pagina no encontrada" },
        { status: 404 }
      );
    }

    log.info({ pageId: id }, "CMS page fetched");
    return NextResponse.json({ page });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener pagina",
      code: "CMS_PAGES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/cms/pages/${id}` });

  try {
    const existing = await prisma.staticPage.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pagina no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateStaticPageSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const page = await prisma.staticPage.update({
      where: { id },
      data: validated.data,
    });

    log.info({ pageId: id }, "CMS page updated");
    return NextResponse.json({ page });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar pagina",
      code: "CMS_PAGES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/cms/pages/${id}` });

  try {
    const existing = await prisma.staticPage.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pagina no encontrada" },
        { status: 404 }
      );
    }

    await prisma.staticPage.delete({ where: { id } });

    log.info({ pageId: id }, "CMS page deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar pagina",
      code: "CMS_PAGES_ERROR",
      logContext: { tenantId },
    });
  }
}
