export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import {
  validateBody,
  createSettlementDocumentSchema,
} from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}/documents`,
  });

  try {
    const settlement = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!settlement) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    const documents = await prisma.settlementDocument.findMany({
      where: { settlementId: id, tenantId },
      orderBy: { uploadedAt: "desc" },
    });

    log.info({ count: documents.length }, "Settlement documents fetched");
    return NextResponse.json({ documents });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener documentos de liquidacion",
      code: "SETTLEMENT_DOCS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}/documents`,
  });

  try {
    const settlement = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!settlement) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, createSettlementDocumentSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const document = await prisma.settlementDocument.create({
      data: {
        tenantId,
        settlementId: id,
        url: validated.data.url,
      },
    });

    log.info({ documentId: document.id }, "Settlement document created");
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear documento de liquidacion",
      code: "SETTLEMENT_DOC_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
