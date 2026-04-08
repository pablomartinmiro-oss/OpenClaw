"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut } from "lucide-react";
import type { TimeEntry } from "@/hooks/useInstructors";
import { useClockIn, useClockOut } from "@/hooks/useInstructors";
import { toast } from "sonner";

interface Props {
  instructorId: string;
  entries: TimeEntry[];
}

export default function ClockWidget({ instructorId, entries }: Props) {
  const [elapsed, setElapsed] = useState("");
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const today = new Date().toISOString().split("T")[0];
  const openEntry = entries.find(
    (e) => e.instructorId === instructorId && e.date.startsWith(today) && !e.clockOut
  );

  useEffect(() => {
    if (!openEntry) { setElapsed(""); return; }
    const tick = () => {
      const diff = Date.now() - new Date(openEntry.clockIn).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [openEntry]);

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync({ instructorId, source: "mobile" });
      toast.success("Fichaje de entrada registrado");
    } catch {
      toast.error("Error al fichar entrada");
    }
  };

  const handleClockOut = async () => {
    if (!openEntry) return;
    try {
      await clockOutMutation.mutateAsync({ entryId: openEntry.id, breakMinutes: 0 });
      toast.success("Fichaje de salida registrado");
    } catch {
      toast.error("Error al fichar salida");
    }
  };

  return (
    <div className="flex items-center gap-4">
      {openEntry && (
        <div className="text-right">
          <p className="text-xs text-white/50">En jornada</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">{elapsed}</p>
        </div>
      )}

      {openEntry ? (
        <button
          onClick={handleClockOut}
          disabled={clockOutMutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-5 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {clockOutMutation.isPending ? "..." : "Fichar Salida"}
        </button>
      ) : (
        <button
          onClick={handleClockIn}
          disabled={clockInMutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-[#5B8C6D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a7359] transition-all disabled:opacity-50 shadow-lg"
        >
          <LogIn className="h-4 w-4" />
          {clockInMutation.isPending ? "..." : "Fichar Entrada"}
        </button>
      )}
    </div>
  );
}
