"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { Instructor } from "@/hooks/useInstructors";

const TD_COLORS: Record<string, string> = {
  TD1: "bg-[#D4A853]/15 text-[#D4A853]",
  TD2: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  TD3: "bg-[#E87B5A]/15 text-[#E87B5A]",
};

const LANG_LABELS: Record<string, string> = {
  es: "ES", en: "EN", fr: "FR", de: "DE", pt: "PT",
};

const CONTRACT_LABELS: Record<string, string> = {
  fijo_discontinuo: "Fijo discontinuo",
  temporal: "Temporal",
  autonomo: "Autonomo",
};

interface Props {
  instructors: Instructor[];
}

export default function InstructorTable({ instructors }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8E4DE] bg-white">
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E4DE] bg-[#FAF9F7]">
              <th className="px-4 py-3 text-left font-medium text-[#8A8580]">Profesor</th>
              <th className="px-4 py-3 text-left font-medium text-[#8A8580]">TD</th>
              <th className="px-4 py-3 text-left font-medium text-[#8A8580]">Estacion</th>
              <th className="px-4 py-3 text-left font-medium text-[#8A8580]">Idiomas</th>
              <th className="px-4 py-3 text-left font-medium text-[#8A8580]">Contrato</th>
              <th className="px-4 py-3 text-right font-medium text-[#8A8580]">EUR/h</th>
              <th className="px-4 py-3 text-center font-medium text-[#8A8580]">Estado</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((inst) => (
              <tr key={inst.id} className="border-b border-[#E8E4DE] last:border-0 hover:bg-[#FAF9F7]/60 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/profesores/${inst.id}`}
                    className="flex items-center gap-3 hover:text-[#E87B5A] transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E87B5A]/10">
                      <GraduationCap className="h-4 w-4 text-[#E87B5A]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2D2A26]">{inst.user.name ?? inst.user.email}</p>
                      <p className="text-xs text-[#8A8580]">{inst.user.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${TD_COLORS[inst.tdLevel] ?? "bg-gray-100 text-gray-600"}`}>
                    {inst.tdLevel}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#2D2A26] capitalize">{inst.station.replace(/_/g, " ")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {inst.languages.map((l) => (
                      <span key={l} className="rounded-md bg-[#FAF9F7] border border-[#E8E4DE] px-1.5 py-0.5 text-xs text-[#8A8580]">
                        {LANG_LABELS[l] ?? l.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#8A8580] text-xs">
                  {CONTRACT_LABELS[inst.contractType] ?? inst.contractType}
                </td>
                <td className="px-4 py-3 text-right font-medium text-[#2D2A26]">
                  {inst.hourlyRate.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${inst.isActive ? "bg-[#5B8C6D]/15 text-[#5B8C6D]" : "bg-[#8A8580]/15 text-[#8A8580]"}`}>
                    {inst.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-[#E8E4DE]">
        {instructors.map((inst) => (
          <Link
            key={inst.id}
            href={`/profesores/${inst.id}`}
            className="flex items-center justify-between p-4 hover:bg-[#FAF9F7]/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E87B5A]/10">
                <GraduationCap className="h-5 w-5 text-[#E87B5A]" />
              </div>
              <div>
                <p className="font-medium text-[#2D2A26]">{inst.user.name ?? inst.user.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${TD_COLORS[inst.tdLevel] ?? ""}`}>
                    {inst.tdLevel}
                  </span>
                  <span className="text-xs text-[#8A8580] capitalize">{inst.station.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[#2D2A26]">
                {inst.hourlyRate.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}/h
              </p>
              <span className={`text-xs ${inst.isActive ? "text-[#5B8C6D]" : "text-[#8A8580]"}`}>
                {inst.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
