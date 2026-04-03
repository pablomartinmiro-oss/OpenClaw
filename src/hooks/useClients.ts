"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  notes: string | null;
  cumulativeSpend: number;
  lifetimeValue: number;
  conversionSource: string | null;
  acquiredAt: string;
  createdAt: string;
}

export function useClients(search?: string, page: number = 1, limit: number = 25) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));

  return useQuery<{ clients: Client[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>({
    queryKey: ["clients", search, page, limit],
    queryFn: () => fetchJSON(`/api/booking/clients?${params}`),
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const res = await fetch("/api/booking/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Client>) => {
      const res = await fetch(`/api/booking/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/booking/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}
