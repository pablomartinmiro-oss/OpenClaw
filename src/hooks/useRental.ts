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

// ==================== TYPES ====================

export interface RentalInventoryItem {
  id: string;
  tenantId: string;
  stationSlug: string;
  equipmentType: string;
  size: string;
  qualityTier: string;
  totalQuantity: number;
  availableQuantity: number;
  minStockAlert: number;
  condition: string;
  lastMaintenanceAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalOrderItem {
  id: string;
  rentalOrderId: string;
  participantName: string;
  equipmentType: string;
  size: string | null;
  qualityTier: string;
  dinSetting: number | null;
  itemStatus: string;
  conditionOnReturn: string | null;
  damageNotes: string | null;
  unitPrice: number;
  serialNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalOrder {
  id: string;
  tenantId: string;
  reservationId: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  stationSlug: string;
  pickupDate: string;
  returnDate: string;
  status: string;
  preparedAt: string | null;
  pickedUpAt: string | null;
  returnedAt: string | null;
  inspectedAt: string | null;
  cancelledAt: string | null;
  totalPrice: number;
  discount: number;
  paymentStatus: string;
  depositCents: number;
  depositReturned: boolean;
  signatureUrl: string | null;
  damageNotes: string | null;
  notes: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: RentalOrderItem[];
  reservation?: {
    id: string;
    clientName: string;
    activityDate: string;
    station?: string;
  } | null;
}

export interface CustomerSizingProfile {
  id: string;
  tenantId: string;
  clientEmail: string;
  clientName: string;
  clientPhone: string | null;
  height: number | null;
  weight: number | null;
  shoeSize: string | null;
  age: number | null;
  abilityLevel: string | null;
  bootSoleLength: number | null;
  preferredDinSetting: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalDashboard {
  pickupsToday: number;
  returnsToday: number;
  activeRentals: number;
  completedToday: number;
  maintenanceCount: number;
  availableUnits: number;
  lowStockAlerts: {
    stationSlug: string;
    equipmentType: string;
    size: string;
    qualityTier: string;
    availableQuantity: number;
    minStockAlert: number;
  }[];
  revenueToday: number;
  last7Days: { date: string; count: number }[];
  upcomingReturns: {
    id: string;
    clientName: string;
    stationSlug: string;
    returnDate: string;
    status: string;
    depositCents: number;
  }[];
}

// ==================== INVENTORY ====================

const invKeys = [["rentalInventory"]];

export function useRentalInventory(
  stationSlug?: string,
  equipmentType?: string,
  qualityTier?: string
) {
  const url = buildUrl("/api/rental/inventory", {
    stationSlug,
    equipmentType,
    qualityTier,
  });
  return useQuery<{ inventory: RentalInventoryItem[] }>({
    queryKey: ["rentalInventory", stationSlug, equipmentType, qualityTier],
    queryFn: () => fetchJSON(url),
  });
}

type CreateInv = {
  stationSlug: string;
  equipmentType: string;
  size: string;
  qualityTier: string;
  totalQuantity: number;
  availableQuantity: number;
  minStockAlert?: number;
  notes?: string | null;
};
type UpdateInv = { id: string } & Partial<CreateInv>;

export const useCreateRentalInventory = () =>
  useMut<CreateInv>("/api/rental/inventory", "POST", invKeys);
export const useUpdateRentalInventory = () =>
  useMutWithId<UpdateInv>("/api/rental/inventory", "PATCH", invKeys);
export const useDeleteRentalInventory = () =>
  useDelById("/api/rental/inventory", invKeys);

// ==================== ORDERS ====================

const orderKeys = [["rentalOrders"], ["rentalDashboard"], ["rentalInventory"]];

export function useRentalOrders(
  status?: string,
  stationSlug?: string,
  dateFrom?: string,
  dateTo?: string,
  search?: string
) {
  const url = buildUrl("/api/rental/orders", {
    status,
    stationSlug,
    dateFrom,
    dateTo,
    search,
  });
  return useQuery<{ orders: RentalOrder[] }>({
    queryKey: ["rentalOrders", status, stationSlug, dateFrom, dateTo, search],
    queryFn: () => fetchJSON(url),
  });
}

export function useRentalOrder(id: string) {
  return useQuery<{ order: RentalOrder }>({
    queryKey: ["rentalOrder", id],
    queryFn: () => fetchJSON(`/api/rental/orders/${id}`),
    enabled: !!id,
  });
}

type CreateOrder = {
  reservationId?: string | null;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  stationSlug: string;
  pickupDate: string;
  returnDate: string;
  totalPrice?: number;
  discount?: number;
  notes?: string | null;
  internalNotes?: string | null;
};
type UpdateOrder = {
  id: string;
  status?: string;
  paymentStatus?: string;
} & Partial<CreateOrder>;

export const useCreateRentalOrder = () =>
  useMut<CreateOrder>("/api/rental/orders", "POST", orderKeys);
export const useUpdateRentalOrder = () =>
  useMutWithId<UpdateOrder>("/api/rental/orders", "PATCH", orderKeys);
export const useDeleteRentalOrder = () =>
  useDelById("/api/rental/orders", orderKeys);

// ==================== ORDER ITEMS ====================

export function useRentalOrderItems(orderId: string) {
  return useQuery<{ items: RentalOrderItem[] }>({
    queryKey: ["rentalOrderItems", orderId],
    queryFn: () => fetchJSON(`/api/rental/orders/${orderId}/items`),
    enabled: !!orderId,
  });
}

type CreateItem = {
  participantName: string;
  equipmentType: string;
  size?: string | null;
  qualityTier: string;
  dinSetting?: number | null;
  unitPrice?: number;
};

export function useCreateRentalOrderItem(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateItem) => {
      const res = await fetch(`/api/rental/orders/${orderId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rentalOrderItems", orderId] });
      qc.invalidateQueries({ queryKey: ["rentalOrder", orderId] });
      qc.invalidateQueries({ queryKey: ["rentalOrders"] });
    },
  });
}

export function useUpdateRentalOrderItem(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { itemId: string } & Record<string, unknown>) => {
      const { itemId, ...data } = input;
      const res = await fetch(
        `/api/rental/orders/${orderId}/items/${itemId}`,
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
      qc.invalidateQueries({ queryKey: ["rentalOrderItems", orderId] });
      qc.invalidateQueries({ queryKey: ["rentalOrder", orderId] });
    },
  });
}

export function useDeleteRentalOrderItem(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(
        `/api/rental/orders/${orderId}/items/${itemId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rentalOrderItems", orderId] });
      qc.invalidateQueries({ queryKey: ["rentalOrder", orderId] });
      qc.invalidateQueries({ queryKey: ["rentalOrders"] });
    },
  });
}

// ==================== PICKUP / RETURN ====================

type PickupPayload = {
  items: { itemId: string; size: string; dinSetting?: number | null }[];
  notes?: string;
};

type ReturnPayload = {
  items: {
    itemId: string;
    conditionOnReturn: "OK" | "NEEDS_SERVICE" | "DAMAGED";
    damageNotes?: string | null;
  }[];
  notes?: string;
};

export function usePickupRentalOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { orderId: string } & PickupPayload) => {
      const { orderId, ...data } = input;
      const res = await fetch(`/api/rental/orders/${orderId}/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rentalOrders"] });
      qc.invalidateQueries({ queryKey: ["rentalDashboard"] });
      qc.invalidateQueries({ queryKey: ["rentalInventory"] });
    },
  });
}

export function useReturnRentalOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { orderId: string } & ReturnPayload) => {
      const { orderId, ...data } = input;
      const res = await fetch(`/api/rental/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rentalOrders"] });
      qc.invalidateQueries({ queryKey: ["rentalDashboard"] });
      qc.invalidateQueries({ queryKey: ["rentalInventory"] });
    },
  });
}

// ==================== PROFILES ====================

const profileKeys = [["rentalProfiles"]];

export function useRentalProfiles(search?: string) {
  const url = buildUrl("/api/rental/profiles", { search });
  return useQuery<{ profiles: CustomerSizingProfile[] }>({
    queryKey: ["rentalProfiles", search],
    queryFn: () => fetchJSON(url),
  });
}

export function useRentalProfile(id: string) {
  return useQuery<{ profile: CustomerSizingProfile }>({
    queryKey: ["rentalProfile", id],
    queryFn: () => fetchJSON(`/api/rental/profiles/${id}`),
    enabled: !!id,
  });
}

type CreateProfile = {
  clientEmail: string;
  clientName: string;
  clientPhone?: string | null;
  height?: number | null;
  weight?: number | null;
  shoeSize?: string | null;
  age?: number | null;
  abilityLevel?: string | null;
  bootSoleLength?: number | null;
  preferredDinSetting?: number | null;
  notes?: string | null;
};
type UpdateProfile = { id: string } & Partial<CreateProfile>;

export const useCreateRentalProfile = () =>
  useMut<CreateProfile>("/api/rental/profiles", "POST", profileKeys);
export const useUpdateRentalProfile = () =>
  useMutWithId<UpdateProfile>("/api/rental/profiles", "PATCH", profileKeys);
export const useDeleteRentalProfile = () =>
  useDelById("/api/rental/profiles", profileKeys);

// ==================== DASHBOARD ====================

export function useRentalDashboard() {
  return useQuery<RentalDashboard>({
    queryKey: ["rentalDashboard"],
    queryFn: () => fetchJSON("/api/rental/dashboard"),
    refetchInterval: 60_000, // Refresh every minute
  });
}
