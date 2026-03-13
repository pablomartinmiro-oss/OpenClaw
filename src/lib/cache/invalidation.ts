import { invalidateCache } from "@/lib/cache/redis";
import { CacheKeys } from "@/lib/cache/keys";
import { logger } from "@/lib/logger";

export async function invalidateContactCaches(
  tenantId: string,
  contactId?: string
): Promise<void> {
  await invalidateCache(CacheKeys.contacts(tenantId));
  if (contactId) {
    await invalidateCache(CacheKeys.contact(tenantId, contactId));
  }
  logger.debug({ tenantId, contactId }, "Contact caches invalidated");
}

export async function invalidateConversationCaches(
  tenantId: string,
  conversationId?: string
): Promise<void> {
  await invalidateCache(CacheKeys.conversations(tenantId));
  if (conversationId) {
    await invalidateCache(CacheKeys.conversation(tenantId, conversationId));
  }
  logger.debug({ tenantId, conversationId }, "Conversation caches invalidated");
}

export async function invalidateOpportunityCaches(
  tenantId: string,
  pipelineId: string
): Promise<void> {
  await invalidateCache(CacheKeys.opportunities(tenantId, pipelineId));
  logger.debug({ tenantId, pipelineId }, "Opportunity caches invalidated");
}
