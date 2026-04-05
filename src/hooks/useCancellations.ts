"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ==================== TYPES ====================

export interface CancellationLog {
  id: string;
  previousStatus: string;
  newStatus: string;
  actorId: string;
  notes: string | null;
  timestamp: string;
}

export interface CancellationVoucher {
  id: string;
  code: string;
  value: number;
  isUsed: boolean;
  type: string;
  expirationDate: string | null;
}

export interface CancellationRequest {
  id: string;
  tenantId: string;
  reservationId: string | null;
  quoteId: string | null;
  reason: string | null;
  status: string;
  resolution: string | null;
  operationalStatus: string | null;
  financialStatus: string | null;
  refundAmount: number | null;
  creditNoteNumber: string | null;
  submissionDate: string;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  logs: CancellationLog[];
  vouchers: CancellationVoucher[];
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

// ==================== QUERIES ====================

export function useCancellations(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["cancellations", status],
    queryFn: () =>
      fetchJSON<{ requests: CancellationRequest[] }>(
        `/api/cancellations${qs}`
      ),
    select: (data) => data.requests,
  });
}

export function useCancellation(id: string | null) {
  return useQuery({
    queryKey: ["cancellation", id],
    queryFn: () =>
      fetchJSON<{ cancellation: CancellationRequest }>(
        `/api/cancellations/${id}`
      ),
    select: (data) => data.cancellation,
    enabled: !!id,
  });
}

// ==================== MUTATIONS ====================

export function useCreateCancellation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      reservationId?: string | null;
      quoteId?: string | null;
      reason?: string | null;
    }) =>
      fetchJSON<{ cancellation: CancellationRequest }>(
        "/api/cancellations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cancellations"] }),
  });
}

export function useUpdateCancellationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      status: string;
      resolution?: string;
      financialStatus?: string;
      refundAmount?: number;
      notes?: string;
    }) =>
      fetchJSON<{ cancellation: CancellationRequest }>(
        `/api/cancellations/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["cancellations"] });
      qc.invalidateQueries({ queryKey: ["cancellation", vars.id] });
    },
  });
}

export function useResolveCancellation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      resolution: string;
      refundAmount?: number;
      issueVoucher?: boolean;
      voucherType?: string;
      voucherValue?: number;
      voucherExpiration?: string | null;
      notes?: string;
    }) =>
      fetchJSON<{ cancellation: CancellationRequest }>(
        `/api/cancellations/${id}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["cancellations"] });
      qc.invalidateQueries({ queryKey: ["cancellation", vars.id] });
    },
  });
}

export function useDeleteCancellation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJSON<{ success: boolean }>(`/api/cancellations/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cancellations"] }),
  });
}

// ==================== VOUCHER LIFECYCLE ====================

export function useExtendVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      newExpirationDate,
    }: {
      id: string;
      newExpirationDate: string;
    }) =>
      fetchJSON(`/api/storefront/vouchers/${id}/extend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newExpirationDate }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cancellations"] });
      qc.invalidateQueries({ queryKey: ["cancellation"] });
    },
  });
}

export function useResendVoucher() {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      fetchJSON(`/api/storefront/vouchers/${id}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
  });
}
