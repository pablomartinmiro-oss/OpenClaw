"use client";

import { useState } from "react";
import {
  CalendarCheck,
  UtensilsCrossed,
  Sparkles,
  Phone,
  MapPin,
  Users,
  Clock,
  Award,
  CalendarRange,
  Columns3,
} from "lucide-react";
import type {
  CalendarActivity,
  CalendarRestaurantBooking,
  CalendarSpaSlot,
  OperationsRentals,
} from "@/hooks/useBookingOps";
import InstructorTimeline from "./InstructorTimeline";
import WeekView from "./WeekView";
import LessonDetailPopup from "./LessonDetailPopup";
import RentalsStrip from "./RentalsStrip";

const ACTIVITY_STATUS: Record<string, string> = {
  scheduled: "bg-[#8A8580]/15 text-[#8A8580]",
  pending: "bg-[#D4A853]/15 text-[#D4A853]",
  confirmed: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  cancelled: "bg-[#C75D4A]/15 text-[#C75D4A]",
  incident: "bg-red-100 text-red-700",
};
const ACTIVITY_LABELS: Record<string, string> = {
  scheduled: "Programada",
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  incident: "Incidencia",
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

type RangeMode = "day" | "week";

interface Props {
  date: string;
  onSelectDate: (d: string) => void;
  activities: CalendarActivity[];
  restaurantBookings: CalendarRestaurantBooking[];
  spaSlots: CalendarSpaSlot[];
  summary: { totalActivities: number; totalDiners: number; totalSpaClients: number };
  rentals?: OperationsRentals;
}

export default function UnifiedCalendar({
  date,
  onSelectDate,
  activities,
  restaurantBookings,
  spaSlots,
  summary,
  rentals,
}: Props) {
  const [rangeMode, setRangeMode] = useState<RangeMode>("day");
  const [selected, setSelected] = useState<CalendarActivity | null>(null);

  const totalRentals = rentals?.summary.totalUnits ?? 0;
  const instructorCount = countInstructors(activities);

  return (
    <div className="space-y-4">
      {/* Range toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center rounded-xl border border-[#E8E4DE] bg-white overflow-hidden">
          <button
            onClick={() => setRangeMode("day")}
            className={`flex items-center gap-2 px-3 h-9 text-xs transition-colors ${
              rangeMode === "day"
                ? "bg-[#E87B5A] text-white"
                : "text-[#8A8580] hover:text-[#2D2A26]"
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" />
            Dia
          </button>
          <button
            onClick={() => setRangeMode("week")}
            className={`flex items-center gap-2 px-3 h-9 text-xs transition-colors ${
              rangeMode === "week"
                ? "bg-[#E87B5A] text-white"
                : "text-[#8A8580] hover:text-[#2D2A26]"
            }`}
          >
            <CalendarRange className="h-3.5 w-3.5" />
            Semana
          </button>
        </div>
      </div>

      {rangeMode === "week" ? (
        <WeekView date={date} onSelectDate={onSelectDate} />
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <SummaryCard
              icon={<CalendarCheck className="h-4 w-4 text-[#E87B5A]" />}
              label="Actividades"
              value={summary.totalActivities}
              color="bg-[#E87B5A]/10"
            />
            <SummaryCard
              icon={<Award className="h-4 w-4 text-[#5B8C6D]" />}
              label="Instructores"
              value={instructorCount}
              color="bg-[#5B8C6D]/10"
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
            <SummaryCard
              icon={<MapPin className="h-4 w-4 text-blue-500" />}
              label="Equipos"
              value={totalRentals}
              color="bg-blue-500/10"
            />
          </div>

          {/* Instructor timeline */}
          <div>
            <h2 className="text-sm font-semibold text-[#2D2A26] mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-[#E87B5A]" />
              Linea por instructor
            </h2>
            <InstructorTimeline
              activities={activities}
              onSelect={(a) => setSelected(a)}
            />
          </div>

          {/* Rentals strip */}
          {rentals &&
            (rentals.pickups.length > 0 || rentals.returns.length > 0) && (
              <div>
                <h2 className="text-sm font-semibold text-[#2D2A26] mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  Alquileres del dia
                </h2>
                <RentalsStrip data={rentals} />
              </div>
            )}

          {/* 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                  <ActivityCard
                    key={a.id}
                    activity={a}
                    onClick={() => setSelected(a)}
                  />
                ))
              )}
            </ColumnCard>

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

            <ColumnCard
              title="Spa"
              icon={<Sparkles className="h-4 w-4 text-purple-500" />}
              accentBorder="border-l-purple-500"
              count={spaSlots.length}
            >
              {spaSlots.length === 0 ? (
                <EmptyCol text="Sin citas" />
              ) : (
                spaSlots.map((s) => <SpaCard key={s.id} slot={s} />)
              )}
            </ColumnCard>
          </div>
        </>
      )}

      {selected && (
        <LessonDetailPopup activity={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function countInstructors(activities: CalendarActivity[]): number {
  const set = new Set<string>();
  for (const a of activities) {
    for (const m of a.monitors ?? []) set.add(m.user.id);
  }
  return set.size;
}

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

function ActivityCard({
  activity,
  onClick,
}: {
  activity: CalendarActivity;
  onClick: () => void;
}) {
  const r = activity.reservation;
  const monitors = activity.monitors ?? [];
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-[#E8E4DE] p-3 space-y-2 text-left hover:border-[#E87B5A] hover:bg-[#FAF9F7] transition"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#2D2A26] truncate">
          {r?.clientName ?? "Cliente desconocido"}
        </p>
        <span className={`rounded-[6px] px-2 py-0.5 text-xs font-medium ${ACTIVITY_STATUS[activity.status] ?? ""}`}>
          {ACTIVITY_LABELS[activity.status] ?? activity.status}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-[#8A8580] flex-wrap">
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
    </button>
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
