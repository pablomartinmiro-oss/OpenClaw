export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { apiError } from "@/lib/api-response";
import { validateBody, generateUnitsSchema } from "@/lib/validation";
import { generateOperationalUnits } from "@/lib/planning/operational-units";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/units/generate" });

  try {
    const body = await request.json();
    const validated = validateBody(body, generateUnitsSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const result = await generateOperationalUnits(tenantId, validated.data.reservationId);

    log.info({ reservationId: validated.data.reservationId, created: result.created }, "OUs generated");
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al generar unidades operativas", code: "GENERATE_UNITS_ERROR", logContext: { tenantId } });
  }
}
