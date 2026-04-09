"use client";

import { GraduationCap } from "lucide-react";
import type { Instructor } from "@/hooks/useInstructors";
import type { GroupCellRecord } from "@/hooks/usePlanning";
import GroupCellCard from "./GroupCellCard";

const HOURS = Array.from({ length: 9 }, (_, i) => i + 8); // 8:00 to 16:00

interface Props {
  groups: GroupCellRecord[];
  instructors: Instructor[];
}

export default function PlanningCalendar({ groups, instructors }: Props) {
  const getGroups = (instructorId: string) =>
    groups.filter((g) => g.instructorId === instructorId);

  const unassignedGroups = groups.filter((g) => !g.instructorId);

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex border-b border-[#E8E4DE] bg-[#FAF9F7]">
        <div className="w-44 shrink-0 px-3 py-2 text-xs font-medium text-[#8A8580]">Profesor</div>
        <div className="flex flex-1">
          {HOURS.map((h) => (
            <div key={h} className="flex-1 border-l border-[#E8E4DE] px-1 py-2 text-center text-xs text-[#8A8580]">
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>
      </div>

      {/* Instructor rows */}
      {instructors.map((inst) => {
        const instGroups = getGroups(inst.id);
        return (
          <div key={inst.id} className="flex border-b border-[#E8E4DE] last:border-0 min-h-[60px]">
            <div className="w-44 shrink-0 flex items-center gap-2 px-3 py-2 border-r border-[#E8E4DE]">
              <GraduationCap className="h-3.5 w-3.5 text-[#E87B5A] shrink-0" />
              <div className="truncate">
                <p className="text-xs font-medium text-[#2D2A26] truncate">{inst.user.name ?? inst.user.email}</p>
                <p className="text-[10px] text-[#8A8580]">{inst.tdLevel} · {inst.languages.join(", ").toUpperCase()}</p>
              </div>
            </div>
            <div className="flex flex-1 relative">
              {HOURS.map((h) => (
                <div key={h} className="flex-1 border-l border-[#E8E4DE]" />
              ))}
              {instGroups.map((g) => {
                const startH = parseInt(g.timeSlotStart.split(":")[0]);
                const startM = parseInt(g.timeSlotStart.split(":")[1]);
                const endH = parseInt(g.timeSlotEnd.split(":")[0]);
                const endM = parseInt(g.timeSlotEnd.split(":")[1]);
                const startOff = ((startH - 8) + startM / 60) / HOURS.length * 100;
                const dur = ((endH - startH) + (endM - startM) / 60) / HOURS.length * 100;
                return (
                  <div key={g.id} className="absolute top-1 bottom-1" style={{ left: `${startOff}%`, width: `${dur}%` }}>
                    <GroupCellCard group={g} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Unassigned row */}
      {unassignedGroups.length > 0 && (
        <div className="flex border-t-2 border-[#D4A853]/30 min-h-[60px]">
          <div className="w-44 shrink-0 flex items-center px-3 py-2 border-r border-[#E8E4DE]">
            <p className="text-xs font-semibold text-[#D4A853]">Sin profesor</p>
          </div>
          <div className="flex flex-1 relative">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 border-l border-[#E8E4DE]" />
            ))}
            {unassignedGroups.map((g, i) => {
              const startH = parseInt(g.timeSlotStart.split(":")[0]);
              const startM = parseInt(g.timeSlotStart.split(":")[1]);
              const endH = parseInt(g.timeSlotEnd.split(":")[0]);
              const endM = parseInt(g.timeSlotEnd.split(":")[1]);
              const startOff = ((startH - 8) + startM / 60) / HOURS.length * 100;
              const dur = ((endH - startH) + (endM - startM) / 60) / HOURS.length * 100;
              return (
                <div key={g.id} className="absolute top-1 bottom-1" style={{ left: `${startOff}%`, width: `${dur}%` }}>
                  <GroupCellCard group={g} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {instructors.length === 0 && groups.length === 0 && (
        <div className="p-8 text-center text-sm text-[#8A8580]">
          No hay profesores ni grupos para esta fecha y estacion
        </div>
      )}
    </div>
  );
}
