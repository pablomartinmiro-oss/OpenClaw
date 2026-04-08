export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, clockInSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get("instructorId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (instructorId) where.instructorId = instructorId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate);
    }

    const entries = await prisma.instructorTimeEntry.findMany({
      where,
      include: {
        instructor: {
          select: { id: true, user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: [{ date: "desc" }, { clockIn: "desc" }],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener fichajes",
      code: "TIME_ENTRIES_LIST_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/instructors/time-entries" });

  try {
    const body = await request.json();
    const validated = validateBody(body, clockInSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify instructor belongs to tenant
    const instructor = await prisma.instructor.findFirst({
      where: { id: data.instructorId, tenantId },
    });
    if (!instructor) {
      return NextResponse.json({ error: "Profesor no encontrado" }, { status: 404 });
    }

    // Check no open entry exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const openEntry = await prisma.instructorTimeEntry.findFirst({
      where: {
        tenantId,
        instructorId: data.instructorId,
        date: { gte: today, lt: tomorrow },
        clockOut: null,
      },
    });
    if (openEntry) {
      return NextResponse.json(
        { error: "Ya tiene un fichaje abierto hoy. Cierre el anterior primero." },
        { status: 409 }
      );
    }

    const now = new Date();
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null;

    const entry = await prisma.instructorTimeEntry.create({
      data: {
        tenantId,
        instructorId: data.instructorId,
        date: today,
        clockIn: now,
        source: data.source,
        ipAddress: ip,
        geoLat: data.geoLat ?? null,
        geoLon: data.geoLon ?? null,
      },
      include: {
        instructor: {
          select: { id: true, user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    log.info({ entryId: entry.id, instructorId: data.instructorId }, "Clock in recorded");
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al fichar entrada",
      code: "CLOCK_IN_ERROR",
      logContext: { tenantId },
    });
  }
}
