export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createHomeModuleItemSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/home-modules" });
  const moduleKey = request.nextUrl.searchParams.get("moduleKey");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (moduleKey) where.moduleKey = moduleKey;

    const items = await prisma.homeModuleItem.findMany({
      where,
      orderBy: [{ moduleKey: "asc" }, { sortOrder: "asc" }],
    });
    log.info({ count: items.length }, "Home module items fetched");
    return NextResponse.json({ items });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener módulos home", code: "CMS_HOME_MODULES_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/home-modules" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createHomeModuleItemSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });

    const item = await prisma.homeModuleItem.create({
      data: { tenantId, ...validated.data },
    });
    log.info({ itemId: item.id }, "Home module item created");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear módulo home", code: "CMS_HOME_MODULES_ERROR", logContext: { tenantId } });
  }
}
