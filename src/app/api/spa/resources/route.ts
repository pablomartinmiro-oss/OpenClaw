export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createSpaResourceSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/spa/resources" });
  const { searchParams } = request.nextUrl;
  const typeParam = searchParams.get("type");

  try {
    const where: Prisma.SpaResourceWhereInput = { tenantId };
    if (typeParam === "cabin" || typeParam === "therapist") {
      where.type = typeParam;
    }

    const resources = await prisma.spaResource.findMany({
      where,
      include: { _count: { select: { slots: true } } },
      orderBy: { name: "asc" },
    });

    log.info({ count: resources.length }, "Spa resources fetched");
    return NextResponse.json({ resources });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch spa resources",
      code: "SPA_RESOURCES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/spa/resources" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createSpaResourceSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const resource = await prisma.spaResource.create({
      data: {
        tenantId,
        type: data.type,
        name: data.name,
        active: data.active,
      },
    });

    log.info({ resourceId: resource.id }, "Spa resource created");
    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create spa resource",
      code: "SPA_RESOURCES_ERROR",
      logContext: { tenantId },
    });
  }
}
