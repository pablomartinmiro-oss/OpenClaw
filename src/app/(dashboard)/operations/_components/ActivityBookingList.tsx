"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Circle,
  ChevronDown,
  ChevronRight,
  Phone,
  MapPin,
  UserPlus,
  X,
  AlertTriangle,
  Clock,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import type { ActivityBooking } from "@/hooks/useBookingOps";
import {
  useUpdateActivityBooking,
  useAssignMonitor,
  useUnassignMonitor,
  useFlagActivityIncident,
} from "@/hooks/useBookingOps";
import { useTeam } from "@/hooks/useSettings";
import { ActivityIncidentModal } from "./ActivityIncidentModal";
import ActivityBookingFilters, {
  EMPTY_FILTERS,
  type ActivityFilters,
} from "./ActivityBookingFilters";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Programada" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "in_progress", label: "En curso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "incident", label: "Incidencia" },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-[#8A8580]/15 text-[#8A8580]",
  pending: "bg-[#D4A853]/15 text-[#D4A853]",
  confirmed: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  in_progress: "bg-blue-500/15 text-blue-700",
  completed: "bg-[#5B8C6D]/25 text-[#5B8C6D]",
  cancelled: "bg-[#C75D4A]/15 text-[#C75D4A]",
  incident: "bg-red-100 text-red-700",
};

function inferActivityType(booking: ActivityBooking): string {
  // Best-effort: try to infer from the optional `service`/`activityType` field on the
  // reservation. Falls back to empty string so filters never miss data.
  const r = booking.reservation as
    | { activityType?: string; services?: string }
    | undefined;
  return (r?.activityType ?? r?.services ?? "").toString().toLowerCase();
}

interface Props {
  bookings: ActivityBooking[];
}

export default function ActivityBookingList({ bookings }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [incidentNotes, setIncidentNotes] = useState("");
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_FILTERS);
  const updateBooking = useUpdateActivityBooking();
  const assignMonitor = useAssignMonitor();
  const unassignMonitor = useUnassignMonitor();
  const flagIncident = useFlagActivityIncident();
  const { data: teamData } = useTeam();

  const teamUsers = teamData?.users ?? [];

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filters.status && b.status !== filters.status) return false;
      if (
        filters.station &&
        b.reservation?.station !== filters.station
      )
        return false;
      if (filters.instructorId) {
        const has = (b.monitors ?? []).some(
          (m) => m.user.id === filters.instructorId
        );
        if (!has) return false;
      }
      if (filters.activityType) {
        const t = inferActivityType(b);
        if (!t.includes(filters.activityType)) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const name = (b.reservation?.clientName ?? "").toLowerCase();
        const phone = (b.reservation?.clientPhone ?? "").toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, filters]);

  const handleArrivalToggle = async (booking: ActivityBooking) => {
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        arrivedClient: !booking.arrivedClient,
      });
      toast.success(
        booking.arrivedClient ? "Llegada desmarcada" : "Llegada confirmada"
      );
    } catch {
      toast.error("Error al actualizar llegada");
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await updateBooking.mutateAsync({ id: bookingId, status });
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const handleAssignMonitor = async (bookingId: string, userId: string) => {
    try {
      await assignMonitor.mutateAsync({ bookingId, userId });
      toast.success("Monitor asignado");
      setAssigningId(null);
    } catch {
      toast.error("Error al asignar monitor");
    }
  };

  const handleUnassignMonitor = async (monitorAssignmentId: string) => {
    try {
      await unassignMonitor.mutateAsync(monitorAssignmentId);
      toast.success("Monitor desasignado");
    } catch {
      toast.error("Error al desasignar monitor");
    }
  };

  const handleFlagIncident = async () => {
    if (!incidentId || !incidentNotes.trim()) return;
    try {
      await flagIncident.mutateAsync({
        id: incidentId,
        incidentNotes: incidentNotes.trim(),
      });
      toast.success("Incidencia registrada");
      setIncidentId(null);
      setIncidentNotes("");
    } catch {
      toast.error("Error al registrar incidencia");
    }
  };

  const checkInGroup = async (booking: ActivityBooking) => {
    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        status: "in_progress",
        arrivedClient: true,
      });
      toast.success("Grupo dado de alta");
    } catch {
      toast.error("Error al dar de alta el grupo");
    }
  };

  const markCompleted = async (booking: ActivityBooking) => {
    try {
      await updateBooking.mutateAsync({ id: booking.id, status: "completed" });
      toast.success("Actividad completada");
    } catch {
      toast.error("Error al completar actividad");
    }
  };

  const filterUI = (
    <ActivityBookingFilters
      filters={filters}
      onChange={setFilters}
      instructors={teamUsers
        .filter((u) => u.isActive)
        .map((u) => ({ id: u.id, name: u.name, email: u.email }))}
    />
  );

  if (bookings.length === 0) {
    return (
      <div className="space-y-3">
        {filterUI}
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-12 text-center">
          <p className="text-[#8A8580] text-sm">
            No hay actividades programadas para este dia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {filterUI}
      <div className="flex items-center justify-between text-xs text-[#8A8580] px-1 mt-3 mb-2">
        <span>
          Mostrando {filtered.length} de {bookings.length}
        </span>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center">
            <p className="text-xs text-[#8A8580]">
              Ninguna actividad coincide con los filtros aplicados.
            </p>
          </div>
        )}
        {filtered.map((booking) => {
          const isExpanded = expandedId === booking.id;
          const isAssigning = assigningId === booking.id;
          const monitors = booking.monitors ?? [];
          const assignedUserIds = new Set(monitors.map((m) => m.user.id));
          const availableUsers = teamUsers.filter(
            (u) => u.isActive && !assignedUserIds.has(u.id)
          );

          return (
            <div
              key={booking.id}
              className={`rounded-2xl border bg-white overflow-hidden ${
                booking.status === "incident"
                  ? "border-red-200"
                  : "border-[#E8E4DE]"
              }`}
            >
              {/* Main row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <button
                  onClick={() => handleArrivalToggle(booking)}
                  className="shrink-0"
                  title={booking.arrivedClient ? "Llegada confirmada" : "Marcar llegada"}
                >
                  {booking.arrivedClient ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5B8C6D]/15">
                      <Check className="h-4 w-4 text-[#5B8C6D]" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#E8E4DE]">
                      <Circle className="h-3 w-3 text-[#E8E4DE]" />
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2D2A26] truncate">
                    {booking.reservation?.clientName ?? "Cliente desconocido"}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {booking.reservation?.station && (
                      <span className="flex items-center gap-1 text-xs text-[#8A8580]">
                        <MapPin className="h-3 w-3" />
                        {booking.reservation.station}
                      </span>
                    )}
                    {booking.reservation?.clientPhone && (
                      <span className="flex items-center gap-1 text-xs text-[#8A8580]">
                        <Phone className="h-3 w-3" />
                        {booking.reservation.clientPhone}
                      </span>
                    )}
                    {booking.arrivedClient && (
                      <span className="flex items-center gap-1 text-[10px] text-[#5B8C6D]">
                        <Clock className="h-3 w-3" />
                        Llegada confirmada
                      </span>
                    )}
                  </div>
                </div>

                <MonitorBadges
                  monitors={monitors}
                  isAssigning={isAssigning}
                  onToggleAssign={() => setAssigningId(isAssigning ? null : booking.id)}
                  onUnassign={handleUnassignMonitor}
                />

                <button
                  onClick={() => { setIncidentId(booking.id); setIncidentNotes(""); }}
                  className="shrink-0 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#C75D4A] hover:bg-[#C75D4A]/5 transition-colors"
                  title="Registrar incidencia"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Incidencia</span>
                </button>

                <select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                  className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[booking.status] ?? STATUS_COLORS.scheduled}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                  className="shrink-0 text-[#8A8580] hover:text-[#2D2A26] transition-colors"
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>

              {isAssigning && availableUsers.length > 0 && (
                <div className="border-t border-[#E8E4DE] px-5 py-3 bg-[#FAF9F7]">
                  <p className="text-xs font-medium text-[#8A8580] mb-2">Seleccionar monitor:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableUsers.map((u) => (
                      <button key={u.id} onClick={() => handleAssignMonitor(booking.id, u.id)}
                        className="rounded-lg border border-[#E8E4DE] bg-white px-3 py-1.5 text-xs text-[#2D2A26] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors">
                        {u.name ?? u.email.split("@")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {isExpanded && (
                <div className="border-t border-[#E8E4DE] px-5 py-3 bg-[#FAF9F7]">
                  <p className="text-xs font-medium text-[#8A8580] mb-1">Notas operativas:</p>
                  <p className="text-sm text-[#2D2A26] whitespace-pre-wrap">{booking.operationalNotes || "Sin notas"}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {incidentId && (
        <ActivityIncidentModal
          onClose={() => { setIncidentId(null); setIncidentNotes(""); }}
          onSubmit={handleFlagIncident}
          notes={incidentNotes}
          onNotesChange={setIncidentNotes}
          isPending={flagIncident.isPending}
        />
      )}
    </>
  );
}

function MonitorBadges({
  monitors,
  isAssigning,
  onToggleAssign,
  onUnassign,
}: {
  monitors: NonNullable<ActivityBooking["monitors"]>;
  isAssigning: boolean;
  onToggleAssign: () => void;
  onUnassign: (id: string) => void;
}) {
  return (
    <div className="hidden md:flex items-center gap-1.5 shrink-0">
      {monitors.map((m) => (
        <span
          key={m.id}
          className="inline-flex items-center gap-1 rounded-md bg-[#FAF9F7] border border-[#E8E4DE] px-2 py-1 text-xs text-[#2D2A26]"
        >
          {m.user.name ?? m.user.email.split("@")[0]}
          <button
            onClick={() => onUnassign(m.id)}
            className="text-[#8A8580] hover:text-[#C75D4A] transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onToggleAssign}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
        title="Asignar monitor"
      >
        <UserPlus className="h-3 w-3" />
      </button>
    </div>
  );
}
