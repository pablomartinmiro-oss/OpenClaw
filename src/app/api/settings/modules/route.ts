export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant, requireOwner } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { MODULE_REGISTRY, ALL_MODULE_SLUGS } from "@/lib/modules/registry";
import { invalidateModuleCache } from "@/lib/modules/guard";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/settings/modules" });

  try {
    const configs = await prisma.moduleConfig.findMany({
      where: { tenantId },
    });

    const configMap = new Map(configs.map((c) => [c.module, c]));

    const modules = ALL_MODULE_SLUGS.map((slug) => {
      const def = MODULE_REGISTRY[slug];
      const config = configMap.get(slug);
      return {
        slug: def.slug,
        name: def.name,
        icon: def.icon,
        description: def.description,
        section: def.section,
        dependencies: def.dependencies,
        isCore: def.isCore,
        isEnabled: def.isCore || (config?.isEnabled ?? false),
        config: config?.config ?? {},
      };
    });

    log.info("Modules fetched");
    return NextResponse.json({ modules });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener modulos",
      code: "MODULES_FETCH_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(request: NextRequest) {
  const [session, authError] = await requireOwner();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/settings/modules" });

  try {
    const body = await request.json();
    const { slug, isEnabled } = body as { slug: string; isEnabled: boolean };

    if (!slug || typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "slug and isEnabled required" },
        { status: 400 }
      );
    }

    const def = MODULE_REGISTRY[slug];
    if (!def) {
      return NextResponse.json(
        { error: "Unknown module" },
        { status: 400 }
      );
    }

    if (def.isCore) {
      return NextResponse.json(
        { error: "Cannot disable core modules" },
        { status: 400 }
      );
    }

    // Check dependencies: if enabling, dependencies must be enabled
    if (isEnabled && def.dependencies.length > 0) {
      const depConfigs = await prisma.moduleConfig.findMany({
        where: { tenantId, module: { in: def.dependencies }, isEnabled: true },
      });
      const enabledDeps = depConfigs.map((c) => c.module);
      const missingDeps = def.dependencies.filter(
        (d) => !enabledDeps.includes(d)
      );
      if (missingDeps.length > 0) {
        const names = missingDeps
          .map((d) => MODULE_REGISTRY[d]?.name || d)
          .join(", ");
        return NextResponse.json(
          { error: `Requiere activar primero: ${names}` },
          { status: 400 }
        );
      }
    }

    // If disabling, check if other enabled modules depend on this one
    if (!isEnabled) {
      const dependents = ALL_MODULE_SLUGS.filter((s) => {
        const d = MODULE_REGISTRY[s];
        return d.dependencies.includes(slug);
      });

      if (dependents.length > 0) {
        const enabledDependents = await prisma.moduleConfig.findMany({
          where: {
            tenantId,
            module: { in: dependents },
            isEnabled: true,
          },
        });
        if (enabledDependents.length > 0) {
          const names = enabledDependents
            .map((c) => MODULE_REGISTRY[c.module]?.name || c.module)
            .join(", ");
          return NextResponse.json(
            { error: `No se puede desactivar — depende de: ${names}` },
            { status: 400 }
          );
        }
      }
    }

    await prisma.moduleConfig.upsert({
      where: { tenantId_module: { tenantId, module: slug } },
      create: { tenantId, module: slug, isEnabled },
      update: { isEnabled },
    });

    await invalidateModuleCache(tenantId);

    log.info({ slug, isEnabled }, "Module toggled");
    return NextResponse.json({ success: true, slug, isEnabled });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al cambiar modulo",
      code: "MODULE_TOGGLE_ERROR",
      logContext: { tenantId },
    });
  }
}
