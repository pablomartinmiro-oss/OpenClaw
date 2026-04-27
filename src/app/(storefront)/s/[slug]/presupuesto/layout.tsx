import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicita tu presupuesto",
};

export default function PresupuestoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
