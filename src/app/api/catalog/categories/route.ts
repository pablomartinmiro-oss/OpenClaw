export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createCategorySchema } from "@/lib/validation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/catalog/categories" });
  const { searchParams } = request.nextUrl;
  const parentId = searchParams.get("parentId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (parentId) where.parentId = parentId;

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    log.info({ count: categories.length }, "Categories fetched");
    return NextResponse.json({ categories });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch categories",
      code: "CATEGORIES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/catalog/categories" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCategorySchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const slug = data.slug || generateSlug(data.name);

    const category = await prisma.category.create({
      data: {
        tenantId,
        name: data.name,
        slug,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? 0,
        image: data.image ?? null,
      },
    });

    log.info({ categoryId: category.id }, "Category created");
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create category",
      code: "CATEGORIES_ERROR",
      logContext: { tenantId },
    });
  }
}
