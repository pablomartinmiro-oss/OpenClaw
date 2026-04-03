"use client";

import { Scale } from "lucide-react";
import ExpedientsTable from "./_components/ExpedientsTable";

export default function ReavPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Scale className="h-6 w-6 text-[#E87B5A]" />
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          REAV - Regimen Especial Agencias de Viajes
        </h1>
      </div>
      <ExpedientsTable />
    </div>
  );
}
