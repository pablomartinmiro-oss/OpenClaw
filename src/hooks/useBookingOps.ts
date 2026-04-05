"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

// ==================== ACTIVITY BOOKINGS ====================
export interface ActivityBooking {
  id: string;
  tenantId: string;
  reservationId: string;
  activityDate: string;
  status: string;
  operationalNotes: string | null;
  arrivedClient: boolean;
  reservation?: { clientName: string; station: string; clientPhone: string | null };
  monitors?: { id: string; user: { id: string; name: string | null; email: string } }[];
  createdAt: string;
}

export function useActivityBookings(date?: string, status?: string) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  const url = `/api/booking/activities${params.toString() ? `?${params}` : ""}`;

  return useQuery<{ bookings: ActivityBooking[] }>({
    queryKey: ["activityBookings", date, status],
    queryFn: () => fetchJSON(url),
  });
}

export function useCreateActivityBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { reservationId: string; activityDate: string; status?: string; operationalNotes?: string | null }) => {
      const res = await fetch("/api/booking/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityBookings"] }),
  });
}

export function useUpdateActivityBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; operationalNotes?: string | null; arrivedClient?: boolean }) => {
      const res = await fetch(`/api/booking/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityBookings"] }),
  });
}

export function useDeleteActivityBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/booking/activities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityBookings"] }),
  });
}

// ==================== INCIDENTS ====================
export function useFlagActivityIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, incidentNotes }: { id: string; incidentNotes: string }) => {
      const res = await fetch(`/api/booking/activities/${id}/incident`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentNotes }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activityBookings"] });
      qc.invalidateQueries({ queryKey: ["unifiedCalendar"] });
    },
  });
}

// ==================== MONITORS ====================
export function useAssignMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bookingId: string; userId: string }) => {
      const res = await fetch("/api/booking/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityBookings"] }),
  });
}

export function useUnassignMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/booking/monitors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activityBookings"] }),
  });
}

// ==================== DAILY ORDERS ====================
export interface DailyOrder {
  id: string;
  tenantId: string;
  date: string;
  notes: string | null;
  generatedAt: string;
}

export function useDailyOrder(date?: string) {
  return useQuery<{ order: DailyOrder | null }>({
    queryKey: ["dailyOrder", date],
    queryFn: () => fetchJSON(`/api/booking/daily-orders?date=${date}`),
    enabled: !!date,
  });
}

export function useCreateDailyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; notes?: string | null }) => {
      const res = await fetch("/api/booking/daily-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyOrder"] }),
  });
}

// ==================== UNIFIED CALENDAR ====================

export interface CalendarActivity {
  id: string;
  activityDate: string;
  status: string;
  arrivedClient: boolean;
  operationalNotes: string | null;
  reservation?: {
    clientName: string;
    station: string;
    clientPhone: string | null;
    schedule: string;
    status: string;
  };
  monitors?: { id: string; user: { id: string; name: string | null; email: string } }[];
}

export interface CalendarRestaurantBooking {
  id: string;
  date: string;
  time: string;
  guestCount: number;
  status: string;
  specialRequests: string | null;
  restaurant: { title: string; slug: string };
  client?: { name: string; phone: string | null } | null;
}

export interface CalendarSpaSlot {
  id: string;
  date: string;
  time: string;
  booked: number;
  capacity: number;
  treatment: { title: string; duration: number };
  resource?: { name: string; type: string } | null;
}

export interface CalendarData {
  activities: CalendarActivity[];
  restaurantBookings: CalendarRestaurantBooking[];
  spaSlots: CalendarSpaSlot[];
  dailyOrder: DailyOrder | null;
  summary: { totalActivities: number; totalDiners: number; totalSpaClients: number };
}

export function useUnifiedCalendar(date?: string) {
  return useQuery<CalendarData>({
    queryKey: ["unifiedCalendar", date],
    queryFn: () => fetchJSON(`/api/booking/calendar?date=${date}`),
    enabled: !!date,
  });
}

export function useUpdateDailyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; notes?: string | null }) => {
      const res = await fetch(`/api/booking/daily-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dailyOrder"] }),
  });
}
