export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createCashRegisterSchema } from "@/lib/validation";

export async function GET(_request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/tpv/registers" });

  try {
    const registers = await prisma.cashRegister.findMany({
      where: { tenantId },
      include: { _count: { select: { sessions: true } } },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: registers.length }, "Cash registers fetched");
    return NextResponse.json({ registers });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener cajas registradoras",
      code: "REGISTERS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/tpv/registers" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createCashRegisterSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const register = await prisma.cashRegister.create({
      data: {
        tenantId,
        name: data.name,
        location: data.location ?? null,
        active: data.active,
      },
    });

    log.info({ registerId: register.id }, "Cash register created");
    return NextResponse.json({ register }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear caja registradora",
      code: "REGISTER_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
