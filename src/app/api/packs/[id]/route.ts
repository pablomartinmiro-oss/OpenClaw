export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateLegoPackSchema } from "@/lib/validation";
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
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: `/api/packs/${id}` });

  try {
    const pack = await prisma.legoPack.findFirst({
      where: { id, tenantId },
      include: {
        lines: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!pack) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    log.info({ packId: id }, "Pack fetched");
    return NextResponse.json({ pack });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch pack",
      code: "PACKS_ERROR",
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
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: `/api/packs/${id}` });

  try {
    const existing = await prisma.legoPack.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateLegoPackSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    const pack = await prisma.legoPack.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.categoryId !== undefined && {
          categoryId: data.categoryId ?? null,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.images !== undefined && {
          images: JSON.parse(
            JSON.stringify(data.images)
          ) as Prisma.InputJsonValue,
        }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    log.info({ packId: id }, "Pack updated");
    return NextResponse.json({ pack });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update pack",
      code: "PACKS_ERROR",
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
  const moduleError = await requireModule(tenantId, "packs");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: `/api/packs/${id}` });

  try {
    const existing = await prisma.legoPack.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pack not found" },
        { status: 404 }
      );
    }

    await prisma.legoPack.delete({ where: { id } });

    log.info({ packId: id }, "Pack deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete pack",
      code: "PACKS_ERROR",
      logContext: { tenantId },
    });
  }
}
