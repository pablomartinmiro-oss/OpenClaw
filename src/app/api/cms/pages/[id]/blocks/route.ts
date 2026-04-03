export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createPageBlockSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id: pageId } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/cms/pages/${pageId}/blocks`,
  });

  try {
    // Verify page belongs to tenant
    const page = await prisma.staticPage.findFirst({
      where: { id: pageId, tenantId },
    });
    if (!page) {
      return NextResponse.json(
        { error: "Pagina no encontrada" },
        { status: 404 }
      );
    }

    const blocks = await prisma.pageBlock.findMany({
      where: { pageId, tenantId },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: blocks.length }, "Page blocks fetched");
    return NextResponse.json({ blocks });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener bloques",
      code: "CMS_BLOCKS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id: pageId } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/cms/pages/${pageId}/blocks`,
  });

  try {
    const page = await prisma.staticPage.findFirst({
      where: { id: pageId, tenantId },
    });
    if (!page) {
      return NextResponse.json(
        { error: "Pagina no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, createPageBlockSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const block = await prisma.pageBlock.create({
      data: {
        tenantId,
        pageId,
        type: data.type,
        content: data.content as Prisma.InputJsonValue,
        sortOrder: data.sortOrder,
      },
    });

    log.info({ blockId: block.id }, "Page block created");
    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear bloque",
      code: "CMS_BLOCKS_ERROR",
      logContext: { tenantId },
    });
  }
}
