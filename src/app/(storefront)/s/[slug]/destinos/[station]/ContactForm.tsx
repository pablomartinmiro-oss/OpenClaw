"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

const BEBAS: CSSProperties = {
  fontFamily: "var(--font-bebas-neue, 'Bebas Neue', cursive)",
};

interface ContactFormProps {
  slug: string;
  stationName: string;
}

type Status = "idle" | "loading" | "ok" | "error";

export function ContactForm({ slug, stationName }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`/api/storefront/public/${slug}/budget-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          email,
          phone: phone || null,
          startDate: startDate || null,
          endDate: endDate || null,
          station: stationName,
          notes: notes || null,
        }),
      });
      if (!res.ok) throw new Error("Error");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center bg-[#001D3D]/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#001D3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#001D3D] mb-2" style={BEBAS}>¡Solicitud recibida!</h3>
        <p className="text-[#757575] text-sm leading-relaxed">
          Te contactaremos en menos de 24 horas con tu presupuesto personalizado para {stationName}.
        </p>
      </div>
    );
  }

  const inputClass = "w-full h-10 px-3 text-sm border border-[#E8E4DE] bg-white text-[#2D2A26] placeholder-[#8A8580] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/30 focus:border-[#42A5F5]";
  const labelClass = "block text-xs font-semibold text-[#001D3D] uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelClass}>Nombre *</label>
        <input type="text" required placeholder="Tu nombre completo" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email *</label>
        <input type="email" required placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Teléfono</label>
        <input type="tel" placeholder="+34 600 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Llegada</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Salida</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Mensaje</label>
        <textarea
          placeholder="Cuéntanos qué necesitas: nº personas, nivel, servicios..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-[#E8E4DE] bg-white text-[#2D2A26] placeholder-[#8A8580] focus:outline-none focus:ring-2 focus:ring-[#42A5F5]/30 focus:border-[#42A5F5] resize-none"
        />
      </div>
      {status === "error" && (
        <p className="text-xs text-red-600">Error al enviar. Inténtalo de nuevo.</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-11 bg-[#42A5F5] text-white text-sm font-bold uppercase tracking-wide hover:bg-[#2196F3] disabled:opacity-60 transition-colors"
        style={BEBAS}
      >
        {status === "loading" ? "Enviando..." : "Solicitar presupuesto gratis"}
      </button>
      <p className="text-center text-xs text-[#8A8580]">Sin compromiso · Respuesta en 24h</p>
    </form>
  );
}
