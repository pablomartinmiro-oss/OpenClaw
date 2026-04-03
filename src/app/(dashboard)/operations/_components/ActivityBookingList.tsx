"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { ActivityBooking } from "@/hooks/useBookingOps";
import {
  useUpdateActivityBooking,
  useAssignMonitor,
  useUnassignMonitor,
} from "@/hooks/useBookingOps";
import { useTeam } from "@/hooks/useSettings";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Programada" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-[#8A8580]/15 text-[#8A8580]",
  pending: "bg-[#D4A853]/15 text-[#D4A853]",
  confirmed: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  cancelled: "bg-[#C75D4A]/15 text-[#C75D4A]",
};

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

interface Props {
  bookings: ActivityBooking[];
}

export default function ActivityBookingList({ bookings }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const updateBooking = useUpdateActivityBooking();
  const assignMonitor = useAssignMonitor();
  const unassignMonitor = useUnassignMonitor();
  const { data: teamData } = useTeam();

  const teamUsers = teamData?.users ?? [];

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

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-12 text-center">
        <p className="text-[#8A8580] text-sm">
          No hay actividades programadas para este dia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => {
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
            className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden"
          >
            {/* Main row */}
            <div className="flex items-center gap-3 px-5 py-4">
              {/* Arrival toggle */}
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

              {/* Client info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2D2A26] truncate">
                  {booking.reservation?.clientName ?? "Cliente desconocido"}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
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
                </div>
              </div>

              {/* Monitors */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                {monitors.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1 rounded-md bg-[#FAF9F7] border border-[#E8E4DE] px-2 py-1 text-xs text-[#2D2A26]"
                  >
                    {m.user.name ?? m.user.email.split("@")[0]}
                    <button
                      onClick={() => handleUnassignMonitor(m.id)}
                      className="text-[#8A8580] hover:text-[#C75D4A] transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() =>
                    setAssigningId(isAssigning ? null : booking.id)
                  }
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
                  title="Asignar monitor"
                >
                  <UserPlus className="h-3 w-3" />
                </button>
              </div>

              {/* Status badge */}
              <select
                value={booking.status}
                onChange={(e) =>
                  handleStatusChange(booking.id, e.target.value)
                }
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[booking.status] ?? STATUS_COLORS.scheduled}`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Expand toggle */}
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : booking.id)
                }
                className="shrink-0 text-[#8A8580] hover:text-[#2D2A26] transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Monitor assignment dropdown (mobile-friendly) */}
            {isAssigning && availableUsers.length > 0 && (
              <div className="border-t border-[#E8E4DE] px-5 py-3 bg-[#FAF9F7]">
                <p className="text-xs font-medium text-[#8A8580] mb-2">
                  Seleccionar monitor:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAssignMonitor(booking.id, u.id)}
                      className="rounded-lg border border-[#E8E4DE] bg-white px-3 py-1.5 text-xs text-[#2D2A26] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
                    >
                      {u.name ?? u.email.split("@")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Expanded notes */}
            {isExpanded && (
              <div className="border-t border-[#E8E4DE] px-5 py-3 bg-[#FAF9F7]">
                <p className="text-xs font-medium text-[#8A8580] mb-1">
                  Notas operativas:
                </p>
                <p className="text-sm text-[#2D2A26]">
                  {booking.operationalNotes || "Sin notas"}
                </p>

                {/* Mobile monitors */}
                <div className="md:hidden mt-3">
                  <p className="text-xs font-medium text-[#8A8580] mb-1">
                    Monitores:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {monitors.length === 0 && (
                      <span className="text-xs text-[#8A8580]">Sin asignar</span>
                    )}
                    {monitors.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 rounded-md bg-white border border-[#E8E4DE] px-2 py-1 text-xs text-[#2D2A26]"
                      >
                        {m.user.name ?? m.user.email.split("@")[0]}
                        <button
                          onClick={() => handleUnassignMonitor(m.id)}
                          className="text-[#8A8580] hover:text-[#C75D4A]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() =>
                        setAssigningId(isAssigning ? null : booking.id)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A]"
                    >
                      <UserPlus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
