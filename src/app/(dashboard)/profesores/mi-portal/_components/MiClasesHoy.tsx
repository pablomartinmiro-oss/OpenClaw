"use client";

import { Clock, Users, MapPin } from "lucide-react";
import type { Assignment } from "@/hooks/useInstructors";
import { useUpdateAssignment } from "@/hooks/useInstructors";
import { toast } from "sonner";

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

interface Props {
  assignments: Assignment[];
}

export default function MiClasesHoy({ assignments }: Props) {
  const updateMutation = useUpdateAssignment();

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success(status === "completed" ? "Clase completada" : "Estado actualizado");
    } catch {
      toast.error("Error al actualizar");
    }
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
            return (
              <div
                key={a.id}
                className={`rounded-xl border border-[#E8E4DE] p-4 transition-colors ${
                  a.status === "in_progress" ? "border-[#E87B5A]/40 bg-[#E87B5A]/5" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#2D2A26]">
                        {a.scheduledStart} - {a.scheduledEnd}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[#2D2A26]">
                      {a.booking.reservation.clientName}
                    </p>
                    <p className="text-xs text-[#8A8580]">
                      {LESSON_LABELS[a.lessonType] ?? a.lessonType}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8A8580]">
                    <Users className="h-3.5 w-3.5" />
                    {a.studentCount}p
                  </div>
                </div>

                {/* Action buttons */}
                {a.status === "assigned" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleStatus(a.id, "in_progress")}
                      className="flex-1 rounded-lg bg-[#E87B5A] px-3 py-2 text-xs font-medium text-white hover:bg-[#D56E4F] transition-colors"
                    >
                      Iniciar clase
                    </button>
                  </div>
                )}
                {a.status === "in_progress" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleStatus(a.id, "completed")}
                      className="flex-1 rounded-lg bg-[#5B8C6D] px-3 py-2 text-xs font-medium text-white hover:bg-[#4a7359] transition-colors"
                    >
                      Finalizar clase
                    </button>
                    <button
                      onClick={() => handleStatus(a.id, "no_show")}
                      className="rounded-lg border border-[#C75D4A]/30 px-3 py-2 text-xs font-medium text-[#C75D4A] hover:bg-[#C75D4A]/10 transition-colors"
                    >
                      No show
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
