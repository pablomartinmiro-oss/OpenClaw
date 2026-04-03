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
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/finance/dashboard" });

  try {
    const [invoiceStats, expenseStats, recentTransactions] =
      await Promise.all([
        prisma.invoice.groupBy({
          by: ["status"],
          where: { tenantId },
          _sum: { total: true },
          _count: true,
        }),
        prisma.expense.groupBy({
          by: ["categoryId"],
          where: { tenantId },
          _sum: { amount: true },
        }),
        prisma.transaction.findMany({
          where: { tenantId },
          orderBy: { date: "desc" },
          take: 10,
          include: {
            invoice: { select: { id: true, number: true } },
          },
        }),
      ]);

    // Resolve expense category names
    const categoryIds = expenseStats.map((e) => e.categoryId);
    const categories =
      categoryIds.length > 0
        ? await prisma.expenseCategory.findMany({
            where: { tenantId, id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : [];

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    // Build response
    const invoiceByStatus = invoiceStats.map((s) => ({
      status: s.status,
      total: s._sum.total ?? 0,
      count: s._count,
    }));

    const totalPaid =
      invoiceByStatus.find((s) => s.status === "paid")?.total ?? 0;
    const totalExpenses = expenseStats.reduce(
      (sum, e) => sum + (e._sum.amount ?? 0),
      0
    );
    const pendingCount = invoiceByStatus
      .filter((s) => s.status === "draft" || s.status === "sent")
      .reduce((sum, s) => sum + s.count, 0);

    const expensesByCategory = expenseStats.map((e) => ({
      categoryId: e.categoryId,
      categoryName: categoryMap.get(e.categoryId) ?? "Sin categoria",
      total: e._sum.amount ?? 0,
    }));

    log.info("Finance dashboard data fetched");

    return NextResponse.json({
      summary: {
        totalInvoiced: totalPaid,
        totalExpenses,
        netProfit: totalPaid - totalExpenses,
        pendingInvoices: pendingCount,
      },
      invoiceByStatus,
      expensesByCategory,
      recentTransactions,
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener resumen financiero",
      code: "FINANCE_DASHBOARD_ERROR",
      logContext: { tenantId },
    });
  }
}
