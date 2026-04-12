"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Instructor } from "@/hooks/useInstructors";
import { useCreateGroupCell } from "@/hooks/usePlanning";
import { toast } from "sonner";

const TIME_SLOTS = [
  { label: "Manana (9:00–13:00)", start: "09:00", end: "13:00" },
  { label: "Tarde (13:00–17:00)", start: "13:00", end: "17:00" },
  { label: "Manana corto (9:00–11:00)", start: "09:00", end: "11:00" },
  { label: "Manana largo (11:00–13:00)", start: "11:00", end: "13:00" },
  { label: "Tarde corto (13:00–15:00)", start: "13:00", end: "15:00" },
  { label: "Tarde largo (15:00–17:00)", start: "15:00", end: "17:00" },
];

interface Props {
  date: string;
  station: string;
  instructors: Instructor[];
  onClose: () => void;
}

export default function CreateGroupModal({ date, station, instructors, onClose }: Props) {
  const createMutation = useCreateGroupCell();

  const [form, setForm] = useState({
    timeSlotIdx: 0,
    discipline: "esqui" as string,
    level: "A" as string,
    ageBracket: "" as string,
    language: "es",
    maxParticipants: 10,
    instructorId: "" as string,
    notes: "",
  });

  const set = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slot = TIME_SLOTS[form.timeSlotIdx];
    try {
      await createMutation.mutateAsync({
        activityDate: date,
        station,
        timeSlotStart: slot.start,
        timeSlotEnd: slot.end,
        discipline: form.discipline,
        level: form.level,
        ageBracket: form.ageBracket || null,
        language: form.language,
        maxParticipants: form.maxParticipants,
        instructorId: form.instructorId || null,
        notes: form.notes || null,
      });
      toast.success("Grupo creado");
      onClose();
    } catch {
      toast.error("Error al crear grupo");
    }
  };

  const inputClass = "w-full rounded-lg border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";
  const labelClass = "block text-xs font-semibold text-[#8A8580] uppercase tracking-wide mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-5 py-4">
          <h2 className="text-lg font-bold text-[#2D2A26]">Crear grupo manual</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8A8580] hover:bg-[#FAF9F7]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Date + Station (read-only info) */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Fecha</label>
              <input value={new Date(date).toLocaleDateString("es-ES")} disabled className={`${inputClass} bg-[#FAF9F7]`} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Estacion</label>
              <input value={station.replace(/_/g, " ")} disabled className={`${inputClass} bg-[#FAF9F7] capitalize`} />
            </div>
          </div>

          {/* Time slot */}
          <div>
            <label className={labelClass}>Horario</label>
            <select value={form.timeSlotIdx} onChange={(e) => set("timeSlotIdx", Number(e.target.value))} className={inputClass}>
              {TIME_SLOTS.map((slot, idx) => (
                <option key={idx} value={idx}>{slot.label}</option>
              ))}
            </select>
          </div>

          {/* Discipline + Level */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Disciplina</label>
              <select value={form.discipline} onChange={(e) => set("discipline", e.target.value)} className={inputClass}>
                <option value="esqui">Esqui</option>
                <option value="snow">Snow</option>
                <option value="telemark">Telemark</option>
                <option value="freestyle">Freestyle</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Nivel</label>
              <select value={form.level} onChange={(e) => set("level", e.target.value)} className={inputClass}>
                <option value="A">A - Iniciacion</option>
                <option value="B">B - Intermedio</option>
                <option value="C">C - Avanzado</option>
                <option value="D">D - Experto</option>
              </select>
            </div>
          </div>

          {/* Age bracket + Language */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Grupo de edad</label>
              <select value={form.ageBracket} onChange={(e) => set("ageBracket", e.target.value)} className={inputClass}>
                <option value="">Cualquiera</option>
                <option value="baby">Baby (3-4)</option>
                <option value="infantil">Infantil (5-9)</option>
                <option value="adolescente">Adolescente (10-14)</option>
                <option value="juvenil">Juvenil (15-17)</option>
                <option value="adulto">Adulto (18+)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={labelClass}>Idioma</label>
              <select value={form.language} onChange={(e) => set("language", e.target.value)} className={inputClass}>
                <option value="es">Espanol</option>
                <option value="en">Ingles</option>
                <option value="fr">Frances</option>
                <option value="pt">Portugues</option>
                <option value="de">Aleman</option>
              </select>
            </div>
          </div>

          {/* Max participants + Instructor */}
          <div className="flex gap-3">
            <div className="w-32">
              <label className={labelClass}>Max alumnos</label>
              <input type="number" min={1} max={15} value={form.maxParticipants}
                onChange={(e) => set("maxParticipants", Number(e.target.value))} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Profesor</label>
              <select value={form.instructorId} onChange={(e) => set("instructorId", e.target.value)} className={inputClass}>
                <option value="">Sin asignar</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.user.name} ({i.tdLevel})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              rows={2} placeholder="Notas opcionales..." className={inputClass} />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7]">
              Cancelar
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="rounded-lg bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] disabled:opacity-50">
              {createMutation.isPending ? "Creando..." : "Crear grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
