"use client";

interface SuccessScreenProps {
  isEmbed: boolean;
}

export function SuccessScreen({ isEmbed }: SuccessScreenProps) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center ${isEmbed ? "" : "py-8 sm:py-16"}`}
      style={{ backgroundColor: "#FAF9F7", fontFamily: "var(--font-sans), sans-serif" }}
    >
      <div className="mx-auto w-full max-w-lg px-4 text-center">
        <div
          className="rounded-2xl bg-white p-8 sm:p-12"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
            border: "1px solid #E8E4DE",
            animation: "contactFadeIn 0.5s ease-out",
          }}
        >
          {/* Checkmark circle */}
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(91, 140, 109, 0.1)",
              animation: "contactScaleIn 0.4s ease-out",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5B8C6D"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="mb-2 text-xl font-bold" style={{ color: "#2D2A26" }}>
            Gracias! Te contactaremos pronto.
          </h2>
          <p className="mb-8 text-sm leading-relaxed" style={{ color: "#8A8580" }}>
            Hemos recibido tu mensaje y te responderemos en menos de 24 horas.
          </p>

          {!isEmbed && (
            <a
              href="https://skicenter.es"
              className="inline-block px-6 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: "#E87B5A", borderRadius: "10px" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D56E4F")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E87B5A")}
            >
              Volver a la web
            </a>
          )}
        </div>

        {/* Inline CSS animations */}
        <style>{`
          @keyframes contactFadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes contactScaleIn {
            from { opacity: 0; transform: scale(0.6); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
