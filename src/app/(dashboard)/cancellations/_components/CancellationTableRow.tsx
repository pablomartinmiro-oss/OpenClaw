"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { type CancellationRequest } from "@/hooks/useCancellations";
import CancellationDetail from "./CancellationDetail";

const STATUS_BADGE: Record<string, string> = {
  recibida: "bg-[#8A8580]/15 text-[#8A8580]",
  en_revision: "bg-blue-500/15 text-blue-700",
  pendiente_documentacion: "bg-amber-500/15 text-amber-700",
  pendiente_decision: "bg-purple-500/15 text-purple-700",
  resuelta: "bg-emerald-500/15 text-emerald-700",
  cerrada: "bg-[#2D2A26]/15 text-[#2D2A26]",
};

const STATUS_LABEL: Record<string, string> = {
  recibida: "Recibida",
  en_revision: "En revision",
  pendiente_documentacion: "Pte. documentacion",
  pendiente_decision: "Pte. decision",
  resuelta: "Resuelta",
  cerrada: "Cerrada",
};

const RESOLUTION_LABEL: Record<string, string> = {
  rejected: "Rechazada",
  fully_accepted: "Aceptada total",
  partially_accepted: "Aceptada parcial",
};

interface Props {
  req: CancellationRequest;
  isExpanded: boolean;
  onToggle: () => void;
  onResolve: () => void;
  fmt: Intl.DateTimeFormat;
  fmtCurrency: Intl.NumberFormat;
}

export default function CancellationTableRow({
  req,
  isExpanded,
  onToggle,
  onResolve,
  fmt,
  fmtCurrency,
}: Props) {
  const ref = req.reservationId
    ? `Res: ${req.reservationId.slice(-6)}`
    : req.quoteId
      ? `Pres: ${req.quoteId.slice(-6)}`
      : "\u2014";

  return (
    <>
      <tr className="border-b border-[#E8E4DE] hover:bg-[#FAF9F7]/50">
        <td className="px-4 py-3 font-mono text-xs text-[#8A8580]">
          {req.id.slice(-8)}
        </td>
        <td className="px-4 py-3 text-[#2D2A26]">{ref}</td>
        <td className="px-4 py-3 max-w-[200px] truncate text-[#2D2A26]">
          {req.reason || "\u2014"}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-[6px] px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[req.status] ?? ""}`}
          >
            {STATUS_LABEL[req.status] ?? req.status}
          </span>
        </td>
        <td className="px-4 py-3 text-[#2D2A26]">
          {req.resolution
            ? (RESOLUTION_LABEL[req.resolution] ?? req.resolution)
            : "\u2014"}
        </td>
        <td className="px-4 py-3 text-[#2D2A26]">
          {req.refundAmount ? fmtCurrency.format(req.refundAmount) : "\u2014"}
        </td>
        <td className="px-4 py-3 text-[#8A8580]">
          {fmt.format(new Date(req.createdAt))}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {req.status !== "resuelta" && req.status !== "cerrada" && (
              <button
                onClick={onResolve}
                className="rounded-[6px] bg-[#E87B5A]/15 px-2.5 py-1 text-xs font-medium text-[#E87B5A] hover:bg-[#E87B5A]/25"
              >
                Resolver
              </button>
            )}
            <button
              onClick={onToggle}
              className="rounded-[6px] p-1 text-[#8A8580] hover:bg-[#E8E4DE]"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={8} className="bg-[#FAF9F7] px-4 py-4">
            <CancellationDetail requestId={req.id} />
          </td>
        </tr>
      )}
    </>
  );
}
