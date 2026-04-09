export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";

/**
 * GET: Fetch latest geo positions of all clocked-in instructors (admin view).
 * POST: Instructor reports their current position.
 */
export async function GET() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's open time entries with geo data
    const entries = await prisma.instructorTimeEntry.findMany({
      where: {
        tenantId,
        date: { gte: today, lt: tomorrow },
        clockOut: null,
        geoLat: { not: null },
      },
      include: {
        instructor: {
          select: { id: true, station: true, user: { select: { name: true } } },
        },
      },
      orderBy: { clockIn: "desc" },
    });

    // Deduplicate by instructor (latest entry)
    const seen = new Set<string>();
    const positions = entries.filter((e) => {
      if (seen.has(e.instructorId)) return false;
      seen.add(e.instructorId);
      return true;
    }).map((e) => ({
      instructorId: e.instructorId,
      instructorName: e.instructor.user.name,
      station: e.instructor.station,
      lat: e.geoLat,
      lon: e.geoLon,
      clockIn: e.clockIn,
    }));

    return NextResponse.json({ positions });
  } catch (error) {
    return apiError(error, { publicMessage: "Error", code: "GEO_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  try {
    const { lat, lon } = await request.json();
    if (typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json({ error: "lat/lon required" }, { status: 400 });
    }

    // Update the current open time entry with geo
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const instructor = await prisma.instructor.findFirst({
      where: { tenantId, userId: session.userId },
    });
    if (!instructor) {
      return NextResponse.json({ error: "No eres profesor" }, { status: 403 });
    }

    const entry = await prisma.instructorTimeEntry.findFirst({
      where: { tenantId, instructorId: instructor.id, date: { gte: today, lt: tomorrow }, clockOut: null },
      orderBy: { clockIn: "desc" },
    });

    if (!entry) {
      return NextResponse.json({ error: "No tienes fichaje abierto" }, { status: 409 });
    }

    await prisma.instructorTimeEntry.update({
      where: { id: entry.id },
      data: { geoLat: lat, geoLon: lon },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al reportar posicion", code: "GEO_UPDATE_ERROR", logContext: { tenantId } });
  }
}
