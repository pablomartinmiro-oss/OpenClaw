"use client";

import { useState } from "react";
import { CalendarPlus, Send, CheckCircle2 } from "lucide-react";
import {
  useExtendVoucher,
  useResendVoucher,
  type CancellationVoucher,
} from "@/hooks/useCancellations";
import { toast } from "sonner";

interface Props {
  voucher: CancellationVoucher;
}

export default function VoucherRow({ voucher }: Props) {
  const [showExtend, setShowExtend] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [extendDate, setExtendDate] = useState("");
  const [resendEmail, setResendEmail] = useState("");

  const extendMutation = useExtendVoucher();
  const resendMutation = useResendVoucher();

  const fmtCurrency = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  });

  const handleExtend = async () => {
    if (!extendDate) return;
    try {
      await extendMutation.mutateAsync({
        id: voucher.id,
        newExpirationDate: extendDate,
      });
      toast.success("Fecha de expiracion extendida");
      setShowExtend(false);
      setExtendDate("");
    } catch {
      toast.error("Error al extender bono");
    }
  };

  const handleResend = async () => {
    if (!resendEmail) return;
    try {
      await resendMutation.mutateAsync({
        id: voucher.id,
        email: resendEmail,
      });
      toast.success("Bono reenviado por email");
      setShowResend(false);
      setResendEmail("");
    } catch {
      toast.error("Error al reenviar bono");
    }
  };

  return (
    <div className="rounded-[6px] border border-[#E8E4DE] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-medium text-[#2D2A26]">
            {voucher.code}
          </span>
          <span className="text-sm text-[#8A8580]">
            {fmtCurrency.format(voucher.value)}
          </span>
          {voucher.isUsed ? (
            <span className="flex items-center gap-1 rounded-[6px] bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Canjeado
            </span>
          ) : (
            <span className="rounded-[6px] bg-[#D4A853]/15 px-2 py-0.5 text-xs text-[#D4A853]">
              Pendiente
            </span>
          )}
        </div>
        {!voucher.isUsed && (
          <div className="flex gap-1">
            <button
              onClick={() => setShowExtend(!showExtend)}
              className="rounded-[6px] p-1.5 text-[#8A8580] hover:bg-[#E8E4DE]"
              title="Extender fecha"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowResend(!showResend)}
              className="rounded-[6px] p-1.5 text-[#8A8580] hover:bg-[#E8E4DE]"
              title="Reenviar por email"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {showExtend && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={extendDate}
            onChange={(e) => setExtendDate(e.target.value)}
            className="rounded-[6px] border border-[#E8E4DE] px-2 py-1 text-xs"
          />
          <button
            onClick={handleExtend}
            disabled={extendMutation.isPending}
            className="rounded-[6px] bg-[#E87B5A] px-2.5 py-1 text-xs text-white hover:bg-[#D56E4F] disabled:opacity-50"
          >
            Extender
          </button>
        </div>
      )}

      {showResend && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="email"
            placeholder="email@ejemplo.com"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="rounded-[6px] border border-[#E8E4DE] px-2 py-1 text-xs flex-1"
          />
          <button
            onClick={handleResend}
            disabled={resendMutation.isPending}
            className="rounded-[6px] bg-[#E87B5A] px-2.5 py-1 text-xs text-white hover:bg-[#D56E4F] disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
