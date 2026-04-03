export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createReavCostSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id } = await params;
  const log = logger.child({
    tenantId,
    path: `/api/reav/expedients/${id}/costs`,
  });

  try {
    // Verify expedient belongs to tenant
    const expedient = await prisma.reavExpedient.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    const costs = await prisma.reavCost.findMany({
      where: { expedientId: id, tenantId },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: costs.length }, "REAV costs fetched");
    return NextResponse.json({ costs });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener costes REAV",
      code: "REAV_COSTS_ERROR",
      logContext: { tenantId, expedientId: id },
    });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const { id } = await params;
  const log = logger.child({
    tenantId,
    path: `/api/reav/expedients/${id}/costs`,
  });

  try {
    // Verify expedient belongs to tenant
    const expedient = await prisma.reavExpedient.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!expedient) {
      return NextResponse.json(
        { error: "Expediente no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, createReavCostSchema);
    if (!validated.ok)
      return NextResponse.json({ error: validated.error }, { status: 400 });

    const cost = await prisma.reavCost.create({
      data: {
        tenantId,
        expedientId: id,
        description: validated.data.description,
        cost: validated.data.cost,
        notes: validated.data.notes ?? null,
      },
    });

    log.info({ costId: cost.id }, "REAV cost created");
    return NextResponse.json({ cost }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear coste REAV",
      code: "REAV_COST_CREATE_ERROR",
      logContext: { tenantId, expedientId: id },
    });
  }
}
