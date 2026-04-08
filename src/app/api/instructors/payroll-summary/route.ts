export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { calculatePayroll } from "@/lib/instructors/payroll-calculator";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const modError = await requireModule(tenantId, "instructors");
  if (modError) return modError;

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString());
  const month = parseInt(searchParams.get("month") ?? (new Date().getMonth() + 1).toString());
  const instructorId = searchParams.get("instructorId");

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get instructors
    const where: Record<string, unknown> = { tenantId };
    if (instructorId) where.id = instructorId;

    const instructors = await prisma.instructor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const summaries = await Promise.all(
      instructors.map(async (inst) => {
        // Get locked time entries for the month
        const timeEntries = await prisma.instructorTimeEntry.findMany({
          where: {
            tenantId,
            instructorId: inst.id,
            date: { gte: startDate, lte: endDate },
            clockOut: { not: null },
          },
        });

        // Get completed assignments for the month
        const assignments = await prisma.instructorAssignment.findMany({
          where: {
            tenantId,
            instructorId: inst.id,
            booking: { activityDate: { gte: startDate, lte: endDate } },
          },
        });

        return calculatePayroll(
          inst.id,
          inst.user.name ?? inst.user.email,
          inst.hourlyRate,
          year,
          month,
          timeEntries.map((e) => ({
            netMinutes: e.netMinutes,
            date: e.date,
            correctionOf: e.correctionOf,
          })),
          assignments.map((a) => ({
            lessonType: a.lessonType,
            studentCount: a.studentCount,
            scheduledStart: a.scheduledStart,
            scheduledEnd: a.scheduledEnd,
            hourlyRate: a.hourlyRate,
            bonusPerStudent: a.bonusPerStudent,
            surcharge: a.surcharge,
            status: a.status,
          }))
        );
      })
    );

    return NextResponse.json({ summaries, year, month });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al calcular resumen de nominas",
      code: "PAYROLL_SUMMARY_ERROR",
      logContext: { tenantId },
    });
  }
}
