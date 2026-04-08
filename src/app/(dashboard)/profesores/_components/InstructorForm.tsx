"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCreateInstructor } from "@/hooks/useInstructors";
import { useTeam } from "@/hooks/useSettings";
import { toast } from "sonner";

const TD_OPTIONS = ["TD1", "TD2", "TD3"];
const CONTRACT_OPTIONS = [
  { value: "fijo_discontinuo", label: "Fijo discontinuo" },
  { value: "temporal", label: "Temporal" },
  { value: "autonomo", label: "Autonomo" },
];
const DISCIPLINE_OPTIONS = [
  { value: "esqui", label: "Esqui" },
  { value: "snow", label: "Snowboard" },
  { value: "telemark", label: "Telemark" },
  { value: "freestyle", label: "Freestyle" },
];
const LANGUAGE_OPTIONS = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "Ingles" },
  { value: "fr", label: "Frances" },
  { value: "de", label: "Aleman" },
  { value: "pt", label: "Portugues" },
];

interface Props {
  onClose: () => void;
}

export default function InstructorForm({ onClose }: Props) {
  const createMutation = useCreateInstructor();
  const { data: teamData } = useTeam();
  const teamMembers = teamData?.users ?? [];

  const [userId, setUserId] = useState("");
  const [tdLevel, setTdLevel] = useState("TD1");
  const [station, setStation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("20");
  const [perStudentBonus, setPerStudentBonus] = useState("0");
  const [contractType, setContractType] = useState("fijo_discontinuo");
  const [disciplines, setDisciplines] = useState<string[]>(["esqui"]);
  const [languages, setLanguages] = useState<string[]>(["es"]);
  const [certNumber, setCertNumber] = useState("");

  const toggleItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const inputClass =
    "w-full rounded-[10px] border border-[#E8E4DE] bg-white px-3 py-2.5 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";
  const labelClass = "block text-sm font-medium text-[#2D2A26] mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !station || disciplines.length === 0 || languages.length === 0) {
      toast.error("Rellena todos los campos obligatorios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        userId,
        tdLevel,
        station,
        hourlyRate: parseFloat(hourlyRate) || 0,
        perStudentBonus: parseFloat(perStudentBonus) || 0,
        contractType,
        disciplines,
        languages,
        certNumber: certNumber || null,
      });
      toast.success("Profesor creado correctamente");
      onClose();
    } catch {
      toast.error("Error al crear profesor");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] p-5">
          <h2 className="text-lg font-semibold text-[#2D2A26]">Nuevo Profesor</h2>
          <button onClick={onClose} className="text-[#8A8580] hover:text-[#2D2A26]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 max-h-[70vh] overflow-y-auto">
          {/* User select */}
          <div>
            <label className={labelClass}>Miembro del equipo *</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass}>
              <option value="">Seleccionar usuario...</option>
              {teamMembers.map((u: { id: string; name: string | null; email: string }) => (
                <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
              ))}
            </select>
          </div>

          {/* TD Level + Station */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nivel TD *</label>
              <select value={tdLevel} onChange={(e) => setTdLevel(e.target.value)} className={inputClass}>
                {TD_OPTIONS.map((td) => (
                  <option key={td} value={td}>{td}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estacion *</label>
              <input
                type="text"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder="baqueira"
                className={inputClass}
              />
            </div>
          </div>

          {/* Disciplines */}
          <div>
            <label className={labelClass}>Disciplinas *</label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINE_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDisciplines(toggleItem(disciplines, d.value))}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    disciplines.includes(d.value)
                      ? "border-[#E87B5A] bg-[#E87B5A]/10 text-[#E87B5A]"
                      : "border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className={labelClass}>Idiomas *</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLanguages(toggleItem(languages, l.value))}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    languages.includes(l.value)
                      ? "border-[#E87B5A] bg-[#E87B5A]/10 text-[#E87B5A]"
                      : "border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tarifa EUR/hora</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Bonus/alumno EUR</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={perStudentBonus}
                onChange={(e) => setPerStudentBonus(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Contract + Cert */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tipo contrato</label>
              <select value={contractType} onChange={(e) => setContractType(e.target.value)} className={inputClass}>
                {CONTRACT_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>N. titulacion</label>
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[10px] border border-[#E8E4DE] px-4 py-2.5 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Creando..." : "Crear Profesor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
