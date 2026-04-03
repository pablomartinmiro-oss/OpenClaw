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

// ==================== DISCOUNT CODES ====================
export interface DiscountCode {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expirationDate: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdById: string | null;
  createdAt: string;
  _count?: { uses: number };
}

export function useDiscountCodes(isActive?: boolean) {
  const url = buildUrl("/api/storefront/discount-codes", {
    isActive: isActive !== undefined ? String(isActive) : undefined,
  });
  return useQuery<{ codes: DiscountCode[] }>({
    queryKey: ["discountCodes", isActive],
    queryFn: () => fetchJSON(url),
  });
}

type CreateDC = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expirationDate?: string | null;
  maxUses?: number;
  isActive?: boolean;
};
type UpdateDC = {
  id: string;
  code?: string;
  type?: "percentage" | "fixed";
  value?: number;
  expirationDate?: string | null;
  maxUses?: number;
  isActive?: boolean;
};

const dcKeys = [["discountCodes"]];
export const useCreateDiscountCode = () =>
  useMut<CreateDC>("/api/storefront/discount-codes", "POST", dcKeys);
export const useUpdateDiscountCode = () =>
  useMutWithId<UpdateDC>("/api/storefront/discount-codes", "PATCH", dcKeys);
export const useDeleteDiscountCode = () =>
  useDelById("/api/storefront/discount-codes", dcKeys);

// ==================== APPLY DISCOUNT ====================
export interface ApplyResult {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  code: DiscountCode;
}

export function useApplyDiscount() {
  return useMutation({
    mutationFn: async (data: { code: string; amount: number }) => {
      const res = await fetch("/api/storefront/discount-codes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<ApplyResult>;
    },
  });
}

// ==================== COMPENSATION VOUCHERS ====================
export interface CompensationVoucher {
  id: string;
  code: string;
  cancellationId: string | null;
  type: "activity" | "monetary" | "service";
  value: number;
  expirationDate: string | null;
  isUsed: boolean;
  linkedDiscountCodeId: string | null;
  createdAt: string;
}

export function useVouchers(isUsed?: boolean) {
  const url = buildUrl("/api/storefront/vouchers", {
    isUsed: isUsed !== undefined ? String(isUsed) : undefined,
  });
  return useQuery<{ vouchers: CompensationVoucher[] }>({
    queryKey: ["compensationVouchers", isUsed],
    queryFn: () => fetchJSON(url),
  });
}

type CreateVoucher = {
  cancellationId?: string | null;
  type: "activity" | "monetary" | "service";
  value: number;
  expirationDate?: string | null;
  linkedDiscountCodeId?: string | null;
};
type UpdateVoucher = {
  id: string;
  isUsed?: boolean;
  type?: "activity" | "monetary" | "service";
  value?: number;
  expirationDate?: string | null;
  linkedDiscountCodeId?: string | null;
};

const vKeys = [["compensationVouchers"]];
export const useCreateVoucher = () =>
  useMut<CreateVoucher>("/api/storefront/vouchers", "POST", vKeys);
export const useUpdateVoucher = () =>
  useMutWithId<UpdateVoucher>("/api/storefront/vouchers", "PATCH", vKeys);
export const useDeleteVoucher = () =>
  useDelById("/api/storefront/vouchers", vKeys);

// ==================== USAGE HISTORY ====================
export interface DiscountCodeUse {
  id: string;
  codeId: string;
  originalAmount: number;
  finalAmount: number;
  discountAmount: number;
  channel: string;
  reservationId: string | null;
  saleId: string | null;
  appliedAt: string;
  code: { code: string; type: string; value: number };
}

export function useDiscountUsage() {
  return useQuery<{ usage: DiscountCodeUse[] }>({
    queryKey: ["discountUsage"],
    queryFn: () => fetchJSON("/api/storefront/usage"),
  });
}
