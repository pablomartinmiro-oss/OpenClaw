export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { MODULE_REGISTRY, ALL_MODULE_SLUGS } from "@/lib/modules/registry";
import { invalidateModuleCache } from "@/lib/modules/guard";

const bulkModulesSchema = z.object({
  enabled: z.array(z.string()).min(0).max(50),
});

export async function POST(request: NextRequest) {
  const [session, authError] = await requireOwner();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/onboarding/modules" });

  try {
    const body = await request.json();
    const validated = validateBody(body, bulkModulesSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const requested = new Set(validated.data.enabled.filter((s) => MODULE_REGISTRY[s]));

    // Always include core modules
    for (const slug of ALL_MODULE_SLUGS) {
      if (MODULE_REGISTRY[slug].isCore) requested.add(slug);
    }

    // Auto-include dependencies (transitive)
    let added = true;
    while (added) {
      added = false;
      for (const slug of Array.from(requested)) {
        const def = MODULE_REGISTRY[slug];
        for (const dep of def.dependencies) {
          if (!requested.has(dep)) {
            requested.add(dep);
            added = true;
          }
        }
      }
    }

    // Upsert all module configs in a single transaction
    await prisma.$transaction(
      ALL_MODULE_SLUGS.map((slug) =>
        prisma.moduleConfig.upsert({
          where: { tenantId_module: { tenantId, module: slug } },
          create: { tenantId, module: slug, isEnabled: requested.has(slug) },
          update: { isEnabled: requested.has(slug) },
        })
      )
    );

    await invalidateModuleCache(tenantId);

    log.info({ count: requested.size }, "Modules bulk-updated");
    return NextResponse.json({ ok: true, enabled: Array.from(requested) });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al activar modulos",
      code: "ONBOARDING_MODULES_ERROR",
      logContext: { tenantId },
    });
  }
}
