export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updatePlatformSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/platforms/${id}`,
  });

  try {
    const existing = await prisma.externalPlatform.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Plataforma no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updatePlatformSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const platform = await prisma.externalPlatform.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.commissionPercentage !== undefined && {
          commissionPercentage: data.commissionPercentage,
        }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    log.info({ platformId: id }, "Platform updated");
    return NextResponse.json({ platform });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar plataforma",
      code: "TICKETING_PLATFORMS_ERROR",
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
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({
    tenantId,
    path: `/api/ticketing/platforms/${id}`,
  });

  try {
    const existing = await prisma.externalPlatform.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Plataforma no encontrada" },
        { status: 404 }
      );
    }

    await prisma.externalPlatform.delete({ where: { id } });

    log.info({ platformId: id }, "Platform deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar plataforma",
      code: "TICKETING_PLATFORMS_ERROR",
      logContext: { tenantId },
    });
  }
}
