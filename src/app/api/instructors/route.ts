export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createInstructorSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const log = logger.child({ tenantId, path: "/api/instructors" });
  const { searchParams } = new URL(request.url);
  const station = searchParams.get("station");
  const tdLevel = searchParams.get("tdLevel");
  const language = searchParams.get("language");
  const isActive = searchParams.get("isActive");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (station) where.station = station;
    if (tdLevel) where.tdLevel = tdLevel;
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const instructors = await prisma.instructor.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { user: { name: "asc" } },
    });

    // Filter by language in-memory (JSON array)
    const filtered = language
      ? instructors.filter((i) => {
          const langs = i.languages as string[];
          return langs.includes(language);
        })
      : instructors;

    log.info({ count: filtered.length }, "Instructors fetched");
    return NextResponse.json({ instructors: filtered });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener profesores",
      code: "INSTRUCTORS_LIST_ERROR",
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

  const log = logger.child({ tenantId, path: "/api/instructors" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createInstructorSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: data.userId, tenantId },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Check no duplicate instructor for this user
    const existing = await prisma.instructor.findUnique({
      where: { tenantId_userId: { tenantId, userId: data.userId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Este usuario ya tiene un perfil de profesor" },
        { status: 409 }
      );
    }

    const instructor = await prisma.instructor.create({
      data: {
        tenantId,
        userId: data.userId,
        tdLevel: data.tdLevel,
        certExpiry: data.certExpiry ?? null,
        certNumber: data.certNumber ?? null,
        disciplines: data.disciplines,
        specialties: data.specialties,
        languages: data.languages,
        maxLevel: data.maxLevel ?? null,
        hourlyRate: data.hourlyRate,
        perStudentBonus: data.perStudentBonus,
        contractType: data.contractType,
        station: data.station,
        seasonStart: data.seasonStart ?? null,
        seasonEnd: data.seasonEnd ?? null,
        notes: data.notes ?? null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    log.info({ instructorId: instructor.id }, "Instructor created");
    return NextResponse.json({ instructor }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear profesor",
      code: "INSTRUCTOR_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
