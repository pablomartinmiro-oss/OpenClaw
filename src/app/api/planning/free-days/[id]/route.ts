export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, reviewFreeDaySchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId, userId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const { id } = await context.params;
  const log = logger.child({ tenantId, path: `/api/planning/free-days/${id}` });

  try {
    const existing = await prisma.freeDayRequest.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, reviewFreeDaySchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const req = await prisma.freeDayRequest.update({
      where: { id },
      data: {
        status: validated.data.status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNotes: validated.data.reviewNotes ?? null,
      },
    });

    log.info({ requestId: id, status: validated.data.status }, "Free day reviewed");
    return NextResponse.json({ request: req });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "FREE_DAY_REVIEW_ERROR", logContext: { tenantId } });
  }
}
