export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { generateSettlementPDF } from "@/lib/pdf/settlement-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "suppliers");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/suppliers/settlements/${id}/pdf`,
  });

  try {
    const settlement = await prisma.supplierSettlement.findFirst({
      where: { id, tenantId },
      include: {
        supplier: {
          select: {
            fiscalName: true,
            nif: true,
            iban: true,
          },
        },
        lines: { orderBy: { serviceDate: "asc" } },
      },
    });

    if (!settlement) {
      return NextResponse.json(
        { error: "Liquidacion no encontrada" },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    const pdf = await generateSettlementPDF({
      tenantName: tenant?.name ?? "Empresa",
      settlementNumber: settlement.number,
      startDate: settlement.startDate,
      endDate: settlement.endDate,
      supplierFiscalName: settlement.supplier.fiscalName,
      supplierNif: settlement.supplier.nif,
      supplierIban: settlement.supplier.iban,
      grossAmount: settlement.grossAmount,
      commissionAmount: settlement.commissionAmount,
      netAmount: settlement.netAmount,
      lines: settlement.lines.map((l) => ({
        serviceType: l.serviceType,
        serviceDate: l.serviceDate,
        paxCount: l.paxCount,
        saleAmount: l.saleAmount,
        commissionPercentage: l.commissionPercentage,
        commissionAmount: l.commissionAmount,
      })),
    });

    log.info({ settlementId: id }, "Settlement PDF generated");

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${settlement.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al generar PDF de liquidacion",
      code: "SETTLEMENT_PDF_ERROR",
      logContext: { tenantId },
    });
  }
}
