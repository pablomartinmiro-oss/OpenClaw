export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createCouponEmailConfigSchema,
} from "@/lib/validation";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/ticketing/email-config" });

  try {
    const configs = await prisma.couponEmailConfig.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: configs.length }, "Email configs fetched");
    return NextResponse.json({ configs });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener configuracion de email",
      code: "TICKETING_EMAIL_CONFIG_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/ticketing/email-config" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCouponEmailConfigSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const config = await prisma.couponEmailConfig.create({
      data: {
        tenantId,
        templateId: data.templateId,
        eventTrigger: data.eventTrigger,
        enabled: data.enabled,
      },
    });

    log.info({ configId: config.id }, "Email config created");
    return NextResponse.json({ config }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear configuracion de email",
      code: "TICKETING_EMAIL_CONFIG_ERROR",
      logContext: { tenantId },
    });
  }
}
