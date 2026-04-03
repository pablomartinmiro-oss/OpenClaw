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

// ==================== ROOM TYPES ====================
export interface RoomType {
  id: string; title: string; slug: string; capacity: number; basePrice: number;
  description: string | null; images: string[]; active: boolean;
  _count?: { rates: number; blocks: number }; createdAt: string;
}

export function useRoomTypes(active?: boolean) {
  const url = buildUrl("/api/hotel/room-types", {
    active: active !== undefined ? String(active) : undefined,
  });
  return useQuery<{ roomTypes: RoomType[] }>({ queryKey: ["roomTypes", active], queryFn: () => fetchJSON(url) });
}

export function useRoomType(id: string) {
  return useQuery<{ roomType: RoomType }>({
    queryKey: ["roomType", id], queryFn: () => fetchJSON(`/api/hotel/room-types/${id}`), enabled: !!id,
  });
}

type CreateRT = { title: string; slug?: string; capacity: number; basePrice: number; description?: string | null; images?: string[]; active?: boolean };
type UpdateRT = { id: string; title?: string; slug?: string; capacity?: number; basePrice?: number; description?: string | null; images?: string[]; active?: boolean };
const rtKeys = [["roomTypes"]];
export const useCreateRoomType = () => useMut<CreateRT>("/api/hotel/room-types", "POST", rtKeys);
export const useUpdateRoomType = () => useMutWithId<UpdateRT>("/api/hotel/room-types", "PATCH", rtKeys);
export const useDeleteRoomType = () => useDelById("/api/hotel/room-types", rtKeys);

// ==================== SEASONS ====================
export interface RoomRateSeason {
  id: string; name: string; startDate: string; endDate: string; createdAt: string;
}

export function useRoomSeasons() {
  return useQuery<{ seasons: RoomRateSeason[] }>({ queryKey: ["roomSeasons"], queryFn: () => fetchJSON("/api/hotel/seasons") });
}

type CreateSeason = { name: string; startDate: string; endDate: string };
type UpdateSeason = { id: string; name?: string; startDate?: string; endDate?: string };
const sKeys = [["roomSeasons"]];
export const useCreateRoomSeason = () => useMut<CreateSeason>("/api/hotel/seasons", "POST", sKeys);
export const useUpdateRoomSeason = () => useMutWithId<UpdateSeason>("/api/hotel/seasons", "PATCH", sKeys);
export const useDeleteRoomSeason = () => useDelById("/api/hotel/seasons", sKeys);

// ==================== RATES ====================
export interface RoomRate {
  id: string; roomTypeId: string; seasonId: string; dayOfWeek: number;
  price: number; supplement: number;
  roomType?: { title: string }; season?: { name: string };
}

export function useRoomRates(roomTypeId?: string, seasonId?: string) {
  const url = buildUrl("/api/hotel/rates", { roomTypeId, seasonId });
  return useQuery<{ rates: RoomRate[] }>({ queryKey: ["roomRates", roomTypeId, seasonId], queryFn: () => fetchJSON(url) });
}

type BulkRates = { roomTypeId: string; seasonId: string; rates: { dayOfWeek: number; price: number; supplement: number }[] };
export const useBulkSetRates = () => useMut<BulkRates>("/api/hotel/rates", "POST", [["roomRates"]]);

// ==================== BLOCKS ====================
export interface RoomBlock {
  id: string; roomTypeId: string; date: string; unitCount: number; reason: string;
  roomType?: { title: string };
}

export function useRoomBlocks(roomTypeId?: string, from?: string, to?: string) {
  const url = buildUrl("/api/hotel/blocks", { roomTypeId, from, to });
  return useQuery<{ blocks: RoomBlock[] }>({ queryKey: ["roomBlocks", roomTypeId, from, to], queryFn: () => fetchJSON(url) });
}

type CreateBlock = { roomTypeId: string; date: string; unitCount: number; reason: string };
export const useCreateRoomBlock = () => useMut<CreateBlock>("/api/hotel/blocks", "POST", [["roomBlocks"]]);
export const useDeleteRoomBlock = () => useDelById("/api/hotel/blocks", [["roomBlocks"]]);

// ==================== AVAILABILITY ====================
export interface AvailabilityDay {
  date: string; baseCapacity: number; blocked: number; available: number; rate: number | null;
}

export function useAvailability(roomTypeId?: string, from?: string, to?: string) {
  const url = buildUrl("/api/hotel/availability", { roomTypeId, from, to });
  return useQuery<{ availability: AvailabilityDay[] }>({
    queryKey: ["hotelAvailability", roomTypeId, from, to], queryFn: () => fetchJSON(url), enabled: !!roomTypeId && !!from && !!to,
  });
}
