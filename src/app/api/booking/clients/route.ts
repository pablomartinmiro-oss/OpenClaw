export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createClientSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/clients" });
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "25")));
  const skip = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = {
      tenantId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    log.info({ count: clients.length, total, page }, "Clients fetched");
    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch clients",
      code: "BOOKING_CLIENTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/clients" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createClientSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const client = await prisma.client.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        birthDate: data.birthDate ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,
        conversionSource: data.conversionSource ?? null,
      },
    });

    log.info({ clientId: client.id }, "Client created");
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create client",
      code: "BOOKING_CLIENTS_ERROR",
      logContext: { tenantId },
    });
  }
}
