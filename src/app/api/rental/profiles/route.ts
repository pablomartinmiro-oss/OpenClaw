export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createCustomerSizingProfileSchema,
} from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/rental/profiles" });
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");

  try {
    const where: Prisma.CustomerSizingProfileWhereInput = { tenantId };
    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
        { clientPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    const profiles = await prisma.customerSizingProfile.findMany({
      where,
      orderBy: { clientName: "asc" },
    });

    log.info({ count: profiles.length }, "Sizing profiles fetched");
    return NextResponse.json({ profiles });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch sizing profiles",
      code: "RENTAL_PROFILES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "rental");
  if (moduleError) return moduleError;

  const log = logger.child({ tenantId, path: "/api/rental/profiles" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCustomerSizingProfileSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Upsert by tenantId + clientEmail
    const profile = await prisma.customerSizingProfile.upsert({
      where: {
        tenantId_clientEmail: {
          tenantId,
          clientEmail: data.clientEmail,
        },
      },
      create: {
        tenantId,
        clientEmail: data.clientEmail,
        clientName: data.clientName,
        clientPhone: data.clientPhone ?? null,
        height: data.height ?? null,
        weight: data.weight ?? null,
        shoeSize: data.shoeSize ?? null,
        age: data.age ?? null,
        abilityLevel: data.abilityLevel ?? null,
        bootSoleLength: data.bootSoleLength ?? null,
        preferredDinSetting: data.preferredDinSetting ?? null,
        notes: data.notes ?? null,
      },
      update: {
        clientName: data.clientName,
        clientPhone: data.clientPhone ?? null,
        height: data.height ?? null,
        weight: data.weight ?? null,
        shoeSize: data.shoeSize ?? null,
        age: data.age ?? null,
        abilityLevel: data.abilityLevel ?? null,
        bootSoleLength: data.bootSoleLength ?? null,
        preferredDinSetting: data.preferredDinSetting ?? null,
        notes: data.notes ?? null,
      },
    });

    log.info({ profileId: profile.id }, "Sizing profile upserted");
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to create sizing profile",
      code: "RENTAL_PROFILES_ERROR",
      logContext: { tenantId },
    });
  }
}
