export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: `/api/cms/home-modules/${id}` });

  try {
    const existing = await prisma.homeModuleItem.findFirst({ where: { id, tenantId } });
    if (!existing) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });

    await prisma.homeModuleItem.delete({ where: { id } });
    log.info({ itemId: id }, "Home module item deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar módulo home", code: "CMS_HOME_MODULES_ERROR", logContext: { tenantId } });
  }
}
