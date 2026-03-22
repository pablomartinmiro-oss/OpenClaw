import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto — Skicenter",
  description: "Formulario de contacto de Skicenter",
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
