export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { validateBody, updateDailyMenuSchema } from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;

  try {
    const existing = await prisma.dailyMenu.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateDailyMenuSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const menu = await prisma.dailyMenu.update({
      where: { id },
      data: {
        ...(data.date !== undefined && { date: data.date }),
        ...(data.firstCourse !== undefined && { firstCourse: data.firstCourse }),
        ...(data.secondCourse !== undefined && { secondCourse: data.secondCourse }),
        ...(data.dessert !== undefined && { dessert: data.dessert }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return NextResponse.json({ menu });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update daily menu",
      code: "DAILY_MENU_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "restaurant");
  if (moduleError) return moduleError;

  const { id } = await ctx.params;

  try {
    const existing = await prisma.dailyMenu.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.dailyMenu.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete daily menu",
      code: "DAILY_MENU_ERROR",
      logContext: { tenantId },
    });
  }
}
