export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateLocationSchema } from "@/lib/validation";

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

  const log = logger.child({ tenantId, path: `/api/catalog/locations/${id}` });

  try {
    const existing = await prisma.location.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateLocationSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.latitude !== undefined && { latitude: data.latitude ?? null }),
        ...(data.longitude !== undefined && { longitude: data.longitude ?? null }),
        ...(data.description !== undefined && { description: data.description ?? null }),
      },
    });

    log.info({ locationId: id }, "Location updated");
    return NextResponse.json({ location });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update location",
      code: "LOCATIONS_ERROR",
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

  const log = logger.child({ tenantId, path: `/api/catalog/locations/${id}` });

  try {
    const existing = await prisma.location.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    await prisma.location.delete({ where: { id } });

    log.info({ locationId: id }, "Location deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete location",
      code: "LOCATIONS_ERROR",
      logContext: { tenantId },
    });
  }
}
