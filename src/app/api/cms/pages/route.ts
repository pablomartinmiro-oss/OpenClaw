export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createStaticPageSchema } from "@/lib/validation";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 300);
}

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/pages" });
  const isPublished = request.nextUrl.searchParams.get("isPublished");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (isPublished === "true") where.isPublished = true;
    if (isPublished === "false") where.isPublished = false;

    const pages = await prisma.staticPage.findMany({
      where,
      include: { _count: { select: { blocks: true } } },
      orderBy: { updatedAt: "desc" },
    });

    log.info({ count: pages.length }, "CMS pages fetched");
    return NextResponse.json({ pages });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener paginas",
      code: "CMS_PAGES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "cms");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/cms/pages" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createStaticPageSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;
    let slug = data.slug || generateSlug(data.title);

    // Ensure slug uniqueness within tenant
    const existing = await prisma.staticPage.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const page = await prisma.staticPage.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        content: data.content ?? "",
        metaDescription: data.metaDescription ?? null,
        isPublished: data.isPublished ?? false,
      },
    });

    log.info({ pageId: page.id, slug }, "CMS page created");
    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear pagina",
      code: "CMS_PAGES_ERROR",
      logContext: { tenantId },
    });
  }
}
