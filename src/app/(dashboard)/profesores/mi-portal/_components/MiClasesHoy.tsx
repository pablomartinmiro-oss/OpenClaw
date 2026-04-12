"use client";

import { useState } from "react";
import { Users, Phone, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { GroupCellRecord } from "@/hooks/usePlanning";
import { useUpdateGroupCell, useCheckIn } from "@/hooks/usePlanning";
import { toast } from "sonner";
import IncidentForm from "./IncidentForm";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; border: string }> = {
  draft: { bg: "bg-[#8A8580]/10", text: "text-[#8A8580]", label: "Pendiente", border: "border-[#E8E4DE]" },
  confirmed: { bg: "bg-[#D4A853]/10", text: "text-[#D4A853]", label: "Confirmado", border: "border-[#D4A853]/30" },
  in_progress: { bg: "bg-[#E87B5A]/10", text: "text-[#E87B5A]", label: "En curso", border: "border-[#E87B5A]/40" },
  completed: { bg: "bg-[#5B8C6D]/10", text: "text-[#5B8C6D]", label: "Completada", border: "border-[#5B8C6D]/30" },
  cancelled: { bg: "bg-[#8A8580]/10", text: "text-[#8A8580]", label: "Cancelada", border: "border-[#8A8580]/30" },
};

const LEVEL_COLORS: Record<string, string> = {
  A: "bg-[#5B8C6D]/15 text-[#5B8C6D]", B: "bg-[#D4A853]/15 text-[#D4A853]",
  C: "bg-[#E87B5A]/15 text-[#E87B5A]", D: "bg-[#C75D4A]/15 text-[#C75D4A]",
};

const DISCIPLINE_COLORS: Record<string, string> = {
  esqui: "text-blue-600", snow: "text-purple-600", telemark: "text-emerald-600", freestyle: "text-orange-600",
};

const CHECKIN_STYLES: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  present: { icon: CheckCircle2, color: "text-[#5B8C6D]", label: "Presente" },
  absent: { icon: XCircle, color: "text-[#C75D4A]", label: "Ausente" },
  no_show: { icon: XCircle, color: "text-[#8A8580]", label: "No show" },
};

interface Props {
  groups: GroupCellRecord[];
}

export default function MiClasesHoy({ groups }: Props) {
  const updateMutation = useUpdateGroupCell();
  const checkInMutation = useCheckIn();
  const [incidentGroupId, setIncidentGroupId] = useState<string | null>(null);

  const sorted = [...groups]
    .filter((g) => g.status !== "cancelled")
    .sort((a, b) => a.timeSlotStart.localeCompare(b.timeSlotStart));

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success(status === "completed" ? "Clase completada" : status === "in_progress" ? "Clase iniciada" : "Estado actualizado");
    } catch { toast.error("Error al actualizar"); }
  };

  const handleCheckIn = async (groupCellId: string, participantId: string, status: string) => {
    try {
      await checkInMutation.mutateAsync({ groupCellId, participantId, status });
    } catch { toast.error("Error en check-in"); }
  };

  // Class type from notes
  const getClassType = (notes: string | null) => {
    if (!notes) return null;
    if (notes.includes("[Cursillo colectivo]")) return "Cursillo";
    if (notes.includes("[Clase particular]")) return "Particular";
    if (notes.includes("[Escuelita infantil]")) return "Escuelita";
    return null;
  };

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#2D2A26]">Mis clases hoy</h3>
        <span className="text-xs text-[#8A8580]">{sorted.length} clase{sorted.length !== 1 ? "s" : ""}</span>
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="mx-auto h-10 w-10 text-[#E8E4DE] mb-2" />
          <p className="text-sm text-[#8A8580]">No tienes clases asignadas hoy</p>
          <p className="mt-1 text-xs text-[#5B8C6D]">Dia libre!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((g) => {
            const style = STATUS_STYLES[g.status] ?? STATUS_STYLES.draft;
            const classType = getClassType(g.notes);
            const discColor = DISCIPLINE_COLORS[g.discipline] ?? "text-[#2D2A26]";
            const participants = g.units ?? [];

            return (
              <div key={g.id} className={`rounded-xl border-2 ${style.border} p-4 transition-all ${g.status === "in_progress" ? "bg-[#E87B5A]/[0.03] shadow-sm" : ""}`}>
                {/* Class header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#2D2A26]">{g.timeSlotStart} – {g.timeSlotEnd}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>{style.label}</span>
                      {classType && (
                        <span className="rounded-md bg-[#FAF9F7] border border-[#E8E4DE] px-2 py-0.5 text-[10px] text-[#8A8580]">{classType}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold capitalize ${discColor}`}>{g.discipline}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${LEVEL_COLORS[g.level] ?? ""}`}>Nivel {g.level}</span>
                      {g.ageBracket && <span className="text-[10px] text-[#8A8580]">{g.ageBracket}</span>}
                      <span className="text-[10px] text-[#8A8580] uppercase">{g.language}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#8A8580]">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-bold text-[#2D2A26]">{participants.length}</span>/{g.maxParticipants}
                  </div>
                </div>

                {/* Participants list */}
                {participants.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {participants.map((u) => {
                      const checkIn = g.checkIns?.find((c) => c.participantId === u.participant.id);
                      const checkStyle = checkIn ? CHECKIN_STYLES[checkIn.status] : null;
                      const phone = u.reservation?.clientPhone || u.participant.phone;

                      return (
                        <div key={u.id} className="flex items-center gap-2 rounded-lg bg-[#FAF9F7] px-3 py-2">
                          {/* Check-in toggle */}
                          {(g.status === "in_progress" || g.status === "completed") && (
                            <button
                              onClick={() => handleCheckIn(g.id, u.participant.id, checkIn?.status === "present" ? "absent" : "present")}
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                checkStyle?.color === "text-[#5B8C6D]"
                                  ? "border-[#5B8C6D] bg-[#5B8C6D]/15"
                                  : "border-[#E8E4DE] hover:border-[#5B8C6D]"
                              }`}>
                              {checkStyle && <checkStyle.icon className={`h-3.5 w-3.5 ${checkStyle.color}`} />}
                            </button>
                          )}

                          {/* Participant info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-[#2D2A26] truncate">
                                {u.participant.firstName} {u.participant.lastName ?? ""}
                              </span>
                              <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${LEVEL_COLORS[u.participant.level] ?? ""}`}>
                                {u.participant.level}
                              </span>
                              {u.participant.age && <span className="text-[9px] text-[#8A8580]">{u.participant.age}a</span>}
                              <span className="text-[9px] text-[#8A8580] uppercase">{u.participant.language}</span>
                            </div>
                            {u.participant.specialNeeds && (
                              <p className="text-[9px] text-[#D4A853] mt-0.5">⚠ {u.participant.specialNeeds}</p>
                            )}
                          </div>

                          {/* WhatsApp contact */}
                          {phone && (
                            <a href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5B8C6D]/15 text-[#5B8C6D] hover:bg-[#5B8C6D]/25">
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Meeting point */}
                {g.meetingPoint && (
                  <p className="text-[10px] text-[#8A8580] mb-2">Punto de encuentro: <strong>{g.meetingPoint.name}</strong></p>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  {(g.status === "draft" || g.status === "confirmed") && (
                    <button onClick={() => handleStatus(g.id, "in_progress")}
                      className="flex-1 rounded-lg bg-[#E87B5A] px-3 py-2.5 text-xs font-medium text-white hover:bg-[#D56E4F]">
                      Iniciar clase
                    </button>
                  )}
                  {g.status === "in_progress" && (
                    <button onClick={() => handleStatus(g.id, "completed")}
                      className="flex-1 rounded-lg bg-[#5B8C6D] px-3 py-2.5 text-xs font-medium text-white hover:bg-[#4a7359]">
                      Finalizar clase
                    </button>
                  )}
                  {(g.status === "draft" || g.status === "confirmed" || g.status === "in_progress") && (
                    <button onClick={() => setIncidentGroupId(g.id)}
                      className="rounded-lg border border-[#D4A853]/30 px-3 py-2.5 text-xs font-medium text-[#D4A853] hover:bg-[#D4A853]/10">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />Incidencia
                    </button>
                  )}
                </div>

                {/* Active incidents */}
                {g.incidents && g.incidents.filter((i) => !i.resolved).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {g.incidents.filter((i) => !i.resolved).map((inc) => (
                      <div key={inc.id} className="rounded-lg bg-[#C75D4A]/5 border border-[#C75D4A]/20 px-2.5 py-1.5 text-[10px]">
                        <span className="font-medium text-[#C75D4A]">{inc.type.replace(/_/g, " ")}</span>
                        {inc.severity === "urgent" && <span className="ml-1 font-bold text-[#C75D4A]">URGENTE</span>}
                      </div>
                    ))}
                  </div>
                )}
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
