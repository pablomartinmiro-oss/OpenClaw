import { Mountain, CheckCircle, Clock, Mail } from "lucide-react";

export default function SurveySuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col">
      <header className="bg-white border-b border-[#E8E4DE] px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E87B5A]">
            <Mountain className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-[#8A8580]">Skicenter</p>
            <p className="text-sm font-semibold text-[#2D2A26]">Solicitud recibida</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#5B8C6D]/15">
              <CheckCircle className="h-10 w-10 text-[#5B8C6D]" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#2D2A26]">¡Solicitud enviada!</h1>
            <p className="mt-2 text-[#8A8580]">
              Hemos recibido tu solicitud de presupuesto. Nuestro equipo lo revisará y te enviará una propuesta personalizada.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-[#E8E4DE] p-5 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E87B5A]/15">
                <Mail className="h-4 w-4 text-[#E87B5A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#2D2A26]">Confirmación por email</p>
                <p className="text-xs text-[#8A8580] mt-0.5">Te hemos enviado un email con los detalles de tu solicitud</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4A853]/15">
                <Clock className="h-4 w-4 text-[#D4A853]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#2D2A26]">Respuesta en menos de 24h</p>
                <p className="text-xs text-[#8A8580] mt-0.5">Recibirás tu presupuesto personalizado con precios detallados</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#8A8580]">
            ¿Tienes alguna pregunta?{" "}
            <a href="mailto:reservas@skicenter.es" className="text-[#E87B5A] hover:underline">
              reservas@skicenter.es
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
