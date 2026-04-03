export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updatePageBlockSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

type RouteParams = { params: Promise<{ id: string; blockId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id: pageId, blockId } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/cms/pages/${pageId}/blocks/${blockId}`,
  });

  try {
    const existing = await prisma.pageBlock.findFirst({
      where: { id: blockId, pageId, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Bloque no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updatePageBlockSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const block = await prisma.pageBlock.update({
      where: { id: blockId },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.content !== undefined && {
          content: data.content as Prisma.InputJsonValue,
        }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    log.info({ blockId }, "Page block updated");
    return NextResponse.json({ block });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar bloque",
      code: "CMS_BLOCKS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id: pageId, blockId } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/cms/pages/${pageId}/blocks/${blockId}`,
  });

  try {
    const existing = await prisma.pageBlock.findFirst({
      where: { id: blockId, pageId, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Bloque no encontrado" },
        { status: 404 }
      );
    }

    await prisma.pageBlock.delete({ where: { id: blockId } });

    log.info({ blockId }, "Page block deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar bloque",
      code: "CMS_BLOCKS_ERROR",
      logContext: { tenantId },
    });
  }
}
