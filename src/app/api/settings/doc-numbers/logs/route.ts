export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { getNumberLogs } from "@/lib/documents/numbering";

export async function GET(request: NextRequest) {
  try {
    const [session, authError] = await requireTenant();
    if (authError) return authError;

    const { tenantId } = session;
    const log = logger.child({ tenantId, path: "/api/settings/doc-numbers/logs" });

    const url = new URL(request.url);
    const documentType = url.searchParams.get("type") ?? undefined;
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") ?? "50", 10),
      200
    );
    const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

    const logs = await getNumberLogs(tenantId, {
      documentType,
      limit,
      offset,
    });

    log.info({ count: logs.length }, "Document number logs fetched");
    return NextResponse.json({ logs });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cargar logs de numeración",
      code: "DOC_NUMBER_LOGS_ERROR",
    });
  }
}
