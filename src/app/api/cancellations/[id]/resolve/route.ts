export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  resolveCancellationSchema,
} from "@/lib/validation";
import { resolveCancellation } from "@/lib/cancellations/workflow";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId, userId } = session;
  const modErr = await requireModule(tenantId, "booking");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/cancellations/${id}/resolve`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, resolveCancellationSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const cancellation = await resolveCancellation(
      tenantId,
      id,
      userId,
      validated.data
    );

    log.info({ requestId: id }, "Cancellation resolved");
    return NextResponse.json({ cancellation });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al resolver solicitud de cancelacion",
      code: "CANCELLATION_RESOLVE_ERROR",
      logContext: { tenantId },
    });
  }
}
