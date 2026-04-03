export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "storefront");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: "/api/storefront/usage",
  });

  try {
    const usage = await prisma.discountCodeUse.findMany({
      where: { tenantId },
      include: {
        code: {
          select: { code: true, type: true, value: true },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    log.info({ count: usage.length }, "Discount usage fetched");
    return NextResponse.json({ usage });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener historial de uso",
      code: "DISCOUNT_USAGE_ERROR",
      logContext: { tenantId },
    });
  }
}
