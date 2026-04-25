import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LegalShell } from "../_components/LegalShell";

export default async function TerminosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!tenant) notFound();

  return (
    <LegalShell
      title="Terminos y condiciones"
      tenantName={tenant.name}
      updatedAt="abril 2026"
    >
      <p>
        Las presentes condiciones regulan el uso de los servicios ofrecidos
        por {tenant.name} a traves de esta tienda online.
      </p>

      <h2>1. Objeto</h2>
      <p>
        El presente documento establece las condiciones aplicables a la
        contratacion de actividades, alojamiento, restaurante, spa y
        cualquier otro servicio ofrecido por {tenant.name}.
      </p>

      <h2>2. Reservas</h2>
      <ul>
        <li>
          Las reservas estan sujetas a disponibilidad. Al completar el
          proceso de reserva el cliente acepta estas condiciones.
        </li>
        <li>
          El cliente debe facilitar datos veraces y actualizados. Cualquier
          comunicacion se realizara al email indicado en la reserva.
        </li>
      </ul>

      <h2>3. Precios y pago</h2>
      <p>
        Los precios incluyen los impuestos aplicables salvo indicacion
        contraria. El pago se realiza en el momento de la reserva o segun
        las condiciones especificas del servicio.
      </p>

      <h2>4. Politica de cancelacion</h2>
      <ul>
        <li>
          Cancelaciones con mas de 7 dias de antelacion: reembolso integro
          (excluidos costes de gestion no reembolsables).
        </li>
        <li>
          Entre 7 dias y 48 horas antes: se aplica un cargo del 50% sobre el
          importe.
        </li>
        <li>
          Menos de 48 horas o no presentacion: no procede reembolso.
        </li>
        <li>
          Cada caso se revisa individualmente. {tenant.name} podra ofrecer
          un bono de compensacion en lugar del reembolso cuando proceda.
        </li>
      </ul>

      <h2>5. Cupones y bonos</h2>
      <p>
        Los cupones de plataformas externas (Groupon, Smartbox, etc.)
        tienen sus propias condiciones, indicadas en el codigo. Los bonos
        emitidos por {tenant.name} son nominativos y no canjeables por
        dinero salvo indicacion expresa.
      </p>

      <h2>6. Responsabilidad</h2>
      <p>
        Las actividades de montana implican riesgos inherentes. El cliente
        declara conocerlos y aceptarlos. {tenant.name} no se hace
        responsable de incidencias derivadas del incumplimiento de las
        normas de seguridad.
      </p>

      <h2>7. Meteorologia</h2>
      <p>
        En caso de cierre de pistas o suspension del servicio por causas
        meteorologicas, ofreceremos una fecha alternativa, un bono o el
        reembolso de la parte no consumida.
      </p>

      <h2>8. Legislacion aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislacion espanola. Las
        controversias se sometera a los juzgados y tribunales del domicilio
        del consumidor.
      </p>

      <p className="text-xs italic text-gray-500 mt-6">
        Documento orientativo. Para una version legalmente vinculante,
        adapta este texto con asesoramiento juridico.
      </p>
    </LegalShell>
  );
}
