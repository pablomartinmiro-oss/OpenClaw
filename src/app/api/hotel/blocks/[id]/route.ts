export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateRoomBlockSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/hotel/blocks/${id}`,
  });

  try {
    const existing = await prisma.roomBlock.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateRoomBlockSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const block = await prisma.roomBlock.update({
      where: { id },
      data: {
        ...(data.unitCount !== undefined && {
          unitCount: data.unitCount,
        }),
        ...(data.reason !== undefined && { reason: data.reason }),
      },
    });

    log.info({ blockId: id }, "Block updated");
    return NextResponse.json({ block });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update block",
      code: "BLOCKS_ERROR",
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

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "hotel");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/hotel/blocks/${id}`,
  });

  try {
    const existing = await prisma.roomBlock.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    await prisma.roomBlock.delete({ where: { id } });

    log.info({ blockId: id }, "Block deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete block",
      code: "BLOCKS_ERROR",
      logContext: { tenantId },
    });
  }
}
