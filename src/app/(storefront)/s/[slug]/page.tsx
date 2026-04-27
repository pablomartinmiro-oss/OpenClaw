import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Hero, TrustBar } from "./_components/home/Hero";
import { Destinations } from "./_components/home/Destinations";
import { PartnerLogos } from "./_components/home/PartnerLogos";
import { Services, HowItWorks } from "./_components/home/Services";
import {
  Testimonials,
  Financing,
  ContactCTA,
} from "./_components/home/Testimonials";
import { Offers } from "./_components/home/Offers";
import { WhatsAppButton } from "./_components/home/WhatsAppButton";

export const metadata: Metadata = {
  title: { absolute: "Skicenter — Tu viaje de esquí en un solo clic" },
};

const CONTACT_KEYS = ["contact_email", "contact_phone"];

function readString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "value" in value) {
    const inner = (value as { value: unknown }).value;
    if (typeof inner === "string") return inner;
  }
  return null;
}

export default async function StorefrontHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!tenant) notFound();

  const settings = await prisma.siteSetting.findMany({
    where: { tenantId: tenant.id, key: { in: CONTACT_KEYS } },
    select: { key: true, value: true },
  });
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const contactEmail = readString(map.get("contact_email"));
  const contactPhone = readString(map.get("contact_phone"));

  return (
    <>
      <Hero slug={slug} />
      <TrustBar />
      <Destinations slug={slug} />
      <PartnerLogos />
      <Offers slug={slug} />
      <Services slug={slug} />
      <section className="w-full">
        <Image
          src="/banner_nivel_skicenter.jpg"
          alt="Niveles de esquí: principiante, intermedio, avanzado"
          width={1536}
          height={213}
          className="w-full h-auto"
        />
      </section>
      <HowItWorks slug={slug} />
      <Testimonials />
      <Financing slug={slug} />
      <ContactCTA
        slug={slug}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
      />
      <WhatsAppButton />
    </>
  );
}
