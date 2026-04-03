"use client";

import { useState } from "react";
import { Plus, Lock, Clock, X } from "lucide-react";
import { toast } from "sonner";
import {
  useRegisters,
  useSessions,
  useOpenSession,
  useCloseSession,
} from "@/hooks/useTpv";
import type { CashSession } from "@/hooks/useTpv";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const dtf = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function SessionsTab() {
  const { data: regData } = useRegisters();
  const registers = regData?.registers ?? [];

  const [filterRegister, setFilterRegister] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const { data, isLoading } = useSessions(
    filterRegister || undefined,
    filterStatus || undefined
  );
  const openSession = useOpenSession();
  const closeSession = useCloseSession();

  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState<CashSession | null>(null);
  const [openForm, setOpenForm] = useState({ registerId: "", openingAmount: 0 });
  const [closeForm, setCloseForm] = useState({
    closingAmount: 0,
    totalCash: 0,
    totalCard: 0,
    totalBizum: 0,
  });

  if (isLoading) return <PageSkeleton />;

  const sessions = data?.sessions ?? [];

  const handleOpen = async () => {
    if (!openForm.registerId) {
      toast.error("Selecciona una caja");
      return;
    }
    try {
      await openSession.mutateAsync({
        registerId: openForm.registerId,
        openingAmount: openForm.openingAmount,
      });
      toast.success("Sesion abierta");
      setOpenModal(false);
      setOpenForm({ registerId: "", openingAmount: 0 });
    } catch {
      toast.error("Error al abrir sesion");
    }
  };

  const handleClose = async () => {
    if (!closeModal) return;
    try {
      await closeSession.mutateAsync({
        id: closeModal.id,
        ...closeForm,
      });
      toast.success("Sesion cerrada");
      setCloseModal(null);
    } catch {
      toast.error("Error al cerrar sesion");
    }
  };

  const startClose = (s: CashSession) => {
    setCloseForm({
      closingAmount: 0,
      totalCash: s.totalCash ?? 0,
      totalCard: s.totalCard ?? 0,
      totalBizum: s.totalBizum ?? 0,
    });
    setCloseModal(s);
  };

  return (
    <div className="space-y-4">
      {/* Filters + action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={filterRegister}
            onChange={(e) => setFilterRegister(e.target.value)}
            className="rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
          >
            <option value="">Todas las cajas</option>
            {registers.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="open">Abierta</option>
            <option value="closed">Cerrada</option>
          </select>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Abrir Sesion
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-[#8A8580] mb-3" />
          <p className="text-sm text-[#8A8580]">No hay sesiones de caja</p>
          <p className="text-xs text-[#8A8580] mt-1">
            Abre una sesion para empezar a registrar ventas
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAF9F7]/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">Caja</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#8A8580] uppercase tracking-wider">Apertura</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Importe apertura</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Efectivo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Tarjeta</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Bizum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Discrepancia</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#8A8580] uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#8A8580] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE]">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FAF9F7]/30 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-[#2D2A26]">{s.register?.name ?? "—"}</td>
                    <td className="px-4 py-4 text-sm text-[#8A8580]">{dtf.format(new Date(s.openedAt))}</td>
                    <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">{fmt.format(s.openingAmount)}</td>
                    <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">{s.totalCash != null ? fmt.format(s.totalCash) : "—"}</td>
                    <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">{s.totalCard != null ? fmt.format(s.totalCard) : "—"}</td>
                    <td className="px-4 py-4 text-right text-sm text-[#2D2A26]">{s.totalBizum != null ? fmt.format(s.totalBizum) : "—"}</td>
                    <td className="px-4 py-4 text-right text-sm">
                      {s.discrepancy != null ? (
                        <span className={s.discrepancy === 0 ? "text-[#5B8C6D]" : "text-[#C75D4A] font-medium"}>
                          {fmt.format(s.discrepancy)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex rounded-[6px] px-2 py-0.5 text-xs font-medium ${
                        s.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {s.status === "open" ? "Abierta" : "Cerrada"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {s.status === "open" && (
                        <button
                          onClick={() => startClose(s)}
                          className="flex items-center gap-1 rounded-[10px] px-3 py-1.5 text-xs font-medium text-[#C75D4A] bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Lock className="h-3 w-3" /> Cerrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open Session Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2D2A26]">Abrir Sesion</h2>
              <button onClick={() => setOpenModal(false)} className="text-[#8A8580] hover:text-[#2D2A26]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1">Caja *</label>
                <select
                  value={openForm.registerId}
                  onChange={(e) => setOpenForm({ ...openForm, registerId: e.target.value })}
                  className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
                >
                  <option value="">Seleccionar caja</option>
                  {registers.filter((r) => r.active).map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1">Importe de apertura</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={openForm.openingAmount}
                  onChange={(e) => setOpenForm({ ...openForm, openingAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenModal(false)} className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleOpen}
                disabled={openSession.isPending}
                className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50"
              >
                Abrir Sesion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Session Modal */}
      {closeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#2D2A26]">Cerrar Sesion</h2>
              <button onClick={() => setCloseModal(null)} className="text-[#8A8580] hover:text-[#2D2A26]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-[#8A8580] mb-4">
              Caja: <strong className="text-[#2D2A26]">{closeModal.register?.name}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1">Importe de cierre (efectivo contado) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={closeForm.closingAmount}
                  onChange={(e) => setCloseForm({ ...closeForm, closingAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8A8580] mb-1">Total efectivo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={closeForm.totalCash}
                    onChange={(e) => setCloseForm({ ...closeForm, totalCash: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8580] mb-1">Total tarjeta</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={closeForm.totalCard}
                    onChange={(e) => setCloseForm({ ...closeForm, totalCard: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8A8580] mb-1">Total Bizum</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={closeForm.totalBizum}
                    onChange={(e) => setCloseForm({ ...closeForm, totalBizum: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCloseModal(null)} className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleClose}
                disabled={closeSession.isPending}
                className="rounded-[10px] bg-[#C75D4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#B5503F] transition-colors disabled:opacity-50"
              >
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
