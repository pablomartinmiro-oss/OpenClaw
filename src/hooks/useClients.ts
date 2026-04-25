"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

export type SkiLevel = "principiante" | "intermedio" | "avanzado" | "experto";
export type HelmetSize = "S" | "M" | "L" | "XL";
export type ClientLanguage = "es" | "en" | "fr" | "de" | "pt";

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
  updatedAt: string;
  // Ski profile
  skiLevel: SkiLevel | null;
  preferredStation: string | null;
  bootSize: string | null;
  height: number | null;
  weight: number | null;
  helmetSize: HelmetSize | null;
  language: ClientLanguage | null;
  dni: string | null;
  // Lifetime metrics
  totalSpent: number; // cents
  visitCount: number;
  lastVisit: string | null;
}

export interface ClientStats {
  totalClients: number;
  avgSpent: number; // cents
  totalVisits: number;
  newThisMonth: number;
}

export interface ClientsResponse {
  clients: Client[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: ClientStats;
}

export interface ClientHistoryReservation {
  id: string;
  clientName: string;
  station: string;
  activityDate: string;
  status: string;
  totalPrice: number;
  source: string;
  createdAt: string;
}
export interface ClientHistoryQuote {
  id: string;
  clientName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paidAt: string | null;
}
export interface ClientHistory {
  reservations: ClientHistoryReservation[];
  quotes: ClientHistoryQuote[];
}

export interface ClientFilters {
  search?: string;
  skiLevel?: string;
  station?: string;
  source?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function useClients(filters: ClientFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.skiLevel) params.set("skiLevel", filters.skiLevel);
  if (filters.station) params.set("station", filters.station);
  if (filters.source) params.set("source", filters.source);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  params.set("page", String(filters.page ?? 1));
  params.set("limit", String(filters.limit ?? 25));

  return useQuery<ClientsResponse>({
    queryKey: ["clients", filters],
    queryFn: () => fetchJSON(`/api/booking/clients?${params}`),
  });
}

export function useClientHistory(clientId: string | null) {
  return useQuery<ClientHistory>({
    queryKey: ["client-history", clientId],
    enabled: !!clientId,
    queryFn: () => fetchJSON(`/api/booking/clients/${clientId}/history`),
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
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client-history", vars.id] });
    },
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
