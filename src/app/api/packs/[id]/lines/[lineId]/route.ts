export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateLegoPackLineSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string; lineId: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id, lineId } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/packs/${id}/lines/${lineId}`,
  });

  try {
    const existing = await prisma.legoPackLine.findFirst({
      where: { id: lineId, packId: id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pack line not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateLegoPackLineSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const line = await prisma.legoPackLine.update({
      where: { id: lineId },
      data: {
        ...(data.productId !== undefined && {
          productId: data.productId ?? null,
        }),
        ...(data.roomTypeId !== undefined && {
          roomTypeId: data.roomTypeId ?? null,
        }),
        ...(data.treatmentId !== undefined && {
          treatmentId: data.treatmentId ?? null,
        }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.isRequired !== undefined && {
          isRequired: data.isRequired,
        }),
        ...(data.isOptional !== undefined && {
          isOptional: data.isOptional,
        }),
        ...(data.isClientEditable !== undefined && {
          isClientEditable: data.isClientEditable,
        }),
        ...(data.overridePrice !== undefined && {
          overridePrice: data.overridePrice ?? null,
        }),
        ...(data.sortOrder !== undefined && {
          sortOrder: data.sortOrder,
        }),
      },
    });

    log.info({ lineId, packId: id }, "Pack line updated");
    return NextResponse.json({ line });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update pack line",
      code: "PACK_LINES_ERROR",
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

  const { id, lineId } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/packs/${id}/lines/${lineId}`,
  });

  try {
    const existing = await prisma.legoPackLine.findFirst({
      where: { id: lineId, packId: id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pack line not found" },
        { status: 404 }
      );
    }

    await prisma.legoPackLine.delete({ where: { id: lineId } });

    log.info({ lineId, packId: id }, "Pack line deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete pack line",
      code: "PACK_LINES_ERROR",
      logContext: { tenantId },
    });
  }
}
