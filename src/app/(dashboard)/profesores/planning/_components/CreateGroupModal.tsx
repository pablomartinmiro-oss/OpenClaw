"use client";

import { useState } from "react";
import { X, Plus, Trash2, Users, User } from "lucide-react";
import type { Instructor } from "@/hooks/useInstructors";
import { useCreateGroupCell, useAddWalkInParticipant } from "@/hooks/usePlanning";
import { toast } from "sonner";

const CLASS_TYPES = [
  { value: "colectivo", label: "Cursillo colectivo", desc: "Grupo de hasta 10 alumnos", maxDefault: 10, icon: Users },
  { value: "particular", label: "Clase particular", desc: "1-2 alumnos con profesor dedicado", maxDefault: 2, icon: User },
  { value: "escuelita", label: "Escuelita", desc: "Ninos 3-6 anos, max 8", maxDefault: 8, icon: Users },
];

const TIME_SLOTS = [
  { label: "Manana (9:00–13:00)", start: "09:00", end: "13:00" },
  { label: "Tarde (13:00–17:00)", start: "13:00", end: "17:00" },
  { label: "Manana corto (9:00–11:00)", start: "09:00", end: "11:00" },
  { label: "Manana largo (11:00–13:00)", start: "11:00", end: "13:00" },
  { label: "Tarde corto (13:00–15:00)", start: "13:00", end: "15:00" },
  { label: "Tarde largo (15:00–17:00)", start: "15:00", end: "17:00" },
  { label: "1 hora (personalizado)", start: "", end: "" },
];

interface StudentRow {
  firstName: string;
  lastName: string;
  age: string;
  phone: string;
}

const emptyStudent = (): StudentRow => ({ firstName: "", lastName: "", age: "", phone: "" });

interface Props {
  date: string;
  station: string;
  instructors: Instructor[];
  onClose: () => void;
}

export default function CreateGroupModal({ date, station, instructors, onClose }: Props) {
  const createMutation = useCreateGroupCell();
  const addParticipantMutation = useAddWalkInParticipant();

  const [classType, setClassType] = useState("colectivo");
  const [form, setForm] = useState({
    timeSlotIdx: 0,
    customStart: "09:00",
    customEnd: "10:00",
    discipline: "esqui",
    level: "A",
    ageBracket: "",
    language: "es",
    maxParticipants: 10,
    instructorId: "",
    notes: "",
  });
  const [students, setStudents] = useState<StudentRow[]>([emptyStudent()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleTypeChange = (type: string) => {
    setClassType(type);
    const t = CLASS_TYPES.find((c) => c.value === type);
    if (t) set("maxParticipants", t.maxDefault);
    if (type === "escuelita") {
      set("ageBracket", "baby");
    }
  };

  const updateStudent = (idx: number, field: keyof StudentRow, value: string) => {
    setStudents((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addStudentRow = () => setStudents((prev) => [...prev, emptyStudent()]);
  const removeStudentRow = (idx: number) => setStudents((prev) => prev.filter((_, i) => i !== idx));

  const validStudents = students.filter((s) => s.firstName.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const slot = TIME_SLOTS[form.timeSlotIdx];
    const startTime = slot.start || form.customStart;
    const endTime = slot.end || form.customEnd;

    try {
      // 1. Create the group (class)
      const result = await createMutation.mutateAsync({
        activityDate: date,
        station,
        timeSlotStart: startTime,
        timeSlotEnd: endTime,
        discipline: form.discipline,
        level: form.level,
        ageBracket: form.ageBracket || null,
        language: form.language,
        maxParticipants: form.maxParticipants,
        instructorId: form.instructorId || null,
        notes: form.notes || null,
      });

      const groupId = result.group.id;

      // 2. Add students to the group
      let added = 0;
      for (const s of validStudents) {
        try {
          await addParticipantMutation.mutateAsync({
            firstName: s.firstName.trim(),
            lastName: s.lastName.trim() || null,
            age: s.age ? Number(s.age) : null,
            phone: s.phone.trim() || null,
            discipline: form.discipline,
            level: form.level,
            language: form.language,
            groupCellId: groupId,
            activityDate: date,
          });
          added++;
        } catch {
          // Continue with other students if one fails
        }
      }

      const typeLabel = CLASS_TYPES.find((c) => c.value === classType)?.label ?? "Clase";
      toast.success(`${typeLabel} creada${added > 0 ? ` con ${added} alumno${added !== 1 ? "s" : ""}` : ""}`);
      onClose();
    } catch {
      toast.error("Error al crear la clase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";
  const labelClass = "block text-xs font-semibold text-[#8A8580] uppercase tracking-wide mb-1";
  const isCustomTime = form.timeSlotIdx === TIME_SLOTS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-5 py-4 shrink-0">
          <h2 className="text-lg font-bold text-[#2D2A26]">Crear clase</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8A8580] hover:bg-[#FAF9F7]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Class type selector */}
          <div>
            <label className={labelClass}>Tipo de clase</label>
            <div className="grid grid-cols-3 gap-2">
              {CLASS_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.value} type="button" onClick={() => handleTypeChange(t.value)}
                    className={`rounded-xl border p-3 text-left transition-all ${classType === t.value
                      ? "border-[#E87B5A] bg-[#E87B5A]/5 ring-1 ring-[#E87B5A]"
                      : "border-[#E8E4DE] hover:border-[#E87B5A]/30"
                    }`}>
                    <Icon className={`h-4 w-4 mb-1 ${classType === t.value ? "text-[#E87B5A]" : "text-[#8A8580]"}`} />
                    <p className="text-xs font-semibold text-[#2D2A26]">{t.label}</p>
                    <p className="text-[10px] text-[#8A8580]">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date + Station */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Fecha</label>
              <input value={new Date(date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "long" })}
                disabled className={`${inputClass} bg-[#FAF9F7] capitalize`} />
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
            {isCustomTime && (
              <div className="flex gap-2 mt-2">
                <div className="flex-1">
                  <label className="text-[10px] text-[#8A8580]">Inicio</label>
                  <input type="time" value={form.customStart} onChange={(e) => set("customStart", e.target.value)} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#8A8580]">Fin</label>
                  <input type="time" value={form.customEnd} onChange={(e) => set("customEnd", e.target.value)} className={inputClass} />
                </div>
              </div>
            )}
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

          {/* Age bracket + Language + Max */}
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
            <div className="w-24">
              <label className={labelClass}>Max</label>
              <input type="number" min={1} max={15} value={form.maxParticipants}
                onChange={(e) => set("maxParticipants", Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          {/* Instructor */}
          <div>
            <label className={labelClass}>Profesor</label>
            <select value={form.instructorId} onChange={(e) => set("instructorId", e.target.value)} className={inputClass}>
              <option value="">Sin asignar</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.user.name} ({i.tdLevel}) — {(i.disciplines as string[]).join(", ")}
                </option>
              ))}
            </select>
          </div>

          {/* Students section */}
          <div className="rounded-xl border border-[#E8E4DE] overflow-hidden">
            <div className="flex items-center justify-between bg-[#FAF9F7] px-4 py-2.5 border-b border-[#E8E4DE]">
              <span className="text-xs font-semibold text-[#2D2A26]">
                Alumnos ({validStudents.length})
              </span>
              <button type="button" onClick={addStudentRow}
                className="flex items-center gap-1 rounded-lg bg-[#E87B5A]/10 px-2 py-1 text-[10px] font-medium text-[#E87B5A] hover:bg-[#E87B5A]/20">
                <Plus className="h-3 w-3" /> Anadir
              </button>
            </div>
            <div className="p-3 space-y-2">
              {students.map((s, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAF9F7] border border-[#E8E4DE] text-[10px] font-bold text-[#8A8580] mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-1.5">
                    <input value={s.firstName} onChange={(e) => updateStudent(idx, "firstName", e.target.value)}
                      placeholder="Nombre *" className={`${inputClass} text-xs py-1.5`} />
                    <input value={s.lastName} onChange={(e) => updateStudent(idx, "lastName", e.target.value)}
                      placeholder="Apellido" className={`${inputClass} text-xs py-1.5`} />
                    <input type="number" min={3} max={99} value={s.age} onChange={(e) => updateStudent(idx, "age", e.target.value)}
                      placeholder="Edad" className={`${inputClass} text-xs py-1.5`} />
                    <input value={s.phone} onChange={(e) => updateStudent(idx, "phone", e.target.value)}
                      placeholder="Telefono" className={`${inputClass} text-xs py-1.5`} />
                  </div>
                  {students.length > 1 && (
                    <button type="button" onClick={() => removeStudentRow(idx)}
                      className="mt-1 rounded-lg p-1 text-[#8A8580] hover:text-[#C75D4A] hover:bg-[#C75D4A]/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-[10px] text-[#8A8580] px-9">
                Puedes dejar alumnos en blanco — solo se anadiran los que tengan nombre.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              rows={2} placeholder="Notas opcionales..." className={inputClass} />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-[#E8E4DE] px-5 py-3 flex justify-between items-center shrink-0 bg-white">
          <p className="text-xs text-[#8A8580]">
            {CLASS_TYPES.find((c) => c.value === classType)?.label}
            {validStudents.length > 0 && ` · ${validStudents.length} alumno${validStudents.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7]">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="rounded-lg bg-[#E87B5A] px-5 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] disabled:opacity-50">
              {isSubmitting ? "Creando..." : "Crear clase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
