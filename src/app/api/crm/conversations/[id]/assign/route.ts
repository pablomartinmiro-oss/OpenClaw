export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { getDataMode } from "@/lib/data/getDataMode";
import { getGHLClient } from "@/lib/ghl/api";
import { logger } from "@/lib/logger";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const body = await req.json();
  const { assignedTo } = body as { assignedTo: string | null };
  const log = logger.child({ tenantId, conversationId: id });

  try {
    const mode = await getDataMode(tenantId);
    if (mode === "disconnected") {
      return NextResponse.json({ error: "GHL no conectado" }, { status: 400 });
    }

    const ghl = await getGHLClient(tenantId);
    await ghl.updateConversation(id, { assignedTo: assignedTo ?? undefined });
    log.info({ assignedTo }, "Conversation assigned via GHL");

    return NextResponse.json({ success: true, assignedTo });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to assign conversation", code: "CRM_CONVERSATION_ASSIGN", logContext: { tenantId, conversationId: id } });
  }
}
