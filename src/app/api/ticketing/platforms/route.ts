export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createPlatformSchema } from "@/lib/validation";

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "ticketing");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/ticketing/platforms" });

  try {
    const platforms = await prisma.externalPlatform.findMany({
      where: { tenantId },
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: platforms.length }, "Platforms fetched");
    return NextResponse.json({ platforms });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener plataformas",
      code: "TICKETING_PLATFORMS_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/ticketing/platforms" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createPlatformSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const platform = await prisma.externalPlatform.create({
      data: {
        tenantId,
        name: data.name,
        type: data.type,
        commissionPercentage: data.commissionPercentage,
        active: data.active,
      },
    });

    log.info({ platformId: platform.id }, "Platform created");
    return NextResponse.json({ platform }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear plataforma",
      code: "TICKETING_PLATFORMS_ERROR",
      logContext: { tenantId },
    });
  }
}
