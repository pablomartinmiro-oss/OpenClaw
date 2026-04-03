export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createSpaTreatmentSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/spa/treatments" });
  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("categoryId");
  const activeParam = searchParams.get("active");

  try {
    const where: Prisma.SpaTreatmentWhereInput = { tenantId };
    if (categoryId) where.categoryId = categoryId;
    if (activeParam === "true") where.active = true;
    if (activeParam === "false") where.active = false;

    const treatments = await prisma.spaTreatment.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { title: "asc" },
    });

    log.info({ count: treatments.length }, "Spa treatments fetched");
    return NextResponse.json({ treatments });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch spa treatments",
      code: "SPA_TREATMENTS_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/spa/treatments" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createSpaTreatmentSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify category belongs to this tenant
    const category = await prisma.spaCategory.findFirst({
      where: { id: data.categoryId, tenantId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const slug = data.slug || generateSlug(data.title);

    const treatment = await prisma.spaTreatment.create({
      data: {
        tenantId,
        categoryId: data.categoryId,
        title: data.title,
        slug,
        duration: data.duration,
        capacity: data.capacity,
        price: data.price,
        images: JSON.parse(
          JSON.stringify(data.images)
        ) as Prisma.InputJsonValue,
        description: data.description ?? null,
        supplierCommission: data.supplierCommission ?? null,
        fiscalRegime: data.fiscalRegime,
        active: data.active,
      },
    });

    log.info({ treatmentId: treatment.id }, "Spa treatment created");
    return NextResponse.json({ treatment }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create spa treatment",
      code: "SPA_TREATMENTS_ERROR",
      logContext: { tenantId },
    });
  }
}
