export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { getGHLClient } from "@/lib/ghl/api";
import { prisma } from "@/lib/db";
import { getDataMode } from "@/lib/data/getDataMode";
import { mapContactToCache } from "@/lib/ghl/sync";
import { logger } from "@/lib/logger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const log = logger.child({ tenantId, contactId: id });

  try {
    // Try cache first
    const cached = await prisma.cachedContact.findFirst({
      where: { id, tenantId },
    });

    if (cached) {
      return NextResponse.json({
        contact: {
          id: cached.id,
          firstName: cached.firstName ?? "",
          lastName: cached.lastName ?? "",
          name: cached.name ?? "",
          email: cached.email,
          phone: cached.phone,
          tags: cached.tags ?? [],
          source: cached.source,
          dateAdded: cached.dateAdded?.toISOString() ?? "",
          lastActivity: cached.lastActivity?.toISOString(),
          dnd: cached.dnd,
          customFields: cached.customFields ?? {},
        },
      });
    }

    // Not in cache — try fetching from GHL directly
    const mode = await getDataMode(tenantId);
    if (mode === "live") {
      const ghl = await getGHLClient(tenantId);
      const contact = await ghl.getContact(id);
      // Cache it
      const cacheData = mapContactToCache(tenantId, contact);
      const { id: _, ...updateData } = cacheData;
      await prisma.cachedContact.upsert({
        where: { id },
        create: cacheData,
        update: updateData,
      });
      return NextResponse.json({ contact });
    }

    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  } catch (error) {
    return apiError(error, { publicMessage: "Failed to fetch contact", code: "CRM_CONTACT_FETCH", logContext: { tenantId } });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const body = await req.json();
  const log = logger.child({ tenantId, contactId: id });

  try {
    const mode = await getDataMode(tenantId);
    if (mode === "disconnected") {
      return NextResponse.json({ error: "GHL no conectado" }, { status: 400 });
    }

    const ghl = await getGHLClient(tenantId);
    const updated = await ghl.updateContact(id, body);

    const cacheData = mapContactToCache(tenantId, updated);
    const { id: _cacheId, ...updateData } = cacheData;
    await prisma.cachedContact.upsert({
      where: { id },
      create: cacheData,
      update: updateData,
    });

    log.info("Contact updated in GHL + cache");
    return NextResponse.json({ contact: updated });
  } catch (error) {
    await prisma.syncQueue.create({
      data: { tenantId, action: "updateContact", resourceId: id, payload: body },
    });

    return apiError(error, { publicMessage: "Error al actualizar contacto", code: "CRM_CONTACT_UPDATE", logContext: { tenantId, contactId: id } });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const log = logger.child({ tenantId, contactId: id });

  try {
    const mode = await getDataMode(tenantId);
    if (mode === "disconnected") {
      return NextResponse.json({ error: "GHL no conectado" }, { status: 400 });
    }

    const ghl = await getGHLClient(tenantId);
    await ghl.deleteContact(id);
    await prisma.cachedContact.deleteMany({ where: { id, tenantId } });
    log.info("Contact deleted from GHL + cache");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al eliminar contacto", code: "CRM_CONTACT_DELETE", logContext: { tenantId, contactId: id } });
  }
}
