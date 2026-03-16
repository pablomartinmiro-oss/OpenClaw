/**
 * GHL Client — backward-compatible re-export.
 * The real implementation is in api.ts (GHLClient class).
 * This file keeps old imports working during the migration.
 */
export { GHLClient, getGHLClient } from "./api";
export type { GHLClient as GHLClientType } from "./api";

import { createMockGHLClient, type MockGHLClient } from "./mock-server";
import { logger } from "@/lib/logger";

/**
 * Legacy factory — returns mock client for mock mode code paths.
 * Live mode code paths should use getGHLClient() directly.
 */
export async function createGHLClient(
  tenantId: string
): Promise<MockGHLClient> {
  logger.debug({ tenantId }, "Using mock GHL client");
  return createMockGHLClient();
}
