"use client";

import { Printer, Check, X } from "lucide-react";
import type { PaymentMethods } from "@/hooks/useTpv";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});
const dtf = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

interface SaleData {
  ticketNumber: string;
  date: string;
  totalAmount: number;
  totalTax: number;
  paymentMethods: PaymentMethods;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

interface Props {
  sale: SaleData;
  onClose: () => void;
}

export default function Receipt({ sale, onClose }: Props) {
  const subtotal =
    Math.round((sale.totalAmount - sale.totalTax) * 100) / 100;
  const pmParts: string[] = [];
  if (sale.paymentMethods.cash > 0)
    pmParts.push(`Efectivo: ${fmt.format(sale.paymentMethods.cash)}`);
  if (sale.paymentMethods.card > 0)
    pmParts.push(`Tarjeta: ${fmt.format(sale.paymentMethods.card)}`);
  if (sale.paymentMethods.bizum > 0)
    pmParts.push(`Bizum: ${fmt.format(sale.paymentMethods.bizum)}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 print:bg-white print:items-start print:p-0">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl print:max-w-full print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] p-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-4 w-4 text-emerald-700" />
            </div>
            <h2 className="text-lg font-semibold text-[#2D2A26]">
              Cobro completado
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A8580] hover:text-[#2D2A26]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 print:p-3" id="receipt-print">
          <div className="mb-4 text-center">
            <h3 className="text-base font-bold text-[#2D2A26]">TICKET</h3>
            <p className="mt-1 font-mono text-sm text-[#8A8580]">
              {sale.ticketNumber}
            </p>
            <p className="text-xs text-[#8A8580]">
              {dtf.format(new Date(sale.date))}
            </p>
          </div>

          <div className="mb-4 border-y border-dashed border-[#E8E4DE] py-3">
            {sale.items.map((item, i) => (
              <div key={i} className="mb-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#2D2A26]">{item.description}</span>
                  <span className="text-[#2D2A26]">
                    {fmt.format(item.lineTotal)}
                  </span>
                </div>
                <div className="text-xs text-[#8A8580]">
                  {item.quantity} x {fmt.format(item.unitPrice)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-[#8A8580]">
              <span>Subtotal</span>
              <span>{fmt.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#8A8580]">
              <span>IVA</span>
              <span>{fmt.format(sale.totalTax)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E8E4DE] pt-2 text-base font-bold text-[#2D2A26]">
              <span>Total</span>
              <span>{fmt.format(sale.totalAmount)}</span>
            </div>
          </div>

          {pmParts.length > 0 && (
            <div className="mt-4 border-t border-dashed border-[#E8E4DE] pt-3 text-xs text-[#8A8580]">
              {pmParts.map((p) => (
                <div key={p}>{p}</div>
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-[#8A8580] print:mt-3">
            Gracias por su compra
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E8E4DE] p-4 print:hidden">
          <button
            onClick={onClose}
            className="rounded-[10px] border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
          >
            <Printer className="h-4 w-4" /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
