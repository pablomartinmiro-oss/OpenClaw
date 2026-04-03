export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createCmsMenuItemSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/menu-items" });
  const position = request.nextUrl.searchParams.get("position");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (position) where.position = position;

    const items = await prisma.cmsMenuItem.findMany({
      where,
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: items.length }, "CMS menu items fetched");
    return NextResponse.json({ items });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener items del menu",
      code: "CMS_MENU_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/cms/menu-items" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCmsMenuItemSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Validate parentId belongs to same tenant
    if (data.parentId) {
      const parent = await prisma.cmsMenuItem.findFirst({
        where: { id: data.parentId, tenantId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Item padre no encontrado" },
          { status: 400 }
        );
      }
    }

    const item = await prisma.cmsMenuItem.create({
      data: {
        tenantId,
        label: data.label,
        url: data.url,
        position: data.position,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    log.info({ itemId: item.id }, "CMS menu item created");
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear item del menu",
      code: "CMS_MENU_ERROR",
      logContext: { tenantId },
    });
  }
}
