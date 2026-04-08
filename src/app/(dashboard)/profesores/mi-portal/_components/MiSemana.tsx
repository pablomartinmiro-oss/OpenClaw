"use client";

import { Calendar } from "lucide-react";
import type { Assignment } from "@/hooks/useInstructors";

const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const LESSON_COLORS: Record<string, string> = {
  group: "bg-[#E87B5A]/15 border-[#E87B5A]/30 text-[#E87B5A]",
  private: "bg-[#5B8C6D]/15 border-[#5B8C6D]/30 text-[#5B8C6D]",
  adaptive: "bg-[#D4A853]/15 border-[#D4A853]/30 text-[#D4A853]",
};

const LESSON_LABELS: Record<string, string> = {
  group: "Grupal",
  private: "Particular",
  adaptive: "Adaptativa",
};

interface Props {
  assignments: Assignment[];
  weekStart: Date;
}

export default function MiSemana({ assignments, weekStart }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return assignments
      .filter((a) => a.booking.activityDate.startsWith(dateStr) && a.status !== "cancelled")
      .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));
  };

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-[#E87B5A]" />
        <h3 className="text-base font-semibold text-[#2D2A26]">Mi semana</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const dateStr = d.toISOString().split("T")[0];
          const isToday = dateStr === today;
          const dayAssignments = getForDay(d);

          return (
            <div key={i} className="min-h-[120px]">
              {/* Day header */}
              <div
                className={`rounded-lg px-2 py-1.5 text-center mb-2 ${
                  isToday
                    ? "bg-[#E87B5A] text-white"
                    : "bg-[#FAF9F7] text-[#8A8580]"
                }`}
              >
                <p className="text-xs font-semibold">{DAY_LABELS[i]}</p>
                <p className={`text-lg font-bold ${isToday ? "text-white" : "text-[#2D2A26]"}`}>
                  {d.getDate()}
                </p>
              </div>

              {/* Classes */}
              <div className="space-y-1.5">
                {dayAssignments.length === 0 ? (
                  <p className="text-center text-[10px] text-[#8A8580] py-2">—</p>
                ) : (
                  dayAssignments.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-lg border p-1.5 ${LESSON_COLORS[a.lessonType] ?? LESSON_COLORS.group}`}
                    >
                      <p className="text-[10px] font-bold">
                        {a.scheduledStart}-{a.scheduledEnd}
                      </p>
                      <p className="text-[9px] truncate">
                        {a.booking.reservation.clientName}
                      </p>
                      <p className="text-[9px]">
                        {LESSON_LABELS[a.lessonType] ?? a.lessonType} · {a.studentCount}p
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
