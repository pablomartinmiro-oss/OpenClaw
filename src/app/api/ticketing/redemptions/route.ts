export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createCouponRedemptionSchema,
} from "@/lib/validation";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/ticketing/redemptions" });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const code = searchParams.get("code");
    const financialStatus = searchParams.get("financialStatus");

    const where: Prisma.CouponRedemptionWhereInput = { tenantId };
    if (status) where.status = status;
    if (financialStatus) where.financialStatus = financialStatus;
    if (code) where.code = { contains: code, mode: "insensitive" };

    const platformId = searchParams.get("platformId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (platformId) where.platformId = platformId;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const redemptions = await prisma.couponRedemption.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        platform: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, category: true } },
      },
    });

    log.info({ count: redemptions.length }, "Redemptions fetched");
    return NextResponse.json({ redemptions });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener canjes",
      code: "TICKETING_REDEMPTIONS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/ticketing/redemptions" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCouponRedemptionSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const redemption = await prisma.couponRedemption.create({
      data: {
        tenantId,
        code: data.code,
        email: data.email ?? null,
        phone: data.phone ?? null,
        status: data.status,
        financialStatus: data.financialStatus,
        ocrExtraction: data.ocrExtraction
          ? JSON.parse(JSON.stringify(data.ocrExtraction)) as Prisma.InputJsonValue
          : undefined,
        reservationId: data.reservationId ?? null,
        redeemedAt: data.redeemedAt ?? null,
        customerName: data.customerName ?? null,
        platformId: data.platformId ?? null,
        productId: data.productId ?? null,
        skiLevel: data.skiLevel ?? null,
        bootSize: data.bootSize ?? null,
        height: data.height ?? null,
        numPeople: data.numPeople,
        preferredDate: data.preferredDate ?? null,
        notes: data.notes ?? null,
      },
    });

    log.info({ redemptionId: redemption.id }, "Redemption created");
    return NextResponse.json({ redemption }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear canje",
      code: "TICKETING_REDEMPTIONS_ERROR",
      logContext: { tenantId },
    });
  }
}
