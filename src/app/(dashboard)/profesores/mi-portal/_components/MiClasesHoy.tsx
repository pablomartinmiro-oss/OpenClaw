"use client";

import { useState } from "react";
import { Users, Phone, AlertTriangle } from "lucide-react";
import type { Assignment } from "@/hooks/useInstructors";
import { useUpdateAssignment } from "@/hooks/useInstructors";
import { useGroupCells } from "@/hooks/usePlanning";
import { toast } from "sonner";
import IncidentForm from "./IncidentForm";

const LESSON_LABELS: Record<string, string> = {
  group: "Clase grupal",
  private: "Clase particular",
  adaptive: "Clase adaptativa",
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  assigned: { bg: "bg-[#D4A853]/15", text: "text-[#D4A853]", label: "Pendiente" },
  in_progress: { bg: "bg-[#E87B5A]/15", text: "text-[#E87B5A]", label: "En curso" },
  completed: { bg: "bg-[#5B8C6D]/15", text: "text-[#5B8C6D]", label: "Completada" },
  cancelled: { bg: "bg-[#8A8580]/15", text: "text-[#8A8580]", label: "Cancelada" },
  no_show: { bg: "bg-[#C75D4A]/15", text: "text-[#C75D4A]", label: "No show" },
};

const LEVEL_COLORS: Record<string, string> = {
  A: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  B: "bg-[#D4A853]/15 text-[#D4A853]",
  C: "bg-[#E87B5A]/15 text-[#E87B5A]",
  D: "bg-[#C75D4A]/15 text-[#C75D4A]",
};

interface Props {
  assignments: Assignment[];
  instructorId?: string;
}

export default function MiClasesHoy({ assignments, instructorId }: Props) {
  const updateMutation = useUpdateAssignment();
  const [incidentGroupId, setIncidentGroupId] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  // Load GroupCells for participant data
  const { data: groupsData } = useGroupCells(
    instructorId ? { date: today, instructorId } : undefined
  );
  const groupCells = groupsData?.groups ?? [];

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success(status === "completed" ? "Clase completada" : "Estado actualizado");
    } catch { toast.error("Error al actualizar"); }
  };

  const sorted = [...assignments].sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart));

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <h3 className="text-base font-semibold text-[#2D2A26] mb-4">Mis clases hoy</h3>

      {sorted.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#8A8580]">No tienes clases asignadas hoy</p>
          <p className="mt-1 text-xs text-[#8A8580]">Dia libre!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((a) => {
            const style = STATUS_STYLES[a.status] ?? STATUS_STYLES.assigned;
            const phone = a.booking.reservation.clientEmail; // clientPhone not in current type, use email as fallback
            const groupCell = groupCells.find((g) =>
              g.timeSlotStart === a.scheduledStart && g.timeSlotEnd === a.scheduledEnd
            );

            return (
              <div key={a.id} className={`rounded-xl border border-[#E8E4DE] p-4 transition-colors ${a.status === "in_progress" ? "border-[#E87B5A]/40 bg-[#E87B5A]/5" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#2D2A26]">{a.scheduledStart} - {a.scheduledEnd}</span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>{style.label}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[#2D2A26]">{a.booking.reservation.clientName}</p>
                    <p className="text-xs text-[#8A8580]">{LESSON_LABELS[a.lessonType] ?? a.lessonType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-[#8A8580]">
                      <Users className="h-3.5 w-3.5" />{a.studentCount}p
                    </span>
                    {/* WhatsApp contact */}
                    {a.booking.reservation.clientName && (
                      <a href={`https://wa.me/?text=Hola ${a.booking.reservation.clientName}, soy tu profesor de esqui de Skicenter`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5B8C6D]/15 text-[#5B8C6D] hover:bg-[#5B8C6D]/25 transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* GroupCell participants */}
                {groupCell && groupCell.units.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-semibold text-[#8A8580] uppercase tracking-wide">Participantes</p>
                    {groupCell.units.map((u) => (
                      <div key={u.id} className="flex items-center gap-2 rounded-lg bg-[#FAF9F7] px-2.5 py-1.5">
                        <span className="text-xs font-medium text-[#2D2A26]">
                          {u.participant.firstName} {u.participant.lastName ?? ""}
                        </span>
                        <span className={`rounded px-1 py-0.5 text-[10px] font-bold ${LEVEL_COLORS[u.participant.level] ?? ""}`}>
                          {u.participant.level}
                        </span>
                        <span className="text-[10px] text-[#8A8580] capitalize">{u.participant.discipline}</span>
                        <span className="text-[10px] text-[#8A8580] uppercase">{u.participant.language}</span>
                        {u.participant.specialNeeds && (
                          <span className="text-[10px] text-[#D4A853]">⚠ {u.participant.specialNeeds}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  {a.status === "assigned" && (
                    <button onClick={() => handleStatus(a.id, "in_progress")}
                      className="flex-1 rounded-lg bg-[#E87B5A] px-3 py-2 text-xs font-medium text-white hover:bg-[#D56E4F]">
                      Iniciar clase
                    </button>
                  )}
                  {a.status === "in_progress" && (
                    <>
                      <button onClick={() => handleStatus(a.id, "completed")}
                        className="flex-1 rounded-lg bg-[#5B8C6D] px-3 py-2 text-xs font-medium text-white hover:bg-[#4a7359]">
                        Finalizar clase
                      </button>
                      <button onClick={() => handleStatus(a.id, "no_show")}
                        className="rounded-lg border border-[#C75D4A]/30 px-3 py-2 text-xs font-medium text-[#C75D4A] hover:bg-[#C75D4A]/10">
                        No show
                      </button>
                    </>
                  )}
                  {/* Incident button */}
                  {groupCell && (a.status === "assigned" || a.status === "in_progress") && (
                    <button onClick={() => setIncidentGroupId(groupCell.id)}
                      className="rounded-lg border border-[#D4A853]/30 px-3 py-2 text-xs font-medium text-[#D4A853] hover:bg-[#D4A853]/10">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />Incidencia
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {incidentGroupId && (
        <IncidentForm groupCellId={incidentGroupId} onClose={() => setIncidentGroupId(null)} />
      )}
    </div>
  );
}
