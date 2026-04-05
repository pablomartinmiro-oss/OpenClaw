"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useTeam } from "@/hooks/useSettings";
import { useCreatePayroll } from "@/hooks/usePayroll";

const inputCls =
  "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Props {
  year: number;
  month: number;
  onClose: () => void;
}

export default function AddPayrollModal({ year, month, onClose }: Props) {
  const { data: teamData } = useTeam();
  const createPayroll = useCreatePayroll();

  const [userId, setUserId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [notes, setNotes] = useState("");

  const teamUsers = (teamData?.users ?? []).filter((u) => u.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !baseSalary) return;

    try {
      await createPayroll.mutateAsync({
        userId,
        year,
        month,
        baseSalary: parseFloat(baseSalary),
        notes: notes || null,
      });
      toast.success("Nomina creada");
      onClose();
    } catch {
      toast.error("Error al crear nomina. Puede que ya exista para este empleado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2D2A26]">
            Nueva Nomina — {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button onClick={onClose} className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">Empleado</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Seleccionar empleado...</option>
              {teamUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email} ({u.role?.name ?? "—"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">Salario base (EUR)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className={inputCls}
              required
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputCls}
              rows={2}
              placeholder="Notas internas..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createPayroll.isPending}
              className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] disabled:opacity-50 transition-colors"
            >
              {createPayroll.isPending ? "Creando..." : "Crear Nomina"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
