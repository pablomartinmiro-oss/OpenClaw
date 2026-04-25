export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createDailyMenuSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/restaurant/daily-menu" });
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const where: Prisma.DailyMenuWhereInput = { tenantId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const menus = await prisma.dailyMenu.findMany({
      where,
      orderBy: { date: "desc" },
      take: from || to ? undefined : 30,
    });

    log.info({ count: menus.length }, "Daily menus fetched");
    return NextResponse.json({ menus });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch daily menus",
      code: "DAILY_MENU_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/restaurant/daily-menu" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createDailyMenuSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const menu = await prisma.dailyMenu.upsert({
      where: { tenantId_date: { tenantId, date: data.date } },
      update: {
        firstCourse: data.firstCourse ?? "",
        secondCourse: data.secondCourse ?? "",
        dessert: data.dessert ?? "",
        price: data.price,
        active: data.active,
        notes: data.notes ?? null,
      },
      create: {
        tenantId,
        date: data.date,
        firstCourse: data.firstCourse ?? "",
        secondCourse: data.secondCourse ?? "",
        dessert: data.dessert ?? "",
        price: data.price,
        active: data.active,
        notes: data.notes ?? null,
      },
    });

    log.info({ menuId: menu.id }, "Daily menu upserted");
    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to save daily menu",
      code: "DAILY_MENU_ERROR",
      logContext: { tenantId },
    });
  }
}
