import { XCircle } from "lucide-react";

export default function PaymentErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9F7] font-[DM_Sans]">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C75D4A]/15">
          <XCircle className="h-8 w-8 text-[#C75D4A]" />
        </div>
        <h1 className="text-2xl font-bold text-[#2D2A26]">
          Error en el pago
        </h1>
        <p className="mt-3 text-sm text-[#8A8580]">
          Ha ocurrido un error al procesar tu pago. No se ha realizado
          ningún cargo.
        </p>
        <p className="mt-2 text-sm text-[#8A8580]">
          Puedes intentarlo de nuevo o contactarnos para completar el pago
          por transferencia.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="mailto:reservas@skicenter.es"
            className="rounded-xl border border-[#E8E4DE] px-6 py-3 text-sm font-medium text-[#2D2A26] hover:bg-[#FAF9F7] transition-colors"
          >
            Contactar por email
          </a>
        </div>
        <div className="mt-6 border-t border-[#E8E4DE] pt-4">
          <p className="text-xs text-[#8A8580]">
            Teléfono: <strong>639 576 627</strong> · Email:
            reservas@skicenter.es
          </p>
          <p className="mt-1 text-xs text-[#8A8580]">
            IBAN para transferencia:{" "}
            <strong>ES58 0182 2900 5402 0182 7221</strong>
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
