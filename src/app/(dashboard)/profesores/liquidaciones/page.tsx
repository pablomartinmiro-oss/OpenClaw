"use client";

import { useState } from "react";
import { Wallet, ChevronLeft, ChevronRight, Clock, TrendingUp, CalendarCheck } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useMyInstructorProfile } from "@/hooks/useInstructors";
import { useQuery } from "@tanstack/react-query";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface PayrollSummary {
  instructorId: string;
  instructorName: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  workingDays: number;
  totalLessons: number;
  baseEarnings: number;
  overtimeEarnings: number;
  studentBonuses: number;
  surchargeTotal: number;
  totalEarnings: number;
}

export default function LiquidacionesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data: meData, isLoading: loadingMe } = useMyInstructorProfile();
  const myProfile = meData?.instructor;

  const { data, isLoading } = useQuery<{ summaries: PayrollSummary[] }>({
    queryKey: ["payroll-summary", year, month, myProfile?.id],
    queryFn: () => fetchJSON(`/api/instructors/payroll-summary?year=${year}&month=${month}&instructorId=${myProfile?.id}`),
    enabled: !!myProfile?.id,
  });

  const summary = data?.summaries?.[0];

  const shiftMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
  };

  if (loadingMe || isLoading) return <PageSkeleton />;

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
          <Wallet className="h-5 w-5 text-[#E87B5A]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2A26]">Liquidaciones</h1>
          <p className="text-sm text-[#8A8580]">Tu resumen mensual de horas y ganancias</p>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#E8E4DE] px-5 py-3">
        <button onClick={() => shiftMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A]">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-lg font-semibold text-[#2D2A26]">{MONTH_NAMES[month - 1]} {year}</p>
        <button onClick={() => shiftMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A]">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {isCurrentMonth && (
        <div className="rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/30 px-4 py-2 text-xs text-[#D4A853]">
          Estos datos son una estimacion del mes en curso
        </div>
      )}

      {!summary ? (
        <div className="rounded-2xl border border-[#E8E4DE] bg-white p-8 text-center text-sm text-[#8A8580]">
          No hay datos para este periodo
        </div>
      ) : (
        <>
          {/* Total earnings hero */}
          <div className="rounded-2xl bg-gradient-to-r from-[#2D2A26] to-[#4a4540] p-6 text-white">
            <p className="text-sm text-white/60">Total estimado</p>
            <p className="text-3xl font-bold mt-1">
              {summary.totalEarnings.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <BreakdownCard icon={Clock} label="Horas trabajadas" value={`${summary.totalHours}h`} sub={`${summary.workingDays} dias · ${summary.regularHours}h regulares`} color="#E87B5A" />
            <BreakdownCard icon={TrendingUp} label="Base" value={summary.baseEarnings.toLocaleString("es-ES", { style: "currency", currency: "EUR" })} sub={`${myProfile?.hourlyRate ?? 0} EUR/h`} color="#5B8C6D" />
            <BreakdownCard icon={CalendarCheck} label="Extras" value={(summary.overtimeEarnings + summary.studentBonuses + summary.surchargeTotal).toLocaleString("es-ES", { style: "currency", currency: "EUR" })} sub={`${summary.totalLessons} clases`} color="#D4A853" />
          </div>

          {/* Detail table */}
          <div className="rounded-2xl border border-[#E8E4DE] bg-white divide-y divide-[#E8E4DE]">
            <Row label="Horas regulares" value={`${summary.regularHours}h`} amount={summary.baseEarnings} />
            {summary.overtimeHours > 0 && (
              <Row label="Horas extra (x1.25)" value={`${summary.overtimeHours}h`} amount={summary.overtimeEarnings} />
            )}
            {summary.studentBonuses > 0 && (
              <Row label="Bonus alumnos" value={`${summary.totalLessons} clases`} amount={summary.studentBonuses} />
            )}
            {summary.surchargeTotal > 0 && (
              <Row label="Recargos especiales" value="" amount={summary.surchargeTotal} />
            )}
            <div className="flex items-center justify-between p-4 bg-[#FAF9F7]">
              <span className="text-sm font-bold text-[#2D2A26]">TOTAL</span>
              <span className="text-lg font-bold text-[#E87B5A]">
                {summary.totalEarnings.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BreakdownCard({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color }}><Icon className="h-4 w-4" /></div>
        <span className="text-xs text-[#8A8580]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#2D2A26]">{value}</p>
      <p className="text-xs text-[#8A8580]">{sub}</p>
    </div>
  );
}

function Row({ label, value, amount }: { label: string; value: string; amount: number }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <span className="text-sm text-[#2D2A26]">{label}</span>
        {value && <span className="ml-2 text-xs text-[#8A8580]">{value}</span>}
      </div>
      <span className="text-sm font-medium text-[#2D2A26]">
        {amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
      </span>
    </div>
  );
}
