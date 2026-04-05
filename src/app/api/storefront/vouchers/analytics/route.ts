export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: "/api/storefront/vouchers/analytics",
  });

  try {
    const now = new Date();

    const [allVouchers, usedVouchers, expiredVouchers] =
      await Promise.all([
        prisma.compensationVoucher.findMany({
          where: { tenantId },
          select: { value: true, isUsed: true, expirationDate: true },
        }),
        prisma.compensationVoucher.count({
          where: { tenantId, isUsed: true },
        }),
        prisma.compensationVoucher.count({
          where: {
            tenantId,
            isUsed: false,
            expirationDate: { lt: now },
          },
        }),
      ]);

    const totalIssued = allVouchers.length;
    const totalRedeemed = usedVouchers;
    const totalExpired = expiredVouchers;
    const totalActive = totalIssued - totalRedeemed - totalExpired;
    const totalValue = allVouchers.reduce((sum, v) => sum + v.value, 0);
    const redeemedValue = allVouchers
      .filter((v) => v.isUsed)
      .reduce((sum, v) => sum + v.value, 0);
    const pendingValue = totalValue - redeemedValue;

    const analytics = {
      totalIssued,
      totalRedeemed,
      totalExpired,
      totalActive,
      totalValue,
      redeemedValue,
      pendingValue,
      redemptionRate:
        totalIssued > 0
          ? Math.round((totalRedeemed / totalIssued) * 100)
          : 0,
    };

    log.info({ tenantId, analytics }, "Voucher analytics fetched");
    return NextResponse.json({ analytics });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener estadisticas de bonos",
      code: "VOUCHER_ANALYTICS_ERROR",
      logContext: { tenantId },
    });
  }
}
