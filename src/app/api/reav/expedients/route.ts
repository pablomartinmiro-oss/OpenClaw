export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createReavExpedientSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/reav/expedients" });
  const { searchParams } = request.nextUrl;
  const invoiceId = searchParams.get("invoiceId");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (invoiceId) where.invoiceId = invoiceId;

    const expedients = await prisma.reavExpedient.findMany({
      where,
      include: {
        invoice: { select: { id: true, number: true } },
        _count: { select: { costs: true, documents: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    log.info({ count: expedients.length }, "REAV expedients fetched");
    return NextResponse.json({ expedients });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener expedientes REAV",
      code: "REAV_EXPEDIENTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "reav");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/reav/expedients" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createReavExpedientSchema);
    if (!validated.ok)
      return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    // Verify invoice belongs to tenant
    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, tenantId },
      select: { id: true },
    });
    if (!invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const expedient = await prisma.reavExpedient.create({
      data: {
        tenantId,
        invoiceId: data.invoiceId,
        operationType: data.operationType,
        costPercentage: data.costPercentage,
        marginPercentage: data.marginPercentage,
        marginAmount: data.marginAmount,
        taxableBase: data.taxableBase,
        vat: data.vat,
      },
      include: {
        invoice: { select: { id: true, number: true } },
      },
    });

    log.info({ expedientId: expedient.id }, "REAV expedient created");
    return NextResponse.json({ expedient }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear expediente REAV",
      code: "REAV_EXPEDIENT_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
