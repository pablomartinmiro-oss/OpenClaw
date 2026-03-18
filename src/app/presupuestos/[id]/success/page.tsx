import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F7] font-[DM_Sans]">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#5B8C6D]/15">
          <CheckCircle className="h-8 w-8 text-[#5B8C6D]" />
        </div>
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          ¡Pago realizado!
        </h1>
        <p className="mt-3 text-sm text-[#8A8580]">
          Tu pago ha sido procesado correctamente. Recibirás un email de
          confirmación en breve.
        </p>
        <p className="mt-4 text-sm font-medium text-[#2D2A26]">
          ¡Nos vemos en la nieve!
        </p>
        <div className="mt-6 border-t border-[#E8E4DE] pt-4">
          <p className="text-xs text-[#8A8580]">
            Si tienes alguna duda, llámanos al{" "}
            <strong>639 576 627</strong> o escríbenos a{" "}
            <a
              href="mailto:reservas@skicenter.es"
              className="text-[#E87B5A] underline"
            >
              reservas@skicenter.es
            </a>
          </p>
        </div>
        <div className="mt-4">
          <span className="text-lg font-bold tracking-wide text-[#E87B5A]">
            SKICENTER
          </span>
        </div>
      </div>
    </div>
  );
}
