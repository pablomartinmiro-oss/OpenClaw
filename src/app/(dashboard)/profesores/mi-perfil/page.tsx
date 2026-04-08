"use client";

import { User, GraduationCap, Globe, Snowflake } from "lucide-react";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { useMyInstructorProfile } from "@/hooks/useInstructors";

const LANG_LABELS: Record<string, string> = {
  es: "Espanol", en: "Ingles", fr: "Frances", de: "Aleman", pt: "Portugues",
};

const CONTRACT_LABELS: Record<string, string> = {
  fijo_discontinuo: "Fijo discontinuo",
  temporal: "Temporal",
  autonomo: "Autonomo",
};

const TD_COLORS: Record<string, string> = {
  TD1: "bg-[#D4A853]/15 text-[#D4A853]",
  TD2: "bg-[#5B8C6D]/15 text-[#5B8C6D]",
  TD3: "bg-[#E87B5A]/15 text-[#E87B5A]",
};

export default function MiPerfilPage() {
  const { data, isLoading } = useMyInstructorProfile();
  const profile = data?.instructor;

  if (isLoading) return <PageSkeleton />;
  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-[#E8E4DE] bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E87B5A]/10 text-[#E87B5A] text-xl font-bold">
            {(profile.user.name ?? "P")[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2D2A26]">{profile.user.name}</h1>
            <p className="text-sm text-[#8A8580]">{profile.user.email}</p>
            <div className="mt-1 flex gap-2">
              <span className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${TD_COLORS[profile.tdLevel] ?? ""}`}>
                {profile.tdLevel}
              </span>
              <span className="rounded-lg bg-[#FAF9F7] border border-[#E8E4DE] px-2.5 py-0.5 text-xs text-[#2D2A26] capitalize">
                {profile.station.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard icon={GraduationCap} title="Titulacion">
          <p className="text-sm font-medium text-[#2D2A26]">{profile.certNumber ?? "—"}</p>
          <p className="text-xs text-[#8A8580]">
            {profile.certExpiry ? `Caduca: ${new Date(profile.certExpiry).toLocaleDateString("es-ES")}` : "Sin caducidad"}
          </p>
        </InfoCard>

        <InfoCard icon={Snowflake} title="Disciplinas">
          <div className="flex flex-wrap gap-1.5">
            {profile.disciplines.map((d) => (
              <span key={d} className="rounded-lg bg-[#E87B5A]/10 px-2 py-0.5 text-xs font-medium text-[#E87B5A] capitalize">
                {d}
              </span>
            ))}
          </div>
        </InfoCard>

        <InfoCard icon={Globe} title="Idiomas">
          <div className="flex flex-wrap gap-1.5">
            {profile.languages.map((l) => (
              <span key={l} className="rounded-lg bg-[#FAF9F7] border border-[#E8E4DE] px-2 py-0.5 text-xs text-[#2D2A26]">
                {LANG_LABELS[l] ?? l}
              </span>
            ))}
          </div>
        </InfoCard>

        <InfoCard icon={User} title="Contrato">
          <p className="text-sm font-medium text-[#2D2A26]">
            {CONTRACT_LABELS[profile.contractType] ?? profile.contractType}
          </p>
          <p className="text-xs text-[#8A8580]">
            Tarifa: {profile.hourlyRate.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}/h
          </p>
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-[#E87B5A]" />
        <span className="text-xs font-semibold text-[#8A8580] uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </div>
  );
}
