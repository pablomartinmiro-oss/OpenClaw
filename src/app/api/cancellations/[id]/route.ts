export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateCancellationStatusSchema,
} from "@/lib/validation";
import { updateCancellationStatus } from "@/lib/cancellations/workflow";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "booking");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/cancellations/${id}`,
  });

  try {
    const cancellation = await prisma.cancellationRequest.findFirst({
      where: { id, tenantId },
      include: {
        logs: { orderBy: { timestamp: "asc" } },
        vouchers: true,
      },
    });

    if (!cancellation) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    log.info({ requestId: id }, "Cancellation request fetched");
    return NextResponse.json({ cancellation });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener solicitud de cancelacion",
      code: "CANCELLATION_GET_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
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
    path: `/api/cancellations/${id}`,
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, updateCancellationStatusSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const cancellation = await updateCancellationStatus(
      tenantId,
      id,
      userId,
      validated.data
    );

    log.info({ requestId: id }, "Cancellation status updated");
    return NextResponse.json({ cancellation });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar solicitud de cancelacion",
      code: "CANCELLATION_UPDATE_ERROR",
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
  const modErr = await requireModule(tenantId, "booking");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/cancellations/${id}`,
  });

  try {
    const existing = await prisma.cancellationRequest.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Delete logs first, then request
    await prisma.cancellationLog.deleteMany({
      where: { requestId: id, tenantId },
    });
    await prisma.cancellationRequest.delete({ where: { id } });

    log.info({ requestId: id }, "Cancellation request deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al eliminar solicitud de cancelacion",
      code: "CANCELLATION_DELETE_ERROR",
      logContext: { tenantId },
    });
  }
}
