export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/reservations/voucher-stats" });

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Pending (not redeemed, source groupon)
    const pendientes = await prisma.reservation.count({
      where: {
        tenantId,
        source: "groupon",
        voucherRedeemed: false,
        status: { not: "cancelada" },
      },
    });

    // Redeemed this month
    const canjeados = await prisma.reservation.count({
      where: {
        tenantId,
        source: "groupon",
        voucherRedeemed: true,
        voucherRedeemedAt: { gte: startOfMonth },
      },
    });

    // Revenue this month (Groupon)
    const revenueResult = await prisma.reservation.aggregate({
      where: {
        tenantId,
        source: "groupon",
        voucherRedeemed: true,
        createdAt: { gte: startOfMonth },
      },
      _sum: { voucherPricePaid: true },
    });

    // Expiring this week
    const caducanSemana = await prisma.reservation.count({
      where: {
        tenantId,
        source: "groupon",
        voucherRedeemed: false,
        voucherExpiry: { gte: now, lte: endOfWeek },
        status: { not: "cancelada" },
      },
    });

    // Expiring this month
    const caducanMes = await prisma.reservation.count({
      where: {
        tenantId,
        source: "groupon",
        voucherRedeemed: false,
        voucherExpiry: { gte: now, lte: endOfMonth },
        status: { not: "cancelada" },
      },
    });

    // Get expiring voucher details (next 7 days)
    const expiring = await prisma.reservation.findMany({
      where: {
        tenantId,
        source: "groupon",
        voucherRedeemed: false,
        voucherExpiry: { gte: now, lte: endOfWeek },
        status: { not: "cancelada" },
      },
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        voucherExpiry: true,
        voucherCouponCode: true,
      },
      orderBy: { voucherExpiry: "asc" },
      take: 20,
    });

    log.info("Voucher stats fetched");
    return NextResponse.json({
      pendientes,
      canjeados,
      ingresosMes: revenueResult._sum.voucherPricePaid ?? 0,
      caducanSemana,
      caducanMes,
      expiring,
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch voucher stats",
      code: "VOUCHER_STATS_ERROR",
      logContext: { tenantId },
    });
  }
}
