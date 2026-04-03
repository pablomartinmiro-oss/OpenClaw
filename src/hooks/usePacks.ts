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

// ==================== PACKS ====================

export interface LegoPackLine {
  id: string;
  tenantId: string;
  packId: string;
  productId: string | null;
  roomTypeId: string | null;
  treatmentId: string | null;
  quantity: number;
  isRequired: boolean;
  isOptional: boolean;
  isClientEditable: boolean;
  overridePrice: number | null;
  sortOrder: number;
  createdAt: string;
}

export interface LegoPack {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  categoryId: string | null;
  price: number;
  images: string[];
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lines?: LegoPackLine[];
  _count?: { lines: number };
}

export function usePacks(isActive?: boolean) {
  const url = buildUrl("/api/packs", {
    isActive: isActive !== undefined ? String(isActive) : undefined,
  });
  return useQuery<{ packs: LegoPack[] }>({
    queryKey: ["packs", isActive],
    queryFn: () => fetchJSON(url),
  });
}

export function usePack(id: string) {
  return useQuery<{ pack: LegoPack }>({
    queryKey: ["pack", id],
    queryFn: () => fetchJSON(`/api/packs/${id}`),
    enabled: !!id,
  });
}

type CreatePack = {
  title: string;
  slug?: string;
  categoryId?: string | null;
  price?: number;
  images?: string[];
  description?: string | null;
  isActive?: boolean;
};
type UpdatePack = { id: string } & Partial<CreatePack>;
const packKeys = [["packs"]];

export const useCreatePack = () =>
  useMut<CreatePack>("/api/packs", "POST", packKeys);
export const useUpdatePack = () =>
  useMutWithId<UpdatePack>("/api/packs", "PATCH", packKeys);
export const useDeletePack = () =>
  useDelById("/api/packs", packKeys);

// ==================== PACK LINES ====================

export function usePackLines(packId: string) {
  return useQuery<{ lines: LegoPackLine[] }>({
    queryKey: ["packLines", packId],
    queryFn: () => fetchJSON(`/api/packs/${packId}/lines`),
    enabled: !!packId,
  });
}

type CreatePackLine = {
  productId?: string | null;
  roomTypeId?: string | null;
  treatmentId?: string | null;
  quantity?: number;
  isRequired?: boolean;
  isOptional?: boolean;
  isClientEditable?: boolean;
  overridePrice?: number | null;
  sortOrder?: number;
};

export function useCreatePackLine(packId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePackLine) => {
      const res = await fetch(`/api/packs/${packId}/lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["packLines", packId] });
      qc.invalidateQueries({ queryKey: ["pack", packId] });
      qc.invalidateQueries({ queryKey: ["packs"] });
    },
  });
}

export function useUpdatePackLine(packId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<CreatePackLine>) => {
      const { id, ...data } = input;
      const res = await fetch(`/api/packs/${packId}/lines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["packLines", packId] });
      qc.invalidateQueries({ queryKey: ["pack", packId] });
    },
  });
}

export function useDeletePackLine(packId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lineId: string) => {
      const res = await fetch(`/api/packs/${packId}/lines/${lineId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["packLines", packId] });
      qc.invalidateQueries({ queryKey: ["pack", packId] });
      qc.invalidateQueries({ queryKey: ["packs"] });
    },
  });
}
