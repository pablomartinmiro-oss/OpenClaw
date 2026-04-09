export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, moveUnitSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const { id: targetGroupId } = await context.params;
  const log = logger.child({ tenantId, path: `/api/planning/groups/${targetGroupId}/move-unit` });

  try {
    const body = await request.json();
    const validated = validateBody(body, moveUnitSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const target = await prisma.groupCell.findFirst({
      where: { id: validated.data.targetGroupCellId, tenantId },
      include: { _count: { select: { units: true } } },
    });
    if (!target) {
      return NextResponse.json({ error: "Grupo destino no encontrado" }, { status: 404 });
    }
    if (target._count.units >= target.maxParticipants) {
      return NextResponse.json({ error: "Grupo destino lleno" }, { status: 409 });
    }

    await prisma.operationalUnit.update({
      where: { id: validated.data.unitId },
      data: { groupCellId: validated.data.targetGroupCellId },
    });

    log.info({ unitId: validated.data.unitId, targetGroupId }, "Unit moved");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al mover participante", code: "MOVE_UNIT_ERROR", logContext: { tenantId } });
  }
}
