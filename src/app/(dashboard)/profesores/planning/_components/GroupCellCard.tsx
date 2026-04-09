"use client";

import { Users } from "lucide-react";
import type { GroupCellRecord } from "@/hooks/usePlanning";

const DISCIPLINE_COLORS: Record<string, string> = {
  esqui: "bg-blue-500/15 border-blue-500/30 text-blue-700",
  snow: "bg-purple-500/15 border-purple-500/30 text-purple-700",
  telemark: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700",
  freestyle: "bg-orange-500/15 border-orange-500/30 text-orange-700",
};

const LEVEL_COLORS: Record<string, string> = {
  A: "bg-[#5B8C6D]",
  B: "bg-[#D4A853]",
  C: "bg-[#E87B5A]",
  D: "bg-[#C75D4A]",
};

interface Props {
  group: GroupCellRecord;
}

export default function GroupCellCard({ group }: Props) {
  const color = DISCIPLINE_COLORS[group.discipline] ?? DISCIPLINE_COLORS.esqui;
  const count = group._count.units;
  const isFull = count >= group.maxParticipants;

  return (
    <div className={`h-full rounded-lg border px-2 py-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={`inline-block h-2 w-2 rounded-full ${LEVEL_COLORS[group.level] ?? "bg-gray-400"}`} />
          <span className="text-[10px] font-bold uppercase">{group.discipline}</span>
          <span className="text-[10px] font-bold">{group.level}</span>
        </div>
        <div className="flex items-center gap-0.5 text-[10px]">
          <Users className="h-2.5 w-2.5" />
          <span className={isFull ? "font-bold text-[#C75D4A]" : ""}>{count}/{group.maxParticipants}</span>
        </div>
      </div>
      <p className="text-[9px] truncate mt-0.5">
        {group.timeSlotStart}-{group.timeSlotEnd}
        {group.ageBracket && ` · ${group.ageBracket}`}
      </p>
      {group.instructor && (
        <p className="text-[9px] truncate font-medium">
          {group.instructor.user.name}
        </p>
      )}
      {group.incidents && group._count.incidents > 0 && (
        <span className="text-[8px] text-[#C75D4A] font-bold">
          {group._count.incidents} incidencia{group._count.incidents > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
