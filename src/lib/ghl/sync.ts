import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { getGHLClient, type GHLClient } from "./api";
import { logger } from "@/lib/logger";
import type { GHLContact, GHLConversation, GHLOpportunity, GHLPipeline } from "./types";

type JsonValue = Prisma.InputJsonValue;

function stripId<T extends { id: string }>(data: T): Omit<T, "id"> {
  const { id: _, ...rest } = data;
  return rest;
}

const log = logger.child({ layer: "ghl-sync" });

// ==================== MAPPER FUNCTIONS ====================

export function mapContactToCache(tenantId: string, contact: GHLContact) {
  return {
    id: contact.id,
    tenantId,
    firstName: contact.firstName ?? null,
    lastName: contact.lastName ?? null,
    name: contact.name ?? (`${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim() || null),
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    tags: (contact.tags ?? []) as JsonValue,
    customFields: (contact.customFields ?? {}) as JsonValue,
    source: contact.source ?? null,
    dateAdded: contact.dateAdded ? new Date(contact.dateAdded) : null,
    lastActivity: contact.lastActivity ? new Date(contact.lastActivity) : null,
    dnd: contact.dnd ?? false,
    raw: JSON.parse(JSON.stringify(contact)) as JsonValue,
    cachedAt: new Date(),
  };
}

export function mapConversationToCache(tenantId: string, conv: GHLConversation) {
  return {
    id: conv.id,
    tenantId,
    contactId: conv.contactId,
    contactName: conv.contactName ?? null,
    contactPhone: conv.contactPhone ?? null,
    contactEmail: conv.contactEmail ?? null,
    lastMessageBody: conv.lastMessageBody ?? null,
    lastMessageDate: conv.lastMessageDate ? new Date(conv.lastMessageDate) : null,
    lastMessageType: conv.lastMessageType ?? conv.type ?? null,
    unreadCount: conv.unreadCount ?? 0,
    raw: JSON.parse(JSON.stringify(conv)) as JsonValue,
    cachedAt: new Date(),
  };
}

export function mapOpportunityToCache(tenantId: string, opp: GHLOpportunity) {
  return {
    id: opp.id,
    tenantId,
    pipelineId: opp.pipelineId,
    pipelineStageId: opp.pipelineStageId,
    name: opp.name ?? null,
    contactId: opp.contactId ?? null,
    contactName: opp.contactName ?? null,
    monetaryValue: opp.monetaryValue ?? null,
    status: opp.status ?? null,
    assignedTo: opp.assignedTo ?? null,
    lastActivity: opp.lastActivity ? new Date(opp.lastActivity) : null,
    raw: JSON.parse(JSON.stringify(opp)) as JsonValue,
    cachedAt: new Date(),
  };
}

export function mapPipelineToCache(tenantId: string, pipeline: GHLPipeline) {
  return {
    id: pipeline.id,
    tenantId,
    name: pipeline.name,
    stages: JSON.parse(JSON.stringify(pipeline.stages)) as JsonValue,
    raw: JSON.parse(JSON.stringify(pipeline)) as JsonValue,
    cachedAt: new Date(),
  };
}

// ==================== FULL SYNC ====================

export interface SyncProgress {
  contacts: number;
  contactsTotal?: number;
  conversations: number;
  opportunities: number;
  pipelines: number;
  status: "in_progress" | "completed" | "failed";
  error?: string;
}

export async function fullSync(
  tenantId: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncProgress> {
  console.log(`[SYNC] ========== FULL SYNC STARTED for tenant ${tenantId} ==========`);

  const progress: SyncProgress = {
    contacts: 0,
    conversations: 0,
    opportunities: 0,
    pipelines: 0,
    status: "in_progress",
  };

  await prisma.syncStatus.upsert({
    where: { tenantId },
    create: { tenantId, syncInProgress: true },
    update: { syncInProgress: true, lastError: null },
  });
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { syncState: "syncing", syncProgressMsg: "Iniciando sincronización...", lastSyncError: null },
  });

  try {
    console.log("[SYNC] Creating GHL client...");
    const ghl = await getGHLClient(tenantId);
    console.log(`[SYNC] GHL client OK — location: ${ghl.getLocationId()}`);

    // 1. Pipelines
    console.log("[SYNC] Fetching pipelines...");
    const pipelines = await ghl.getPipelines();
    console.log(`[SYNC] Got ${pipelines.length} pipelines: ${pipelines.map(p => p.name).join(", ")}`);

    for (const pipeline of pipelines) {
      const data = mapPipelineToCache(tenantId, pipeline);
      await prisma.cachedPipeline.upsert({
        where: { id: pipeline.id },
        create: data,
        update: { name: data.name, stages: data.stages, raw: data.raw, cachedAt: new Date() },
      });
      progress.pipelines++;

      // 2. Opportunities per pipeline (page-based)
      await syncOpportunitiesForPipeline(ghl, tenantId, pipeline.id, pipeline.name, progress);
    }
    onProgress?.(progress);

    // 3. Contacts (page-based)
    console.log("[SYNC] Syncing contacts...");
    await syncAllContacts(ghl, tenantId, progress, onProgress);

    // 4. Conversations (page-based)
    console.log("[SYNC] Syncing conversations...");
    await syncAllConversations(ghl, tenantId, progress);
    onProgress?.(progress);

    // 5. Done
    progress.status = "completed";
    await prisma.syncStatus.update({
      where: { tenantId },
      data: {
        lastFullSync: new Date(),
        contactCount: progress.contacts,
        conversationCount: progress.conversations,
        opportunityCount: progress.opportunities,
        pipelineCount: progress.pipelines,
        syncInProgress: false,
      },
    });
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        syncState: "complete",
        syncProgressMsg: `${progress.contacts} contactos, ${progress.conversations} conversaciones, ${progress.opportunities} oportunidades`,
        lastSyncAt: new Date(),
        lastSyncError: null,
      },
    });

    console.log(`[SYNC] ========== COMPLETED: ${progress.pipelines} pipelines, ${progress.opportunities} opps, ${progress.contacts} contacts, ${progress.conversations} convs ==========`);
    return progress;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    progress.status = "failed";
    progress.error = msg;

    console.error(`[SYNC] ========== FAILED ==========`);
    console.error(`[SYNC] Error: ${msg}`);
    console.error(`[SYNC] Stack: ${stack}`);
    console.error(`[SYNC] Progress: pipelines=${progress.pipelines} opps=${progress.opportunities} contacts=${progress.contacts} convs=${progress.conversations}`);

    try {
      await prisma.syncStatus.update({
        where: { tenantId },
        data: { syncInProgress: false, lastError: msg },
      });
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { syncState: "error", lastSyncError: msg },
      });
    } catch (dbErr) {
      console.error("[SYNC] DB error write failed:", dbErr);
    }

    return progress;
  }
}

// ==================== PAGE-BASED CONTACTS ====================

async function syncAllContacts(
  ghl: GHLClient,
  tenantId: string,
  progress: SyncProgress,
  onProgress?: (progress: SyncProgress) => void
) {
  const batchSize = 100;
  let currentPage = 1;
  const maxPages = 200;
  const seenFirstIds = new Set<string>();

  while (currentPage <= maxPages) {
    let res;
    try {
      console.log(`[SYNC] Contacts page ${currentPage}...`);
      res = await ghl.getContacts({ limit: batchSize, page: currentPage });
    } catch (err) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      console.error(`[SYNC] Contacts page ${currentPage} FAILED — ${e.response?.status} ${e.message}`);
      throw err;
    }

    if (!res.contacts || res.contacts.length === 0) {
      console.log(`[SYNC] Contacts page ${currentPage}: empty — done`);
      break;
    }

    const firstId = res.contacts[0].id;
    if (seenFirstIds.has(firstId)) {
      console.log(`[SYNC] Contacts page ${currentPage}: duplicate ${firstId} — done`);
      break;
    }
    seenFirstIds.add(firstId);

    progress.contactsTotal = res.meta?.total;
    console.log(`[SYNC] Contacts page ${currentPage}: ${res.contacts.length} records (total: ${res.meta?.total ?? "?"})`);

    for (const contact of res.contacts) {
      const data = mapContactToCache(tenantId, contact);
      await prisma.cachedContact.upsert({
        where: { id: contact.id },
        create: data,
        update: stripId(data),
      });
      progress.contacts++;
    }

    onProgress?.(progress);
    const totalLabel = progress.contactsTotal ? `/${progress.contactsTotal}` : "";
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { syncProgressMsg: `Contactos: ${progress.contacts}${totalLabel}` },
    });

    if (res.contacts.length < batchSize) {
      console.log(`[SYNC] Contacts: last page (${res.contacts.length} < ${batchSize})`);
      break;
    }

    currentPage++;
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`[SYNC] Contacts done: ${progress.contacts} in ${currentPage} pages`);
}

// ==================== PAGE-BASED OPPORTUNITIES ====================

async function syncOpportunitiesForPipeline(
  ghl: GHLClient,
  tenantId: string,
  pipelineId: string,
  pipelineName: string,
  progress: SyncProgress
) {
  let currentPage = 1;
  const startCount = progress.opportunities;
  const batchSize = 20;
  const maxPages = 500;
  const seenFirstIds = new Set<string>();

  while (currentPage <= maxPages) {
    let res;
    try {
      res = await ghl.getOpportunities(pipelineId, {
        limit: batchSize,
        page: currentPage,
      });
    } catch (err) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      console.error(`[SYNC] Opps page ${currentPage} "${pipelineName}" FAILED — ${e.response?.status} ${e.message}`);
      throw err;
    }

    if (!res.opportunities || res.opportunities.length === 0) {
      break;
    }

    const firstId = res.opportunities[0].id;
    if (seenFirstIds.has(firstId)) {
      console.log(`[SYNC] Opps page ${currentPage} "${pipelineName}": duplicate — done`);
      break;
    }
    seenFirstIds.add(firstId);

    console.log(`[SYNC] Opps page ${currentPage} "${pipelineName}": ${res.opportunities.length} records`);

    for (const opp of res.opportunities) {
      const data = mapOpportunityToCache(tenantId, opp);
      await prisma.cachedOpportunity.upsert({
        where: { id: opp.id },
        create: data,
        update: stripId(data),
      });
      progress.opportunities++;
    }

    if (res.opportunities.length < batchSize) break;

    currentPage++;
    await new Promise((r) => setTimeout(r, 150));
  }

  const count = progress.opportunities - startCount;
  console.log(`[SYNC] Pipeline "${pipelineName}": ${count} opps in ${currentPage} pages`);
}

// ==================== PAGE-BASED CONVERSATIONS ====================

async function syncAllConversations(
  ghl: GHLClient,
  tenantId: string,
  progress: SyncProgress
) {
  const batchSize = 100;
  let currentPage = 1;
  const maxPages = 100;
  const seenFirstIds = new Set<string>();

  while (currentPage <= maxPages) {
    let res;
    try {
      console.log(`[SYNC] Conversations page ${currentPage}...`);
      res = await ghl.getConversations({ limit: batchSize, page: currentPage });
    } catch (err) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string };
      console.error(`[SYNC] Conversations page ${currentPage} FAILED — ${e.response?.status} ${e.message}`);
      throw err;
    }

    if (!res.conversations || res.conversations.length === 0) {
      console.log(`[SYNC] Conversations page ${currentPage}: empty — done`);
      break;
    }

    const firstId = res.conversations[0].id;
    if (seenFirstIds.has(firstId)) {
      console.log(`[SYNC] Conversations page ${currentPage}: duplicate — done`);
      break;
    }
    seenFirstIds.add(firstId);

    console.log(`[SYNC] Conversations page ${currentPage}: ${res.conversations.length} records`);

    for (const conv of res.conversations) {
      const data = mapConversationToCache(tenantId, conv);
      await prisma.cachedConversation.upsert({
        where: { id: conv.id },
        create: data,
        update: stripId(data),
      });
      progress.conversations++;
    }

    if (res.conversations.length < batchSize) {
      console.log(`[SYNC] Conversations: last page (${res.conversations.length} < ${batchSize})`);
      break;
    }

    currentPage++;
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`[SYNC] Conversations done: ${progress.conversations} in ${currentPage} pages`);
}

// ==================== INCREMENTAL SYNC ====================

export async function incrementalSync(tenantId: string): Promise<{
  contactsDelta: number;
  needsFullSync: boolean;
}> {
  const ghl = await getGHLClient(tenantId);

  const cachedCount = await prisma.cachedContact.count({ where: { tenantId } });
  const res = await ghl.getContacts({ limit: 1, page: 1 });
  const ghlTotal = res.meta?.total ?? 0;

  const delta = Math.abs(ghlTotal - cachedCount);
  const mismatchPercent = cachedCount > 0 ? (delta / cachedCount) * 100 : 100;

  log.info({ tenantId, cachedCount, ghlTotal, delta, mismatchPercent }, "Incremental sync check");

  if (mismatchPercent > 10) {
    return { contactsDelta: delta, needsFullSync: true };
  }

  const recentContacts = await ghl.getContacts({ limit: 100, page: 1 });
  for (const contact of recentContacts.contacts) {
    const data = mapContactToCache(tenantId, contact);
    await prisma.cachedContact.upsert({
      where: { id: contact.id },
      create: data,
      update: stripId(data),
    });
  }

  await prisma.syncStatus.upsert({
    where: { tenantId },
    create: { tenantId, lastIncrSync: new Date() },
    update: { lastIncrSync: new Date() },
  });

  return { contactsDelta: delta, needsFullSync: false };
}

// ==================== WEBHOOK CACHE HANDLERS ====================

export async function upsertCachedContact(
  tenantId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
) {
  const contactData = {
    id: data.id as string,
    tenantId,
    firstName: (data.firstName as string) ?? null,
    lastName: (data.lastName as string) ?? null,
    name: (data.name as string) ??
      (`${(data.firstName as string) ?? ""} ${(data.lastName as string) ?? ""}`.trim() || null),
    email: (data.email as string) ?? null,
    phone: (data.phone as string) ?? null,
    tags: (data.tags ?? []) as JsonValue,
    customFields: (data.customFields ?? {}) as JsonValue,
    source: (data.source as string) ?? null,
    dateAdded: data.dateAdded ? new Date(data.dateAdded as string) : null,
    lastActivity: data.lastActivity ? new Date(data.lastActivity as string) : null,
    dnd: (data.dnd as boolean) ?? false,
    raw: JSON.parse(JSON.stringify(data)) as JsonValue,
    cachedAt: new Date(),
  };

  await prisma.cachedContact.upsert({
    where: { id: contactData.id },
    create: contactData,
    update: stripId(contactData),
  });
}

export async function deleteCachedContact(tenantId: string, contactId: string) {
  await prisma.cachedContact.deleteMany({
    where: { id: contactId, tenantId },
  });
}

export async function updateCachedContactTags(
  tenantId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
) {
  const contactId = data.id as string ?? data.contactId as string;
  if (!contactId) return;

  await prisma.cachedContact.updateMany({
    where: { id: contactId, tenantId },
    data: { tags: (data.tags ?? []) as JsonValue, cachedAt: new Date() },
  });
}

export async function updateCachedContactDnd(
  tenantId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
) {
  const contactId = data.id as string ?? data.contactId as string;
  if (!contactId) return;

  await prisma.cachedContact.updateMany({
    where: { id: contactId, tenantId },
    data: { dnd: (data.dnd as boolean) ?? false, cachedAt: new Date() },
  });
}

export async function cacheMessage(
  tenantId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
) {
  const conversationId = data.conversationId as string;
  if (!conversationId) return;

  await prisma.cachedConversation.updateMany({
    where: { id: conversationId, tenantId },
    data: {
      lastMessageBody: (data.body as string) ?? null,
      lastMessageDate: data.dateAdded ? new Date(data.dateAdded as string) : new Date(),
      lastMessageType: (data.messageType as string) ?? null,
      cachedAt: new Date(),
    },
  });
}

export async function upsertCachedOpportunity(
  tenantId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
) {
  const oppData = {
    id: data.id as string,
    tenantId,
    pipelineId: data.pipelineId as string,
    pipelineStageId: data.pipelineStageId as string,
    name: (data.name as string) ?? null,
    contactId: (data.contactId as string) ?? null,
    contactName: (data.contact?.name as string) ?? null,
    monetaryValue: (data.monetaryValue as number) ?? null,
    status: (data.status as string) ?? null,
    assignedTo: (data.assignedTo as string) ?? null,
    lastActivity: data.lastActivity ? new Date(data.lastActivity as string) : null,
    raw: data,
    cachedAt: new Date(),
  };

  await prisma.cachedOpportunity.upsert({
    where: { id: oppData.id },
    create: oppData,
    update: { ...oppData, id: undefined },
  });
}

export async function updateCachedOpportunityField(
  tenantId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
) {
  const oppId = data.id as string;
  if (!oppId) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { cachedAt: new Date() };
  if (data.pipelineStageId) update.pipelineStageId = data.pipelineStageId;
  if (data.status) update.status = data.status;
  if (data.monetaryValue !== undefined) update.monetaryValue = data.monetaryValue;

  await prisma.cachedOpportunity.updateMany({
    where: { id: oppId, tenantId },
    data: update,
  });
}

// ==================== SYNC QUEUE PROCESSOR ====================

export async function processSyncQueue() {
  const items = await prisma.syncQueue.findMany({
    where: {
      status: "pending",
      nextRetryAt: { lte: new Date() },
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  for (const item of items) {
    try {
      await prisma.syncQueue.update({
        where: { id: item.id },
        data: { status: "processing", attempts: item.attempts + 1 },
      });

      const ghl = await getGHLClient(item.tenantId);
      const payload = item.payload as Record<string, unknown>;

      switch (item.action) {
        case "updateContact":
          await ghl.updateContact(item.resourceId, payload);
          break;
        case "createContact":
          await ghl.createContact(payload);
          break;
        case "updateOpportunity":
          await ghl.updateOpportunity(item.resourceId, payload);
          break;
        case "createOpportunity":
          await ghl.createOpportunity(payload as unknown as Parameters<GHLClient["createOpportunity"]>[0]);
          break;
        default:
          log.warn({ action: item.action }, "Unknown sync queue action");
      }

      await prisma.syncQueue.update({
        where: { id: item.id },
        data: { status: "completed" },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      const nextRetry = new Date(Date.now() + Math.pow(2, item.attempts) * 60000);

      await prisma.syncQueue.update({
        where: { id: item.id },
        data: {
          status: item.attempts + 1 >= item.maxAttempts ? "failed" : "pending",
          lastError: msg,
          nextRetryAt: nextRetry,
        },
      });

      log.error({ itemId: item.id, action: item.action, error: msg }, "Sync queue item failed");
    }
  }
}
