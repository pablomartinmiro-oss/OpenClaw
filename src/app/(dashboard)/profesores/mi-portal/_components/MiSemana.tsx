"use client";

import { Calendar, Users, Sun, Sunset } from "lucide-react";
import type { GroupCellRecord } from "@/hooks/usePlanning";

const DAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

const DISCIPLINE_DOT: Record<string, string> = {
  esqui: "bg-blue-400", snow: "bg-purple-400", telemark: "bg-emerald-400", freestyle: "bg-orange-400",
};

interface Props {
  groups: GroupCellRecord[];
  weekStartStr: string;
}

export default function MiSemana({ groups, weekStartStr }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartStr);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const getForDay = (dateStr: string) =>
    groups
      .filter((g) => g.activityDate.startsWith(dateStr) && g.status !== "cancelled")
      .sort((a, b) => a.timeSlotStart.localeCompare(b.timeSlotStart));

  const totalStudents = groups.reduce((s, g) => s + g._count.units, 0);

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#E87B5A]" />
          <h3 className="text-base font-semibold text-[#2D2A26]">Mi semana</h3>
        </div>
        <span className="text-xs text-[#8A8580]">{groups.length} clases · {totalStudents} alumnos</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((dateStr, i) => {
          const isToday = dateStr === today;
          const isPast = dateStr < today;
          const dayGroups = getForDay(dateStr);
          const dayNum = new Date(dateStr).getDate();
          const morning = dayGroups.filter((g) => g.timeSlotStart < "13:00");
          const afternoon = dayGroups.filter((g) => g.timeSlotStart >= "13:00");
          const dayStudents = dayGroups.reduce((s, g) => s + g._count.units, 0);

          return (
            <div key={dateStr} className={`min-h-[140px] ${isPast ? "opacity-50" : ""}`}>
              {/* Day header */}
              <div className={`rounded-lg px-2 py-1.5 text-center mb-2 ${isToday ? "bg-[#E87B5A] text-white" : "bg-[#FAF9F7] text-[#8A8580]"}`}>
                <p className="text-[10px] font-semibold">{DAY_LABELS[i]}</p>
                <p className={`text-lg font-bold ${isToday ? "text-white" : "text-[#2D2A26]"}`}>{dayNum}</p>
                {dayGroups.length > 0 && (
                  <p className={`text-[9px] ${isToday ? "text-white/70" : "text-[#8A8580]"}`}>
                    {dayGroups.length}c · {dayStudents}a
                  </p>
                )}
              </div>

              {/* Classes */}
              <div className="space-y-1.5">
                {dayGroups.length === 0 ? (
                  <p className="text-center text-[10px] text-[#E8E4DE] py-2">—</p>
                ) : (
                  <>
                    {/* Morning block */}
                    {morning.length > 0 && (
                      <div>
                        <div className="flex items-center gap-0.5 mb-0.5 px-0.5">
                          <Sun className="h-2 w-2 text-[#D4A853]" />
                          <span className="text-[7px] text-[#8A8580]">AM</span>
                        </div>
                        {morning.map((g) => (
                          <ClassMiniCard key={g.id} group={g} />
                        ))}
                      </div>
                    )}
                    {/* Afternoon block */}
                    {afternoon.length > 0 && (
                      <div>
                        <div className="flex items-center gap-0.5 mb-0.5 px-0.5">
                          <Sunset className="h-2 w-2 text-[#E87B5A]" />
                          <span className="text-[7px] text-[#8A8580]">PM</span>
                        </div>
                        {afternoon.map((g) => (
                          <ClassMiniCard key={g.id} group={g} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClassMiniCard({ group }: { group: GroupCellRecord }) {
  const dot = DISCIPLINE_DOT[group.discipline] ?? "bg-gray-400";
  const count = group._count.units;
  const isCompleted = group.status === "completed";

  return (
    <div className={`rounded-lg border border-[#E8E4DE] p-1.5 mb-1 ${isCompleted ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-1">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
        <span className="text-[9px] font-bold text-[#2D2A26]">{group.timeSlotStart}</span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[8px] text-[#8A8580] capitalize truncate">{group.discipline} {group.level}</span>
        <span className="flex items-center gap-0.5 text-[8px] text-[#8A8580] ml-auto">
          <Users className="h-2 w-2" />{count}
        </span>
      </div>
    </div>
  );
}
