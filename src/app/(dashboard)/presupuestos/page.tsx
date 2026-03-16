"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { useProducts } from "@/hooks/useProducts";
import type { Quote } from "@/hooks/useQuotes";
import { QuoteList } from "./_components/QuoteList";
import { QuoteDetail } from "./_components/QuoteDetail";
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
  const [emailPreview, setEmailPreview] = useState<{
    quote: Quote;
    items: EmailItem[];
  } | null>(null);

  if (quotesLoading || productsLoading) return <PageSkeleton />;

  const currentQuote = selectedQuote
    ? quotes?.find((q) => q.id === selectedQuote.id) || selectedQuote
    : null;

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-0 -m-6">
        {/* Left panel — Quote list */}
        <div className="w-[40%] min-w-[320px] border-r border-border bg-white">
          <div className="border-b border-border px-4 py-4">
            <h1 className="text-lg font-bold text-text-primary">Presupuestos</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {quotes?.length || 0} solicitudes
            </p>
          </div>
          <QuoteList
            quotes={quotes || []}
            selectedId={currentQuote?.id || null}
            onSelect={setSelectedQuote}
          />
        </div>

        {/* Right panel — Quote detail */}
        <div className="flex-1 bg-white">
          {currentQuote ? (
            <QuoteDetail
              key={currentQuote.id}
              quote={currentQuote}
              products={products || []}
              onPreviewEmail={(quote, items) => setEmailPreview({ quote, items })}
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
