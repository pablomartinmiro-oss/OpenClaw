export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateSpaTreatmentSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/spa/treatments/${id}`,
  });

  try {
    const treatment = await prisma.spaTreatment.findFirst({
      where: { id, tenantId },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { slots: true } },
      },
    });

    if (!treatment) {
      return NextResponse.json(
        { error: "Spa treatment not found" },
        { status: 404 }
      );
    }

    log.info({ treatmentId: id }, "Spa treatment fetched");
    return NextResponse.json({ treatment });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch spa treatment",
      code: "SPA_TREATMENTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/spa/treatments/${id}`,
  });

  try {
    const existing = await prisma.spaTreatment.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Spa treatment not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateSpaTreatmentSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // If changing category, verify it belongs to tenant
    if (data.categoryId) {
      const category = await prisma.spaCategory.findFirst({
        where: { id: data.categoryId, tenantId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
    }

    const treatment = await prisma.spaTreatment.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && {
          categoryId: data.categoryId,
        }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.images !== undefined && {
          images: JSON.parse(
            JSON.stringify(data.images)
          ) as Prisma.InputJsonValue,
        }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.supplierCommission !== undefined && {
          supplierCommission: data.supplierCommission ?? null,
        }),
        ...(data.fiscalRegime !== undefined && {
          fiscalRegime: data.fiscalRegime,
        }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    log.info({ treatmentId: id }, "Spa treatment updated");
    return NextResponse.json({ treatment });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update spa treatment",
      code: "SPA_TREATMENTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/spa/treatments/${id}`,
  });

  try {
    const existing = await prisma.spaTreatment.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Spa treatment not found" },
        { status: 404 }
      );
    }

    await prisma.spaTreatment.delete({ where: { id } });

    log.info({ treatmentId: id }, "Spa treatment deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete spa treatment",
      code: "SPA_TREATMENTS_ERROR",
      logContext: { tenantId },
    });
  }
}
