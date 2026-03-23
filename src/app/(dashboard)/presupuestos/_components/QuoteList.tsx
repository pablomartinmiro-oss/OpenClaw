"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Calendar, Users, Clock, FormInput, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Quote } from "@/hooks/useQuotes";
import { STATIONS } from "../../reservas/_components/constants";

const STATUS_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
  nuevo: { label: "Nuevo", color: "text-gray-600", bgClass: "bg-gray-100" },
  borrador: { label: "Borrador", color: "text-gray-600", bgClass: "bg-gray-100" },
  en_proceso: { label: "En Proceso", color: "text-gold", bgClass: "bg-gold-light" },
  enviado: { label: "Enviado", color: "text-soft-blue", bgClass: "bg-soft-blue-light animate-pulse-soft" },
  pagado: { label: "Pagado", color: "text-white", bgClass: "bg-sage" },
  expirado: { label: "Expirado", color: "text-muted-red", bgClass: "bg-muted-red-light" },
  cancelado: { label: "Cancelado", color: "text-gray-500", bgClass: "bg-gray-200" },
};

const FILTER_TABS = [
  { key: "", label: "Todos" },
  { key: "borrador", label: "Borrador" },
  { key: "enviado", label: "Enviado" },
  { key: "pagado", label: "Pagado" },
  { key: "expirado", label: "Expirado" },
];

function getStationLabel(value: string): string {
  return STATIONS.find((s) => s.value === value)?.label ?? value;
}

function formatEUR(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface QuoteListProps {
  quotes: Quote[];
  selectedId: string | null;
  onSelect: (quote: Quote) => void;
}

export function QuoteList({ quotes, selectedId, onSelect }: QuoteListProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const filtered = useMemo(() => {
    let result = quotes;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((q) => {
        const matchName = q.clientName?.toLowerCase().includes(s);
        const matchEmail = q.clientEmail?.toLowerCase().includes(s);
        const matchPhone = q.clientPhone?.includes(s);
        return matchName || matchEmail || matchPhone;
      });
    }
    if (filterStatus) {
      result = result.filter((q) => q.status === filterStatus);
    }
    // Sort newest first
    return [...result].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [quotes, search, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of quotes) counts[q.status] = (counts[q.status] || 0) + 1;
    return counts;
  }, [quotes]);

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-border p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-border bg-surface pl-10 pr-3 py-2 text-sm placeholder:text-text-secondary focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const isActive = filterStatus === tab.key;
            const count = tab.key ? (statusCounts[tab.key] || 0) : quotes.length;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(isActive && tab.key ? "" : tab.key)}
                className={cn(
                  "rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-coral text-white"
                    : "bg-warm-muted text-text-secondary hover:bg-warm-muted/80"
                )}
              >
                {tab.label}
                <span className="ml-1 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quote cards */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-secondary">
            No se encontraron presupuestos
          </div>
        ) : (
          filtered.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              isSelected={selectedId === quote.id}
              onSelect={() => onSelect(quote)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function QuoteCard({
  quote,
  isSelected,
  onSelect,
}: {
  quote: Quote;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const config = STATUS_CONFIG[quote.status] || STATUS_CONFIG.nuevo;
  const totalPax = quote.adults + quote.children;
  const isExpired = quote.status === "expirado";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={cn(
        "w-full border-b border-warm-border p-4 text-left transition-all hover:bg-warm-muted/50 cursor-pointer",
        isSelected && "bg-warm-muted border-l-[3px] border-l-coral"
      )}
    >
      {/* Row 1: Name + amount */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <h3 className={cn(
            "font-semibold text-sm text-text-primary truncate",
            isExpired && "line-through opacity-60"
          )}>
            {quote.clientName}
          </h3>
          {quote.source === "survey" && (
            <span className="flex items-center gap-0.5 rounded-[6px] bg-coral-light px-1.5 py-0.5 text-[10px] font-medium text-coral shrink-0">
              <FormInput className="h-2.5 w-2.5" /> Desde formulario
            </span>
          )}
        </div>
        {quote.totalAmount > 0 && (
          <span className={cn(
            "text-sm font-bold text-text-primary whitespace-nowrap",
            isExpired && "line-through opacity-60"
          )}>
            {formatEUR(quote.totalAmount)}
          </span>
        )}
      </div>

      {/* Row 2: Destination + dates */}
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {getStationLabel(quote.destination)}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(quote.checkIn)} - {formatDate(quote.checkOut)}
        </span>
      </div>

      {/* Row 3: Status badge + pax + date */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[11px] font-medium", config.bgClass, config.color)}>
            {quote.status === "pagado" && <Check className="h-3 w-3" />}
            {config.label}
          </span>
          <span className="flex items-center gap-0.5 rounded-[6px] bg-warm-muted px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
            <Users className="h-2.5 w-2.5" /> {totalPax} pax
          </span>
          {quote.status === "enviado" && quote.expiresAt && (
            <ExpiryBadge expiresAt={quote.expiresAt} />
          )}
        </div>
        <span className="text-[10px] text-text-secondary">
          {new Date(quote.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </div>
  );
}

function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) {
    return (
      <span className="flex items-center gap-0.5 rounded-[6px] bg-muted-red-light px-1.5 py-0.5 text-[10px] font-medium text-muted-red">
        <Clock className="h-2.5 w-2.5" /> Expirado
      </span>
    );
  }
  if (diffDays <= 2) {
    return (
      <span className="flex items-center gap-0.5 rounded-[6px] bg-gold-light px-1.5 py-0.5 text-[10px] font-medium text-gold">
        <Clock className="h-2.5 w-2.5" /> {diffDays}d
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[10px] text-text-secondary">
      <Clock className="h-2.5 w-2.5" /> {diffDays}d
    </span>
  );
}

export { STATUS_CONFIG };
