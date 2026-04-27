export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

const businessInfoSchema = z.object({
  businessType: z.enum([
    "ski_school",
    "hotel",
    "spa",
    "restaurant",
    "multi",
  ]),
  city: z.string().min(1).max(100),
  phone: z.string().max(30).optional().or(z.literal("")),
  website: z.string().max(500).optional().or(z.literal("")),
  logoUrl: z.string().url().max(2000).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/onboarding/business" });

  try {
    const body = await request.json();
    const validated = validateBody(body, businessInfoSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { businessType, city, phone, website, logoUrl } = validated.data;

    await prisma.siteSetting.upsert({
      where: { tenantId_key: { tenantId, key: "onboarding.business" } },
      update: {
        value: { businessType, city, phone: phone || null, website: website || null, logoUrl: logoUrl || null } as Prisma.InputJsonValue,
      },
      create: {
        tenantId,
        key: "onboarding.business",
        value: { businessType, city, phone: phone || null, website: website || null, logoUrl: logoUrl || null } as Prisma.InputJsonValue,
      },
    });

    log.info({ businessType }, "Business info saved");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al guardar la informacion del negocio",
      code: "ONBOARDING_BUSINESS_ERROR",
      logContext: { tenantId },
    });
  }
}
