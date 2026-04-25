"use client";

import { CreditCard } from "lucide-react";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

interface Props {
  total: number;
  disabled: boolean;
  onCharge: () => void;
}

export default function PaymentBar({ total, disabled, onCharge }: Props) {
  return (
    <div className="shrink-0 border-t border-[#E8E4DE] bg-[#FAF9F7]/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#8A8580]">
          Total
        </span>
        <span className="text-2xl font-bold text-[#2D2A26]">
          {fmt.format(total)}
        </span>
      </div>
      <button
        onClick={onCharge}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CreditCard className="h-4 w-4" /> Cobrar
      </button>
    </div>
  );
}
