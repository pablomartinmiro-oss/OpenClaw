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

// ==================== EXTERNAL PLATFORMS ====================

export interface Platform {
  id: string;
  name: string;
  type: string;
  commissionPercentage: number;
  active: boolean;
  createdAt: string;
  _count?: { products: number };
}

export function usePlatforms() {
  return useQuery<{ platforms: Platform[] }>({
    queryKey: ["ticketingPlatforms"],
    queryFn: () => fetchJSON("/api/ticketing/platforms"),
  });
}

type CreatePlatform = {
  name: string;
  type?: string;
  commissionPercentage?: number;
  active?: boolean;
};
type UpdatePlatform = {
  id: string;
  name?: string;
  type?: string;
  commissionPercentage?: number;
  active?: boolean;
};
const platKeys = [["ticketingPlatforms"]];
export const useCreatePlatform = () =>
  useMut<CreatePlatform>("/api/ticketing/platforms", "POST", platKeys);
export const useUpdatePlatform = () =>
  useMutWithId<UpdatePlatform>("/api/ticketing/platforms", "PATCH", platKeys);
export const useDeletePlatform = () =>
  useDelById("/api/ticketing/platforms", platKeys);

// ==================== PLATFORM PRODUCTS ====================

export interface PlatformProduct {
  id: string;
  platformId: string;
  productId: string;
  externalId: string | null;
  externalUrl: string | null;
  status: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    category: string;
    station: string | null;
  };
}

export function usePlatformProducts(platformId: string) {
  return useQuery<{ products: PlatformProduct[] }>({
    queryKey: ["ticketingPlatformProducts", platformId],
    queryFn: () =>
      fetchJSON(`/api/ticketing/platforms/${platformId}/products`),
    enabled: !!platformId,
  });
}

type CreatePlatformProduct = {
  productId: string;
  externalId?: string | null;
  externalUrl?: string | null;
  status?: string;
};

export function useCreatePlatformProduct(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePlatformProduct) => {
      const res = await fetch(
        `/api/ticketing/platforms/${platformId}/products`,
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
      qc.invalidateQueries({
        queryKey: ["ticketingPlatformProducts", platformId],
      });
      qc.invalidateQueries({ queryKey: ["ticketingPlatforms"] });
    },
  });
}

export function useUpdatePlatformProduct(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: { id: string; externalId?: string | null; externalUrl?: string | null; status?: string }
    ) => {
      const { id, ...data } = input;
      const res = await fetch(
        `/api/ticketing/platforms/${platformId}/products/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["ticketingPlatformProducts", platformId],
      });
    },
  });
}

export function useDeletePlatformProduct(platformId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prodId: string) => {
      const res = await fetch(
        `/api/ticketing/platforms/${platformId}/products/${prodId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["ticketingPlatformProducts", platformId],
      });
      qc.invalidateQueries({ queryKey: ["ticketingPlatforms"] });
    },
  });
}

// ==================== COUPON REDEMPTIONS ====================

export interface CouponRedemption {
  id: string;
  code: string;
  email: string | null;
  phone: string | null;
  status: string;
  financialStatus: string;
  ocrExtraction: Record<string, unknown> | null;
  reservationId: string | null;
  redeemedAt: string | null;
  createdAt: string;
}

export function useRedemptions(filters?: {
  status?: string;
  code?: string;
  financialStatus?: string;
}) {
  const url = buildUrl("/api/ticketing/redemptions", {
    status: filters?.status,
    code: filters?.code,
    financialStatus: filters?.financialStatus,
  });
  return useQuery<{ redemptions: CouponRedemption[] }>({
    queryKey: ["ticketingRedemptions", filters],
    queryFn: () => fetchJSON(url),
  });
}

type CreateRedemption = {
  code: string;
  email?: string | null;
  phone?: string | null;
  status?: string;
  financialStatus?: string;
  ocrExtraction?: Record<string, unknown> | null;
  reservationId?: string | null;
  redeemedAt?: string | null;
};
type UpdateRedemption = { id: string } & Partial<CreateRedemption>;
const redKeys = [["ticketingRedemptions"]];
export const useCreateRedemption = () =>
  useMut<CreateRedemption>("/api/ticketing/redemptions", "POST", redKeys);
export const useUpdateRedemption = () =>
  useMutWithId<UpdateRedemption>("/api/ticketing/redemptions", "PATCH", redKeys);
export const useDeleteRedemption = () =>
  useDelById("/api/ticketing/redemptions", redKeys);

// ==================== COUPON EMAIL CONFIG ====================

export interface CouponEmailConfig {
  id: string;
  templateId: string;
  eventTrigger: string;
  enabled: boolean;
  createdAt: string;
}

export function useEmailConfigs() {
  return useQuery<{ configs: CouponEmailConfig[] }>({
    queryKey: ["ticketingEmailConfigs"],
    queryFn: () => fetchJSON("/api/ticketing/email-config"),
  });
}

type CreateEmailConfig = {
  templateId: string;
  eventTrigger: string;
  enabled?: boolean;
};
type UpdateEmailConfig = {
  id: string;
  templateId?: string;
  eventTrigger?: string;
  enabled?: boolean;
};
const emailKeys = [["ticketingEmailConfigs"]];
export const useCreateEmailConfig = () =>
  useMut<CreateEmailConfig>("/api/ticketing/email-config", "POST", emailKeys);
export const useUpdateEmailConfig = () =>
  useMutWithId<UpdateEmailConfig>("/api/ticketing/email-config", "PATCH", emailKeys);
export const useDeleteEmailConfig = () =>
  useDelById("/api/ticketing/email-config", emailKeys);

// ==================== BATCH COUPON SUBMISSION ====================

export interface BatchCouponInput {
  code: string;
  email?: string;
  phone?: string;
  platformId?: string;
  imageBase64?: string;
}

export interface BatchResult {
  index: number;
  code: string;
  status: "created" | "duplicate" | "error";
  redemptionId?: string;
  ocrConfidence?: string;
  hardDuplicate?: boolean;
  softDuplicate?: boolean;
  error?: string;
}

export function useBatchRedemption() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coupons: BatchCouponInput[]) => {
      const res = await fetch("/api/ticketing/redemptions/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupons }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{
        results: BatchResult[];
        summary: { total: number; created: number; duplicates: number };
      }>;
    },
    onSuccess: () =>
      redKeys.forEach((k) => qc.invalidateQueries({ queryKey: k })),
  });
}
