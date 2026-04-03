export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  updateSpaScheduleTemplateSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/spa/schedule-templates/${id}`,
  });

  try {
    const existing = await prisma.spaScheduleTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Schedule template not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(
      body,
      updateSpaScheduleTemplateSchema
    );
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // If changing treatmentId, verify it belongs to tenant
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

    const template = await prisma.spaScheduleTemplate.update({
      where: { id },
      data: {
        ...(data.dayOfWeek !== undefined && {
          dayOfWeek: data.dayOfWeek,
        }),
        ...(data.startTime !== undefined && {
          startTime: data.startTime,
        }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.treatmentId !== undefined && {
          treatmentId: data.treatmentId ?? null,
        }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.resourceIds !== undefined && {
          resourceIds: JSON.parse(
            JSON.stringify(data.resourceIds)
          ) as Prisma.InputJsonValue,
        }),
      },
    });

    log.info({ templateId: id }, "Schedule template updated");
    return NextResponse.json({ template });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update schedule template",
      code: "SPA_SCHEDULE_ERROR",
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
  const moduleError = await requireModule(tenantId, "spa");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/spa/schedule-templates/${id}`,
  });

  try {
    const existing = await prisma.spaScheduleTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Schedule template not found" },
        { status: 404 }
      );
    }

    await prisma.spaScheduleTemplate.delete({ where: { id } });

    log.info({ templateId: id }, "Schedule template deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete schedule template",
      code: "SPA_SCHEDULE_ERROR",
      logContext: { tenantId },
    });
  }
}
