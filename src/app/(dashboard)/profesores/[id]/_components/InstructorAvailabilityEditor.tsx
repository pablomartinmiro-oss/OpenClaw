"use client";

import { useState } from "react";
import { Calendar, Save } from "lucide-react";
import type { Instructor } from "@/hooks/useInstructors";
import { useInstructorAvailability, useUpdateAvailability } from "@/hooks/useInstructors";
import { toast } from "sonner";

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun display order

interface SlotState {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Props {
  instructor: Instructor;
}

export default function InstructorAvailabilityEditor({ instructor }: Props) {
  const { data } = useInstructorAvailability(instructor.id);
  const updateMutation = useUpdateAvailability();

  const existingSlots = data?.slots ?? instructor.availability ?? [];

  const [slots, setSlots] = useState<SlotState[]>(() =>
    WEEK_DAYS.map((day) => {
      const existing = existingSlots.find((s) => s.dayOfWeek === day);
      return existing
        ? { dayOfWeek: day, startTime: existing.startTime, endTime: existing.endTime, isActive: existing.isActive }
        : { dayOfWeek: day, startTime: "09:00", endTime: "17:00", isActive: false };
    })
  );

  const [dirty, setDirty] = useState(false);

  const updateSlot = (day: number, field: keyof SlotState, value: string | boolean) => {
    setSlots((prev) =>
      prev.map((s) => (s.dayOfWeek === day ? { ...s, [field]: value } : s))
    );
    setDirty(true);
  };

  const handleSave = async () => {
    const activeSlots = slots.filter((s) => s.isActive);
    try {
      await updateMutation.mutateAsync({
        instructorId: instructor.id,
        slots: activeSlots,
      });
      toast.success("Disponibilidad actualizada");
      setDirty(false);
    } catch {
      toast.error("Error al actualizar disponibilidad");
    }
  };

  const inputClass =
    "w-[80px] rounded-lg border border-[#E8E4DE] px-2 py-1.5 text-sm text-center text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none";

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#E87B5A]" />
          <h3 className="text-lg font-semibold text-[#2D2A26]">Disponibilidad Semanal</h3>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {slots.map((slot) => (
          <div
            key={slot.dayOfWeek}
            className={`flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
              slot.isActive
                ? "border-[#E87B5A]/30 bg-[#E87B5A]/5"
                : "border-[#E8E4DE] bg-[#FAF9F7]"
            }`}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={slot.isActive}
                onChange={(e) => updateSlot(slot.dayOfWeek, "isActive", e.target.checked)}
                className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]"
              />
              <span className={`w-24 text-sm font-medium ${slot.isActive ? "text-[#2D2A26]" : "text-[#8A8580]"}`}>
                {DAY_LABELS[slot.dayOfWeek]}
              </span>
            </label>

            {slot.isActive && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(slot.dayOfWeek, "startTime", e.target.value)}
                  className={inputClass}
                />
                <span className="text-sm text-[#8A8580]">a</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(slot.dayOfWeek, "endTime", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
