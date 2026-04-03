import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Look up tenant by slug
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">{tenant.name}</h1>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-white px-6 py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {tenant.name}
      </footer>
    </div>
  );
}
