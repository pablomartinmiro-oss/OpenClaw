export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

const storefrontSchema = z.object({
  siteTitle: z.string().min(1).max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#42A5F5"),
});

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/onboarding/storefront" });

  try {
    const body = await request.json();
    const validated = validateBody(body, storefrontSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { siteTitle, description, primaryColor } = validated.data;

    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { tenantId_key: { tenantId, key: "site_title" } },
        update: { value: { value: siteTitle } as Prisma.InputJsonValue },
        create: { tenantId, key: "site_title", value: { value: siteTitle } as Prisma.InputJsonValue },
      }),
      prisma.siteSetting.upsert({
        where: { tenantId_key: { tenantId, key: "site_description" } },
        update: { value: { value: description || "" } as Prisma.InputJsonValue },
        create: { tenantId, key: "site_description", value: { value: description || "" } as Prisma.InputJsonValue },
      }),
      prisma.siteSetting.upsert({
        where: { tenantId_key: { tenantId, key: "primary_color" } },
        update: { value: { value: primaryColor } as Prisma.InputJsonValue },
        create: { tenantId, key: "primary_color", value: { value: primaryColor } as Prisma.InputJsonValue },
      }),
    ]);

    log.info("Storefront config saved");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al guardar la tienda online",
      code: "ONBOARDING_STOREFRONT_ERROR",
      logContext: { tenantId },
    });
  }
}
