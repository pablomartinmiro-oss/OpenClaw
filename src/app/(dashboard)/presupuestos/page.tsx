"use client";

import { useState, useCallback } from "react";
import { FileText, Plus, ArrowLeft, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuotes } from "@/hooks/useQuotes";
import { useProducts } from "@/hooks/useProducts";
import { exportToCSV } from "@/lib/utils/export";
import { toast } from "sonner";
import type { Quote } from "@/hooks/useQuotes";
import { QuoteList } from "./_components/QuoteList";
import { QuoteDetail } from "./_components/QuoteDetail";
import { QuoteForm } from "./_components/QuoteForm";
import { EmailPreviewModal } from "./_components/EmailPreviewModal";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";

interface EmailItem {
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export default function PresupuestosPage() {
  const { data: quotes, isLoading: quotesLoading } = useQuotes();
  const { data: products, isLoading: productsLoading } = useProducts();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{
    quote: Quote;
    items: EmailItem[];
  } | null>(null);

  const handleExportCSV = useCallback(() => {
    if (!quotes?.length) {
      toast.error("No hay presupuestos para exportar");
      return;
    }
    exportToCSV(
      quotes.map((q) => ({
        cliente: q.clientName,
        email: q.clientEmail ?? "",
        importe: q.totalAmount,
        estado: q.status,
        destino: q.destination,
        fecha_entrada: q.checkIn,
        fecha_salida: q.checkOut,
        adultos: q.adults,
        creado: q.createdAt ? new Date(q.createdAt).toLocaleDateString("es-ES") : "",
      })),
      "presupuestos",
      [
        { key: "cliente", label: "Cliente" },
        { key: "email", label: "Email" },
        { key: "importe", label: "Importe (€)" },
        { key: "estado", label: "Estado" },
        { key: "destino", label: "Destino" },
        { key: "fecha_entrada", label: "Entrada" },
        { key: "fecha_salida", label: "Salida" },
        { key: "adultos", label: "Adultos" },
        { key: "creado", label: "Fecha creación" },
      ]
    );
    toast.success("CSV exportado");
  }, [quotes]);

  if (quotesLoading || productsLoading) return <PageSkeleton />;

  const currentQuote = selectedQuote
    ? quotes?.find((q) => q.id === selectedQuote.id) || selectedQuote
    : null;

  const showDetail = showNewForm || !!currentQuote;

  // DEBUG: Always show both panels for testing
  const debugAlwaysShow = false;

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-0 -m-4 md:-m-6">
        {/* Left panel — Quote list (hidden on mobile when detail is shown) */}
        <div className={cn(
          "w-full md:w-[40%] md:min-w-[320px] border-r border-border bg-white",
          (showDetail && !debugAlwaysShow) ? "hidden md:block" : "block"
        )}>
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div>
              <h1 className="text-lg font-bold text-slate-900">Presupuestos</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {quotes?.length || 0} solicitudes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentQuote && (
                <span className="text-xs text-blue-600 font-medium hidden sm:block">
                  Selected: {currentQuote.clientName}
                </span>
              )}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
                title="Exportar CSV"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button
                onClick={() => { 
                  setShowNewForm(true); 
                  setSelectedQuote(null); 
                }}
                className="flex items-center gap-1.5 rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white hover:bg-blue-600-hover transition-colors min-h-[44px]"
              >
                <Plus className="h-4 w-4" /> Nuevo
              </button>
            </div>
          </div>
          <QuoteList
            quotes={quotes || []}
            selectedId={currentQuote?.id || null}
            onSelect={(q) => { 
              setSelectedQuote(q); 
              setShowNewForm(false); 
            }}
          />
        </div>

        {/* Right panel — Quote detail or form (full width on mobile) */}
        <div className={cn(
          "flex-1 bg-white",
          (showDetail || debugAlwaysShow) ? "block" : "hidden md:block"
        )}>
          {/* Mobile back button */}
          {showDetail && (
            <div className="flex items-center border-b border-border px-3 py-2 md:hidden">
              <button
                onClick={() => { setSelectedQuote(null); setShowNewForm(false); }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>
          )}

          {showNewForm ? (
            <QuoteForm
              onClose={() => setShowNewForm(false)}
              onCreated={() => setShowNewForm(false)}
            />
          ) : currentQuote ? (
            <div className="h-full overflow-auto">
              {/* Debug view - simple version */}
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-slate-900">{currentQuote.clientName}</h2>
                <p className="text-slate-500">{currentQuote.clientEmail}</p>
                <p className="text-blue-600 font-bold text-lg mt-2">{currentQuote.totalAmount} €</p>
                <p className="text-sm text-slate-500 mt-1">Status: {currentQuote.status}</p>
                <p className="text-sm text-slate-500">Destination: {currentQuote.destination}</p>
                <p className="text-sm text-slate-500">Dates: {currentQuote.checkIn} to {currentQuote.checkOut}</p>
                <p className="text-sm text-slate-500">Adults: {currentQuote.adults}, Children: {currentQuote.children}</p>
              </div>
              <QuoteDetail
                key={currentQuote.id}
                quote={currentQuote}
                products={products || []}
                onPreviewEmail={(quote, items) => setEmailPreview({ quote, items })}
                onDeleted={() => setSelectedQuote(null)}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-500">
              <FileText className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Selecciona un presupuesto para ver los detalles</p>
            </div>
          )}
        </div>
      </div>

      {emailPreview && (
        <EmailPreviewModal
          quote={emailPreview.quote}
          items={emailPreview.items}
          isOpen={true}
          onClose={() => setEmailPreview(null)}
        />
      )}
    </>
  );
}
