export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createClientSchema } from "@/lib/validation";
import type { Prisma } from "@/generated/prisma/client";

const SORTABLE_FIELDS = new Set([
  "name",
  "email",
  "createdAt",
  "totalSpent",
  "visitCount",
  "lastVisit",
]);

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/booking/clients" });
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const skiLevel = searchParams.get("skiLevel");
  const station = searchParams.get("station");
  const source = searchParams.get("source");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "25")));
  const skip = (page - 1) * limit;

  const orderField = SORTABLE_FIELDS.has(sortBy) ? sortBy : "createdAt";

  try {
    const where: Prisma.ClientWhereInput = {
      tenantId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { dni: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(skiLevel ? { skiLevel } : {}),
      ...(station ? { preferredStation: station } : {}),
      ...(source ? { conversionSource: source } : {}),
    };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [clients, total, statsRow, newThisMonth] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { [orderField]: sortDir },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
      prisma.client.aggregate({
        where: { tenantId },
        _sum: { totalSpent: true, visitCount: true },
        _avg: { totalSpent: true },
        _count: { _all: true },
      }),
      prisma.client.count({
        where: { tenantId, createdAt: { gte: startOfMonth } },
      }),
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
      stats: {
        totalClients: statsRow._count._all,
        avgSpent: Math.round(statsRow._avg.totalSpent ?? 0),
        totalVisits: statsRow._sum.visitCount ?? 0,
        newThisMonth,
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
        skiLevel: data.skiLevel ?? null,
        preferredStation: data.preferredStation ?? null,
        bootSize: data.bootSize ?? null,
        height: data.height ?? null,
        weight: data.weight ?? null,
        helmetSize: data.helmetSize ?? null,
        language: data.language ?? null,
        dni: data.dni ?? null,
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
