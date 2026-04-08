"use client";

import { AlertCircle, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Assignment } from "@/hooks/useInstructors";

interface ActivityBooking {
  id: string;
  activityDate: string;
  status: string;
  operationalNotes: string | null;
  reservation: {
    id: string;
    clientName: string;
    clientEmail: string | null;
  };
  monitors: { id: string; userId: string }[];
}

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

interface Props {
  date: string;
  assignments: Assignment[];
}

export default function UnassignedLessons({ date, assignments }: Props) {
  const { data } = useQuery<{ bookings: ActivityBooking[] }>({
    queryKey: ["activity-bookings", date],
    queryFn: () => fetchJSON(`/api/booking/activities?date=${date}`),
  });

  const bookings = data?.bookings ?? [];
  const assignedBookingIds = new Set(assignments.map((a) => a.bookingId));
  const unassigned = bookings.filter((b) => !assignedBookingIds.has(b.id) && b.status !== "cancelled");

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-[#E87B5A]" />
        <h3 className="text-sm font-semibold text-[#2D2A26]">Clases sin asignar</h3>
        {unassigned.length > 0 && (
          <span className="rounded-full bg-[#C75D4A]/15 px-2 py-0.5 text-xs font-medium text-[#C75D4A]">
            {unassigned.length}
          </span>
        )}
      </div>

      {unassigned.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-[#8A8580]">Todas las clases estan asignadas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unassigned.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-[#D4A853]/30 bg-[#D4A853]/5 p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#2D2A26]">
                    {booking.reservation.clientName}
                  </p>
                  <p className="text-xs text-[#8A8580]">
                    {booking.reservation.clientEmail}
                  </p>
                </div>
                <AlertCircle className="h-4 w-4 text-[#D4A853] shrink-0" />
              </div>
              {booking.operationalNotes && (
                <p className="mt-1 text-xs text-[#8A8580]">{booking.operationalNotes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
