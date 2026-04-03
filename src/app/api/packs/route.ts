export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createLegoPackSchema } from "@/lib/validation";
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
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/packs" });
  const { searchParams } = request.nextUrl;
  const isActiveParam = searchParams.get("isActive");

  try {
    const where: Prisma.LegoPackWhereInput = { tenantId };
    if (isActiveParam === "true") where.isActive = true;
    if (isActiveParam === "false") where.isActive = false;

    const packs = await prisma.legoPack.findMany({
      where,
      include: {
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: packs.length }, "Packs fetched");
    return NextResponse.json({ packs });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch packs",
      code: "PACKS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/packs" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createLegoPackSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const slug = data.slug || generateSlug(data.title);

    const pack = await prisma.legoPack.create({
      data: {
        tenantId,
        title: data.title,
        slug,
        categoryId: data.categoryId ?? null,
        price: data.price,
        images: JSON.parse(
          JSON.stringify(data.images)
        ) as Prisma.InputJsonValue,
        description: data.description ?? null,
        isActive: data.isActive,
      },
    });

    log.info({ packId: pack.id }, "Pack created");
    return NextResponse.json({ pack }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create pack",
      code: "PACKS_ERROR",
      logContext: { tenantId },
    });
  }
}
