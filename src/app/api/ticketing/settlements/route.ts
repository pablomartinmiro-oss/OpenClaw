export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

interface PlatformStat {
  platformId: string;
  platformName: string;
  commissionPercentage: number;
  totalRedemptions: number;
  redeemedCount: number;
  pendingCount: number;
  estimatedRevenue: number;
  estimatedCommission: number;
}

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split("-").map(Number);
      dateFrom = new Date(y, m - 1, 1);
      dateTo = new Date(y, m, 1);
    }

    const platforms = await prisma.externalPlatform.findMany({
      where: { tenantId },
      include: {
        redemptions: {
          where: dateFrom && dateTo
            ? { createdAt: { gte: dateFrom, lt: dateTo } }
            : undefined,
          select: {
            id: true,
            financialStatus: true,
            product: { select: { price: true } },
          },
        },
      },
    });

    const stats: PlatformStat[] = platforms.map((p) => {
      const total = p.redemptions.length;
      const redeemed = p.redemptions.filter((r) => r.financialStatus === "redeemed").length;
      const pending = p.redemptions.filter((r) => r.financialStatus === "pending").length;
      const revenue = p.redemptions.reduce(
        (sum, r) => sum + (r.product?.price ?? 0),
        0
      );
      const commission = revenue * (p.commissionPercentage / 100);
      return {
        platformId: p.id,
        platformName: p.name,
        commissionPercentage: p.commissionPercentage,
        totalRedemptions: total,
        redeemedCount: redeemed,
        pendingCount: pending,
        estimatedRevenue: revenue,
        estimatedCommission: commission,
      };
    });

    return NextResponse.json({ stats, month: month ?? null });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener liquidaciones",
      code: "TICKETING_SETTLEMENTS_ERROR",
      logContext: { tenantId },
    });
  }
}
