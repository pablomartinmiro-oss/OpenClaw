export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createCancellationRequestSchema,
} from "@/lib/validation";
import { createCancellationRequest } from "@/lib/cancellations/workflow";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "booking");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: "/api/cancellations",
  });
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const reservationId = searchParams.get("reservationId");

  try {
    const where: Prisma.CancellationRequestWhereInput = { tenantId };
    if (status) where.status = status;
    if (reservationId) where.reservationId = reservationId;

    const requests = await prisma.cancellationRequest.findMany({
      where,
      include: {
        logs: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        vouchers: {
          select: { id: true, code: true, value: true, isUsed: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: requests.length }, "Cancellation requests fetched");
    return NextResponse.json({ requests });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener solicitudes de cancelacion",
      code: "CANCELLATION_LIST_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId, userId } = session;
  const modErr = await requireModule(tenantId, "booking");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: "/api/cancellations",
  });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCancellationRequestSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }

    const cancellation = await createCancellationRequest(
      tenantId,
      userId,
      validated.data
    );

    log.info(
      { requestId: cancellation.id },
      "Cancellation request created"
    );
    return NextResponse.json({ cancellation }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear solicitud de cancelacion",
      code: "CANCELLATION_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
