export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateSpaCategorySchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

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
    path: `/api/spa/categories/${id}`,
  });

  try {
    const existing = await prisma.spaCategory.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Spa category not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateSpaCategorySchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const category = await prisma.spaCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    log.info({ categoryId: id }, "Spa category updated");
    return NextResponse.json({ category });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update spa category",
      code: "SPA_CATEGORIES_ERROR",
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
    path: `/api/spa/categories/${id}`,
  });

  try {
    const existing = await prisma.spaCategory.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Spa category not found" },
        { status: 404 }
      );
    }

    await prisma.spaCategory.delete({ where: { id } });

    log.info({ categoryId: id }, "Spa category deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete spa category",
      code: "SPA_CATEGORIES_ERROR",
      logContext: { tenantId },
    });
  }
}
