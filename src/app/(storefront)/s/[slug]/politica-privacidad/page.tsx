import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LegalShell } from "../_components/LegalShell";

export default async function PoliticaPrivacidadPage({
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
      title="Politica de privacidad"
      tenantName={tenant.name}
      updatedAt="abril 2026"
    >
      <p>
        En {tenant.name} respetamos tu privacidad y nos comprometemos a
        proteger los datos personales que nos facilitas. Esta politica
        describe como recopilamos, utilizamos y protegemos tu informacion.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos es {tenant.name}. Para
        cualquier consulta relacionada con la proteccion de datos puedes
        contactar con nosotros a traves de los canales habilitados en la
        web.
      </p>

      <h2>2. Datos que recopilamos</h2>
      <ul>
        <li>Datos identificativos: nombre, email, telefono.</li>
        <li>
          Datos de reserva: fechas, servicios contratados, metodo de pago.
        </li>
        <li>
          Datos tecnicos: direccion IP, tipo de navegador y datos de
          navegacion (cookies).
        </li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <ul>
        <li>Gestionar reservas, cancelaciones y bonos.</li>
        <li>Enviar comunicaciones operativas relacionadas con tu reserva.</li>
        <li>Cumplir con obligaciones legales y fiscales.</li>
        <li>
          Si das tu consentimiento, enviar comunicaciones comerciales y
          ofertas.
        </li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        El tratamiento se basa en la ejecucion de un contrato (reserva), en
        el consentimiento del usuario (comunicaciones comerciales) y en el
        cumplimiento de obligaciones legales aplicables.
      </p>

      <h2>5. Conservacion de datos</h2>
      <p>
        Conservamos tus datos durante el tiempo necesario para cumplir con
        la finalidad para la que fueron recogidos y, posteriormente, durante
        los plazos legales de conservacion.
      </p>

      <h2>6. Derechos del usuario</h2>
      <p>
        Tienes derecho a acceder, rectificar, suprimir, oponerte, limitar el
        tratamiento y solicitar la portabilidad de tus datos. Para
        ejercerlos, escribenos a la direccion de contacto que aparece en
        nuestra web.
      </p>

      <h2>7. Cesion de datos</h2>
      <p>
        No cedemos tus datos a terceros salvo obligacion legal o cuando sea
        necesario para la prestacion del servicio (por ejemplo, pasarelas
        de pago, plataformas de reserva externa).
      </p>

      <h2>8. Cambios en la politica</h2>
      <p>
        Esta politica puede actualizarse. Te recomendamos revisarla
        periodicamente.
      </p>

      <p className="text-xs italic text-gray-500 mt-6">
        Documento orientativo. Para una version legalmente vinculante,
        adapta este texto con asesoramiento juridico.
      </p>
    </LegalShell>
  );
}
