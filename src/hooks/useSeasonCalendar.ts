"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SeasonCalendarEntry {
  id: string;
  tenantId: string;
  station: string;
  season: "media" | "alta";
  startDate: string;
  endDate: string;
  label: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export function useSeasonCalendar() {
  return useQuery({
    queryKey: ["season-calendar"],
    queryFn: () =>
      fetchJSON<{ entries: SeasonCalendarEntry[] }>("/api/season-calendar"),
    select: (data) => data.entries,
  });
}

export function useCreateSeasonEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SeasonCalendarEntry, "id" | "tenantId" | "createdAt" | "updatedAt">) =>
      fetchJSON<{ entry: SeasonCalendarEntry }>("/api/season-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["season-calendar"] }),
  });
}

export function useUpdateSeasonEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<SeasonCalendarEntry> & { id: string }) =>
      fetchJSON<{ entry: SeasonCalendarEntry }>(`/api/season-calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["season-calendar"] }),
  });
}

export function useDeleteSeasonEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJSON<{ success: boolean }>(`/api/season-calendar/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["season-calendar"] }),
  });
}

export type { SeasonCalendarEntry };
