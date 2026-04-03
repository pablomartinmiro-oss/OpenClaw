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

export interface CashRegister {
  id: string;
  name: string;
  location: string | null;
  active: boolean;
  _count?: { sessions: number };
  createdAt: string;
}

export interface CashSession {
  id: string;
  registerId: string;
  openedById: string;
  openingAmount: number;
  closingAmount: number | null;
  totalCash: number | null;
  totalCard: number | null;
  totalBizum: number | null;
  discrepancy: number | null;
  status: string;
  openedAt: string;
  closedAt: string | null;
  register?: { id: string; name: string };
  openedBy?: { id: string; name: string };
  _count?: { movements: number; sales: number };
  movements?: CashMovement[];
  sales?: TpvSale[];
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface PaymentMethods {
  cash: number;
  card: number;
  bizum: number;
}

export interface TpvSaleItem {
  id: string;
  saleId: string;
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  discountAmount: number | null;
  fiscalRegime: string;
  taxPerLine: number;
}

export interface TpvSale {
  id: string;
  sessionId: string;
  ticketNumber: string;
  date: string;
  totalAmount: number;
  discountApplied: number | null;
  totalTax: number;
  paymentMethods: PaymentMethods;
  clientId: string | null;
  items?: TpvSaleItem[];
  session?: { id: string; register: { name: string } };
}

// ==================== REGISTERS ====================

export function useRegisters() {
  return useQuery<{ registers: CashRegister[] }>({
    queryKey: ["tpvRegisters"],
    queryFn: () => fetchJSON("/api/tpv/registers"),
  });
}

type CreateReg = { name: string; location?: string | null; active?: boolean };
type UpdateReg = { id: string; name?: string; location?: string | null; active?: boolean };

export function useCreateRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReg) => {
      const res = await fetch("/api/tpv/registers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tpvRegisters"] }),
  });
}

export function useUpdateRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateReg) => {
      const res = await fetch(`/api/tpv/registers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tpvRegisters"] }),
  });
}

export function useDeleteRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tpv/registers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tpvRegisters"] }),
  });
}

// ==================== SESSIONS ====================

export function useSessions(registerId?: string, status?: string) {
  const url = buildUrl("/api/tpv/sessions", { registerId, status });
  return useQuery<{ sessions: CashSession[] }>({
    queryKey: ["tpvSessions", registerId, status],
    queryFn: () => fetchJSON(url),
  });
}

export function useSession(id: string) {
  return useQuery<{ session: CashSession }>({
    queryKey: ["tpvSession", id],
    queryFn: () => fetchJSON(`/api/tpv/sessions/${id}`),
    enabled: !!id,
  });
}

export function useOpenSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { registerId: string; openingAmount: number }) => {
      const res = await fetch("/api/tpv/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tpvSessions"] }),
  });
}

type CloseData = {
  id: string;
  closingAmount: number;
  totalCash: number;
  totalCard: number;
  totalBizum: number;
};

export function useCloseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: CloseData) => {
      const res = await fetch(`/api/tpv/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tpvSessions"] });
      qc.invalidateQueries({ queryKey: ["tpvSession"] });
    },
  });
}

// ==================== MOVEMENTS ====================

export function useMovements(sessionId: string) {
  return useQuery<{ movements: CashMovement[] }>({
    queryKey: ["tpvMovements", sessionId],
    queryFn: () => fetchJSON(`/api/tpv/sessions/${sessionId}/movements`),
    enabled: !!sessionId,
  });
}

type CreateMov = { type: string; amount: number; reason: string };

export function useCreateMovement(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMov) => {
      const res = await fetch(`/api/tpv/sessions/${sessionId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sessionId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tpvMovements", sessionId] });
      qc.invalidateQueries({ queryKey: ["tpvSession", sessionId] });
    },
  });
}

export function useDeleteMovement(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (movId: string) => {
      const res = await fetch(
        `/api/tpv/sessions/${sessionId}/movements/${movId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tpvMovements", sessionId] });
      qc.invalidateQueries({ queryKey: ["tpvSession", sessionId] });
    },
  });
}

// ==================== SALES ====================

export function useSales(sessionId?: string, date?: string) {
  const url = buildUrl("/api/tpv/sales", { sessionId, date });
  return useQuery<{ sales: TpvSale[] }>({
    queryKey: ["tpvSales", sessionId, date],
    queryFn: () => fetchJSON(url),
  });
}

export function useSale(id: string) {
  return useQuery<{ sale: TpvSale }>({
    queryKey: ["tpvSale", id],
    queryFn: () => fetchJSON(`/api/tpv/sales/${id}`),
    enabled: !!id,
  });
}

type CreateSaleItem = {
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number | null;
  fiscalRegime?: string;
  taxRate?: number;
};

type CreateSale = {
  sessionId: string;
  date?: string;
  discountApplied?: number | null;
  paymentMethods: PaymentMethods;
  clientId?: string | null;
  items: CreateSaleItem[];
};

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSale) => {
      const res = await fetch("/api/tpv/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tpvSales"] });
      qc.invalidateQueries({ queryKey: ["tpvSessions"] });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tpv/sales/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tpvSales"] });
      qc.invalidateQueries({ queryKey: ["tpvSessions"] });
    },
  });
}
