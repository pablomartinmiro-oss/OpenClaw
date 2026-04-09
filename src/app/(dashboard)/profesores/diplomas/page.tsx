"use client";

import { Award } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useQuery } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });
}

interface DiplomaRecord {
  id: string;
  participantName: string;
  instructorName: string;
  level: string;
  discipline: string;
  station: string;
  issuedAt: string;
}

const LEVEL_LABELS: Record<string, string> = {
  A: "Principiante", B: "Basico", C: "Intermedio", D: "Avanzado",
};

export default function DiplomasPage() {
  const { data, isLoading } = useQuery<{ diplomas: DiplomaRecord[] }>({
    queryKey: ["diplomas"],
    queryFn: () => fetchJSON("/api/planning/diplomas"),
  });
  const diplomas = data?.diplomas ?? [];

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A853]/10">
          <Award className="h-5 w-5 text-[#D4A853]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">Diplomas</h1>
          <p className="text-sm text-[#8A8580]">Diplomas de nivel emitidos a participantes</p>
        </div>
      </div>

      {diplomas.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center text-sm text-[#8A8580]">
          No se han emitido diplomas todavia
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diplomas.map((d) => (
            <div key={d.id} className="rounded-2xl border border-[#E8E4DE] bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <Award className="h-8 w-8 text-[#D4A853]" />
                <span className="rounded-lg bg-[#D4A853]/15 px-2.5 py-1 text-xs font-bold text-[#D4A853]">
                  Nivel {d.level}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#2D2A26]">{d.participantName}</h3>
              <p className="text-sm text-[#8A8580] capitalize">{d.discipline} · {LEVEL_LABELS[d.level] ?? d.level}</p>
              <div className="mt-3 pt-3 border-t border-[#E8E4DE] text-xs text-[#8A8580]">
                <p>Profesor: {d.instructorName}</p>
                <p>Estacion: {d.station} · {new Date(d.issuedAt).toLocaleDateString("es-ES")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
