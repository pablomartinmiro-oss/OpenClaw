export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createLocationSchema } from "@/lib/validation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export async function GET(_request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "catalog");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/catalog/locations" });

  try {
    const locations = await prisma.location.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });

    log.info({ count: locations.length }, "Locations fetched");
    return NextResponse.json({ locations });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch locations",
      code: "LOCATIONS_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/catalog/locations" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createLocationSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const slug = data.slug || generateSlug(data.name);

    const location = await prisma.location.create({
      data: {
        tenantId,
        name: data.name,
        slug,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        description: data.description ?? null,
      },
    });

    log.info({ locationId: location.id }, "Location created");
    return NextResponse.json({ location }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create location",
      code: "LOCATIONS_ERROR",
      logContext: { tenantId },
    });
  }
}
