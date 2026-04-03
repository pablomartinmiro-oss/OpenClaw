export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/monitors/${id}`,
  });

  try {
    const existing = await prisma.bookingMonitor.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Monitor assignment not found" },
        { status: 404 }
      );
    }

    await prisma.bookingMonitor.delete({ where: { id } });

    log.info({ monitorId: id }, "Monitor unassigned");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to unassign monitor",
      code: "BOOKING_MONITORS_ERROR",
      logContext: { tenantId },
    });
  }
}
