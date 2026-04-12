"use client";

import { Users, Sun, Sunset, AlertTriangle } from "lucide-react";
import { useGroupCells } from "@/hooks/usePlanning";
import type { GroupCellRecord } from "@/hooks/usePlanning";

interface Props {
  weekDays: string[];
  station: string;
  onSelectDate: (date: string) => void;
  onSelectGroup: (id: string) => void;
}

const DISCIPLINE_DOT: Record<string, string> = {
  esqui: "bg-blue-400", snow: "bg-purple-400", telemark: "bg-emerald-400", freestyle: "bg-orange-400",
};

const LEVEL_COLORS: Record<string, string> = {
  A: "text-[#5B8C6D]", B: "text-[#D4A853]", C: "text-[#E87B5A]", D: "text-[#C75D4A]",
};

export default function WeekView({ weekDays, station, onSelectDate, onSelectGroup }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 border-b border-[#E8E4DE] bg-[#FAF9F7]">
        {weekDays.map((day) => {
          const d = new Date(day);
          const isToday = day === todayStr;
          const dayName = d.toLocaleDateString("es-ES", { weekday: "short" });
          const dayNum = d.getDate();
          const monthName = d.toLocaleDateString("es-ES", { month: "short" });
          return (
            <button key={day} onClick={() => onSelectDate(day)}
              className="border-r last:border-r-0 border-[#E8E4DE] px-2 py-2 text-center hover:bg-[#E87B5A]/5 transition-colors">
              <p className="text-[10px] text-[#8A8580] uppercase">{dayName}</p>
              <p className={`text-lg font-bold ${isToday ? "text-[#E87B5A]" : "text-[#2D2A26]"}`}>{dayNum}</p>
              <p className="text-[9px] text-[#8A8580] capitalize">{monthName}</p>
            </button>
          );
        })}
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((day) => (
          <DayColumn key={day} date={day} station={station} onSelectDate={onSelectDate} onSelectGroup={onSelectGroup} />
        ))}
      </div>
    </div>
  );
}

function DayColumn({ date, station, onSelectDate, onSelectGroup }: {
  date: string; station: string; onSelectDate: (d: string) => void; onSelectGroup: (id: string) => void;
}) {
  const { data } = useGroupCells({ date, station });
  const groups = data?.groups ?? [];
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = date === todayStr;
  const isPast = date < todayStr;

  const morning = groups.filter((g) => g.timeSlotStart < "13:00");
  const afternoon = groups.filter((g) => g.timeSlotStart >= "13:00");
  const totalStudents = groups.reduce((s, g) => s + g._count.units, 0);
  const unassigned = groups.filter((g) => !g.instructorId).length;

  return (
    <div className={`border-r last:border-r-0 border-[#E8E4DE] flex flex-col ${isPast ? "opacity-50" : ""} ${isToday ? "bg-[#E87B5A]/[0.03]" : ""}`}>
      {/* Day summary */}
      <div className="px-2 py-2 border-b border-[#E8E4DE]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#2D2A26]">{groups.length}g</span>
          <span className="flex items-center gap-0.5 text-[10px] text-[#8A8580]">
            <Users className="h-2.5 w-2.5" />{totalStudents}
          </span>
        </div>
        {unassigned > 0 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <AlertTriangle className="h-2.5 w-2.5 text-[#D4A853]" />
            <span className="text-[9px] text-[#D4A853]">{unassigned} sin profe</span>
          </div>
        )}
      </div>

      {/* Morning block */}
      <div className="flex-1 p-1.5 border-b border-[#E8E4DE]/50">
        {morning.length > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <Sun className="h-2.5 w-2.5 text-[#D4A853]" />
              <span className="text-[8px] text-[#8A8580]">AM</span>
            </div>
            {morning.map((g) => (
              <MiniGroupCard key={g.id} group={g} onClick={() => { onSelectDate(date); onSelectGroup(g.id); }} />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-[9px] text-[#E8E4DE]">—</span>
          </div>
        )}
      </div>

      {/* Afternoon block */}
      <div className="flex-1 p-1.5">
        {afternoon.length > 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1 mb-1">
              <Sunset className="h-2.5 w-2.5 text-[#E87B5A]" />
              <span className="text-[8px] text-[#8A8580]">PM</span>
            </div>
            {afternoon.map((g) => (
              <MiniGroupCard key={g.id} group={g} onClick={() => { onSelectDate(date); onSelectGroup(g.id); }} />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-[9px] text-[#E8E4DE]">—</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniGroupCard({ group, onClick }: { group: GroupCellRecord; onClick: () => void }) {
  const dot = DISCIPLINE_DOT[group.discipline] ?? "bg-gray-400";
  const levelColor = LEVEL_COLORS[group.level] ?? "text-[#8A8580]";
  const count = group._count.units;
  const noInstructor = !group.instructorId;

  return (
    <button onClick={onClick}
      className={`w-full rounded-lg border px-1.5 py-1 text-left transition-all hover:shadow-sm
        ${noInstructor ? "border-[#D4A853]/40 bg-[#D4A853]/5" : "border-[#E8E4DE] bg-white hover:bg-[#FAF9F7]"}
      `}>
      <div className="flex items-center gap-1">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className={`text-[9px] font-bold ${levelColor}`}>{group.level}</span>
        <span className="text-[9px] text-[#8A8580] ml-auto">{count}/{group.maxParticipants}</span>
      </div>
      {group.instructor && (
        <p className="text-[8px] text-[#8A8580] truncate mt-0.5">
          {group.instructor.user.name?.split(" ")[0]}
        </p>
      )}
    </button>
  );
}
