export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createIncidentSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const resolved = searchParams.get("resolved");
  const groupCellId = searchParams.get("groupCellId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (resolved !== null) where.resolved = resolved === "true";
    if (groupCellId) where.groupCellId = groupCellId;

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        instructor: { select: { user: { select: { name: true } } } },
        groupCell: { select: { discipline: true, level: true, timeSlotStart: true, timeSlotEnd: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ incidents });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "INCIDENTS_LIST_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/incidents" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createIncidentSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Get instructor from current user
    const instructor = await prisma.instructor.findFirst({
      where: { tenantId, userId: session.userId },
    });
    if (!instructor) {
      return NextResponse.json({ error: "No eres profesor" }, { status: 403 });
    }

    const incident = await prisma.incident.create({
      data: {
        tenantId,
        groupCellId: data.groupCellId,
        instructorId: instructor.id,
        participantId: data.participantId ?? null,
        type: data.type,
        severity: data.severity,
        description: data.description,
      },
    });

    log.info({ incidentId: incident.id, type: data.type }, "Incident created");
    return NextResponse.json({ incident }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear incidencia", code: "INCIDENT_CREATE_ERROR", logContext: { tenantId } });
  }
}
