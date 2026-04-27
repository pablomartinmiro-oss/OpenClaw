import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiencias",
};

export default function ExperienciasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
