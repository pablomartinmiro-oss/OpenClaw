"use client";

import { useState, type FormEvent } from "react";

const ASUNTO_OPTIONS = [
  "Presupuesto",
  "Información general",
  "Incidencia",
  "Cupones",
  "Otro",
] as const;

interface ContactFormProps {
  onSuccess: () => void;
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [asunto, setAsunto] = useState<string>("Información general");
  const [mensaje, setMensaje] = useState("");
  const [privacidad, setPrivacidad] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!nombre.trim() || !email.trim() || !mensaje.trim() || !privacidad) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    if (mensaje.trim().length < 10) {
      setError("El mensaje debe tener al menos 10 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim() || undefined,
          asunto,
          mensaje: mensaje.trim(),
          privacidad,
          website, // honeypot
        }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error || "Error al enviar el formulario. Inténtalo de nuevo.");
        return;
      }

      onSuccess();
    } catch {
      setError("Error de conexión. Comprueba tu conexión a internet e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    borderColor: "#E8E4DE",
    color: "#2D2A26",
    borderRadius: "10px",
  };

  const focusClass =
    "focus:outline-none focus:ring-2 focus:border-[#E87B5A]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from real users */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium" style={{ color: "#2D2A26" }}>
          Nombre <span style={{ color: "#E87B5A" }}>*</span>
        </label>
        <input
          type="text"
          id="nombre"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre completo"
          className={`w-full border px-3 py-2.5 text-sm ${focusClass}`}
          style={{ ...inputStyle, "--tw-ring-color": "rgba(232,123,90,0.2)" } as React.CSSProperties}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium" style={{ color: "#2D2A26" }}>
          Email <span style={{ color: "#E87B5A" }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className={`w-full border px-3 py-2.5 text-sm ${focusClass}`}
          style={{ ...inputStyle, "--tw-ring-color": "rgba(232,123,90,0.2)" } as React.CSSProperties}
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="mb-1 block text-sm font-medium" style={{ color: "#2D2A26" }}>
          Telefono
        </label>
        <input
          type="tel"
          id="telefono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+34 600 000 000"
          className={`w-full border px-3 py-2.5 text-sm ${focusClass}`}
          style={{ ...inputStyle, "--tw-ring-color": "rgba(232,123,90,0.2)" } as React.CSSProperties}
        />
      </div>

      {/* Asunto */}
      <div>
        <label htmlFor="asunto" className="mb-1 block text-sm font-medium" style={{ color: "#2D2A26" }}>
          Asunto
        </label>
        <select
          id="asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          className={`w-full appearance-none border bg-white px-3 py-2.5 text-sm ${focusClass}`}
          style={{ ...inputStyle, "--tw-ring-color": "rgba(232,123,90,0.2)" } as React.CSSProperties}
        >
          {ASUNTO_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="mensaje" className="mb-1 block text-sm font-medium" style={{ color: "#2D2A26" }}>
          Mensaje <span style={{ color: "#E87B5A" }}>*</span>
        </label>
        <textarea
          id="mensaje"
          required
          minLength={10}
          rows={4}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe tu mensaje aqui..."
          className={`w-full resize-none border px-3 py-2.5 text-sm ${focusClass}`}
          style={{ ...inputStyle, "--tw-ring-color": "rgba(232,123,90,0.2)" } as React.CSSProperties}
        />
      </div>

      {/* Privacidad */}
      <label htmlFor="privacidad" className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          id="privacidad"
          checked={privacidad}
          onChange={(e) => setPrivacidad(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border accent-[#E87B5A]"
          style={{ borderColor: "#E8E4DE" }}
          required
        />
        <span className="text-xs leading-relaxed" style={{ color: "#8A8580" }}>
          He leido y acepto la{" "}
          <a
            href="/politica-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "#E87B5A" }}
          >
            politica de privacidad
          </a>{" "}
          <span style={{ color: "#E87B5A" }}>*</span>
        </span>
      </label>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(199, 93, 74, 0.08)",
            color: "#C75D4A",
            border: "1px solid rgba(199, 93, 74, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 border-0 px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        style={{
          backgroundColor: loading ? "#D56E4F" : "#E87B5A",
          borderRadius: "10px",
        }}
        onMouseEnter={(e) => {
          if (!loading) (e.currentTarget.style.backgroundColor = "#D56E4F");
        }}
        onMouseLeave={(e) => {
          if (!loading) (e.currentTarget.style.backgroundColor = "#E87B5A");
        }}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {loading ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
