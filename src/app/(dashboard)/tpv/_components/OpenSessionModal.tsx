"use client";

import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  registers: { id: string; name: string }[];
  form: { registerId: string; openingAmount: number };
  setForm: (v: { registerId: string; openingAmount: number }) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function OpenSessionModal({
  onClose,
  registers,
  form,
  setForm,
  onSubmit,
  submitting,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2D2A26]">Abrir Caja</h2>
          <button
            onClick={onClose}
            className="text-[#8A8580] hover:text-[#2D2A26]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-[#8A8580]">
          Cuenta el efectivo inicial antes de abrir.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Caja *
            </label>
            <select
              value={form.registerId}
              onChange={(e) =>
                setForm({ ...form, registerId: e.target.value })
              }
              className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
            >
              <option value="">Seleccionar caja</option>
              {registers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2D2A26] mb-1">
              Efectivo inicial (recuento)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.openingAmount || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  openingAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
              className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50"
          >
            Abrir Caja
          </button>
        </div>
      </div>
    </div>
  );
}
