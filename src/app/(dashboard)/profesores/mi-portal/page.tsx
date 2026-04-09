"use client";

import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  useMyInstructorProfile,
  useTimeEntries,
  useAssignments,
} from "@/hooks/useInstructors";
import ClockWidget from "./_components/ClockWidget";
import MiClasesHoy from "./_components/MiClasesHoy";
import MiSemana from "./_components/MiSemana";
import MiStats from "./_components/MiStats";

export default function MiPortalPage() {
  const { data: meData, isLoading: loadingMe } = useMyInstructorProfile();
  const myProfile = meData?.instructor;

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: entriesData } = useTimeEntries(
    myProfile ? { instructorId: myProfile.id, startDate: monthStart, endDate: monthEnd } : undefined
  );
  const entries = entriesData?.entries ?? [];
  const todayEntries = entries.filter((e) => e.date.startsWith(today));

  const { data: todayData } = useAssignments(
    myProfile ? { date: today, instructorId: myProfile.id } : undefined
  );
  const todayClasses = todayData?.assignments ?? [];

  const { data: allAssignments } = useAssignments(
    myProfile ? { instructorId: myProfile.id } : undefined
  );
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekClasses = (allAssignments?.assignments ?? []).filter((a) => {
    const d = new Date(a.booking.activityDate);
    return d >= weekStart && d <= weekEnd;
  });

  if (loadingMe) return <PageSkeleton />;

  if (!myProfile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-[#2D2A26]">No tienes perfil de profesor</p>
          <p className="mt-2 text-sm text-[#8A8580]">Contacta con tu administrador</p>
        </div>
      </div>
    );
  }

  const greeting = now.getHours() < 12 ? "Buenos dias" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches";
  const firstName = myProfile.user.name?.split(" ")[0] ?? "Profesor";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Greeting + Clock — hero section */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2D2A26] to-[#4a4540] p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/60">{greeting},</p>
            <h1 className="text-2xl font-bold">{firstName}</h1>
            <p className="mt-1 text-sm text-white/60">
              {todayClasses.length} clase{todayClasses.length !== 1 ? "s" : ""} hoy ·{" "}
              {myProfile.tdLevel} · {myProfile.station.replace(/_/g, " ")}
            </p>
          </div>
          <ClockWidget
            instructorId={myProfile.id}
            entries={todayEntries}
          />
        </div>
      </div>

      {/* Today's classes + Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MiClasesHoy assignments={todayClasses} instructorId={myProfile.id} />
        </div>
        <div className="lg:col-span-2">
          <MiStats entries={entries} myProfile={myProfile} />
        </div>
      </div>

      {/* Week calendar */}
      <MiSemana assignments={weekClasses} weekStart={weekStart} />
    </div>
  );
}
