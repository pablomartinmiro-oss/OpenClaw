export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createLegoPackLineSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/packs/${id}/lines`,
  });

  try {
    const pack = await prisma.legoPack.findFirst({
      where: { id, tenantId },
    });
    if (!pack) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    const lines = await prisma.legoPackLine.findMany({
      where: { packId: id, tenantId },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ packId: id, count: lines.length }, "Pack lines fetched");
    return NextResponse.json({ lines });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch pack lines",
      code: "PACK_LINES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/packs/${id}/lines`,
  });

  try {
    const pack = await prisma.legoPack.findFirst({
      where: { id, tenantId },
    });
    if (!pack) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, createLegoPackLineSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const line = await prisma.legoPackLine.create({
      data: {
        tenantId,
        packId: id,
        productId: data.productId ?? null,
        roomTypeId: data.roomTypeId ?? null,
        treatmentId: data.treatmentId ?? null,
        quantity: data.quantity,
        isRequired: data.isRequired,
        isOptional: data.isOptional,
        isClientEditable: data.isClientEditable,
        overridePrice: data.overridePrice ?? null,
        sortOrder: data.sortOrder,
      },
    });

    log.info({ lineId: line.id, packId: id }, "Pack line created");
    return NextResponse.json({ line }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create pack line",
      code: "PACK_LINES_ERROR",
      logContext: { tenantId },
    });
  }
}
