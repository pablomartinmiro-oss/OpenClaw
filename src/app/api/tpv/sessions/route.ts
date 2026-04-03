export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, openCashSessionSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/tpv/sessions" });
  const { searchParams } = request.nextUrl;
  const registerId = searchParams.get("registerId");
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (registerId) where.registerId = registerId;
    if (status) where.status = status;

    const sessions = await prisma.cashSession.findMany({
      where,
      include: {
        register: { select: { id: true, name: true } },
        openedBy: { select: { id: true, name: true } },
        _count: { select: { movements: true, sales: true } },
      },
      orderBy: { openedAt: "desc" },
    });

    log.info({ count: sessions.length }, "Cash sessions fetched");
    return NextResponse.json({ sessions });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener sesiones de caja",
      code: "SESSIONS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId, userId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/tpv/sessions" });

  try {
    const body = await request.json();
    const validated = validateBody(body, openCashSessionSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify register belongs to tenant
    const register = await prisma.cashRegister.findFirst({
      where: { id: data.registerId, tenantId, active: true },
    });
    if (!register) {
      return NextResponse.json(
        { error: "Caja registradora no encontrada o inactiva" },
        { status: 404 }
      );
    }

    // Check no open session for this register
    const openSession = await prisma.cashSession.findFirst({
      where: { tenantId, registerId: data.registerId, status: "open" },
    });
    if (openSession) {
      return NextResponse.json(
        { error: "Ya existe una sesion abierta para esta caja" },
        { status: 409 }
      );
    }

    const cashSession = await prisma.cashSession.create({
      data: {
        tenantId,
        registerId: data.registerId,
        openedById: userId,
        openingAmount: data.openingAmount,
        status: "open",
      },
      include: {
        register: { select: { id: true, name: true } },
        openedBy: { select: { id: true, name: true } },
      },
    });

    log.info(
      { sessionId: cashSession.id },
      "Cash session opened"
    );
    return NextResponse.json({ session: cashSession }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al abrir sesion de caja",
      code: "SESSION_OPEN_ERROR",
      logContext: { tenantId },
    });
  }
}
