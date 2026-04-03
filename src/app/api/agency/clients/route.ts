export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";

const log = logger.child({ route: "/api/agency/clients" });

/**
 * Agency-level route — restricted to:
 * 1. Requests with valid AGENCY_SECRET header, OR
 * 2. Authenticated users with "owner" role
 */
function verifyAgencyAccess(req: NextRequest, roleName?: string): boolean {
  const secret = process.env.AGENCY_SECRET;
  if (secret) {
    const headerSecret = req.headers.get("x-agency-secret");
    if (headerSecret === secret) return true;
  }
  return roleName === "owner";
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!verifyAgencyAccess(req, session?.user?.roleName)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    return apiError(err, {
      publicMessage: "Error al cargar clientes de agencia",
      code: "AGENCY_CLIENTS_FETCH_FAILED",
    });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!verifyAgencyAccess(req, session?.user?.roleName)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    return apiError(err, {
      publicMessage: "Error al crear cliente",
      code: "AGENCY_CLIENT_CREATE_FAILED",
    });
  }
}
