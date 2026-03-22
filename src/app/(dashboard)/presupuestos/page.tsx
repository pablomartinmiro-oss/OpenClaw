"use client";

import { useState } from "react";
import { FileText, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuotes } from "@/hooks/useQuotes";
import { useProducts } from "@/hooks/useProducts";
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

  if (quotesLoading || productsLoading) return <PageSkeleton />;

  const currentQuote = selectedQuote
    ? quotes?.find((q) => q.id === selectedQuote.id) || selectedQuote
    : null;

  const showDetail = showNewForm || !!currentQuote;

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-0 -m-4 md:-m-6">
        {/* Left panel — Quote list (hidden on mobile when detail is shown) */}
        <div className={cn(
          "w-full md:w-[40%] md:min-w-[320px] border-r border-border bg-white",
          showDetail ? "hidden md:block" : "block"
        )}>
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <div>
              <h1 className="text-lg font-bold text-text-primary">Presupuestos</h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {quotes?.length || 0} solicitudes
              </p>
            </div>
            <button
              onClick={() => { setShowNewForm(true); setSelectedQuote(null); }}
              className="flex items-center gap-1.5 rounded-lg bg-coral px-3 py-2 text-sm font-medium text-white hover:bg-coral-hover transition-colors min-h-[44px]"
            >
              <Plus className="h-4 w-4" /> Nuevo
            </button>
          </div>
          <QuoteList
            quotes={quotes || []}
            selectedId={currentQuote?.id || null}
            onSelect={(q) => { setSelectedQuote(q); setShowNewForm(false); }}
          />
        </div>

        {/* Right panel — Quote detail or form (full width on mobile) */}
        <div className={cn(
          "flex-1 bg-white",
          showDetail ? "block" : "hidden md:block"
        )}>
          {/* Mobile back button */}
          {showDetail && (
            <div className="flex items-center border-b border-border px-3 py-2 md:hidden">
              <button
                onClick={() => { setSelectedQuote(null); setShowNewForm(false); }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-warm-muted transition-colors min-h-[44px]"
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
            <QuoteDetail
              key={currentQuote.id}
              quote={currentQuote}
              products={products || []}
              onPreviewEmail={(quote, items) => setEmailPreview({ quote, items })}
              onDeleted={() => setSelectedQuote(null)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-text-secondary">
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
