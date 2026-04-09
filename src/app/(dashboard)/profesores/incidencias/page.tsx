"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useIncidents, useResolveIncident } from "@/hooks/usePlanning";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  level_mismatch: "Nivel no encaja",
  age_mismatch: "Edad no encaja",
  danger: "Peligro en pista",
  medical: "Incidencia medica",
  general: "General",
};

const SEVERITY_STYLES: Record<string, string> = {
  normal: "bg-[#D4A853]/15 text-[#D4A853]",
  urgent: "bg-[#C75D4A]/15 text-[#C75D4A]",
};

export default function IncidenciasPage() {
  const [showResolved, setShowResolved] = useState(false);
  const { data, isLoading } = useIncidents({ resolved: showResolved ? "true" : "false" });
  const incidents = data?.incidents ?? [];
  const resolveMutation = useResolveIncident();

  const handleResolve = async (id: string) => {
    try {
      await resolveMutation.mutateAsync({ id, resolvedNotes: "Resuelta por admin" });
      toast.success("Incidencia resuelta");
    } catch { toast.error("Error"); }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A853]/10">
            <AlertTriangle className="h-5 w-5 text-[#D4A853]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Incidencias</h1>
            <p className="text-sm text-[#8A8580]">Incidencias reportadas por profesores</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowResolved(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!showResolved ? "bg-[#D4A853] text-white" : "border border-[#E8E4DE] text-[#8A8580]"}`}>
            Abiertas
          </button>
          <button onClick={() => setShowResolved(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${showResolved ? "bg-[#5B8C6D] text-white" : "border border-[#E8E4DE] text-[#8A8580]"}`}>
            Resueltas
          </button>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center text-sm text-[#8A8580]">
          No hay incidencias {showResolved ? "resueltas" : "abiertas"}
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div key={inc.id} className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLES[inc.severity] ?? ""}`}>
                      {inc.severity === "urgent" ? "URGENTE" : "Normal"}
                    </span>
                    <span className="text-xs font-medium text-[#2D2A26]">{TYPE_LABELS[inc.type] ?? inc.type}</span>
                  </div>
                  <p className="text-sm text-[#2D2A26]">{inc.description}</p>
                  <div className="mt-2 flex gap-3 text-xs text-[#8A8580]">
                    <span>Profesor: {inc.instructor.user.name ?? "—"}</span>
                    <span>Grupo: {inc.groupCell.discipline} {inc.groupCell.level} ({inc.groupCell.timeSlotStart}-{inc.groupCell.timeSlotEnd})</span>
                    <span>{new Date(inc.createdAt).toLocaleString("es-ES")}</span>
                  </div>
                </div>
                {!inc.resolved && (
                  <button onClick={() => handleResolve(inc.id)}
                    className="flex items-center gap-1 rounded-lg bg-[#5B8C6D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4a7359]">
                    <Check className="h-3 w-3" /> Resolver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
