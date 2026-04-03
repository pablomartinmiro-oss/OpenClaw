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

// ==================== TYPES ====================

export interface ReavExpedient {
  id: string;
  tenantId: string;
  invoiceId: string;
  operationType: string;
  costPercentage: number;
  marginPercentage: number;
  marginAmount: number;
  taxableBase: number;
  vat: number;
  createdAt: string;
  updatedAt: string;
  invoice?: { id: string; number: string };
  _count?: { costs: number; documents: number };
  costs?: ReavCost[];
  documents?: ReavDocument[];
}

export interface ReavCost {
  id: string;
  expedientId: string;
  description: string;
  cost: number;
  notes: string | null;
  createdAt: string;
}

export interface ReavDocument {
  id: string;
  expedientId: string;
  type: string;
  url: string;
  uploadedAt: string;
}

// ==================== EXPEDIENTS ====================

export function useReavExpedients(invoiceId?: string) {
  const url = buildUrl("/api/reav/expedients", { invoiceId });
  return useQuery<{ expedients: ReavExpedient[] }>({
    queryKey: ["reaExpedients", invoiceId],
    queryFn: () => fetchJSON(url),
  });
}

export function useReavExpedient(id: string) {
  return useQuery<{ expedient: ReavExpedient }>({
    queryKey: ["reaExpedient", id],
    queryFn: () => fetchJSON(`/api/reav/expedients/${id}`),
    enabled: !!id,
  });
}

const expKeys = [["reaExpedients"]];

type CreateExpedient = {
  invoiceId: string;
  operationType?: string;
  costPercentage?: number;
  marginPercentage?: number;
  marginAmount?: number;
  taxableBase?: number;
  vat?: number;
};

export function useCreateReavExpedient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateExpedient) => {
      const res = await fetch("/api/reav/expedients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      expKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

type UpdateExpedient = {
  id: string;
  operationType?: string;
  costPercentage?: number;
  marginPercentage?: number;
  marginAmount?: number;
  taxableBase?: number;
  vat?: number;
};

export function useUpdateReavExpedient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateExpedient) => {
      const res = await fetch(`/api/reav/expedients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      expKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useDeleteReavExpedient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reav/expedients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      expKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== COSTS ====================

export function useAddReavCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: { expedientId: string; description: string; cost: number; notes?: string | null }
    ) => {
      const { expedientId, ...data } = input;
      const res = await fetch(`/api/reav/expedients/${expedientId}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reaExpedients"] });
      qc.invalidateQueries({ queryKey: ["reaExpedient"] });
    },
  });
}

export function useDeleteReavCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ expedientId, costId }: { expedientId: string; costId: string }) => {
      const res = await fetch(
        `/api/reav/expedients/${expedientId}/costs/${costId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reaExpedients"] });
      qc.invalidateQueries({ queryKey: ["reaExpedient"] });
    },
  });
}

// ==================== DOCUMENTS ====================

export function useAddReavDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: { expedientId: string; type: string; url: string }
    ) => {
      const { expedientId, ...data } = input;
      const res = await fetch(
        `/api/reav/expedients/${expedientId}/documents`,
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
      qc.invalidateQueries({ queryKey: ["reaExpedients"] });
      qc.invalidateQueries({ queryKey: ["reaExpedient"] });
    },
  });
}

export function useDeleteReavDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      expedientId,
      docId,
    }: {
      expedientId: string;
      docId: string;
    }) => {
      const res = await fetch(
        `/api/reav/expedients/${expedientId}/documents/${docId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reaExpedients"] });
      qc.invalidateQueries({ queryKey: ["reaExpedient"] });
    },
  });
}
