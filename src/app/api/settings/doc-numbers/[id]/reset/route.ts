export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/guard";
import { apiError, badRequest } from "@/lib/api-response";
import { validateBody, resetDocCounterSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { resetCounter } from "@/lib/documents/numbering";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, authError] = await requireOwner();
    if (authError) return authError;

    const { tenantId, userId } = session;
    const { id } = await params;
    const log = logger.child({ tenantId, counterId: id });

    const body = await request.json();
    const parsed = validateBody(body, resetDocCounterSchema);
    if (!parsed.ok) return badRequest(parsed.error);

    const counter = await resetCounter(
      tenantId,
      id,
      parsed.data.newValue,
      userId
    );

    log.info(
      { newValue: parsed.data.newValue },
      "Document counter reset"
    );
    return NextResponse.json({ counter });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al resetear contador",
      code: "DOC_NUMBER_RESET_ERROR",
    });
  }
}
