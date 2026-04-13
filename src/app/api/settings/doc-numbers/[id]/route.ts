export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth/guard";
import { apiError, badRequest } from "@/lib/api-response";
import { validateBody, updateDocNumberPrefixSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { updatePrefix } from "@/lib/documents/numbering";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [session, authError] = await requireOwner();
    if (authError) return authError;

    const { tenantId } = session;
    const { id } = await params;
    const log = logger.child({ tenantId, counterId: id });

    const body = await request.json();
    const parsed = validateBody(body, updateDocNumberPrefixSchema);
    if (!parsed.ok) return badRequest(parsed.error);

    const counter = await updatePrefix(tenantId, id, parsed.data.prefix);

    log.info({ prefix: parsed.data.prefix }, "Document counter prefix updated");
    return NextResponse.json({ counter });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al actualizar prefijo",
      code: "DOC_NUMBER_PREFIX_ERROR",
    });
  }
}
