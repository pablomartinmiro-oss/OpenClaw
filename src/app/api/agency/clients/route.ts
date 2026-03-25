import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/agency/clients" });

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
    });

    const clientsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const [contacts, opps, conversations] = await Promise.all([
          prisma.cachedContact.count({ where: { tenantId: tenant.id } }),
          prisma.cachedOpportunity.count({ where: { tenantId: tenant.id } }),
          prisma.cachedConversation.count({ where: { tenantId: tenant.id } }),
        ]);

        const wonOpps = await prisma.cachedOpportunity.count({
          where: { tenantId: tenant.id, status: "won" },
        });

        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          syncState: tenant.syncState,
          lastSyncAt: tenant.lastSyncAt,
          ghlLocationId: tenant.ghlLocationId,
          isDemo: tenant.isDemo,
          isActive: tenant.isActive,
          stats: {
            contacts,
            opportunities: opps,
            conversations,
            wonOpportunities: wonOpps,
            winRate: opps > 0 ? Math.round((wonOpps / opps) * 100) : 0,
          },
        };
      })
    );

    return NextResponse.json({ clients: clientsWithStats });
  } catch (err) {
    log.error({ err }, "Failed to fetch agency clients");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, ghlLocationId, plan } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "name and slug required" }, { status: 400 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        ghlLocationId: ghlLocationId || null,
        isActive: true,
        isDemo: false,
      },
    });

    log.info({ tenantId: tenant.id, name, plan }, "New client created");

    return NextResponse.json({ client: tenant });
  } catch (err) {
    log.error({ err }, "Failed to create client");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
