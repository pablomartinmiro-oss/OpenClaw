"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

// ==================== TYPES ====================

export interface ParticipantRecord {
  id: string;
  reservationId: string | null;
  firstName: string;
  lastName: string | null;
  birthDate: string | null;
  age: number | null;
  ageBracket: string | null;
  discipline: string;
  level: string;
  language: string;
  specialNeeds: string | null;
  relationship: string | null;
  phone: string | null;
}

export interface OperationalUnitRecord {
  id: string;
  participantId: string;
  reservationId: string | null;
  activityDate: string;
  planningMode: string;
  status: string;
  groupCellId: string | null;
  participant: ParticipantRecord;
  reservation: { clientName: string; station: string } | null;
  groupCell: { id: string; discipline: string; level: string; timeSlotStart: string } | null;
}

export interface GroupCellRecord {
  id: string;
  activityDate: string;
  station: string;
  timeSlotStart: string;
  timeSlotEnd: string;
  discipline: string;
  level: string;
  ageBracket: string | null;
  language: string;
  maxParticipants: number;
  instructorId: string | null;
  meetingPointId: string | null;
  status: string;
  notes: string | null;
  instructor: { id: string; tdLevel: string; user: { name: string | null } } | null;
  meetingPoint: { id: string; name: string } | null;
  units: Array<{
    id: string;
    participant: ParticipantRecord;
    reservation: { clientName: string; clientPhone: string } | null;
  }>;
  checkIns: Array<{ id: string; participantId: string; status: string }>;
  incidents: Array<{ id: string; type: string; severity: string; resolved: boolean }>;
  _count: { units: number; incidents: number };
}

export interface IncidentRecord {
  id: string;
  groupCellId: string;
  instructorId: string;
  participantId: string | null;
  type: string;
  severity: string;
  description: string;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  instructor: { user: { name: string | null } };
  groupCell: { discipline: string; level: string; timeSlotStart: string; timeSlotEnd: string };
}

export interface FreeDayRequestRecord {
  id: string;
  instructorId: string;
  requestDate: string;
  reason: string | null;
  status: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  instructor: { user: { name: string | null } };
}

// ==================== PARTICIPANTS ====================

export function useParticipants(reservationId: string | null) {
  return useQuery<{ participants: ParticipantRecord[] }>({
    queryKey: ["participants", reservationId],
    queryFn: () => fetchJSON(`/api/planning/participants?reservationId=${reservationId}`),
    enabled: !!reservationId,
  });
}

export function useCreateParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/planning/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["participants"] }),
  });
}

export function useUpdateParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const res = await fetch(`/api/planning/participants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["participants"] }),
  });
}

export function useDeleteParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/planning/participants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["participants"] }),
  });
}

// ==================== OPERATIONAL UNITS ====================

export function useOperationalUnits(filters?: { date?: string; status?: string; reservationId?: string }) {
  const params = new URLSearchParams();
  if (filters?.date) params.set("date", filters.date);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.reservationId) params.set("reservationId", filters.reservationId);
  const qs = params.toString();

  return useQuery<{ units: OperationalUnitRecord[] }>({
    queryKey: ["operational-units", qs],
    queryFn: () => fetchJSON(`/api/planning/units${qs ? `?${qs}` : ""}`),
  });
}

export function useGenerateUnits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: string) => {
      const res = await fetch("/api/planning/units/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operational-units"] }),
  });
}

// ==================== GROUP CELLS ====================

export function useGroupCells(filters?: { date?: string; station?: string; instructorId?: string }) {
  const params = new URLSearchParams();
  if (filters?.date) params.set("date", filters.date);
  if (filters?.station) params.set("station", filters.station);
  if (filters?.instructorId) params.set("instructorId", filters.instructorId);
  const qs = params.toString();

  return useQuery<{ groups: GroupCellRecord[] }>({
    queryKey: ["group-cells", qs],
    queryFn: () => fetchJSON(`/api/planning/groups${qs ? `?${qs}` : ""}`),
  });
}

export function useGroupCell(id: string | null) {
  return useQuery<{ group: GroupCellRecord }>({
    queryKey: ["group-cells", id],
    queryFn: () => fetchJSON(`/api/planning/groups/${id}`),
    enabled: !!id,
  });
}

export function useAutoGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; station: string }) => {
      const res = await fetch("/api/planning/groups/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-cells"] });
      qc.invalidateQueries({ queryKey: ["operational-units"] });
    },
  });
}

export function useUpdateGroupCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const res = await fetch(`/api/planning/groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-cells"] }),
  });
}

export function useDeleteGroupCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/planning/groups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-cells"] });
      qc.invalidateQueries({ queryKey: ["operational-units"] });
    },
  });
}

export function useMoveUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId, targetGroupCellId }: { unitId: string; targetGroupCellId: string }) => {
      const res = await fetch(`/api/planning/groups/${targetGroupCellId}/move-unit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, targetGroupCellId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-cells"] }),
  });
}

// ==================== AUTO-ASSIGN INSTRUCTORS ====================

export function useAutoAssignInstructors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { date: string; station: string }) => {
      const res = await fetch("/api/planning/assign-instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-cells"] }),
  });
}

// ==================== CHECK-IN ====================

export function useCheckIns(groupCellId: string | null) {
  return useQuery<{ checkIns: Array<{ id: string; participantId: string; status: string }> }>({
    queryKey: ["check-ins", groupCellId],
    queryFn: () => fetchJSON(`/api/planning/check-in?groupCellId=${groupCellId}`),
    enabled: !!groupCellId,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { groupCellId: string; participantId: string; status: string; notes?: string }) => {
      const res = await fetch("/api/planning/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["check-ins"] }),
  });
}

// ==================== INCIDENTS ====================

export function useIncidents(filters?: { resolved?: string; groupCellId?: string }) {
  const params = new URLSearchParams();
  if (filters?.resolved) params.set("resolved", filters.resolved);
  if (filters?.groupCellId) params.set("groupCellId", filters.groupCellId);
  const qs = params.toString();

  return useQuery<{ incidents: IncidentRecord[] }>({
    queryKey: ["incidents", qs],
    queryFn: () => fetchJSON(`/api/planning/incidents${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/planning/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useResolveIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; resolvedNotes?: string }) => {
      const res = await fetch(`/api/planning/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

// ==================== FREE DAY REQUESTS ====================

export function useFreeDayRequests(instructorId?: string) {
  const params = instructorId ? `?instructorId=${instructorId}` : "";
  return useQuery<{ requests: FreeDayRequestRecord[] }>({
    queryKey: ["free-days", instructorId],
    queryFn: () => fetchJSON(`/api/planning/free-days${params}`),
  });
}

export function useRequestFreeDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { requestDate: string; reason?: string }) => {
      const res = await fetch("/api/planning/free-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["free-days"] }),
  });
}

export function useReviewFreeDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status: string; reviewNotes?: string }) => {
      const res = await fetch(`/api/planning/free-days/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["free-days"] }),
  });
}

// ==================== CREATE GROUP CELL (MANUAL) ====================

export function useCreateGroupCell() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      activityDate: string;
      station: string;
      timeSlotStart: string;
      timeSlotEnd: string;
      discipline: string;
      level: string;
      ageBracket?: string | null;
      language?: string;
      maxParticipants?: number;
      instructorId?: string | null;
      notes?: string | null;
    }) => {
      const res = await fetch("/api/planning/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["group-cells"] }),
  });
}

// ==================== ADD WALK-IN PARTICIPANT TO GROUP ====================

export function useAddWalkInParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName?: string | null;
      age?: number | null;
      discipline: string;
      level: string;
      language?: string;
      phone?: string | null;
      groupCellId: string;
      activityDate?: string;
    }) => {
      const res = await fetch("/api/planning/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-cells"] });
      qc.invalidateQueries({ queryKey: ["operational-units"] });
      qc.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}

// ==================== OVERVIEW STATS ====================

export interface OverviewStats {
  todayGroups: number;
  todayStudents: number;
  todayInstructors: number;
  pendingUnits: number;
  unassignedGroups: number;
  openIncidents: number;
  pendingFreeDays: number;
  occupancy: number;
  morningGroups: number;
  afternoonGroups: number;
  byDiscipline: Array<{ discipline: string; count: number }>;
  recentIncidents: Array<{ id: string; type: string; severity: string; description: string; createdAt: string }>;
}

export function useOverviewStats(date: string, station?: string) {
  const params = new URLSearchParams({ date });
  if (station) params.set("station", station);
  return useQuery<OverviewStats>({
    queryKey: ["planning-overview", date, station],
    queryFn: () => fetchJSON(`/api/planning/overview?${params.toString()}`),
  });
}
