export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { calculatePrice } from "@/lib/pricing/calculator";

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/pricing" });

  try {
    const body = await request.json();
    const { station, activityDate, items } = body;

    if (!station || !activityDate || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields: station, activityDate, items" },
        { status: 400 }
      );
    }

    const result = await calculatePrice({
      tenantId,
      station,
      activityDate: new Date(activityDate),
      items,
    });

    log.info({ station, season: result.season, total: result.total }, "Price calculated");
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al calcular precio",
      code: "PRICING_FAILED",
      logContext: { tenantId },
    });
  }
}
