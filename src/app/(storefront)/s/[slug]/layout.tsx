import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StorefrontShell } from "./_components/StorefrontShell";

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

  return (
    <StorefrontShell tenantName={tenant.name} slug={tenant.slug}>
      {children}
    </StorefrontShell>
  );
}
