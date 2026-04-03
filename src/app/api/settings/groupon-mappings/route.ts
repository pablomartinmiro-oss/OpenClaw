export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody } from "@/lib/validation";
import { z } from "zod";

const createGrouponMappingSchema = z.object({
  grouponDesc: z.string().min(1, "grouponDesc es obligatorio"),
  pattern: z.string().min(1, "pattern es obligatorio"),
  services: z.array(z.record(z.unknown())).min(1, "services es obligatorio"),
});

export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/settings/groupon-mappings" });

  try {
    const mappings = await prisma.grouponProductMapping.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: mappings.length }, "Groupon mappings fetched");
    return NextResponse.json({ mappings });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch mappings",
      code: "GROUPON_MAPPING_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/settings/groupon-mappings" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createGrouponMappingSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    // Validate regex pattern
    try {
      new RegExp(data.pattern, "i");
    } catch {
      return NextResponse.json({ error: "Patrón regex inválido" }, { status: 400 });
    }

    const mapping = await prisma.grouponProductMapping.create({
      data: {
        tenantId,
        grouponDesc: data.grouponDesc,
        pattern: data.pattern,
        services: JSON.parse(JSON.stringify(data.services)),
      },
    });

    log.info({ mappingId: mapping.id }, "Groupon mapping created");
    return NextResponse.json({ mapping }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create mapping",
      code: "GROUPON_MAPPING_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const log = logger.child({ tenantId, path: "/api/settings/groupon-mappings" });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id es obligatorio" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.grouponProductMapping.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Mapeo no encontrado" }, { status: 404 });
    }

    await prisma.grouponProductMapping.delete({ where: { id } });

    log.info({ mappingId: id }, "Groupon mapping deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete mapping",
      code: "GROUPON_MAPPING_ERROR",
      logContext: { tenantId },
    });
  }
}
