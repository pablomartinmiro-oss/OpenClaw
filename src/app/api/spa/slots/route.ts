export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createSpaSlotSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/spa/slots" });
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const treatmentId = searchParams.get("treatmentId");
  const statusParam = searchParams.get("status");

  try {
    const where: Prisma.SpaSlotWhereInput = { tenantId };
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        // Match full day
        const start = new Date(parsed);
        start.setHours(0, 0, 0, 0);
        const end = new Date(parsed);
        end.setHours(23, 59, 59, 999);
        where.date = { gte: start, lte: end };
      }
    }
    if (treatmentId) where.treatmentId = treatmentId;
    if (
      statusParam === "available" ||
      statusParam === "blocked" ||
      statusParam === "full"
    ) {
      where.status = statusParam;
    }

    const slots = await prisma.spaSlot.findMany({
      where,
      include: {
        treatment: { select: { id: true, title: true } },
        resource: { select: { id: true, name: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    log.info({ count: slots.length }, "Spa slots fetched");
    return NextResponse.json({ slots });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch spa slots",
      code: "SPA_SLOTS_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/spa/slots" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createSpaSlotSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify treatment belongs to this tenant
    const treatment = await prisma.spaTreatment.findFirst({
      where: { id: data.treatmentId, tenantId },
    });
    if (!treatment) {
      return NextResponse.json(
        { error: "Treatment not found" },
        { status: 404 }
      );
    }

    // If resourceId provided, verify it belongs to tenant
    if (data.resourceId) {
      const resource = await prisma.spaResource.findFirst({
        where: { id: data.resourceId, tenantId },
      });
      if (!resource) {
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 }
        );
      }
    }

    const slot = await prisma.spaSlot.create({
      data: {
        tenantId,
        date: data.date,
        time: data.time,
        treatmentId: data.treatmentId,
        resourceId: data.resourceId ?? null,
        capacity: data.capacity,
        status: data.status,
      },
    });

    log.info({ slotId: slot.id }, "Spa slot created");
    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create spa slot",
      code: "SPA_SLOTS_ERROR",
      logContext: { tenantId },
    });
  }
}
