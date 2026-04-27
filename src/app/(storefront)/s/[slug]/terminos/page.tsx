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
      title="Términos y condiciones"
      tenantName={tenant.name}
      updatedAt="abril 2026"
    >
      <p>
        Las presentes condiciones regulan el uso de los servicios ofrecidos
        por {tenant.name} a través de esta tienda online.
      </p>

      <h2>1. Objeto</h2>
      <p>
        El presente documento establece las condiciones aplicables a la
        contratación de actividades, alojamiento, restaurante, spa y
        cualquier otro servicio ofrecido por {tenant.name}.
      </p>

      <h2>2. Reservas</h2>
      <ul>
        <li>
          Las reservas están sujetas a disponibilidad. Al completar el
          proceso de reserva el cliente acepta estas condiciones.
        </li>
        <li>
          El cliente debe facilitar datos veraces y actualizados. Cualquier
          comunicación se realizará al email indicado en la reserva.
        </li>
      </ul>

      <h2>3. Precios y pago</h2>
      <p>
        Los precios incluyen los impuestos aplicables salvo indicación
        contraria. El pago se realiza en el momento de la reserva o según
        las condiciones específicas del servicio.
      </p>

      <h2>4. Política de cancelación</h2>
      <ul>
        <li>
          Cancelaciones con más de 7 días de antelación: reembolso íntegro
          (excluidos costes de gestión no reembolsables).
        </li>
        <li>
          Entre 7 días y 48 horas antes: se aplica un cargo del 50% sobre el
          importe.
        </li>
        <li>
          Menos de 48 horas o no presentación: no procede reembolso.
        </li>
        <li>
          Cada caso se revisa individualmente. {tenant.name} podrá ofrecer
          un bono de compensación en lugar del reembolso cuando proceda.
        </li>
      </ul>

      <h2>5. Cupones y bonos</h2>
      <p>
        Los cupones de plataformas externas (Groupon, Smartbox, etc.)
        tienen sus propias condiciones, indicadas en el código. Los bonos
        emitidos por {tenant.name} son nominativos y no canjeables por
        dinero salvo indicación expresa.
      </p>

      <h2>6. Responsabilidad</h2>
      <p>
        Las actividades de montaña implican riesgos inherentes. El cliente
        declara conocerlos y aceptarlos. {tenant.name} no se hace
        responsable de incidencias derivadas del incumplimiento de las
        normas de seguridad.
      </p>

      <h2>7. Meteorología</h2>
      <p>
        En caso de cierre de pistas o suspensión del servicio por causas
        meteorológicas, ofreceremos una fecha alternativa, un bono o el
        reembolso de la parte no consumida.
      </p>

      <h2>8. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Las
        controversias se someterán a los juzgados y tribunales del domicilio
        del consumidor.
      </p>

      <p className="text-xs italic text-gray-500 mt-6">
        Documento orientativo. Para una versión legalmente vinculante,
        adapta este texto con asesoramiento jurídico.
      </p>
    </LegalShell>
  );
}
