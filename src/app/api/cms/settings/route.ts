export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, upsertSiteSettingSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/settings" });

  try {
    const settings = await prisma.siteSetting.findMany({
      where: { tenantId },
      orderBy: { key: "asc" },
    });

    log.info({ count: settings.length }, "CMS settings fetched");
    return NextResponse.json({ settings });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener configuracion CMS",
      code: "CMS_SETTINGS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PUT(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/settings" });

  try {
    const body = await request.json();
    const validated = validateBody(body, upsertSiteSettingSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { key, value } = validated.data;

    const setting = await prisma.siteSetting.upsert({
      where: { tenantId_key: { tenantId, key } },
      update: { value: value as Prisma.InputJsonValue },
      create: {
        tenantId,
        key,
        value: value as Prisma.InputJsonValue,
      },
    });

    log.info({ key }, "CMS setting upserted");
    return NextResponse.json({ setting });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al guardar configuracion CMS",
      code: "CMS_SETTINGS_ERROR",
      logContext: { tenantId },
    });
  }
}
