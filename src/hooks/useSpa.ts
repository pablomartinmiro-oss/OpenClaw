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

// ==================== SPA CATEGORIES ====================
export interface SpaCategory {
  id: string; name: string; slug: string; sortOrder: number;
  _count?: { treatments: number }; createdAt: string;
}

export function useSpaCategories() {
  return useQuery<{ categories: SpaCategory[] }>({
    queryKey: ["spaCategories"],
    queryFn: () => fetchJSON("/api/spa/categories"),
  });
}

type CreateCat = { name: string; slug?: string; sortOrder?: number };
type UpdateCat = { id: string; name?: string; slug?: string; sortOrder?: number };
const catKeys = [["spaCategories"]];
export const useCreateSpaCategory = () => useMut<CreateCat>("/api/spa/categories", "POST", catKeys);
export const useUpdateSpaCategory = () => useMutWithId<UpdateCat>("/api/spa/categories", "PATCH", catKeys);
export const useDeleteSpaCategory = () => useDelById("/api/spa/categories", catKeys);

// ==================== SPA TREATMENTS ====================
export interface SpaTreatment {
  id: string; tenantId: string; categoryId: string;
  title: string; slug: string; duration: number; capacity: number;
  price: number; images: string[]; description: string | null;
  supplierCommission: number | null; fiscalRegime: string;
  active: boolean; createdAt: string;
  category?: { id: string; name: string };
  _count?: { slots: number };
}

export function useSpaTreatments(categoryId?: string, active?: boolean) {
  const url = buildUrl("/api/spa/treatments", {
    categoryId,
    active: active !== undefined ? String(active) : undefined,
  });
  return useQuery<{ treatments: SpaTreatment[] }>({
    queryKey: ["spaTreatments", categoryId, active],
    queryFn: () => fetchJSON(url),
  });
}

export function useSpaTreatment(id: string) {
  return useQuery<{ treatment: SpaTreatment }>({
    queryKey: ["spaTreatment", id],
    queryFn: () => fetchJSON(`/api/spa/treatments/${id}`),
    enabled: !!id,
  });
}

type CreateTreat = {
  categoryId: string; title: string; slug?: string;
  duration: number; capacity?: number; price: number;
  images?: string[]; description?: string | null;
  supplierCommission?: number | null; fiscalRegime?: string;
  active?: boolean;
};
type UpdateTreat = { id: string } & Partial<CreateTreat>;
const treatKeys = [["spaTreatments"]];
export const useCreateSpaTreatment = () => useMut<CreateTreat>("/api/spa/treatments", "POST", treatKeys);
export const useUpdateSpaTreatment = () => useMutWithId<UpdateTreat>("/api/spa/treatments", "PATCH", treatKeys);
export const useDeleteSpaTreatment = () => useDelById("/api/spa/treatments", treatKeys);

// ==================== SPA RESOURCES ====================
export interface SpaResource {
  id: string; type: string; name: string; active: boolean;
  _count?: { slots: number }; createdAt: string;
}

export function useSpaResources(type?: string) {
  const url = buildUrl("/api/spa/resources", { type });
  return useQuery<{ resources: SpaResource[] }>({
    queryKey: ["spaResources", type],
    queryFn: () => fetchJSON(url),
  });
}

type CreateRes = { type: string; name: string; active?: boolean };
type UpdateRes = { id: string; type?: string; name?: string; active?: boolean };
const resKeys = [["spaResources"]];
export const useCreateSpaResource = () => useMut<CreateRes>("/api/spa/resources", "POST", resKeys);
export const useUpdateSpaResource = () => useMutWithId<UpdateRes>("/api/spa/resources", "PATCH", resKeys);
export const useDeleteSpaResource = () => useDelById("/api/spa/resources", resKeys);

// ==================== SPA SLOTS ====================
export interface SpaSlot {
  id: string; date: string; time: string; treatmentId: string;
  resourceId: string | null; capacity: number; booked: number;
  status: string; createdAt: string;
  treatment?: { id: string; title: string };
  resource?: { id: string; name: string } | null;
}

export function useSpaSlots(date?: string, treatmentId?: string, status?: string) {
  const url = buildUrl("/api/spa/slots", { date, treatmentId, status });
  return useQuery<{ slots: SpaSlot[] }>({
    queryKey: ["spaSlots", date, treatmentId, status],
    queryFn: () => fetchJSON(url),
  });
}

type CreateSlot = {
  date: string; time: string; treatmentId: string;
  resourceId?: string | null; capacity?: number; status?: string;
};
type UpdateSlot = { id: string; capacity?: number; booked?: number; status?: string };
const slotKeys = [["spaSlots"]];
export const useCreateSpaSlot = () => useMut<CreateSlot>("/api/spa/slots", "POST", slotKeys);
export const useUpdateSpaSlot = () => useMutWithId<UpdateSlot>("/api/spa/slots", "PATCH", slotKeys);
export const useDeleteSpaSlot = () => useDelById("/api/spa/slots", slotKeys);

// ==================== SPA SCHEDULE TEMPLATES ====================
export interface SpaScheduleTemplate {
  id: string; dayOfWeek: number; startTime: string; endTime: string;
  treatmentId: string | null; capacity: number;
  resourceIds: string[]; createdAt: string;
}

export function useSpaScheduleTemplates(dayOfWeek?: number) {
  const url = buildUrl("/api/spa/schedule-templates", {
    dayOfWeek: dayOfWeek !== undefined ? String(dayOfWeek) : undefined,
  });
  return useQuery<{ templates: SpaScheduleTemplate[] }>({
    queryKey: ["spaScheduleTemplates", dayOfWeek],
    queryFn: () => fetchJSON(url),
  });
}

type CreateTemplate = {
  dayOfWeek: number; startTime: string; endTime: string;
  treatmentId?: string | null; capacity?: number;
  resourceIds?: string[];
};
type UpdateTemplate = { id: string } & Partial<CreateTemplate>;
const tmplKeys = [["spaScheduleTemplates"]];
export const useCreateSpaScheduleTemplate = () =>
  useMut<CreateTemplate>("/api/spa/schedule-templates", "POST", tmplKeys);
export const useUpdateSpaScheduleTemplate = () =>
  useMutWithId<UpdateTemplate>("/api/spa/schedule-templates", "PATCH", tmplKeys);
export const useDeleteSpaScheduleTemplate = () =>
  useDelById("/api/spa/schedule-templates", tmplKeys);
