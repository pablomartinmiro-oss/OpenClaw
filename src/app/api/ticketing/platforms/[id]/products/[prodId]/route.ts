export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updatePlatformProductSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string; prodId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id: platformId, prodId } = await params;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/platforms/${platformId}/products/${prodId}`,
  });

  try {
    const existing = await prisma.platformProduct.findFirst({
      where: { id: prodId, tenantId, platformId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Producto de plataforma no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updatePlatformProductSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const updated = await prisma.platformProduct.update({
      where: { id: prodId },
      data: {
        ...(data.externalId !== undefined && { externalId: data.externalId }),
        ...(data.externalUrl !== undefined && { externalUrl: data.externalUrl }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        product: { select: { id: true, name: true, category: true, station: true } },
      },
    });

    log.info({ prodId }, "Platform product updated");
    return NextResponse.json({ product: updated });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar producto de plataforma",
      code: "TICKETING_PLATFORM_PRODUCTS_ERROR",
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

  const { id: platformId, prodId } = await params;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/platforms/${platformId}/products/${prodId}`,
  });

  try {
    const existing = await prisma.platformProduct.findFirst({
      where: { id: prodId, tenantId, platformId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Producto de plataforma no encontrado" },
        { status: 404 }
      );
    }

    await prisma.platformProduct.delete({ where: { id: prodId } });

    log.info({ prodId }, "Platform product deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar producto de plataforma",
      code: "TICKETING_PLATFORM_PRODUCTS_ERROR",
      logContext: { tenantId },
    });
  }
}
