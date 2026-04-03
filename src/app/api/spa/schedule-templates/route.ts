export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createSpaScheduleTemplateSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: "/api/spa/schedule-templates",
  });
  const { searchParams } = request.nextUrl;
  const dayParam = searchParams.get("dayOfWeek");

  try {
    const where: Prisma.SpaScheduleTemplateWhereInput = { tenantId };
    if (dayParam !== null) {
      const day = parseInt(dayParam, 10);
      if (!isNaN(day) && day >= 0 && day <= 6) {
        where.dayOfWeek = day;
      }
    }

    const templates = await prisma.spaScheduleTemplate.findMany({
      where,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    log.info({ count: templates.length }, "Schedule templates fetched");
    return NextResponse.json({ templates });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch schedule templates",
      code: "SPA_SCHEDULE_ERROR",
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

  const log = logger.child({
    tenantId,
    path: "/api/spa/schedule-templates",
  });

  try {
    const body = await request.json();
    const validated = validateBody(
      body,
      createSpaScheduleTemplateSchema
    );
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // If treatmentId provided, verify it belongs to tenant
    if (data.treatmentId) {
      const treatment = await prisma.spaTreatment.findFirst({
        where: { id: data.treatmentId, tenantId },
      });
      if (!treatment) {
        return NextResponse.json(
          { error: "Treatment not found" },
          { status: 404 }
        );
      }
    }

    const template = await prisma.spaScheduleTemplate.create({
      data: {
        tenantId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        treatmentId: data.treatmentId ?? null,
        capacity: data.capacity,
        resourceIds: JSON.parse(
          JSON.stringify(data.resourceIds)
        ) as Prisma.InputJsonValue,
      },
    });

    log.info({ templateId: template.id }, "Schedule template created");
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create schedule template",
      code: "SPA_SCHEDULE_ERROR",
      logContext: { tenantId },
    });
  }
}
