"use client";

import { useState } from "react";
import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { usePayrollRecords } from "@/hooks/usePayroll";
import PayrollTable from "./_components/PayrollTable";
import AddPayrollModal from "./_components/AddPayrollModal";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function PayrollPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = usePayrollRecords(year, month);
  const records = data?.records ?? [];

  const shiftMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setMonth(m);
    setYear(y);
  };

  const totalPayroll = records.reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E87B5A]/10">
            <Wallet className="h-5 w-5 text-[#E87B5A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2D2A26]">Nominas</h1>
            <p className="text-sm text-[#8A8580]">
              Gestion de nominas y extras del equipo
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="rounded-[10px] bg-[#E87B5A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors"
        >
          + Nueva Nomina
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#E8E4DE] px-5 py-3">
        <button
          onClick={() => shiftMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-[#2D2A26]">
            {MONTH_NAMES[month - 1]} {year}
          </p>
          <p className="text-xs text-[#8A8580]">
            {records.length} nomina{records.length !== 1 ? "s" : ""} — Total:{" "}
            {totalPayroll.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
          </p>
        </div>
        <button
          onClick={() => shiftMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8E4DE] text-[#8A8580] hover:border-[#E87B5A] hover:text-[#E87B5A] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <PayrollTable records={records} />
      )}

      {showAdd && (
        <AddPayrollModal
          year={year}
          month={month}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
