"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

// ==================== TYPES ====================

export interface PayrollExtra {
  id: string;
  concept: string;
  type: string;
  amount: number;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  year: number;
  month: number;
  baseSalary: number;
  totalExtras: number;
  totalAmount: number;
  status: string;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  extras: PayrollExtra[];
}

// ==================== LIST ====================

export function usePayrollRecords(year: number, month: number) {
  return useQuery<{ records: PayrollRecord[] }>({
    queryKey: ["payroll", year, month],
    queryFn: () => fetchJSON(`/api/payroll?year=${year}&month=${month}`),
  });
}

// ==================== CREATE ====================

export function useCreatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      year: number;
      month: number;
      baseSalary: number;
      notes?: string | null;
    }) => {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}

// ==================== UPDATE ====================

export function useUpdatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      baseSalary?: number;
      status?: string;
      notes?: string | null;
    }) => {
      const res = await fetch(`/api/payroll/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}

// ==================== DELETE ====================

export function useDeletePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/payroll/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}

// ==================== EXTRAS ====================

export function useCreatePayrollExtra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payrollId,
      ...data
    }: {
      payrollId: string;
      concept: string;
      type: string;
      amount: number;
    }) => {
      const res = await fetch(`/api/payroll/${payrollId}/extras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}

export function useDeletePayrollExtra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ payrollId, extraId }: { payrollId: string; extraId: string }) => {
      const res = await fetch(`/api/payroll/${payrollId}/extras/${extraId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}
