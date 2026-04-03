"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

function buildUrl(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

function useMut<T>(url: string, method: string, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: T) => {
      const res = await fetch(url, {
        method,
        ...(method !== "DELETE" && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

function useMutWithId<T>(basePath: string, method: string, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: T & { id: string }) => {
      const { id, ...data } = input as Record<string, unknown> & { id: string };
      const res = await fetch(`${basePath}/${id}`, {
        method,
        ...(method !== "DELETE" && {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

function useDelById(basePath: string, keys: string[][]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${basePath}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== SUPPLIER TYPES ====================

export interface Supplier {
  id: string;
  fiscalName: string;
  commercialName: string | null;
  nif: string;
  iban: string | null;
  email: string | null;
  phone: string | null;
  commissionPercentage: number;
  paymentMethod: string;
  settlementFrequency: string;
  status: string;
  createdAt: string;
  _count?: { settlements: number };
}

export interface Settlement {
  id: string;
  supplierId: string;
  number: string;
  startDate: string;
  endDate: string;
  status: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  pdfUrl: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  supplier?: { id: string; fiscalName: string; commercialName: string | null };
  _count?: { lines: number; documents: number };
}

export interface SettlementLine {
  id: string;
  settlementId: string;
  serviceType: string;
  productId: string | null;
  serviceDate: string;
  paxCount: number;
  saleAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  createdAt: string;
}

// ==================== SUPPLIERS ====================

const supKeys = [["suppliers"]];
const setKeys = [["settlements"]];

export function useSuppliers(status?: string) {
  const url = buildUrl("/api/suppliers", {
    status: status !== undefined ? status : undefined,
  });
  return useQuery<{ suppliers: Supplier[] }>({
    queryKey: ["suppliers", status],
    queryFn: () => fetchJSON(url),
  });
}

export function useSupplier(id: string) {
  return useQuery<{ supplier: Supplier }>({
    queryKey: ["supplier", id],
    queryFn: () => fetchJSON(`/api/suppliers/${id}`),
    enabled: !!id,
  });
}

type CreateSup = {
  fiscalName: string;
  commercialName?: string | null;
  nif: string;
  iban?: string | null;
  email?: string | null;
  phone?: string | null;
  commissionPercentage?: number;
  paymentMethod?: string;
  settlementFrequency?: string;
  status?: string;
};
type UpdateSup = { id: string } & Partial<CreateSup>;

export const useCreateSupplier = () =>
  useMut<CreateSup>("/api/suppliers", "POST", supKeys);
export const useUpdateSupplier = () =>
  useMutWithId<UpdateSup>("/api/suppliers", "PATCH", supKeys);
export const useDeleteSupplier = () =>
  useDelById("/api/suppliers", supKeys);

// ==================== SETTLEMENTS ====================

export function useSettlements(supplierId?: string, status?: string) {
  const url = buildUrl("/api/suppliers/settlements", {
    supplierId,
    status,
  });
  return useQuery<{ settlements: Settlement[] }>({
    queryKey: ["settlements", supplierId, status],
    queryFn: () => fetchJSON(url),
  });
}

export function useSettlement(id: string) {
  return useQuery<{ settlement: Settlement & { lines: SettlementLine[] } }>({
    queryKey: ["settlement", id],
    queryFn: () => fetchJSON(`/api/suppliers/settlements/${id}`),
    enabled: !!id,
  });
}

type CreateSet = {
  supplierId: string;
  startDate: string;
  endDate: string;
  status?: string;
  pdfUrl?: string | null;
};
type UpdateSet = {
  id: string;
  status?: string;
  pdfUrl?: string | null;
  reason?: string | null;
};

export const useCreateSettlement = () =>
  useMut<CreateSet>("/api/suppliers/settlements", "POST", setKeys);
export const useUpdateSettlement = () =>
  useMutWithId<UpdateSet>("/api/suppliers/settlements", "PATCH", setKeys);
export const useDeleteSettlement = () =>
  useDelById("/api/suppliers/settlements", setKeys);

// ==================== SETTLEMENT LINES ====================

export function useAddSettlementLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      settlementId: string;
      serviceType: string;
      serviceDate: string;
      paxCount: number;
      saleAmount: number;
      commissionPercentage: number;
      commissionAmount: number;
      productId?: string | null;
      reservationId?: string | null;
      invoiceId?: string | null;
    }) => {
      const { settlementId, ...data } = input;
      const res = await fetch(
        `/api/suppliers/settlements/${settlementId}/lines`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settlements"] });
      qc.invalidateQueries({ queryKey: ["settlement"] });
    },
  });
}

export function useDeleteSettlementLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { settlementId: string; lineId: string }) => {
      const res = await fetch(
        `/api/suppliers/settlements/${input.settlementId}/lines/${input.lineId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settlements"] });
      qc.invalidateQueries({ queryKey: ["settlement"] });
    },
  });
}
