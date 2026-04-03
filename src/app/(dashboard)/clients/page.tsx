"use client";

import { useState, useMemo, useCallback } from "react";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, Client } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClientModal, DeleteConfirm } from "./_components/ClientModal";
import { toast } from "sonner";
import {
  Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, UserCheck,
} from "lucide-react";

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalClient, setModalClient] = useState<Client | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const { data, isLoading } = useClients(debouncedSearch, page, 25);
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const clients = useMemo(() => data?.clients ?? [], [data]);
  const pagination = data?.pagination;

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
    const id = setTimeout(() => setDebouncedSearch(val), 300);
    return () => clearTimeout(id);
  }, []);

  function handleSave(formData: Partial<Client>) {
    if (modalClient === "new") {
      createClient.mutate(formData, {
        onSuccess: () => { toast.success("Cliente creado"); setModalClient(null); },
        onError: () => toast.error("Error al crear cliente"),
      });
    } else if (modalClient) {
      updateClient.mutate({ id: modalClient.id, ...formData }, {
        onSuccess: () => { toast.success("Cliente actualizado"); setModalClient(null); },
        onError: () => toast.error("Error al actualizar cliente"),
      });
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteClient.mutate(deleteTarget.id, {
      onSuccess: () => { toast.success("Cliente eliminado"); setDeleteTarget(null); },
      onError: () => toast.error("Error al eliminar cliente"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">Clientes</h1>
          <p className="text-sm text-[#8A8580]">
            {pagination ? `${pagination.total} clientes registrados` : "Cargando..."}
          </p>
        </div>
        <Button onClick={() => setModalClient("new")} className="bg-[#E87B5A] text-white hover:bg-[#D56E4F]">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8580]" />
        <Input value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar por nombre, email o telefono..." className="pl-8" />
      </div>

      <div className="rounded-[14px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E4DE]">
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Telefono</Th>
                <Th right>Gasto acum.</Th>
                <Th right>Valor vida</Th>
                <Th>Fuente</Th>
                <Th>Fecha alta</Th>
                <Th right>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#E8E4DE]/50">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <UserCheck className="mx-auto h-8 w-8 text-[#E8E4DE] mb-2" />
                    <p className="text-sm text-[#8A8580]">
                      {debouncedSearch ? "Sin resultados para esta busqueda" : "No hay clientes registrados"}
                    </p>
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="border-b border-[#E8E4DE]/50 hover:bg-[#FAF9F7] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#2D2A26]">{c.name}</td>
                    <td className="px-4 py-3 text-[#8A8580]">{c.email || "\u2014"}</td>
                    <td className="px-4 py-3 text-[#8A8580]">{c.phone || "\u2014"}</td>
                    <td className="px-4 py-3 text-right text-[#2D2A26]">{EUR.format(c.cumulativeSpend)}</td>
                    <td className="px-4 py-3 text-right text-[#2D2A26]">{EUR.format(c.lifetimeValue)}</td>
                    <td className="px-4 py-3">
                      {c.conversionSource ? (
                        <span className="inline-flex items-center rounded-md bg-[#E87B5A]/10 px-2 py-0.5 text-xs font-medium text-[#E87B5A]">
                          {c.conversionSource}
                        </span>
                      ) : (
                        <span className="text-[#8A8580]">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#8A8580]">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModalClient(c)} className="rounded-lg p-1.5 text-[#8A8580] hover:bg-[#E87B5A]/10 hover:text-[#E87B5A] transition-colors" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-[#8A8580] hover:bg-[#C75D4A]/10 hover:text-[#C75D4A] transition-colors" title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E8E4DE] px-4 py-3">
            <p className="text-xs text-[#8A8580]">Pagina {pagination.page} de {pagination.totalPages}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {modalClient && (
        <ClientModal
          client={modalClient === "new" ? null : modalClient}
          onClose={() => setModalClient(null)}
          onSave={handleSave}
          saving={createClient.isPending || updateClient.isPending}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleteClient.isPending}
        />
      )}
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold text-[#8A8580] uppercase tracking-wider ${right ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}
