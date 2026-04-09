"use client";

import { useState } from "react";
import { CalendarOff, Plus } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useMyInstructorProfile } from "@/hooks/useInstructors";
import { useFreeDayRequests, useRequestFreeDay } from "@/hooks/usePlanning";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-[#D4A853]/15", text: "text-[#D4A853]", label: "Pendiente" },
  approved: { bg: "bg-[#5B8C6D]/15", text: "text-[#5B8C6D]", label: "Aprobado" },
  rejected: { bg: "bg-[#C75D4A]/15", text: "text-[#C75D4A]", label: "Rechazado" },
};

export default function DiasLibresPage() {
  const { data: meData, isLoading: loadingMe } = useMyInstructorProfile();
  const myProfile = meData?.instructor;
  const { data, isLoading } = useFreeDayRequests(myProfile?.id);
  const requests = data?.requests ?? [];
  const requestMutation = useRequestFreeDay();

  const [requestDate, setRequestDate] = useState("");
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDate) { toast.error("Selecciona una fecha"); return; }
    try {
      await requestMutation.mutateAsync({ requestDate, reason: reason || undefined });
      toast.success("Solicitud enviada");
      setShowForm(false);
      setRequestDate("");
      setReason("");
    } catch {
      toast.error("Error al enviar solicitud");
    }
  };

  if (loadingMe || isLoading) return <PageSkeleton />;

  const inputClass = "w-full rounded-[10px] border border-[#E8E4DE] bg-white px-3 py-2.5 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <CalendarOff className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Dias libres</h1>
            <p className="text-sm text-[#8A8580]">Solicita dias libres a tu administrador</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors">
          <Plus className="h-4 w-4" /> Solicitar
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E8E4DE] bg-white p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">Fecha *</label>
            <input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">Motivo (opcional)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className={inputClass} placeholder="Motivo de la solicitud..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm text-[#8A8580] hover:bg-[#FAF9F7]">Cancelar</button>
            <button type="submit" disabled={requestMutation.isPending}
              className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] disabled:opacity-50">
              {requestMutation.isPending ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-[#E8E4DE] bg-white divide-y divide-[#E8E4DE]">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#8A8580]">No tienes solicitudes de dias libres</div>
        ) : (
          requests.map((req) => {
            const style = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending;
            return (
              <div key={req.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-[#2D2A26]">
                    {new Date(req.requestDate).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  {req.reason && <p className="text-xs text-[#8A8580] mt-0.5">{req.reason}</p>}
                  {req.reviewNotes && <p className="text-xs text-[#8A8580] mt-0.5 italic">Admin: {req.reviewNotes}</p>}
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
