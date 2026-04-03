import { prisma } from "@/lib/db";

export interface PublicTenant {
  id: string;
  name: string;
  slug: string;
}

/**
 * Look up a tenant by slug for public storefront routes (no auth required).
 * Returns null if not found.
 */
export async function lookupTenant(
  slug: string
): Promise<PublicTenant | null> {
  return prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
}
