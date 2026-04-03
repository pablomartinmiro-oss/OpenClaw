export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createSpaCategorySchema } from "@/lib/validation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/spa/categories" });

  try {
    const categories = await prisma.spaCategory.findMany({
      where: { tenantId },
      include: { _count: { select: { treatments: true } } },
      orderBy: { sortOrder: "asc" },
    });

    log.info({ count: categories.length }, "Spa categories fetched");
    return NextResponse.json({ categories });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch spa categories",
      code: "SPA_CATEGORIES_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/spa/categories" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createSpaCategorySchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;
    const slug = data.slug || generateSlug(data.name);

    const category = await prisma.spaCategory.create({
      data: {
        tenantId,
        name: data.name,
        slug,
        sortOrder: data.sortOrder,
      },
    });

    log.info({ categoryId: category.id }, "Spa category created");
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create spa category",
      code: "SPA_CATEGORIES_ERROR",
      logContext: { tenantId },
    });
  }
}
