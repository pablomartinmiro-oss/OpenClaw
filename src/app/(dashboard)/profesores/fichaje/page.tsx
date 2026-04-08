"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useInstructors, useTimeEntries, useMyInstructorProfile } from "@/hooks/useInstructors";
import type { TimeEntryFilters } from "@/hooks/useInstructors";
import ClockInOutWidget from "./_components/ClockInOutWidget";
import TimeEntryTable from "./_components/TimeEntryTable";
import TimeEntrySummary from "./_components/TimeEntrySummary";

export default function FichajePage() {
  const now = new Date();
  const { data: meData } = useMyInstructorProfile();
  const isInstructor = meData?.isInstructor ?? false;
  const myProfile = meData?.instructor;

  const [filters, setFilters] = useState<TimeEntryFilters>({
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0],
  });

  // Auto-filter to own profile if user is an instructor
  useEffect(() => {
    if (isInstructor && myProfile && !filters.instructorId) {
      setFilters((prev) => ({ ...prev, instructorId: myProfile.id }));
    }
  }, [isInstructor, myProfile, filters.instructorId]);

  const { data: instructorsData } = useInstructors({ isActive: "true" });
  const instructors = instructorsData?.instructors ?? [];
  const { data, isLoading } = useTimeEntries(filters);
  const entries = data?.entries ?? [];

  const selectClass =
    "rounded-[10px] border border-[#E8E4DE] bg-white px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
          <Clock className="h-5 w-5 text-[#E87B5A]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">Fichaje</h1>
          <p className="text-sm text-[#8A8580]">
            {isInstructor ? "Tu control de jornada" : "Control de jornada de los profesores"}
          </p>
        </div>
      </div>

      {/* Clock widget */}
      <ClockInOutWidget
        instructors={isInstructor && myProfile ? [instructors.find((i) => i.id === myProfile.id)!].filter(Boolean) : instructors}
        entries={entries}
        autoSelectId={isInstructor && myProfile ? myProfile.id : undefined}
      />

      {/* Filters — managers see all, instructors see only theirs */}
      <div className="flex flex-wrap items-center gap-3">
        {!isInstructor && (
          <select
            value={filters.instructorId ?? ""}
            onChange={(e) => setFilters({ ...filters, instructorId: e.target.value || undefined })}
            className={selectClass}
          >
            <option value="">Todos los profesores</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>{i.user.name ?? i.user.email}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={filters.startDate ?? ""}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className={selectClass}
        />
        <span className="text-sm text-[#8A8580]">a</span>
        <input
          type="date"
          value={filters.endDate ?? ""}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className={selectClass}
        />
      </div>

      {/* Summary */}
      <TimeEntrySummary entries={entries} />

      {/* Table */}
      {isLoading ? <PageSkeleton /> : <TimeEntryTable entries={entries} />}
    </div>
  );
}
