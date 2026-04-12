"use client";

import { useState } from "react";
import { Award, Search, Send } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useMyInstructorProfile } from "@/hooks/useInstructors";
import { useGroupCells } from "@/hooks/usePlanning";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DiplomaRecord {
  id: string;
  participantId: string;
  participantName: string;
  instructorName: string;
  level: string;
  discipline: string;
  station: string;
  issuedAt: string;
  notes: string | null;
}

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => { if (!res.ok) throw new Error(`${res.status}`); return res.json(); });
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  A: { label: "Nivel A — Iniciacion", color: "bg-[#5B8C6D]/15 text-[#5B8C6D] border-[#5B8C6D]/30" },
  B: { label: "Nivel B — Intermedio", color: "bg-[#D4A853]/15 text-[#D4A853] border-[#D4A853]/30" },
  C: { label: "Nivel C — Avanzado", color: "bg-[#E87B5A]/15 text-[#E87B5A] border-[#E87B5A]/30" },
  D: { label: "Nivel D — Experto", color: "bg-[#C75D4A]/15 text-[#C75D4A] border-[#C75D4A]/30" },
};

export default function MisDiplomasPage() {
  const { data: meData, isLoading: loadingMe } = useMyInstructorProfile();
  const myProfile = meData?.instructor;
  const [filter, setFilter] = useState("");
  const [showIssue, setShowIssue] = useState(false);

  const { data: diplomasData, isLoading } = useQuery<{ diplomas: DiplomaRecord[] }>({
    queryKey: ["diplomas", myProfile?.id],
    queryFn: () => fetchJSON(`/api/planning/diplomas?instructorId=${myProfile?.id}`),
    enabled: !!myProfile?.id,
  });
  const diplomas = diplomasData?.diplomas ?? [];
  const filtered = filter
    ? diplomas.filter((d) => d.participantName.toLowerCase().includes(filter.toLowerCase()))
    : diplomas;

  if (loadingMe || isLoading) return <PageSkeleton />;
  if (!myProfile) return <div className="py-12 text-center text-[#8A8580]">Sin perfil de profesor</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A853]/10">
            <Award className="h-5 w-5 text-[#D4A853]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2D2A26]">Mis diplomas</h1>
            <p className="text-xs text-[#8A8580]">{diplomas.length} diploma{diplomas.length !== 1 ? "s" : ""} emitido{diplomas.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={() => setShowIssue(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F]">
          <Send className="h-4 w-4" /> Emitir diploma
        </button>
      </div>

      {/* Search */}
      {diplomas.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8A8580]" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar alumno..."
            className="w-full rounded-xl border border-[#E8E4DE] bg-white pl-9 pr-4 py-2.5 text-sm focus:border-[#E87B5A] focus:outline-none" />
        </div>
      )}

      {/* Diploma grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-[#E8E4DE]" />
          <p className="mt-4 text-sm text-[#8A8580]">
            {diplomas.length === 0 ? "Aun no has emitido ningun diploma" : "Sin resultados"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d) => {
            const levelInfo = LEVEL_LABELS[d.level] ?? LEVEL_LABELS.A;
            return (
              <div key={d.id} className="rounded-xl border border-[#E8E4DE] bg-white p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <Award className="h-6 w-6 text-[#D4A853]" />
                  <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${levelInfo.color}`}>{d.level}</span>
                </div>
                <p className="text-sm font-semibold text-[#2D2A26]">{d.participantName}</p>
                <p className="text-xs text-[#8A8580] capitalize mt-0.5">{d.discipline} · {d.station.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-[#8A8580] mt-1">
                  {new Date(d.issuedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {d.notes && <p className="text-[10px] text-[#D4A853] mt-1">{d.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Issue diploma modal */}
      {showIssue && (
        <IssueDiplomaModal
          instructorId={myProfile.id}
          instructorName={myProfile.user.name ?? "Profesor"}
          station={myProfile.station}
          onClose={() => setShowIssue(false)}
        />
      )}
    </div>
  );
}

function IssueDiplomaModal({ instructorId, instructorName, station, onClose }: {
  instructorId: string; instructorName: string; station: string; onClose: () => void;
}) {
  const qc = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const { data: groupsData } = useGroupCells({ date: today, instructorId });
  const groups = groupsData?.groups ?? [];

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [level, setLevel] = useState("A");
  const [discipline, setDiscipline] = useState("esqui");
  const [notes, setNotes] = useState("");

  const issueMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/planning/diplomas", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["diplomas"] }),
  });

  const currentGroup = groups.find((g) => g.id === selectedGroup);
  const participants = currentGroup?.units ?? [];
  const selectedP = participants.find((u) => u.participant.id === selectedParticipant)?.participant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant || !selectedP) { toast.error("Selecciona un alumno"); return; }
    try {
      await issueMutation.mutateAsync({
        participantId: selectedParticipant,
        instructorId,
        groupCellId: selectedGroup || null,
        level,
        discipline,
        station,
        participantName: `${selectedP.firstName} ${selectedP.lastName ?? ""}`.trim(),
        instructorName,
        notes: notes || null,
      });
      toast.success("Diploma emitido");
      onClose();
    } catch { toast.error("Error al emitir diploma"); }
  };

  const inputClass = "w-full rounded-lg border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2D2A26]">Emitir diploma</h2>
          <button onClick={onClose} className="text-[#8A8580] hover:text-[#2D2A26]">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Select class */}
          <div>
            <label className="block text-xs font-semibold text-[#8A8580] uppercase mb-1">Clase de hoy</label>
            <select value={selectedGroup} onChange={(e) => { setSelectedGroup(e.target.value); setSelectedParticipant(""); }} className={inputClass}>
              <option value="">Seleccionar clase...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.timeSlotStart}–{g.timeSlotEnd} {g.discipline} {g.level} ({g._count.units}a)</option>
              ))}
            </select>
          </div>

          {/* Select participant */}
          {selectedGroup && (
            <div>
              <label className="block text-xs font-semibold text-[#8A8580] uppercase mb-1">Alumno</label>
              <select value={selectedParticipant} onChange={(e) => {
                setSelectedParticipant(e.target.value);
                const p = participants.find((u) => u.participant.id === e.target.value)?.participant;
                if (p) { setLevel(p.level); setDiscipline(p.discipline); }
              }} className={inputClass}>
                <option value="">Seleccionar alumno...</option>
                {participants.map((u) => (
                  <option key={u.participant.id} value={u.participant.id}>
                    {u.participant.firstName} {u.participant.lastName ?? ""} ({u.participant.level})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Level + Discipline */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#8A8580] uppercase mb-1">Nivel conseguido</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                <option value="A">A - Iniciacion</option>
                <option value="B">B - Intermedio</option>
                <option value="C">C - Avanzado</option>
                <option value="D">D - Experto</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#8A8580] uppercase mb-1">Disciplina</label>
              <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className={inputClass}>
                <option value="esqui">Esqui</option>
                <option value="snow">Snow</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#8A8580] uppercase mb-1">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Observaciones opcionales..." className={inputClass} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-[#E8E4DE] px-4 py-2 text-sm text-[#8A8580] hover:bg-[#FAF9F7]">Cancelar</button>
            <button type="submit" disabled={issueMutation.isPending || !selectedParticipant}
              className="rounded-lg bg-[#D4A853] px-4 py-2 text-sm font-medium text-white hover:bg-[#c49a48] disabled:opacity-50">
              {issueMutation.isPending ? "Emitiendo..." : "Emitir diploma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
