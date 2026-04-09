export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, resolveIncidentSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId, userId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/planning/incidents/${id}` });

  try {
    const existing = await prisma.incident.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ error: "Incidencia no encontrada" }, { status: 404 });
    }
    const body = await request.json();
    const validated = validateBody(body, resolveIncidentSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolvedNotes: validated.data.resolvedNotes ?? null,
      },
    });

    log.info({ incidentId: id }, "Incident resolved");
    return NextResponse.json({ incident });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al resolver", code: "INCIDENT_RESOLVE_ERROR", logContext: { tenantId } });
  }
}
