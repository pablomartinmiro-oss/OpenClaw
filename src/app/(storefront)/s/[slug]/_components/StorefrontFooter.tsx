import Link from "next/link";

interface StorefrontFooterProps {
  tenantName: string;
  slug: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export function StorefrontFooter({
  tenantName,
  slug,
  contactEmail,
  contactPhone,
}: StorefrontFooterProps) {
  const base = `/s/${slug}`;
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {tenantName}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Reserva actividades, alojamiento y experiencias en un solo
              lugar.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Servicios
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <FooterLink href={`${base}/canjear`}>Canjear cupon</FooterLink>
              <FooterLink href={`${base}/presupuesto`}>
                Solicitar presupuesto
              </FooterLink>
              <FooterLink href={`${base}/cancelar`}>
                Cancelar reserva
              </FooterLink>
              <FooterLink href={`${base}/bono`}>Verificar bono</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Contacto
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-gray-900"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li>
                  <a
                    href={`tel:${contactPhone}`}
                    className="hover:text-gray-900"
                  >
                    {contactPhone}
                  </a>
                </li>
              )}
              {!contactEmail && !contactPhone && (
                <li className="text-gray-400">
                  Disponible en cada experiencia
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {tenantName}. Todos los derechos
            reservados.
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href={`${base}/politica-privacidad`}
              className="hover:text-gray-900"
            >
              Privacidad
            </Link>
            <Link href={`${base}/terminos`} className="hover:text-gray-900">
              Terminos
            </Link>
            <Link href={`${base}/cookies`} className="hover:text-gray-900">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link href={href} className="hover:text-gray-900">
        {children}
      </Link>
    </li>
  );
}
