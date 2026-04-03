export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateReavExpedientSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/reav/expedients/${id}` });

  try {
    const expedient = await prisma.reavExpedient.findFirst({
      where: { id, tenantId },
      include: {
        invoice: { select: { id: true, number: true } },
        costs: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { uploadedAt: "desc" } },
      },
    });

    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    log.info({ expedientId: id }, "REAV expedient fetched");
    return NextResponse.json({ expedient });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener expediente REAV",
      code: "REAV_EXPEDIENT_GET_ERROR",
      logContext: { tenantId, expedientId: id },
    });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/reav/expedients/${id}` });

  try {
    // Verify ownership
    const existing = await prisma.reavExpedient.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateReavExpedientSchema);
    if (!validated.ok)
      return NextResponse.json({ error: validated.error }, { status: 400 });

    const expedient = await prisma.reavExpedient.update({
      where: { id },
      data: validated.data,
      include: {
        invoice: { select: { id: true, number: true } },
      },
    });

    log.info({ expedientId: id }, "REAV expedient updated");
    return NextResponse.json({ expedient });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar expediente REAV",
      code: "REAV_EXPEDIENT_UPDATE_ERROR",
      logContext: { tenantId, expedientId: id },
    });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/reav/expedients/${id}` });

  try {
    const existing = await prisma.reavExpedient.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    await prisma.reavExpedient.delete({ where: { id } });

    log.info({ expedientId: id }, "REAV expedient deleted");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar expediente REAV",
      code: "REAV_EXPEDIENT_DELETE_ERROR",
      logContext: { tenantId, expedientId: id },
    });
  }
}
