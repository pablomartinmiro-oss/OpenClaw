export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, assignMonitorSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/monitors" });
  const { searchParams } = request.nextUrl;
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json(
      { error: "bookingId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Verify booking belongs to tenant
    const booking = await prisma.activityBooking.findFirst({
      where: { id: bookingId, tenantId },
    });
    if (!booking) {
      return NextResponse.json(
        { error: "Activity booking not found" },
        { status: 404 }
      );
    }

    const monitors = await prisma.bookingMonitor.findMany({
      where: { bookingId, tenantId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { assignedAt: "asc" },
    });

    log.info({ bookingId, count: monitors.length }, "Monitors fetched");
    return NextResponse.json({ monitors });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch monitors",
      code: "BOOKING_MONITORS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/monitors" });

  try {
    const body = await request.json();
    const validated = validateBody(body, assignMonitorSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify booking belongs to tenant
    const booking = await prisma.activityBooking.findFirst({
      where: { id: data.bookingId, tenantId },
    });
    if (!booking) {
      return NextResponse.json(
        { error: "Activity booking not found" },
        { status: 404 }
      );
    }

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: data.userId, tenantId },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in this tenant" },
        { status: 404 }
      );
    }

    // Create assignment (handle unique constraint)
    const monitor = await prisma.bookingMonitor.create({
      data: {
        tenantId,
        bookingId: data.bookingId,
        userId: data.userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    log.info(
      { monitorId: monitor.id, bookingId: data.bookingId, userId: data.userId },
      "Monitor assigned"
    );
    return NextResponse.json({ monitor }, { status: 201 });
  } catch (error) {
    // Handle unique constraint violation (already assigned)
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "Monitor already assigned to this booking" },
        { status: 409 }
      );
    }
    return apiError(error, {
      publicMessage: "Failed to assign monitor",
      code: "BOOKING_MONITORS_ERROR",
      logContext: { tenantId },
    });
  }
}
