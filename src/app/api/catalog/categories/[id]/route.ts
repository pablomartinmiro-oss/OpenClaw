export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateCategorySchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: `/api/catalog/categories/${id}` });

  try {
    const existing = await prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateCategorySchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const category = await prisma.category.update({
      where: { id, tenantId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.parentId !== undefined && { parentId: data.parentId ?? null }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.image !== undefined && { image: data.image ?? null }),
      },
    });

    log.info({ categoryId: id }, "Category updated");
    return NextResponse.json({ category });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update category",
      code: "CATEGORIES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: `/api/catalog/categories/${id}` });

  try {
    const existing = await prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check for child categories
    const childCount = await prisma.category.count({
      where: { parentId: id, tenantId },
    });
    if (childCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with child categories" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    log.info({ categoryId: id }, "Category deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete category",
      code: "CATEGORIES_ERROR",
      logContext: { tenantId },
    });
  }
}
