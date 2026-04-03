export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { getGHLClient } from "@/lib/ghl/api";
import { getDataMode } from "@/lib/data/getDataMode";
import { logger } from "@/lib/logger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const log = logger.child({ tenantId, conversationId: id });

  try {
    const mode = await getDataMode(tenantId);
    if (mode === "disconnected") {
      return NextResponse.json({ messages: [], nextPage: null });
    }

    // Messages always fetched fresh from GHL (not cached)
    const ghl = await getGHLClient(tenantId);
    const messages = await ghl.getMessages(id);
    log.info({ count: messages.length }, "Messages fetched live");
    return NextResponse.json({ messages, nextPage: null });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to fetch messages", code: "CRM_MESSAGES_FETCH", logContext: { tenantId, conversationId: id } });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const body = await req.json();
  const log = logger.child({ tenantId, conversationId: id });

  try {
    const mode = await getDataMode(tenantId);
    if (mode === "disconnected") {
      return NextResponse.json({ error: "GHL no conectado" }, { status: 400 });
    }

    const ghl = await getGHLClient(tenantId);
    const result = await ghl.sendMessage(id, {
      type: (body.type as "SMS" | "Email" | "WhatsApp") ?? "SMS",
      body: body.message,
    });
    log.info("Message sent via GHL");
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to send message", code: "CRM_MESSAGE_SEND", logContext: { tenantId, conversationId: id } });
  }
}
