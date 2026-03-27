import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SKIINET",
    default: "SKIINET — Plataforma de gestión para escuelas de ski",
  },
  description: "Reservas, clientes, pagos e instructores en una sola plataforma inteligente. Automatiza el 85% de tu gestión.",
  keywords: ["gestión ski", "software escuela ski", "CRM ski", "reservas ski"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%230066FF'/><text x='4' y='22' font-family='system-ui' font-weight='800' font-size='14' fill='white'>SK</text><rect x='20' y='6' width='3' height='20' rx='1.5' fill='white'/><rect x='25' y='6' width='3' height='20' rx='1.5' fill='white'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
