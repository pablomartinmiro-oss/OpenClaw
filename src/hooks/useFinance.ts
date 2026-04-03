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

// ==================== INVOICES ====================
export interface InvoiceLine {
  id: string; invoiceId: string; description: string; quantity: number;
  unitPrice: number; lineTotal: number; taxRate: number; fiscalRegime: string;
}

export interface Invoice {
  id: string; number: string; clientId: string | null; status: string;
  subtotal: number; taxAmount: number; total: number; issuedAt: string | null;
  paidAt: string | null; pdfUrl: string | null; notes: string | null;
  lines: InvoiceLine[]; client?: { id: string; name: string } | null;
  _count?: { transactions: number }; createdAt: string;
}

export function useInvoices(status?: string, clientId?: string) {
  const url = buildUrl("/api/finance/invoices", { status, clientId });
  return useQuery<{ invoices: Invoice[] }>({
    queryKey: ["invoices", status, clientId], queryFn: () => fetchJSON(url),
  });
}

export function useInvoice(id: string) {
  return useQuery<{ invoice: Invoice }>({
    queryKey: ["invoice", id], queryFn: () => fetchJSON(`/api/finance/invoices/${id}`), enabled: !!id,
  });
}

type CreateInvoice = {
  clientId?: string | null; notes?: string | null; status?: string;
  lines: { description: string; quantity: number; unitPrice: number; taxRate?: number; fiscalRegime?: string }[];
};
type UpdateInvoice = { id: string; status?: string; notes?: string | null; clientId?: string | null };
const invKeys = [["invoices"]];
export const useCreateInvoice = () => useMut<CreateInvoice>("/api/finance/invoices", "POST", invKeys);
export const useUpdateInvoice = () => useMutWithId<UpdateInvoice>("/api/finance/invoices", "PATCH", invKeys);
export const useDeleteInvoice = () => useDelById("/api/finance/invoices", invKeys);

// ==================== TRANSACTIONS ====================
export interface Transaction {
  id: string; invoiceId: string | null; date: string; amount: number;
  method: string; status: string; reference: string | null; createdAt: string;
}

export function useTransactions(invoiceId?: string, method?: string, status?: string) {
  const url = buildUrl("/api/finance/transactions", { invoiceId, method, status });
  return useQuery<{ transactions: Transaction[] }>({
    queryKey: ["transactions", invoiceId, method, status], queryFn: () => fetchJSON(url),
  });
}

type CreateTransaction = { invoiceId?: string; date: string; amount: number; method: string; status?: string; reference?: string };
type UpdateTransaction = { id: string; status?: string; reference?: string; method?: string; amount?: number };
const txKeys = [["transactions"], ["invoices"]];
export const useCreateTransaction = () => useMut<CreateTransaction>("/api/finance/transactions", "POST", txKeys);
export const useUpdateTransaction = () => useMutWithId<UpdateTransaction>("/api/finance/transactions", "PATCH", txKeys);
export const useDeleteTransaction = () => useDelById("/api/finance/transactions", txKeys);

// ==================== COST CENTERS ====================
export interface CostCenter {
  id: string; name: string; code: string; active: boolean;
  _count?: { expenses: number }; createdAt: string;
}

export function useCostCenters() {
  return useQuery<{ costCenters: CostCenter[] }>({
    queryKey: ["costCenters"], queryFn: () => fetchJSON("/api/finance/cost-centers"),
  });
}

type CreateCC = { name: string; code: string; active?: boolean };
type UpdateCC = { id: string; name?: string; code?: string; active?: boolean };
const ccKeys = [["costCenters"]];
export const useCreateCostCenter = () => useMut<CreateCC>("/api/finance/cost-centers", "POST", ccKeys);
export const useUpdateCostCenter = () => useMutWithId<UpdateCC>("/api/finance/cost-centers", "PATCH", ccKeys);
export const useDeleteCostCenter = () => useDelById("/api/finance/cost-centers", ccKeys);

// ==================== EXPENSE CATEGORIES ====================
export interface ExpenseCategory {
  id: string; name: string; code: string;
  _count?: { expenses: number }; createdAt: string;
}

export function useExpenseCategories() {
  return useQuery<{ categories: ExpenseCategory[] }>({
    queryKey: ["expenseCategories"], queryFn: () => fetchJSON("/api/finance/expense-categories"),
  });
}

type CreateEC = { name: string; code: string };
type UpdateEC = { id: string; name?: string; code?: string };
const ecKeys = [["expenseCategories"]];
export const useCreateExpenseCategory = () => useMut<CreateEC>("/api/finance/expense-categories", "POST", ecKeys);
export const useUpdateExpenseCategory = () => useMutWithId<UpdateEC>("/api/finance/expense-categories", "PATCH", ecKeys);
export const useDeleteExpenseCategory = () => useDelById("/api/finance/expense-categories", ecKeys);

// ==================== EXPENSES ====================
export interface Expense {
  id: string; date: string; categoryId: string; costCenterId: string | null;
  concept: string; amount: number; paymentMethod: string; status: string;
  supplierId: string | null; category?: { name: string }; costCenter?: { name: string } | null;
  supplier?: { fiscalName: string } | null; createdAt: string;
}

export function useExpenses(categoryId?: string, costCenterId?: string, status?: string, supplierId?: string) {
  const url = buildUrl("/api/finance/expenses", { categoryId, costCenterId, status, supplierId });
  return useQuery<{ expenses: Expense[] }>({
    queryKey: ["expenses", categoryId, costCenterId, status, supplierId], queryFn: () => fetchJSON(url),
  });
}

export function useExpense(id: string) {
  return useQuery<{ expense: Expense }>({
    queryKey: ["expense", id], queryFn: () => fetchJSON(`/api/finance/expenses/${id}`), enabled: !!id,
  });
}

type CreateExp = {
  date: string; categoryId: string; costCenterId?: string | null; concept: string;
  amount: number; paymentMethod?: string; status?: string; supplierId?: string | null;
};
type UpdateExp = {
  id: string; date?: string; categoryId?: string; costCenterId?: string | null;
  concept?: string; amount?: number; paymentMethod?: string; status?: string; supplierId?: string | null;
};
const expKeys = [["expenses"]];
export const useCreateExpense = () => useMut<CreateExp>("/api/finance/expenses", "POST", expKeys);
export const useUpdateExpense = () => useMutWithId<UpdateExp>("/api/finance/expenses", "PATCH", expKeys);
export const useDeleteExpense = () => useDelById("/api/finance/expenses", expKeys);

// ==================== RECURRING EXPENSES ====================
export interface RecurringExpense {
  id: string; expenseId: string; pattern: string; nextDueDate: string;
  active: boolean; expense?: Expense; createdAt: string;
}

export function useRecurringExpenses() {
  return useQuery<{ recurringExpenses: RecurringExpense[] }>({
    queryKey: ["recurringExpenses"], queryFn: () => fetchJSON("/api/finance/recurring-expenses"),
  });
}

type CreateRE = { expenseId: string; pattern: string; nextDueDate: string; active?: boolean };
type UpdateRE = { id: string; pattern?: string; nextDueDate?: string; active?: boolean };
const reKeys = [["recurringExpenses"]];
export const useCreateRecurringExpense = () => useMut<CreateRE>("/api/finance/recurring-expenses", "POST", reKeys);
export const useUpdateRecurringExpense = () => useMutWithId<UpdateRE>("/api/finance/recurring-expenses", "PATCH", reKeys);
export const useDeleteRecurringExpense = () => useDelById("/api/finance/recurring-expenses", reKeys);
