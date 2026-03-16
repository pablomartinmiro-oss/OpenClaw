"use client";

import { X } from "lucide-react";
import type { Quote } from "@/hooks/useQuotes";

interface EmailItem {
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

interface EmailPreviewModalProps {
  quote: Quote;
  items: EmailItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function EmailPreviewModal({ quote, items, isOpen, onClose }: EmailPreviewModalProps) {
  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 5);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[14px] bg-white shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg bg-white p-1.5 shadow-sm hover:bg-surface transition-colors"
        >
          <X className="h-5 w-5 text-text-secondary" />
        </button>

        {/* Email content */}
        <div className="p-0">
          {/* Header banner */}
          <div
            className="px-8 py-6 text-center"
            style={{
              background: "linear-gradient(135deg, #E87B5A 0%, #D4A853 100%)",
            }}
          >
            <h1 className="text-2xl font-bold text-white tracking-wide">SKICENTER</h1>
            <p className="text-sm text-white/80 mt-1">Tu aventura en la nieve empieza aquí</p>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Greeting */}
            <div>
              <p className="text-base text-text-primary">
                Hola <strong>{quote.clientName.split(" ")[0]}</strong>,
              </p>
              <p className="text-sm text-text-secondary mt-2">
                Encantados de saludarte. Te enviamos presupuesto para vuestra estancia
                en <strong>
                  {quote.destination === "baqueira" ? "Baqueira" :
                   quote.destination === "sierra_nevada" ? "Sierra Nevada" :
                   quote.destination === "formigal" ? "Formigal" :
                   quote.destination === "alto_campoo" ? "Alto Campoo" :
                   "Grandvalira"}
                </strong> del{" "}
                <strong>{formatDate(new Date(quote.checkIn))}</strong> al{" "}
                <strong>{formatDate(new Date(quote.checkOut))}</strong>.
              </p>
            </div>

            {/* Payment info */}
            <div className="rounded-lg bg-surface p-4">
              <p className="text-sm font-medium text-text-primary mb-2">Formas de pago:</p>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Transferencia bancaria: ES12 3456 7890 1234 5678 9012</li>
                <li>• Enlace de pago: se enviará tras la confirmación</li>
              </ul>
              <p className="text-xs text-warning mt-2 font-medium">
                Este presupuesto tiene validez hasta el {formatDate(expiryDate)}.
              </p>
            </div>

            {/* Client info */}
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">Datos del cliente</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-text-secondary">Nombre: </span>
                  <span className="text-text-primary">{quote.clientName}</span>
                </div>
                {quote.clientPhone && (
                  <div>
                    <span className="text-text-secondary">Teléfono: </span>
                    <span className="text-text-primary">{quote.clientPhone}</span>
                  </div>
                )}
                {quote.clientEmail && (
                  <div>
                    <span className="text-text-secondary">Email: </span>
                    <span className="text-text-primary">{quote.clientEmail}</span>
                  </div>
                )}
                <div>
                  <span className="text-text-secondary">Personas: </span>
                  <span className="text-text-primary">
                    {quote.adults} adultos{quote.children > 0 ? `, ${quote.children} niños` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="py-2 text-left font-semibold text-text-primary">Descripción</th>
                    <th className="py-2 text-center font-semibold text-text-primary w-16">Cant.</th>
                    <th className="py-2 text-center font-semibold text-text-primary w-16">Dto.</th>
                    <th className="py-2 text-right font-semibold text-text-primary w-24">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5">
                        <div className="font-medium text-text-primary">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-text-secondary">{item.description}</div>
                        )}
                      </td>
                      <td className="py-2.5 text-center text-text-secondary">{item.quantity}</td>
                      <td className="py-2.5 text-center text-text-secondary">
                        {item.discount > 0 ? `${item.discount}%` : "-"}
                      </td>
                      <td className="py-2.5 text-right font-medium text-text-primary">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="mt-3 flex justify-between items-center border-t-2 border-coral pt-3">
                <span className="text-base font-bold text-text-primary">TOTAL</span>
                <span className="text-xl font-bold text-coral">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Terms */}
            <div className="text-xs text-text-secondary space-y-1 border-t border-border pt-4">
              <p className="font-semibold text-text-primary">Términos y condiciones:</p>
              <p>
                El presupuesto incluye IVA. Los precios pueden variar según disponibilidad.
                La reserva se confirma con el pago del 30% del total. Cancelación gratuita
                hasta 15 días antes de la llegada. Para cancelaciones posteriores se aplicará
                una penalización del 50%. No shows: 100% del importe.
              </p>
            </div>

            {/* Footer */}
            <div
              className="rounded-2xl px-6 py-4 text-center text-white text-xs"
              style={{
                background: "linear-gradient(135deg, #E87B5A 0%, #D4A853 100%)",
              }}
            >
              <p className="font-semibold">Skicenter Spain</p>
              <p className="mt-1 opacity-80">
                info@skicenter.es · +34 900 123 456 · www.skicenter.es
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
