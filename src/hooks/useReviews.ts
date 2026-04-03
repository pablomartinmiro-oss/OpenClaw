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

export interface Review {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  rating: number;
  authorName: string;
  authorEmail: string | null;
  title: string | null;
  body: string;
  stayDate: string | null;
  status: string;
  reply: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicReview {
  id: string;
  entityType: string;
  entityId: string;
  rating: number;
  authorName: string;
  title: string | null;
  body: string;
  stayDate: string | null;
  reply: string | null;
  createdAt: string;
}

// ==================== ADMIN HOOKS ====================

const reviewKeys = [["reviews"]];

export function useReviews(status?: string, entityType?: string) {
  const url = buildUrl("/api/reviews", { status, entityType });
  return useQuery<{ reviews: Review[] }>({
    queryKey: ["reviews", status, entityType],
    queryFn: () => fetchJSON(url),
  });
}

type CreateReview = {
  entityType: string;
  entityId: string;
  rating: number;
  authorName: string;
  authorEmail?: string | null;
  title?: string | null;
  body: string;
  stayDate?: string | null;
  status?: string;
};

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReview) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      reviewKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

type UpdateReview = {
  id: string;
  status?: string;
  reply?: string | null;
  rating?: number;
  title?: string | null;
  body?: string;
};

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateReview) => {
      const { id, ...data } = input;
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      reviewKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () =>
      reviewKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}

// ==================== PUBLIC HOOKS ====================

export function usePublicReviews(
  tenantId: string,
  entityType?: string,
  entityId?: string
) {
  const url = buildUrl("/api/reviews/public", {
    tenantId,
    entityType,
    entityId,
  });
  return useQuery<{ reviews: PublicReview[] }>({
    queryKey: ["publicReviews", tenantId, entityType, entityId],
    queryFn: () => fetchJSON(url),
    enabled: !!tenantId,
  });
}
