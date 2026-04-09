export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createFreeDayRequestSchema } from "@/lib/validation";

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

    const requests = await prisma.freeDayRequest.findMany({
      where,
      include: { instructor: { select: { user: { select: { name: true } } } } },
      orderBy: { requestDate: "asc" },
    });
    return NextResponse.json({ requests });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "FREE_DAYS_LIST_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/free-days" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createFreeDayRequestSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const instructor = await prisma.instructor.findFirst({
      where: { tenantId, userId: session.userId },
    });
    if (!instructor) {
      return NextResponse.json({ error: "No eres profesor" }, { status: 403 });
    }

    const req = await prisma.freeDayRequest.create({
      data: {
        tenantId,
        instructorId: instructor.id,
        requestDate: validated.data.requestDate,
        reason: validated.data.reason ?? null,
      },
    });

    log.info({ requestId: req.id }, "Free day requested");
    return NextResponse.json({ request: req }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al solicitar dia libre", code: "FREE_DAY_CREATE_ERROR", logContext: { tenantId } });
  }
}
