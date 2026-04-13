export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import {
  getCounters,
  ALL_DOCUMENT_TYPES,
  DEFAULT_PREFIXES,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/documents/numbering";

export async function GET() {
  try {
    const [session, authError] = await requireTenant();
    if (authError) return authError;

    const { tenantId } = session;
    const log = logger.child({ tenantId, path: "/api/settings/doc-numbers" });

    const counters = await getCounters(tenantId);

    // Build response with all types, filling in defaults for missing ones
    const year = new Date().getFullYear();
    const counterMap = new Map(
      counters.map((c) => [`${c.documentType}-${c.year}`, c])
    );

    const result = ALL_DOCUMENT_TYPES.map((type) => {
      const key = `${type}-${year}`;
      const counter = counterMap.get(key);
      return {
        id: counter?.id ?? null,
        documentType: type,
        label: DOCUMENT_TYPE_LABELS[type],
        year,
        currentNumber: counter?.currentNumber ?? 0,
        prefix: counter?.prefix ?? DEFAULT_PREFIXES[type],
        nextNumber: `${counter?.prefix ?? DEFAULT_PREFIXES[type]}${year}-${String((counter?.currentNumber ?? 0) + 1).padStart(4, "0")}`,
      };
    });

    log.info("Document counters fetched");
    return NextResponse.json({ counters: result });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cargar contadores de documentos",
      code: "DOC_NUMBERS_FETCH_ERROR",
    });
  }
}
