export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateVariantSchema } from "@/lib/validation";

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

  const log = logger.child({ tenantId, path: `/api/catalog/variants/${id}` });

  try {
    const existing = await prisma.experienceVariant.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateVariantSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const variant = await prisma.experienceVariant.update({
      where: { id, tenantId },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.priceModifier !== undefined && { priceModifier: data.priceModifier }),
        ...(data.priceType !== undefined && { priceType: data.priceType }),
      },
    });

    log.info({ variantId: id }, "Variant updated");
    return NextResponse.json({ variant });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update variant",
      code: "VARIANTS_ERROR",
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

  const log = logger.child({ tenantId, path: `/api/catalog/variants/${id}` });

  try {
    const existing = await prisma.experienceVariant.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    await prisma.experienceVariant.delete({ where: { id } });

    log.info({ variantId: id }, "Variant deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete variant",
      code: "VARIANTS_ERROR",
      logContext: { tenantId },
    });
  }
}
