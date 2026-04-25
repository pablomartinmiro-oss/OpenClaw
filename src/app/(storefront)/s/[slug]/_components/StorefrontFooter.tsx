import Link from "next/link";

interface StorefrontFooterProps {
  tenantName: string;
  slug: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

const DESTINOS = [
  "Baqueira Beret",
  "Sierra Nevada",
  "Formigal",
  "Alto Campoo",
  "Candanchu",
  "Astun",
  "La Pinilla",
];

const SERVICIOS = [
  { label: "Packs todo incluido", path: "/experiencias?category=pack" },
  { label: "Forfaits", path: "/experiencias?category=forfait" },
  { label: "Alquiler de material", path: "/experiencias?category=alquiler" },
  { label: "Escuela de esqui", path: "/experiencias?category=escuela" },
  { label: "Apres-ski", path: "/experiencias?category=apreski" },
  { label: "Taquillas", path: "/experiencias?category=locker" },
];

export function StorefrontFooter({
  tenantName,
  slug,
  contactEmail,
  contactPhone,
}: StorefrontFooterProps) {
  const base = `/s/${slug}`;
  const phoneHref = contactPhone ? `tel:${contactPhone.replace(/\s+/g, "")}` : null;
  const waHref = contactPhone
    ? `https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <footer id="contacto" className="bg-[#0F1A2B] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white text-base font-bold mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E87B5A]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20l4.5-7 3.5 4 5-8 5 11z" />
                  <circle cx="17" cy="6" r="1.5" />
                </svg>
              </span>
              {tenantName}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Tu agencia de viajes de esqui de confianza. Mas de 4.000
              viajeros han disfrutado con nosotros.
            </p>
            <div className="flex gap-2">
              <SocialIcon
                href="https://instagram.com"
                label="Instagram"
                d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6a4 4 0 100 8 4 4 0 000-8zm6.5-1a1 1 0 100 2 1 1 0 000-2z"
              />
              <SocialIcon
                href="https://facebook.com"
                label="Facebook"
                d="M14 9h3V5h-3a4 4 0 00-4 4v2H7v4h3v8h4v-8h3l1-4h-4V9z"
              />
              <SocialIcon
                href="https://youtube.com"
                label="YouTube"
                d="M23 7s-.2-1.6-.8-2.3c-.8-1-1.7-1-2.1-1C17 3.5 12 3.5 12 3.5s-5 0-8.1.2c-.4.1-1.3.1-2.1 1C1.2 5.4 1 7 1 7S.8 8.9.8 10.7v1.7C.8 14.3 1 16 1 16s.2 1.6.8 2.3c.8 1 1.9 1 2.4 1.1 1.7.2 7.8.2 7.8.2s5 0 8.1-.2c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.3.8-2.3s.2-1.8.2-3.7v-1.7C23.2 8.9 23 7 23 7zM9.7 14.3V7.7L16.1 11l-6.4 3.3z"
              />
            </div>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Destinos
            </h3>
            <ul className="space-y-2 text-sm">
              {DESTINOS.map((d) => (
                <li key={d}>
                  <Link
                    href={`${base}/experiencias?station=${encodeURIComponent(d)}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Servicios
            </h3>
            <ul className="space-y-2 text-sm">
              {SERVICIOS.map((s) => (
                <li key={s.path}>
                  <Link
                    href={`${base}${s.path}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              {phoneHref && (
                <li>
                  <a
                    href={phoneHref}
                    className="flex items-start gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <PhoneIcon />
                    <span>{contactPhone}</span>
                  </a>
                </li>
              )}
              {waHref && (
                <li>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <WhatsAppIcon />
                    <span>WhatsApp</span>
                  </a>
                </li>
              )}
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-start gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <MailIcon />
                    <span className="break-all">{contactEmail}</span>
                  </a>
                </li>
              )}
              <li className="pt-2">
                <Link
                  href={`${base}/presupuesto`}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-[#E87B5A] hover:bg-[#D56E4F] rounded-lg transition-colors"
                >
                  Solicita presupuesto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {tenantName}. Todos los derechos
            reservados.
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={`${base}/canjear`} className="hover:text-white">
              Canjear cupon
            </Link>
            <Link href={`${base}/cancelar`} className="hover:text-white">
              Cancelar reserva
            </Link>
            <Link href={`${base}/bono`} className="hover:text-white">
              Verificar bono
            </Link>
            <Link href={`${base}/politica-privacidad`} className="hover:text-white">
              Privacidad
            </Link>
            <Link href={`${base}/terminos`} className="hover:text-white">
              Terminos
            </Link>
            <Link href={`${base}/cookies`} className="hover:text-white">
              Cookies
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, d }: { href: string; label: string; d: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-[#E87B5A] text-white transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d={d} />
      </svg>
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
