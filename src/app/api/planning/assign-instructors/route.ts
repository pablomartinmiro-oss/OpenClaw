export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { apiError } from "@/lib/api-response";
import { validateBody, autoGroupSchema } from "@/lib/validation";
import { autoAssignInstructors, applyAssignmentSuggestions } from "@/lib/planning/instructor-assignment";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;
  const log = logger.child({ tenantId, path: "/api/planning/assign-instructors" });

  try {
    const body = await request.json();
    const validated = validateBody(body, autoGroupSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const suggestions = await autoAssignInstructors(tenantId, validated.data.date, validated.data.station);
    const applied = await applyAssignmentSuggestions(suggestions);

    log.info({ assigned: applied.assigned }, "Auto-assignment applied");
    return NextResponse.json({ suggestions, applied });
  } catch (error) {
    return apiError(error, { publicMessage: "Error en asignacion automatica", code: "AUTO_ASSIGN_ERROR", logContext: { tenantId } });
  }
}
