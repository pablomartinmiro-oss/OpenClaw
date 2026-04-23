export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { processRecurringExpenses } from "@/lib/finance/recurring-processor";

const log = logger.child({ route: "/api/cron/recurring-expenses" });

/**
 * Cron endpoint to process recurring expenses for all tenants.
 * Call daily from Railway cron or external scheduler.
 */
export async function GET(req: Request) {
  const rl = await rateLimit(getClientIP(req), "cron");
  if (rl) return rl;

  // Verify cron secret if configured
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    // Find tenants that have active recurring expenses
    const tenants = await prisma.tenant.findMany({
      where: {
        isActive: true,
        recurringExpenses: {
          some: {
            active: true,
            nextDueDate: { lte: new Date() },
          },
        },
      },
      select: { id: true, name: true },
    });

    if (tenants.length === 0) {
      return NextResponse.json({
        message: "No recurring expenses due",
        processed: 0,
      });
    }

    let totalProcessed = 0;
    const results = [];

    for (const tenant of tenants) {
      try {
        const count = await processRecurringExpenses(tenant.id);
        totalProcessed += count;
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          created: count,
        });
      } catch (error) {
        log.error(
          { tenantId: tenant.id, err: error },
          "Failed to process recurring expenses for tenant"
        );
        results.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          error: "Processing failed",
        });
      }
    }

    log.info(
      { totalProcessed, tenantsProcessed: tenants.length },
      "Recurring expenses cron complete"
    );

    return NextResponse.json({
      message: "Recurring expenses processed",
      processed: totalProcessed,
      tenants: results,
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error processing recurring expenses",
      code: "CRON_RECURRING_EXPENSES_ERROR",
    });
  }
}
