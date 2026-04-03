export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createDailyOrderSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/daily-orders" });
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");

  try {
    const where: Record<string, unknown> = { tenantId };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const orders = await prisma.dailyOrder.findMany({
      where,
      orderBy: { date: "asc" },
    });

    log.info({ count: orders.length }, "Daily orders fetched");
    return NextResponse.json({ orders });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch daily orders",
      code: "DAILY_ORDERS_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/booking/daily-orders" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createDailyOrderSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Normalize date to start of day for unique constraint
    const normalizedDate = new Date(data.date);
    normalizedDate.setHours(0, 0, 0, 0);

    // Upsert on (tenantId, date) unique constraint
    const order = await prisma.dailyOrder.upsert({
      where: {
        tenantId_date: {
          tenantId,
          date: normalizedDate,
        },
      },
      update: {
        notes: data.notes ?? null,
      },
      create: {
        tenantId,
        date: normalizedDate,
        notes: data.notes ?? null,
      },
    });

    log.info({ orderId: order.id, date: normalizedDate }, "Daily order upserted");
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create daily order",
      code: "DAILY_ORDERS_ERROR",
      logContext: { tenantId },
    });
  }
}
