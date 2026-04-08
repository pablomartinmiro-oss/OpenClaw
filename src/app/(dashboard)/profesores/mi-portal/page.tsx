"use client";

import { GraduationCap } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  useMyInstructorProfile,
  useTimeEntries,
  useAssignments,
} from "@/hooks/useInstructors";
import ClockInOutWidget from "../fichaje/_components/ClockInOutWidget";
import MiClasesHoy from "./_components/MiClasesHoy";
import MiSemana from "./_components/MiSemana";
import MiStats from "./_components/MiStats";

export default function MiPortalPage() {
  const { data: meData, isLoading: loadingMe } = useMyInstructorProfile();
  const myProfile = meData?.instructor;
  const isInstructor = meData?.isInstructor ?? false;

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const { data: entriesData } = useTimeEntries(
    myProfile ? { instructorId: myProfile.id, startDate: monthStart, endDate: monthEnd } : undefined
  );
  const entries = entriesData?.entries ?? [];

  const { data: todayAssignments } = useAssignments(
    myProfile ? { date: today, instructorId: myProfile.id } : undefined
  );
  const todayClasses = todayAssignments?.assignments ?? [];

  // Week range for calendar
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

  const { data: weekAssignments } = useAssignments(
    myProfile ? { instructorId: myProfile.id } : undefined
  );
  const weekClasses = (weekAssignments?.assignments ?? []).filter((a) => {
    const d = new Date(a.booking.activityDate);
    return d >= weekStart && d <= weekEnd;
  });

  if (loadingMe) return <PageSkeleton />;

  if (!isInstructor || !myProfile) {
    return (
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-12 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-[#E8E4DE]" />
        <p className="mt-4 text-lg font-medium text-[#2D2A26]">
          No tienes un perfil de profesor asignado
        </p>
        <p className="mt-1 text-sm text-[#8A8580]">
          Contacta con tu administrador para que te asigne como profesor
        </p>
      </div>
    );
  }

  // Today's open entry for clock widget
  const todayEntries = entries.filter((e) => e.date.startsWith(today));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
          <GraduationCap className="h-5 w-5 text-[#E87B5A]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">
            Hola, {myProfile.user.name?.split(" ")[0] ?? "Profesor"}
          </h1>
          <p className="text-sm text-[#8A8580]">
            {myProfile.tdLevel} · {myProfile.station.replace(/_/g, " ")} · {todayClasses.length} clase{todayClasses.length !== 1 ? "s" : ""} hoy
          </p>
        </div>
      </div>

      {/* Clock in/out — prominent */}
      <ClockInOutWidget
        instructors={[{
          ...myProfile,
          createdAt: myProfile.createdAt ?? "",
          updatedAt: myProfile.updatedAt ?? "",
        }]}
        entries={todayEntries}
        autoSelectId={myProfile.id}
      />

      {/* Today's classes + Stats side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MiClasesHoy assignments={todayClasses} />
        <MiStats entries={entries} myProfile={myProfile} />
      </div>

      {/* Week calendar */}
      <MiSemana assignments={weekClasses} weekStart={weekStart} />
    </div>
  );
}
