"use client";

import { useMemo } from "react";
import { GraduationCap, Users, Award, Snowflake } from "lucide-react";
import { useOperationsWeekSummary } from "@/hooks/useBookingOps";

const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow; // ISO Monday start
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

interface Props {
  date: string;
  onSelectDate: (date: string) => void;
}

export default function WeekView({ date, onSelectDate }: Props) {
  const weekStart = useMemo(() => startOfWeek(date), [date]);
  const { data, isLoading } = useOperationsWeekSummary(weekStart);

  const days = data?.days ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border border-[#E8E4DE] bg-[#FAF9F7] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {days.map((d, i) => {
        const dayDate = new Date(d.date + "T12:00:00");
        const dayNum = dayDate.getDate();
        const isSelected = isSameDay(d.date, date);
        const isWeekend = i >= 5;
        return (
          <button
            key={d.date}
            onClick={() => onSelectDate(d.date)}
            className={`text-left rounded-2xl border p-4 transition ${
              isSelected
                ? "border-[#E87B5A] bg-[#E87B5A]/5"
                : isWeekend
                  ? "border-[#E8E4DE] bg-[#FAF9F7]/50 hover:border-[#E87B5A]/50"
                  : "border-[#E8E4DE] bg-white hover:border-[#E87B5A]/50"
            }`}
          >
            <div className="flex items-baseline justify-between mb-3">
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-[#E87B5A]" : "text-[#8A8580]"
                }`}
              >
                {DAY_LABELS[i]}
              </span>
              <span className="text-2xl font-bold text-[#2D2A26]">{dayNum}</span>
            </div>
            <div className="space-y-1.5">
              <Stat
                icon={<GraduationCap className="h-3 w-3 text-[#E87B5A]" />}
                label="clases"
                value={d.totalActivities}
              />
              <Stat
                icon={<Users className="h-3 w-3 text-[#5B8C6D]" />}
                label="alumnos"
                value={d.totalStudents}
              />
              <Stat
                icon={<Award className="h-3 w-3 text-[#D4A853]" />}
                label="instructores"
                value={d.totalInstructors}
              />
              <Stat
                icon={<Snowflake className="h-3 w-3 text-blue-500" />}
                label="alquileres"
                value={d.totalRentals}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-[#8A8580]">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-[#2D2A26]">{value}</span>
    </div>
  );
}
