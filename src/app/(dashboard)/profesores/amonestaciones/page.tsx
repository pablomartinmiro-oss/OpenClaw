"use client";

import { useState } from "react";
import { ShieldAlert, Plus } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInstructors } from "@/hooks/useInstructors";
import { toast } from "sonner";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });
}

interface DisciplinaryRecord {
  id: string;
  instructorId: string;
  type: string;
  reason: string;
  issuedAt: string;
  acknowledged: boolean;
  instructor: { user: { name: string | null } };
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  warning: { label: "Aviso", color: "bg-[#D4A853]/15 text-[#D4A853]" },
  reprimand: { label: "Amonestacion", color: "bg-[#E87B5A]/15 text-[#E87B5A]" },
  suspension: { label: "Suspension", color: "bg-[#C75D4A]/15 text-[#C75D4A]" },
};

export default function AmonestacionesPage() {
  const { data, isLoading } = useQuery<{ records: DisciplinaryRecord[] }>({
    queryKey: ["disciplinary"],
    queryFn: () => fetchJSON("/api/planning/disciplinary"),
  });
  const records = data?.records ?? [];
  const { data: instructorsData } = useInstructors({ isActive: "true" });
  const instructors = instructorsData?.instructors ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ instructorId: "", type: "warning", reason: "" });
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch("/api/planning/disciplinary", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["disciplinary"] }); toast.success("Amonestacion creada"); setShowForm(false); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.instructorId || !form.reason) { toast.error("Completa todos los campos"); return; }
    createMutation.mutate(form);
  };

  if (isLoading) return <PageSkeleton />;

  const inputClass = "w-full rounded-[10px] border border-[#E8E4DE] bg-white px-3 py-2.5 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C75D4A]/10">
            <ShieldAlert className="h-5 w-5 text-[#C75D4A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Amonestaciones</h1>
            <p className="text-sm text-[#8A8580]">Registro disciplinario de profesores</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-[10px] bg-[#C75D4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#b5523f]">
          <Plus className="h-4 w-4" /> Nueva
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E8E4DE] bg-white p-5 space-y-4">
          <select value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })} className={inputClass}>
            <option value="">Seleccionar profesor...</option>
            {instructors.map((i) => <option key={i.id} value={i.id}>{i.user.name ?? i.user.email}</option>)}
          </select>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            <option value="warning">Aviso</option>
            <option value="reprimand">Amonestacion</option>
            <option value="suspension">Suspension</option>
          </select>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className={inputClass} placeholder="Motivo de la amonestacion..." />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm text-[#8A8580]">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="rounded-[10px] bg-[#C75D4A] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {createMutation.isPending ? "..." : "Crear"}
            </button>
          </div>
        </form>
      )}

      {records.length === 0 ? (
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center text-sm text-[#8A8580]">Sin registros disciplinarios</div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => {
            const typeInfo = TYPE_LABELS[r.type] ?? TYPE_LABELS.warning;
            return (
              <div key={r.id} className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                    <span className="text-sm font-medium text-[#2D2A26]">{r.instructor.user.name ?? "—"}</span>
                  </div>
                  <span className="text-xs text-[#8A8580]">{new Date(r.issuedAt).toLocaleDateString("es-ES")}</span>
                </div>
                <p className="text-sm text-[#2D2A26]">{r.reason}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
