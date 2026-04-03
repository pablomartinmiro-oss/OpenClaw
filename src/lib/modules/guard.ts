import { redis } from "@/lib/cache/redis";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { MODULE_REGISTRY } from "./registry";

const CACHE_TTL = 300; // 5 minutes

/**
 * Check if a module is enabled for a tenant.
 * Returns null if enabled, or a 403 NextResponse if disabled.
 */
export async function requireModule(
  tenantId: string,
  moduleSlug: string
): Promise<NextResponse | null> {
  // Core modules are always enabled
  const moduleDef = MODULE_REGISTRY[moduleSlug];
  if (!moduleDef) {
    return NextResponse.json(
      { error: "Unknown module", code: "UNKNOWN_MODULE" },
      { status: 400 }
    );
  }
  if (moduleDef.isCore) return null;

  try {
    // Check Redis cache first
    const cacheKey = `mod:${tenantId}`;
    const client = redis;
    let enabledModules: string[] | null = null;

    if (client) {
      const cached = await client.get(cacheKey);
      if (cached) {
        enabledModules = JSON.parse(cached);
      }
    }

    // Cache miss — query DB
    if (!enabledModules) {
      const configs = await prisma.moduleConfig.findMany({
        where: { tenantId, isEnabled: true },
        select: { module: true },
      });
      enabledModules = configs.map((c) => c.module);

      // Cache for 5 minutes
      if (client) {
        await client.set(cacheKey, JSON.stringify(enabledModules), "EX", CACHE_TTL);
      }
    }

    if (!enabledModules.includes(moduleSlug)) {
      return NextResponse.json(
        { error: "Modulo no habilitado", code: "MODULE_DISABLED" },
        { status: 403 }
      );
    }

    return null; // Module is enabled
  } catch {
    // Fail open — if we can't check, allow access
    return null;
  }
}

/**
 * Invalidate module cache for a tenant (call after toggling modules).
 */
export async function invalidateModuleCache(tenantId: string): Promise<void> {
  try {
    const client = redis;
    if (client) {
      await client.del(`mod:${tenantId}`);
    }
  } catch {
    // Best effort
  }
}
