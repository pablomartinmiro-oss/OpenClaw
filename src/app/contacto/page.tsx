"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ContactForm } from "./contact-form";
import { SuccessScreen } from "./success-screen";

function ContactoContent() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <SuccessScreen isEmbed={isEmbed} />;
  }

  return (
    <div
      className={`min-h-screen ${isEmbed ? "" : "py-8 sm:py-16"}`}
      style={{ backgroundColor: "#FAF9F7", fontFamily: "var(--font-sans), sans-serif" }}
    >
      <div className="mx-auto w-full max-w-lg px-4">
        {/* Header */}
        {!isEmbed && (
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#E87B5A" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#2D2A26" }}>
              Skicenter
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#8A8580" }}>
              Tu agencia de viajes de esqui
            </p>
          </div>
        )}

        {/* Form Card */}
        <div
          className="rounded-2xl bg-white p-6 sm:p-8"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            border: "1px solid #E8E4DE",
          }}
        >
          <h2 className="mb-1 text-lg font-semibold" style={{ color: "#2D2A26" }}>
            Contacta con nosotros
          </h2>
          <p className="mb-6 text-sm" style={{ color: "#8A8580" }}>
            Rellena el formulario y te responderemos en menos de 24 horas.
          </p>

          <ContactForm onSuccess={() => setSubmitted(true)} />
        </div>

        {/* Footer */}
        {!isEmbed && (
          <p className="mt-6 text-center text-xs" style={{ color: "#8A8580" }}>
            Skicenter &copy; {new Date().getFullYear()} &mdash; Todos los derechos reservados
          </p>
        )}
      </div>
    </div>
  );
}

export default function ContactoPage() {
  return (
    <Suspense>
      <ContactoContent />
    </Suspense>
  );
}
