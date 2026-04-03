export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createTimeSlotSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/catalog/timeslots" });
  const { searchParams } = request.nextUrl;
  const productId = searchParams.get("productId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (productId) where.productId = productId;

    const timeSlots = await prisma.productTimeSlot.findMany({
      where,
      orderBy: [{ startTime: "asc" }, { endTime: "asc" }],
    });

    log.info({ count: timeSlots.length }, "Time slots fetched");
    return NextResponse.json({ timeSlots });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch time slots",
      code: "TIMESLOTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/catalog/timeslots" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createTimeSlotSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    // Verify product exists for this tenant
    const product = await prisma.product.findFirst({
      where: { id: data.productId, tenantId },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const timeSlot = await prisma.productTimeSlot.create({
      data: {
        tenantId,
        productId: data.productId,
        type: data.type ?? "fixed",
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity ?? 0,
        dayOfWeek: data.dayOfWeek ?? null,
        priceOverride: data.priceOverride ?? null,
      },
    });

    log.info({ timeSlotId: timeSlot.id }, "Time slot created");
    return NextResponse.json({ timeSlot }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create time slot",
      code: "TIMESLOTS_ERROR",
      logContext: { tenantId },
    });
  }
}
