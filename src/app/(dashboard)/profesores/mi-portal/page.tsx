"use client";

import { useMemo } from "react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useMyInstructorProfile, useTimeEntries } from "@/hooks/useInstructors";
import { useGroupCells } from "@/hooks/usePlanning";
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

  // Time entries for stats
  const { data: entriesData } = useTimeEntries(
    myProfile ? { instructorId: myProfile.id, startDate: monthStart, endDate: monthEnd } : undefined
  );
  const entries = entriesData?.entries ?? [];
  const todayEntries = entries.filter((e) => e.date.startsWith(today));

  // Today's GroupCells (classes) for this instructor
  const { data: todayGroupsData } = useGroupCells(
    myProfile ? { date: today, instructorId: myProfile.id } : undefined
  );
  const todayClasses = todayGroupsData?.groups ?? [];

  // Week range for MiSemana
  const { weekStart, weekEnd } = useMemo(() => {
    const ws = new Date(now);
    ws.setDate(ws.getDate() - ((ws.getDay() + 6) % 7)); // Monday
    const we = new Date(ws);
    we.setDate(we.getDate() + 6); // Sunday
    return {
      weekStart: ws.toISOString().split("T")[0],
      weekEnd: we.toISOString().split("T")[0],
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const { data: weekGroupsData } = useGroupCells(
    myProfile ? { startDate: weekStart, endDate: weekEnd, instructorId: myProfile.id } : undefined
  );
  const weekClasses = weekGroupsData?.groups ?? [];

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
  const totalStudents = todayClasses.reduce((s, g) => s + g._count.units, 0);

  // Next upcoming class
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const nextClass = todayClasses.find((g) => g.timeSlotStart > nowTime && g.status !== "completed" && g.status !== "cancelled");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero: greeting + clock + next class */}
      <div className="rounded-2xl bg-gradient-to-r from-[#2D2A26] to-[#4a4540] p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/60">{greeting},</p>
            <h1 className="text-2xl font-bold">{firstName}</h1>
            <p className="mt-1 text-sm text-white/60">
              {todayClasses.length} clase{todayClasses.length !== 1 ? "s" : ""} hoy · {totalStudents} alumno{totalStudents !== 1 ? "s" : ""} · {myProfile.tdLevel}
            </p>
            {nextClass && (
              <div className="mt-2 rounded-lg bg-white/10 px-3 py-2 inline-block">
                <p className="text-xs text-white/80">Proxima clase</p>
                <p className="text-sm font-bold">
                  {nextClass.timeSlotStart} – {nextClass.timeSlotEnd} · {nextClass.discipline} {nextClass.level} · {nextClass._count.units} alumnos
                </p>
              </div>
            )}
          </div>
          <ClockWidget instructorId={myProfile.id} entries={todayEntries} />
        </div>
      </div>

      {/* Today's classes + Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MiClasesHoy groups={todayClasses} />
        </div>
        <div className="lg:col-span-2">
          <MiStats entries={entries} myProfile={myProfile} todayClasses={todayClasses} />
        </div>
      </div>

      {/* Week calendar */}
      <MiSemana groups={weekClasses} weekStartStr={weekStart} />
    </div>
  );
}
