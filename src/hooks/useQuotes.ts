"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string | null;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  // Per-product variables
  startDate: string | null;
  endDate: string | null;
  numDays: number | null;
  numPersons: number | null;
  ageDetails: Array<{ age: number; type: string }> | null;
  station: string | null;
  modalidad: string | null;
  nivel: string | null;
  sector: string | null;
  idioma: string | null;
  horario: string | null;
  puntoEncuentro: string | null;
  tipoCliente: string | null;
  gama: string | null;
  casco: boolean | null;
  tipoActividad: string | null;
  regimen: string | null;
  alojamientoNombre: string | null;
  seguroIncluido: boolean | null;
  notes: string | null;
}

interface Quote {
  id: string;
  tenantId: string;
  ghlContactId: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientNotes: string | null;
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  wantsAccommodation: boolean;
  wantsForfait: boolean;
  wantsClases: boolean;
  wantsEquipment: boolean;
  status: string;
  source: string | null;
  totalAmount: number;
  expiresAt: string | null;
  sentAt: string | null;
  // Cancellation
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelType: string | null;
  cancelNotes: string | null;
  bonoCode: string | null;
  bonoAmount: number | null;
  bonoExpiresAt: string | null;
  refundStatus: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export function useQuotes(status?: string, destination?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (destination) params.set("destination", destination);
  const qs = params.toString();

  return useQuery({
    queryKey: ["quotes", status, destination],
    queryFn: () =>
      fetchJSON<{ quotes: Quote[] }>(`/api/quotes${qs ? `?${qs}` : ""}`),
    select: (data) => data.quotes,
  });
}

export function useQuote(id: string | null) {
  return useQuery({
    queryKey: ["quote", id],
    queryFn: () => fetchJSON<{ quote: Quote }>(`/api/quotes/${id}`),
    select: (data) => data.quote,
    enabled: !!id,
  });
}

export function useUpdateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetchJSON<{ quote: Quote }>(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useUpdateQuoteItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      quoteId,
      items,
    }: {
      quoteId: string;
      items: Omit<QuoteItem, "id" | "quoteId">[];
    }) =>
      fetchJSON<{ items: QuoteItem[]; totalAmount: number }>(
        `/api/quotes/${quoteId}/items`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useAddQuoteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      quoteId,
      ...data
    }: { quoteId: string } & Record<string, unknown>) =>
      fetchJSON<{ item: QuoteItem; totalAmount: number }>(
        `/api/quotes/${quoteId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJSON<{ quote: Quote }>("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJSON<{ success: boolean }>(`/api/quotes/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useSendQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/quotes/${id}/send`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al enviar");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useMarkPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paymentMethod,
      paymentRef,
    }: {
      id: string;
      paymentMethod: string;
      paymentRef?: string;
    }) => {
      const res = await fetch(`/api/quotes/${id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, paymentRef }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al marcar como pagado");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

export function useQuoteDraftCount() {
  return useQuery({
    queryKey: ["quotes", "count", "borrador"],
    queryFn: () => fetchJSON<{ borrador: number }>("/api/quotes/count"),
    select: (data) => data.borrador,
    refetchInterval: 60_000,
  });
}

export function useCancelQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reason,
      notes,
      action,
      iban,
      titular,
    }: {
      id: string;
      reason: string;
      notes?: string;
      action?: "bono" | "devolucion";
      iban?: string;
      titular?: string;
    }) => {
      const res = await fetch(`/api/quotes/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, notes, action, iban, titular }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cancelar");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quote"] });
    },
  });
}

// ==================== TASKS ====================

interface Task {
  id: string;
  tenantId: string;
  quoteId: string;
  quoteItemId: string | null;
  type: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  assignedTo: string | null;
  completedAt: string | null;
  createdAt: string;
  quote?: { id: string; clientName: string; destination: string };
  quoteItem?: { id: string; name: string; category: string | null };
}

export function useTasks(quoteId?: string, status?: string) {
  const params = new URLSearchParams();
  if (quoteId) params.set("quoteId", quoteId);
  if (status) params.set("status", status);
  const qs = params.toString();

  return useQuery({
    queryKey: ["tasks", quoteId, status],
    queryFn: () => fetchJSON<{ tasks: Task[] }>(`/api/tasks${qs ? `?${qs}` : ""}`),
    select: (data) => data.tasks,
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      fetchJSON<{ task: Task }>("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export type { Quote, QuoteItem, Task };
