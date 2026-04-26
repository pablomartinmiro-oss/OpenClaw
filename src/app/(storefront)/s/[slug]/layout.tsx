import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Bebas_Neue, Raleway } from "next/font/google";
import { StorefrontShell } from "./_components/StorefrontShell";

const CONTACT_KEYS = ["contact_email", "contact_phone"];

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

function readString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "value" in value) {
    const inner = (value as { value: unknown }).value;
    if (typeof inner === "string") return inner;
  }
  return null;
}

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    notFound();
  }

  const contactSettings = await prisma.siteSetting.findMany({
    where: { tenantId: tenant.id, key: { in: CONTACT_KEYS } },
    select: { key: true, value: true },
  });

  const settingMap = new Map(contactSettings.map((s) => [s.key, s.value]));
  const contactEmail = readString(settingMap.get("contact_email"));
  const contactPhone = readString(settingMap.get("contact_phone"));

  return (
    <div className={`${bebasNeue.variable} ${raleway.variable}`}>
      <StorefrontShell
        tenantName={tenant.name}
        slug={tenant.slug}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
      >
        {children}
      </StorefrontShell>
    </div>
  );
}
