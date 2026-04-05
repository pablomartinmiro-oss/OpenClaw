"use client";

import {
  CalendarCheck,
  UtensilsCrossed,
  Sparkles,
  Phone,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import type {
  CalendarActivity,
  CalendarRestaurantBooking,
  CalendarSpaSlot,
} from "@/hooks/useBookingOps";

const ACTIVITY_STATUS: Record<string, string> = {
  scheduled: "bg-[#8A8580]/15 text-[#8A8580]",
  pending: "bg-[#D4A853]/15 text-[#D4A853]",
  confirmed: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  cancelled: "bg-[#C75D4A]/15 text-[#C75D4A]",
};
const ACTIVITY_LABELS: Record<string, string> = {
  scheduled: "Programada",
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const REST_STATUS: Record<string, string> = {
  confirmed: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  cancelled: "bg-[#C75D4A]/15 text-[#C75D4A]",
  no_show: "bg-[#8A8580]/15 text-[#8A8580]",
};
const REST_LABELS: Record<string, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  no_show: "No presentado",
};

interface Props {
  activities: CalendarActivity[];
  restaurantBookings: CalendarRestaurantBooking[];
  spaSlots: CalendarSpaSlot[];
  summary: { totalActivities: number; totalDiners: number; totalSpaClients: number };
}

export default function UnifiedCalendar({
  activities,
  restaurantBookings,
  spaSlots,
  summary,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          icon={<CalendarCheck className="h-4 w-4 text-[#E87B5A]" />}
          label="Actividades"
          value={summary.totalActivities}
          color="bg-[#E87B5A]/10"
        />
        <SummaryCard
          icon={<UtensilsCrossed className="h-4 w-4 text-[#D4A853]" />}
          label="Comensales"
          value={summary.totalDiners}
          color="bg-[#D4A853]/10"
        />
        <SummaryCard
          icon={<Sparkles className="h-4 w-4 text-purple-500" />}
          label="Spa clientes"
          value={summary.totalSpaClients}
          color="bg-purple-500/10"
        />
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activities column */}
        <ColumnCard
          title="Actividades"
          icon={<CalendarCheck className="h-4 w-4 text-[#E87B5A]" />}
          accentBorder="border-l-[#E87B5A]"
          count={activities.length}
        >
          {activities.length === 0 ? (
            <EmptyCol text="Sin actividades" />
          ) : (
            activities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))
          )}
        </ColumnCard>

        {/* Restaurant column */}
        <ColumnCard
          title="Restaurante"
          icon={<UtensilsCrossed className="h-4 w-4 text-[#D4A853]" />}
          accentBorder="border-l-[#D4A853]"
          count={restaurantBookings.length}
        >
          {restaurantBookings.length === 0 ? (
            <EmptyCol text="Sin reservas" />
          ) : (
            restaurantBookings.map((rb) => (
              <RestaurantCard key={rb.id} booking={rb} />
            ))
          )}
        </ColumnCard>

        {/* Spa column */}
        <ColumnCard
          title="Spa"
          icon={<Sparkles className="h-4 w-4 text-purple-500" />}
          accentBorder="border-l-purple-500"
          count={spaSlots.length}
        >
          {spaSlots.length === 0 ? (
            <EmptyCol text="Sin citas" />
          ) : (
            spaSlots.map((s) => (
              <SpaCard key={s.id} slot={s} />
            ))
          )}
        </ColumnCard>
      </div>
    </div>
  );
}

/* Sub-components */

function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string;
}) {
  return (
    <div className={`rounded-xl ${color} px-4 py-3 flex items-center gap-3`}>
      {icon}
      <div>
        <p className="text-lg font-bold text-[#2D2A26]">{value}</p>
        <p className="text-xs text-[#8A8580]">{label}</p>
      </div>
    </div>
  );
}

function ColumnCard({ title, icon, accentBorder, count, children }: {
  title: string; icon: React.ReactNode; accentBorder: string; count: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden border-l-4 ${accentBorder}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F7]">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-[#2D2A26]">{title}</span>
        </div>
        <span className="text-xs text-[#8A8580]">{count}</span>
      </div>
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">{children}</div>
    </div>
  );
}

function EmptyCol({ text }: { text: string }) {
  return <p className="text-xs text-[#8A8580] text-center py-6">{text}</p>;
}

function ActivityCard({ activity }: { activity: CalendarActivity }) {
  const r = activity.reservation;
  const monitors = activity.monitors ?? [];
  return (
    <div className="rounded-xl border border-[#E8E4DE] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#2D2A26] truncate">
          {r?.clientName ?? "Cliente desconocido"}
        </p>
        <span className={`rounded-[6px] px-2 py-0.5 text-xs font-medium ${ACTIVITY_STATUS[activity.status] ?? ""}`}>
          {ACTIVITY_LABELS[activity.status] ?? activity.status}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-[#8A8580]">
        {r?.station && (
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.station}</span>
        )}
        {r?.schedule && (
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.schedule}</span>
        )}
        {r?.clientPhone && (
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.clientPhone}</span>
        )}
      </div>
      {monitors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {monitors.map((m) => (
            <span key={m.id} className="rounded-md bg-[#FAF9F7] border border-[#E8E4DE] px-2 py-0.5 text-xs text-[#2D2A26]">
              {m.user.name ?? m.user.email.split("@")[0]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RestaurantCard({ booking }: { booking: CalendarRestaurantBooking }) {
  return (
    <div className="rounded-xl border border-[#E8E4DE] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#2D2A26]">{booking.restaurant.title}</p>
        <span className={`rounded-[6px] px-2 py-0.5 text-xs font-medium ${REST_STATUS[booking.status] ?? ""}`}>
          {REST_LABELS[booking.status] ?? booking.status}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-[#8A8580]">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.time}</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{booking.guestCount} comensales</span>
      </div>
      {booking.client?.name && (
        <p className="text-xs text-[#8A8580]">{booking.client.name}</p>
      )}
      {booking.specialRequests && (
        <p className="text-xs text-[#D4A853] italic">{booking.specialRequests}</p>
      )}
    </div>
  );
}

function SpaCard({ slot }: { slot: CalendarSpaSlot }) {
  return (
    <div className="rounded-xl border border-[#E8E4DE] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#2D2A26]">{slot.treatment.title}</p>
        <span className="rounded-[6px] bg-purple-50 text-purple-700 px-2 py-0.5 text-xs font-medium">
          {slot.booked}/{slot.capacity}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-[#8A8580]">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{slot.time}</span>
        <span>{slot.treatment.duration} min</span>
        {slot.resource && (
          <span className="text-purple-600">{slot.resource.name}</span>
        )}
      </div>
    </div>
  );
}
