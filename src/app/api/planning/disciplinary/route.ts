export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const instructorId = new URL(request.url).searchParams.get("instructorId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (instructorId) where.instructorId = instructorId;

    const records = await prisma.disciplinaryRecord.findMany({
      where,
      include: { instructor: { select: { user: { select: { name: true } } } } },
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json({ records });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "DISCIPLINARY_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId, userId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/disciplinary" });

  try {
    const body = await request.json();
    const { instructorId, type, reason, notes } = body;

    if (!instructorId || !type || !reason) {
      return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
    }

    const record = await prisma.disciplinaryRecord.create({
      data: { tenantId, instructorId, type, reason, issuedBy: userId, notes },
      include: { instructor: { select: { user: { select: { name: true } } } } },
    });

    log.info({ recordId: record.id, type }, "Disciplinary record created");
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear amonestacion", code: "DISCIPLINARY_CREATE_ERROR", logContext: { tenantId } });
  }
}
