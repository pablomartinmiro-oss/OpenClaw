"use client";

import { useState, useMemo } from "react";
import { X, Banknote, CreditCard, Smartphone, Split } from "lucide-react";
import type { PaymentMethods } from "@/hooks/useTpv";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

type Method = "efectivo" | "tarjeta" | "mixto";

interface Props {
  total: number;
  onClose: () => void;
  onConfirm: (paymentMethods: PaymentMethods) => void;
  submitting: boolean;
}

export default function PaymentModal({
  total,
  onClose,
  onConfirm,
  submitting,
}: Props) {
  const [method, setMethod] = useState<Method>("efectivo");
  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [bizum, setBizum] = useState(0);

  const sumSplit = useMemo(() => cash + card + bizum, [cash, card, bizum]);
  const remaining = useMemo(
    () => Math.round((total - sumSplit) * 100) / 100,
    [total, sumSplit]
  );

  const handleConfirm = () => {
    let pm: PaymentMethods;
    if (method === "efectivo") pm = { cash: total, card: 0, bizum: 0 };
    else if (method === "tarjeta") pm = { cash: 0, card: total, bizum: 0 };
    else pm = { cash, card, bizum };
    onConfirm(pm);
  };

  const valid =
    method !== "mixto" ||
    Math.abs(remaining) < 0.01;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2D2A26]">Cobrar</h2>
          <button
            onClick={onClose}
            className="text-[#8A8580] hover:text-[#2D2A26]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 rounded-[10px] bg-[#FAF9F7] p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8A8580]">
            Total a cobrar
          </p>
          <p className="text-3xl font-bold text-[#2D2A26]">{fmt.format(total)}</p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <MethodButton
            active={method === "efectivo"}
            icon={<Banknote className="h-4 w-4" />}
            label="Efectivo"
            onClick={() => setMethod("efectivo")}
          />
          <MethodButton
            active={method === "tarjeta"}
            icon={<CreditCard className="h-4 w-4" />}
            label="Tarjeta"
            onClick={() => setMethod("tarjeta")}
          />
          <MethodButton
            active={method === "mixto"}
            icon={<Split className="h-4 w-4" />}
            label="Mixto"
            onClick={() => setMethod("mixto")}
          />
        </div>

        {method === "mixto" && (
          <div className="mb-4 space-y-3 rounded-[10px] border border-[#E8E4DE] p-4">
            <SplitRow
              icon={<Banknote className="h-4 w-4 text-[#8A8580]" />}
              label="Efectivo"
              value={cash}
              onChange={setCash}
            />
            <SplitRow
              icon={<CreditCard className="h-4 w-4 text-[#8A8580]" />}
              label="Tarjeta"
              value={card}
              onChange={setCard}
            />
            <SplitRow
              icon={<Smartphone className="h-4 w-4 text-[#8A8580]" />}
              label="Bizum"
              value={bizum}
              onChange={setBizum}
            />
            <div
              className={`flex items-center justify-between rounded-[6px] px-2 py-1.5 text-xs font-medium ${
                Math.abs(remaining) < 0.01
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              <span>Restante</span>
              <span>{fmt.format(remaining)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!valid || submitting}
            className="rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50"
          >
            {submitting ? "Cobrando..." : "Confirmar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MethodButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-[10px] border-2 px-3 py-3 text-xs font-medium transition-all ${
        active
          ? "border-[#E87B5A] bg-[#E87B5A]/5 text-[#E87B5A]"
          : "border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A]/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SplitRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="flex-1 text-sm text-[#2D2A26]">{label}</span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0.00"
        className="w-28 rounded-[10px] border border-[#E8E4DE] px-3 py-1.5 text-right text-sm focus:border-[#E87B5A] focus:outline-none"
      />
    </div>
  );
}
