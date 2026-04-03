export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateSpaSlotSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/spa/slots/${id}`,
  });

  try {
    const existing = await prisma.spaSlot.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Spa slot not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateSpaSlotSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const slot = await prisma.spaSlot.update({
      where: { id },
      data: {
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.booked !== undefined && { booked: data.booked }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    log.info({ slotId: id }, "Spa slot updated");
    return NextResponse.json({ slot });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update spa slot",
      code: "SPA_SLOTS_ERROR",
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
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/spa/slots/${id}`,
  });

  try {
    const existing = await prisma.spaSlot.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Spa slot not found" },
        { status: 404 }
      );
    }

    await prisma.spaSlot.delete({ where: { id } });

    log.info({ slotId: id }, "Spa slot deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete spa slot",
      code: "SPA_SLOTS_ERROR",
      logContext: { tenantId },
    });
  }
}
