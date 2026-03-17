import { prisma } from "@/lib/db";

/**
 * Determine data source for a tenant:
 * - "live" if tenant has a GHL access token (connected to GHL)
 * - "mock" otherwise (uses local/mock data)
 */
export async function getDataMode(tenantId: string): Promise<"mock" | "live"> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { ghlAccessToken: true },
  });
  return tenant?.ghlAccessToken ? "live" : "mock";
}
