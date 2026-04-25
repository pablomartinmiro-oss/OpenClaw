"use client";

import { useState } from "react";
import { ClipboardList, CalendarDays, ChevronLeft, ChevronRight, List, LayoutGrid } from "lucide-react";
import { useActivityBookings, useUnifiedCalendar } from "@/hooks/useBookingOps";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import ActivityBookingList from "./_components/ActivityBookingList";
import DailyOrderSection from "./_components/DailyOrderSection";
import UnifiedCalendar from "./_components/UnifiedCalendar";

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ViewMode = "list" | "calendar";

export default function OperationsPage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateISO(new Date())
  );
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const { data: activityData, isLoading: loadingActivities } = useActivityBookings(selectedDate);
  const { data: calendarData, isLoading: loadingCalendar } = useUnifiedCalendar(selectedDate);
  const bookings = activityData?.bookings ?? [];

  const isToday = selectedDate === formatDateISO(new Date());
  const isLoading = viewMode === "calendar" ? loadingCalendar : loadingActivities;

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(formatDateISO(d));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <ClipboardList className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Operaciones</h1>
            <p className="text-sm text-[#8A8580]">
              Gestion diaria de actividades, restaurante y spa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-[#E8E4DE] bg-white overflow-hidden">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex h-9 w-9 items-center justify-center transition-colors ${
                viewMode === "calendar" ? "bg-[#E87B5A] text-white" : "text-[#8A8580] hover:text-[#2D2A26]"
              }`}
              title="Vista calendario"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-9 w-9 items-center justify-center transition-colors ${
                viewMode === "list" ? "bg-[#E87B5A] text-white" : "text-[#8A8580] hover:text-[#2D2A26]"
              }`}
              title="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Date picker */}
          <button
            onClick={() => shiftDate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E4DE] bg-white text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
            title="Dia anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8580] pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-[#E8E4DE] bg-white pl-9 pr-3 py-2 text-sm text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A] transition-colors"
            />
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E4DE] bg-white text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
            title="Dia siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(formatDateISO(new Date()))}
              className="rounded-xl border border-[#E8E4DE] bg-white px-3 py-2 text-xs font-medium text-[#E87B5A] hover:bg-[#E87B5A]/5 transition-colors"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* Date display */}
      <div className="rounded-xl bg-[#FAF9F7] border border-[#E8E4DE] px-5 py-3">
        <p className="text-sm font-medium text-[#2D2A26] capitalize">
          {formatDateDisplay(selectedDate)}
        </p>
        {viewMode === "list" && (
          <p className="text-xs text-[#8A8580] mt-0.5">
            {bookings.length}{" "}
            {bookings.length === 1 ? "actividad programada" : "actividades programadas"}
          </p>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : viewMode === "calendar" && calendarData ? (
        <>
          <UnifiedCalendar
            date={selectedDate}
            onSelectDate={setSelectedDate}
            activities={calendarData.activities}
            restaurantBookings={calendarData.restaurantBookings}
            spaSlots={calendarData.spaSlots}
            summary={calendarData.summary}
          />
          <DailyOrderSection date={selectedDate} />
        </>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-[#2D2A26] mb-3">
              Actividades del dia
            </h2>
            <ActivityBookingList bookings={bookings} />
          </div>
          <DailyOrderSection date={selectedDate} />
        </>
      )}
    </div>
  );
}
