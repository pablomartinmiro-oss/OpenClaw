"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mountain, MapPin, Calendar, Users, CheckSquare, Loader2, ChevronRight } from "lucide-react";

const DESTINATIONS = [
  { value: "baqueira", label: "Baqueira Beret" },
  { value: "sierra_nevada", label: "Sierra Nevada" },
  { value: "valdesqui", label: "Valdesquí" },
  { value: "la_pinilla", label: "La Pinilla" },
  { value: "grandvalira", label: "Grandvalira" },
  { value: "formigal", label: "Formigal" },
  { value: "alto_campoo", label: "Alto Campoo" },
];

const SERVICES = [
  { value: "forfait", label: "Forfait (pases de ski)" },
  { value: "alquiler", label: "Alquiler de material" },
  { value: "escuela", label: "Clases de esquí" },
  { value: "alojamiento", label: "Alojamiento" },
];

type Step = 1 | 2 | 3;

interface FormData {
  name: string;
  email: string;
  phone: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  services: string[];
}

export default function SurveyPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    destination: "",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    services: ["forfait", "alquiler"],
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleService(val: string) {
    set("services", form.services.includes(val)
      ? form.services.filter((s) => s !== val)
      : [...form.services, val]
    );
  }

  function canAdvance(): boolean {
    if (step === 1) return !!(form.name.trim() && form.email.trim());
    if (step === 2) return !!(form.destination && form.checkIn && form.checkOut && form.checkIn <= form.checkOut);
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/survey/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Error al enviar");
      }
      router.push(`/survey/${slug}/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E4DE] px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E87B5A]">
            <Mountain className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-[#8A8580]">Skicenter</p>
            <p className="text-sm font-semibold text-[#2D2A26]">Solicita tu presupuesto</p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-[#E8E4DE] px-6 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  step > s ? "bg-[#5B8C6D] text-white" : step === s ? "bg-[#E87B5A] text-white" : "bg-[#E8E4DE] text-[#8A8580]"
                }`}>
                  {step > s ? "✓" : s}
                </div>
                <span className={`text-xs ${step === s ? "text-[#2D2A26] font-medium" : "text-[#8A8580]"}`}>
                  {s === 1 ? "Tus datos" : s === 2 ? "Viaje" : "Servicios"}
                </span>
                {s < 3 && <div className={`h-px flex-1 ${step > s ? "bg-[#5B8C6D]" : "bg-[#E8E4DE]"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-lg mx-auto">
          {/* Step 1: Contact info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold text-[#2D2A26]">¿Cómo te llamamos?</h1>
                <p className="mt-1 text-sm text-[#8A8580]">Tus datos de contacto para enviarte el presupuesto</p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E8E4DE] p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Nombre y apellidos *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ej: María García"
                    className="w-full rounded-[10px] border border-[#E8E4DE] px-4 py-2.5 text-sm placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-[10px] border border-[#E8E4DE] px-4 py-2.5 text-sm placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full rounded-[10px] border border-[#E8E4DE] px-4 py-2.5 text-sm placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Trip details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold text-[#2D2A26]">¿A dónde y cuándo?</h1>
                <p className="mt-1 text-sm text-[#8A8580]">Destino, fechas y número de personas</p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E8E4DE] p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                    <MapPin className="inline h-3.5 w-3.5 mr-1" />Estación de esquí *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DESTINATIONS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => set("destination", d.value)}
                        className={`rounded-[10px] border px-3 py-2.5 text-sm text-left transition-colors ${
                          form.destination === d.value
                            ? "border-[#E87B5A] bg-[#E87B5A]/10 text-[#E87B5A] font-medium"
                            : "border-[#E8E4DE] text-[#2D2A26] hover:border-[#E87B5A]/40"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                      <Calendar className="inline h-3.5 w-3.5 mr-1" />Llegada *
                    </label>
                    <input
                      type="date"
                      value={form.checkIn}
                      onChange={(e) => set("checkIn", e.target.value)}
                      className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2.5 text-sm focus:border-[#E87B5A] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                      <Calendar className="inline h-3.5 w-3.5 mr-1" />Salida *
                    </label>
                    <input
                      type="date"
                      value={form.checkOut}
                      min={form.checkIn}
                      onChange={(e) => set("checkOut", e.target.value)}
                      className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2.5 text-sm focus:border-[#E87B5A] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                      <Users className="inline h-3.5 w-3.5 mr-1" />Adultos (≥12)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.adults}
                      onChange={(e) => set("adults", parseInt(e.target.value) || 1)}
                      className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2.5 text-sm focus:border-[#E87B5A] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">
                      <Users className="inline h-3.5 w-3.5 mr-1" />Niños (&lt;12)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={form.children}
                      onChange={(e) => set("children", parseInt(e.target.value) || 0)}
                      className="w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2.5 text-sm focus:border-[#E87B5A] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold text-[#2D2A26]">¿Qué necesitas?</h1>
                <p className="mt-1 text-sm text-[#8A8580]">Selecciona los servicios que quieres incluir en tu presupuesto</p>
              </div>
              <div className="rounded-2xl bg-white border border-[#E8E4DE] p-5 space-y-3">
                {SERVICES.map((s) => {
                  const active = form.services.includes(s.value);
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleService(s.value)}
                      className={`w-full flex items-center gap-3 rounded-[10px] border px-4 py-3 text-sm text-left transition-colors ${
                        active
                          ? "border-[#E87B5A] bg-[#E87B5A]/10"
                          : "border-[#E8E4DE] hover:border-[#E87B5A]/40"
                      }`}
                    >
                      <CheckSquare className={`h-4 w-4 shrink-0 ${active ? "text-[#E87B5A]" : "text-[#8A8580]"}`} />
                      <span className={active ? "text-[#E87B5A] font-medium" : "text-[#2D2A26]"}>{s.label}</span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="rounded-[10px] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex-1 rounded-[10px] border border-[#E8E4DE] px-4 py-3 text-sm font-medium text-[#2D2A26] hover:bg-[#E8E4DE]/40 transition-colors"
              >
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-3 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-[#E87B5A] px-4 py-3 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                  "Solicitar presupuesto"
                )}
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-[#8A8580]">
            Recibirás tu presupuesto personalizado en menos de 24h
          </p>
        </div>
      </main>
    </div>
  );
}
