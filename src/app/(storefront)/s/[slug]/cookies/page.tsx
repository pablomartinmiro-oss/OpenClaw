import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LegalShell } from "../_components/LegalShell";

export default async function CookiesPage({
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
      title="Politica de cookies"
      tenantName={tenant.name}
      updatedAt="abril 2026"
    >
      <p>
        Esta web utiliza cookies para garantizar el correcto funcionamiento
        del sitio y mejorar la experiencia de usuario.
      </p>

      <h2>1. Que son las cookies</h2>
      <p>
        Las cookies son pequenos archivos de texto que se almacenan en tu
        dispositivo cuando visitas una web. Permiten reconocerte en visitas
        sucesivas y guardar preferencias.
      </p>

      <h2>2. Tipos de cookies utilizadas</h2>
      <ul>
        <li>
          <strong>Tecnicas:</strong> imprescindibles para el funcionamiento
          del carrito, login y reservas. No requieren consentimiento.
        </li>
        <li>
          <strong>Analiticas:</strong> nos permiten conocer como se utiliza
          la web para mejorar los servicios. Se utilizan de forma agregada
          y anonima.
        </li>
        <li>
          <strong>Publicitarias:</strong> solo si se activan, permiten
          mostrar publicidad relevante segun los intereses del usuario.
        </li>
      </ul>

      <h2>3. Gestion de cookies</h2>
      <p>
        Puedes configurar o rechazar las cookies desde la configuracion de
        tu navegador. Ten en cuenta que el bloqueo de cookies tecnicas
        puede afectar al funcionamiento del sitio.
      </p>

      <ul>
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E87B5A] hover:underline"
          >
            Configurar cookies en Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E87B5A] hover:underline"
          >
            Configurar cookies en Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E87B5A] hover:underline"
          >
            Configurar cookies en Safari
          </a>
        </li>
      </ul>

      <h2>4. Cookies de terceros</h2>
      <p>
        Algunas funcionalidades pueden incluir cookies de terceros (mapas,
        videos, pasarelas de pago). En cada caso se aplican las politicas
        del proveedor correspondiente.
      </p>

      <h2>5. Actualizaciones</h2>
      <p>
        {tenant.name} puede modificar esta politica para adaptarla a
        cambios legislativos o de servicio. Te recomendamos revisarla
        periodicamente.
      </p>

      <p className="text-xs italic text-gray-500 mt-6">
        Documento orientativo. Para una version legalmente vinculante,
        adapta este texto con asesoramiento juridico.
      </p>
    </LegalShell>
  );
}
