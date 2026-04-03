export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { generateInvoicePDF } from "@/lib/pdf/invoice-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { id } = await params;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;

  const log = logger.child({
    tenantId,
    path: `/api/finance/invoices/${id}/pdf`,
  });

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { name: true, email: true } },
        lines: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    const pdf = await generateInvoicePDF({
      tenantName: tenant?.name ?? "Empresa",
      invoiceNumber: invoice.number,
      clientName: invoice.client?.name ?? "Sin cliente",
      clientEmail: invoice.client?.email,
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
      lines: invoice.lines.map((l) => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
        lineTotal: l.lineTotal,
      })),
    });

    log.info({ invoiceId: id }, "Invoice PDF generated");

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al generar PDF de factura",
      code: "INVOICE_PDF_ERROR",
      logContext: { tenantId },
    });
  }
}
