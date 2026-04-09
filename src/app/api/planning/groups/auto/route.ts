export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { apiError } from "@/lib/api-response";
import { validateBody, autoGroupSchema } from "@/lib/validation";
import { autoGroupUnits, applyGroupingSuggestion } from "@/lib/planning/grouping-engine";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/groups/auto" });

  try {
    const body = await request.json();
    const validated = validateBody(body, autoGroupSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { date, station } = validated.data;

    // Generate suggestions
    const result = await autoGroupUnits(tenantId, date, station);

    // Apply immediately (admin can modify later)
    const applied = await applyGroupingSuggestion(tenantId, date, station, result.groups);

    log.info({ date, station, groups: applied.created }, "Auto-grouping applied");
    return NextResponse.json({ result, applied });
  } catch (error) {
    return apiError(error, { publicMessage: "Error en agrupacion automatica", code: "AUTO_GROUP_ERROR", logContext: { tenantId } });
  }
}
