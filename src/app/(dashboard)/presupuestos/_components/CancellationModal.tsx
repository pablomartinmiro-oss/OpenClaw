"use client";

import { useState } from "react";
import { AlertTriangle, Gift, CreditCard, X } from "lucide-react";
import { toast } from "sonner";
import { useCancelQuote } from "@/hooks/useQuotes";
import type { Quote } from "@/hooks/useQuotes";

interface Props {
  quote: Quote;
  onClose: () => void;
}

type Step = "reason" | "options" | "refund_form" | "done";

const REASONS = [
  { value: "cliente_solicita", label: "Cliente solicita cancelación" },
  { value: "sin_disponibilidad", label: "Sin disponibilidad" },
  { value: "error_presupuesto", label: "Error en presupuesto" },
  { value: "otro", label: "Otro" },
];

export function CancellationModal({ quote, onClose }: Props) {
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [iban, setIban] = useState("");
  const [titular, setTitular] = useState("");
  const [result, setResult] = useState<{
    cancelType?: string;
    bonoCode?: string;
    bonoAmount?: number;
    daysUntilCheckIn?: number;
  } | null>(null);

  const cancelQuote = useCancelQuote();

  const handleSubmitReason = async () => {
    if (!reason) {
      toast.error("Selecciona un motivo de cancelación");
      return;
    }

    try {
      const data = await cancelQuote.mutateAsync({
        id: quote.id,
        reason,
        notes: notes || undefined,
      });

      if (data.options) {
        // Server says >15 days — show bono/refund options
        setResult(data);
        setStep("options");
      } else {
        // Direct cancellation (<15 days or blackout)
        setResult(data);
        setStep("done");
        toast.success("Presupuesto cancelado");
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleBono = async () => {
    try {
      const data = await cancelQuote.mutateAsync({
        id: quote.id,
        reason,
        notes: notes || undefined,
        action: "bono",
      });
      setResult(data);
      setStep("done");
      toast.success("Bono generado correctamente");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRequestRefund = () => {
    setStep("refund_form");
  };

  const handleSubmitRefund = async () => {
    if (!iban || !titular) {
      toast.error("IBAN y titular son obligatorios");
      return;
    }
    try {
      const data = await cancelQuote.mutateAsync({
        id: quote.id,
        reason,
        notes: notes || undefined,
        action: "devolucion",
        iban,
        titular,
      });
      setResult(data);
      setStep("done");
      toast.success("Solicitud de devolución enviada");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const INPUT_CLS = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-red" />
            Cancelar Presupuesto
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-surface transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {step === "reason" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900">Motivo de cancelación *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`mt-1 ${INPUT_CLS}`}
              >
                <option value="">Seleccionar motivo...</option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {reason === "otro" && (
              <div>
                <label className="text-sm font-medium text-slate-900">Descripción</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Describe el motivo..."
                  className={`mt-1 ${INPUT_CLS}`}
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-900 hover:bg-surface transition-colors">
                Volver
              </button>
              <button
                onClick={handleSubmitReason}
                disabled={cancelQuote.isPending || !reason}
                className="rounded-lg bg-muted-red px-4 py-2 text-sm font-medium text-white hover:bg-muted-red/90 transition-colors disabled:opacity-50"
              >
                {cancelQuote.isPending ? "Procesando..." : "Continuar"}
              </button>
            </div>
          </div>
        )}

        {step === "options" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              La cancelación es con más de 15 días de antelación.
              Puede elegir entre un bono o solicitar la devolución.
            </p>
            <div className="grid gap-3">
              <button
                onClick={handleBono}
                disabled={cancelQuote.isPending}
                className="flex items-center gap-3 rounded-xl border-2 border-gold/30 bg-amber-50/30 p-4 text-left hover:border-gold transition-colors disabled:opacity-50"
              >
                <Gift className="h-8 w-8 text-amber-700" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Generar Bono</div>
                  <div className="text-xs text-slate-500">
                    Bono por {quote.totalAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}, válido 1 año
                  </div>
                </div>
              </button>
              <button
                onClick={handleRequestRefund}
                className="flex items-center gap-3 rounded-xl border-2 border-border p-4 text-left hover:border-blue-500 transition-colors"
              >
                <CreditCard className="h-8 w-8 text-slate-500" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Solicitar Devolución</div>
                  <div className="text-xs text-slate-500">
                    Devolución al IBAN del cliente
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "refund_form" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Introduzca los datos bancarios del cliente para la devolución.
            </p>
            <div>
              <label className="text-sm font-medium text-slate-900">IBAN *</label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="ES00 0000 0000 0000 0000 0000"
                className={`mt-1 ${INPUT_CLS}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-900">Titular de la cuenta *</label>
              <input
                type="text"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                placeholder="Nombre completo del titular"
                className={`mt-1 ${INPUT_CLS}`}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setStep("options")} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-900 hover:bg-surface transition-colors">
                Volver
              </button>
              <button
                onClick={handleSubmitRefund}
                disabled={cancelQuote.isPending || !iban || !titular}
                className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-blue-600-hover transition-colors disabled:opacity-50"
              >
                {cancelQuote.isPending ? "Procesando..." : "Solicitar Devolución"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && result && (
          <div className="space-y-4">
            {result.cancelType === "bono" && result.bonoCode && (
              <div className="rounded-xl bg-amber-50/30 border border-gold/30 p-4 text-center">
                <Gift className="h-8 w-8 text-amber-700 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">Bono generado</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{result.bonoCode}</p>
                <p className="text-sm text-slate-500 mt-1">
                  Importe: {result.bonoAmount?.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </p>
              </div>
            )}
            {result.cancelType === "devolucion" && (
              <div className="rounded-xl bg-surface p-4 text-center">
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">Solicitud de devolución registrada</p>
                <p className="text-xs text-slate-500 mt-1">
                  Se ha enviado un email a administracion@skicenter.es
                </p>
              </div>
            )}
            {result.cancelType === "sin_devolucion" && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-red mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">Cancelado sin devolución</p>
                <p className="text-xs text-slate-500 mt-1">
                  Según la política de cancelación, no se admiten devoluciones con menos de 15 días de antelación.
                </p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={onClose} className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-blue-600-hover transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
