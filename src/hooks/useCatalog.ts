"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

// ==================== CATEGORIES ====================
interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  image: string | null;
  children?: { id: string; name: string; slug: string }[];
  createdAt: string;
}

export function useCategories(parentId?: string) {
  const params = new URLSearchParams();
  if (parentId) params.set("parentId", parentId);
  const url = `/api/catalog/categories${params.toString() ? `?${params}` : ""}`;

  return useQuery<{ categories: Category[] }>({
    queryKey: ["categories", parentId],
    queryFn: () => fetchJSON(url),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug?: string;
      parentId?: string | null;
      sortOrder?: number;
      image?: string | null;
    }) => {
      const res = await fetch("/api/catalog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      slug?: string;
      parentId?: string | null;
      sortOrder?: number;
      image?: string | null;
    }) => {
      const res = await fetch(`/api/catalog/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/catalog/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ==================== LOCATIONS ====================
interface Location {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  createdAt: string;
}

export function useLocations() {
  return useQuery<{ locations: Location[] }>({
    queryKey: ["locations"],
    queryFn: () => fetchJSON("/api/catalog/locations"),
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug?: string;
      latitude?: number | null;
      longitude?: number | null;
      description?: string | null;
    }) => {
      const res = await fetch("/api/catalog/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      slug?: string;
      latitude?: number | null;
      longitude?: number | null;
      description?: string | null;
    }) => {
      const res = await fetch(`/api/catalog/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/catalog/locations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });
}

// ==================== VARIANTS ====================
interface ExperienceVariant {
  id: string;
  tenantId: string;
  productId: string;
  label: string;
  priceModifier: number;
  priceType: string;
  createdAt: string;
}

export function useVariants(productId?: string) {
  const params = new URLSearchParams();
  if (productId) params.set("productId", productId);
  const url = `/api/catalog/variants${params.toString() ? `?${params}` : ""}`;

  return useQuery<{ variants: ExperienceVariant[] }>({
    queryKey: ["variants", productId],
    queryFn: () => fetchJSON(url),
    enabled: !!productId,
  });
}

export function useCreateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      label: string;
      priceModifier?: number;
      priceType?: string;
    }) => {
      const res = await fetch("/api/catalog/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["variants"] }),
  });
}

export function useUpdateVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      label?: string;
      priceModifier?: number;
      priceType?: string;
    }) => {
      const res = await fetch(`/api/catalog/variants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["variants"] }),
  });
}

export function useDeleteVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/catalog/variants/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["variants"] }),
  });
}

// ==================== TIME SLOTS ====================
interface ProductTimeSlot {
  id: string;
  tenantId: string;
  productId: string;
  type: string;
  startTime: string;
  endTime: string;
  capacity: number;
  dayOfWeek: number | null;
  priceOverride: number | null;
  createdAt: string;
}

export function useTimeSlots(productId?: string) {
  const params = new URLSearchParams();
  if (productId) params.set("productId", productId);
  const url = `/api/catalog/timeslots${params.toString() ? `?${params}` : ""}`;

  return useQuery<{ timeSlots: ProductTimeSlot[] }>({
    queryKey: ["timeSlots", productId],
    queryFn: () => fetchJSON(url),
    enabled: !!productId,
  });
}

export function useCreateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      type?: string;
      startTime: string;
      endTime: string;
      capacity?: number;
      dayOfWeek?: number | null;
      priceOverride?: number | null;
    }) => {
      const res = await fetch("/api/catalog/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeSlots"] }),
  });
}

export function useUpdateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      type?: string;
      startTime?: string;
      endTime?: string;
      capacity?: number;
      dayOfWeek?: number | null;
      priceOverride?: number | null;
    }) => {
      const res = await fetch(`/api/catalog/timeslots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeSlots"] }),
  });
}

export function useDeleteTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/catalog/timeslots/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timeSlots"] }),
  });
}

export type { Category, Location, ExperienceVariant, ProductTimeSlot };
