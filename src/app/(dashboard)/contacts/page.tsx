"use client";

import { useState, useMemo } from "react";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useContacts } from "@/hooks/useGHL";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { GHLEmptyState } from "@/components/shared/GHLEmptyState";
import { ContactsTable } from "./_components/ContactsTable";
import { ContactsSearch } from "./_components/ContactsSearch";
import { SourceFilter } from "./_components/SourceFilter";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  // Debounce search — send to server after 300ms
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    // Simple debounce via setTimeout
    clearTimeout((globalThis as unknown as { __searchTimeout?: ReturnType<typeof setTimeout> }).__searchTimeout);
    (globalThis as unknown as { __searchTimeout?: ReturnType<typeof setTimeout> }).__searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const { data, isLoading, isFetching } = useContacts({
    page,
    limit: PAGE_SIZE,
    query: debouncedSearch,
  });

  const contacts = useMemo(() => data?.contacts ?? [], [data]);
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const c of contacts) {
      if (c.source) set.add(c.source);
    }
    return Array.from(set).sort();
  }, [contacts]);

  // Client-side source filter (applied on top of server-side search)
  const filtered = useMemo(() => {
    if (!sourceFilter) return contacts;
    return contacts.filter((c) => c.source === sourceFilter);
  }, [contacts, sourceFilter]);

  return (
    <GHLEmptyState message="No hay contactos. Conecta GoHighLevel para importar tus contactos.">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Contactos</h1>
          <p className="text-sm text-text-secondary">Gestiona tu base de datos de contactos</p>
        </div>
        <span className="text-sm text-text-secondary">
          {total.toLocaleString("es-ES")} contactos
          {isFetching && !isLoading && <span className="ml-2 text-xs text-coral">cargando...</span>}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ContactsSearch value={search} onChange={handleSearch} />
        {sources.length > 0 && (
          <SourceFilter
            sources={sources}
            selected={sourceFilter}
            onSelect={setSourceFilter}
          />
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No se encontraron contactos"
          description={
            search || sourceFilter
              ? "Prueba ajustando tu búsqueda o filtros"
              : "Los contactos aparecerán aquí una vez sincronizados con GHL"
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <ContactsTable contacts={filtered} />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
    </GHLEmptyState>
  );
}
