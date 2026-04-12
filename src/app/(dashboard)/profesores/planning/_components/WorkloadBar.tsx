"use client";

import type { Instructor } from "@/hooks/useInstructors";
import type { GroupCellRecord } from "@/hooks/usePlanning";

interface Props {
  instructors: Instructor[];
  groups: GroupCellRecord[];
}

export default function WorkloadBar({ instructors, groups }: Props) {
  if (instructors.length === 0) return null;

  const maxLoad = Math.max(1, ...instructors.map((i) => groups.filter((g) => g.instructorId === i.id).length));

  return (
    <div className="rounded-xl border border-[#E8E4DE] bg-white px-4 py-3">
      <p className="text-[10px] font-semibold text-[#8A8580] uppercase tracking-wide mb-2">Carga de profesores</p>
      <div className="flex gap-3 overflow-x-auto">
        {instructors.map((inst) => {
          const load = groups.filter((g) => g.instructorId === inst.id).length;
          const students = groups.filter((g) => g.instructorId === inst.id).reduce((s, g) => s + g._count.units, 0);
          const pct = (load / maxLoad) * 100;
          const firstName = inst.user.name?.split(" ")[0] ?? "?";

          return (
            <div key={inst.id} className="flex flex-col items-center gap-1 min-w-[56px]">
              <div className="relative h-12 w-6 rounded-full bg-[#FAF9F7] border border-[#E8E4DE] overflow-hidden">
                <div
                  className="absolute bottom-0 w-full rounded-full bg-[#E87B5A]/60 transition-all"
                  style={{ height: `${Math.max(pct, 8)}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-[#2D2A26]">{firstName}</span>
              <span className="text-[9px] text-[#8A8580]">{load}g · {students}a</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
