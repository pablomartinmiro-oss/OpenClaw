"use client";

import { AlertCircle, User } from "lucide-react";
import type { OperationalUnitRecord } from "@/hooks/usePlanning";

const LEVEL_COLORS: Record<string, string> = {
  A: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  B: "bg-[#D4A853]/15 text-[#D4A853]",
  C: "bg-[#E87B5A]/15 text-[#E87B5A]",
  D: "bg-[#C75D4A]/15 text-[#C75D4A]",
};

interface Props {
  units: OperationalUnitRecord[];
}

export default function UnassignedPanel({ units }: Props) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4 w-4 text-[#D4A853]" />
        <h3 className="text-sm font-semibold text-[#2D2A26]">Pendientes de agrupar</h3>
        {units.length > 0 && (
          <span className="rounded-full bg-[#D4A853]/15 px-2 py-0.5 text-xs font-medium text-[#D4A853]">
            {units.length}
          </span>
        )}
      </div>

      {units.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-[#8A8580]">Todos los participantes estan agrupados</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {units.map((unit) => (
            <div key={unit.id} className="rounded-xl border border-[#E8E4DE] p-3 hover:border-[#E87B5A]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF9F7]">
                    <User className="h-3.5 w-3.5 text-[#8A8580]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#2D2A26]">
                      {unit.participant.firstName} {unit.participant.lastName ?? ""}
                    </p>
                    <p className="text-[10px] text-[#8A8580]">
                      {unit.reservation?.clientName ?? "Walk-in"}
                    </p>
                  </div>
                </div>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${LEVEL_COLORS[unit.participant.level] ?? ""}`}>
                  {unit.participant.level}
                </span>
              </div>
              <div className="mt-1.5 flex gap-1.5">
                <span className="rounded bg-[#FAF9F7] border border-[#E8E4DE] px-1.5 py-0.5 text-[10px] capitalize text-[#2D2A26]">
                  {unit.participant.discipline}
                </span>
                {unit.participant.ageBracket && (
                  <span className="rounded bg-[#FAF9F7] border border-[#E8E4DE] px-1.5 py-0.5 text-[10px] capitalize text-[#2D2A26]">
                    {unit.participant.ageBracket}
                  </span>
                )}
                <span className="rounded bg-[#FAF9F7] border border-[#E8E4DE] px-1.5 py-0.5 text-[10px] uppercase text-[#2D2A26]">
                  {unit.participant.language}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
