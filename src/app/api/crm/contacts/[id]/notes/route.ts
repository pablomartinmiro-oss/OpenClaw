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

  try {
    const mode = await getDataMode(tenantId);
    if (mode === "disconnected") {
      return NextResponse.json({ notes: [] });
    }

    const ghl = await getGHLClient(tenantId);
    const notes = await ghl.getContactNotes(id);
    return NextResponse.json({ notes });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to fetch notes", code: "CRM_NOTES_FETCH", logContext: { tenantId, contactId: id } });
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

  try {
    const mode = await getDataMode(tenantId);
    if (mode === "disconnected") {
      return NextResponse.json({ error: "GHL no conectado" }, { status: 400 });
    }

    const ghl = await getGHLClient(tenantId);
    const note = await ghl.addContactNote(id, body.body);
    return NextResponse.json(note);
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to add note", code: "CRM_NOTE_CREATE", logContext: { tenantId, contactId: id } });
  }
}
