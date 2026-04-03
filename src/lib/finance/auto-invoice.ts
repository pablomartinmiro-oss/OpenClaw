import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { Invoice } from "@/generated/prisma/client";

const log = logger.child({ module: "auto-invoice" });

/**
 * Auto-generate an invoice from a TPV sale.
 * Since TPV sales are immediate payment, the invoice is created as "paid"
 * and a Transaction record is created.
 */
export async function createInvoiceFromTpvSale(
  tenantId: string,
  saleId: string
): Promise<Invoice> {
  // 1. Fetch the TpvSale with items
  const sale = await prisma.tpvSale.findFirst({
    where: { id: saleId, tenantId },
    include: { items: true },
  });

  if (!sale) {
    throw new Error(`TpvSale ${saleId} no encontrada`);
  }

  // 2. Generate next invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });

  const year = new Date().getFullYear();
  let seq = 1;
  if (lastInvoice?.number) {
    const match = lastInvoice.number.match(/FAC-\d{4}-(\d+)/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }
  const invoiceNumber = `FAC-${year}-${String(seq).padStart(4, "0")}`;

  // 3. Calculate totals from items
  const lines = sale.items.map((item) => ({
    tenantId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.lineTotal,
    taxRate: item.taxPerLine > 0 ? 21 : 0,
    fiscalRegime: item.fiscalRegime,
  }));

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const taxAmount = sale.totalTax;
  const total = sale.totalAmount;

  // 4. Create Invoice + InvoiceLines + Transaction in a single tx
  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        tenantId,
        number: invoiceNumber,
        clientId: sale.clientId,
        status: "paid",
        subtotal,
        taxAmount,
        total,
        issuedAt: new Date(),
        paidAt: new Date(),
        notes: `Auto-generada desde venta TPV ${sale.ticketNumber}`,
        lines: {
          createMany: { data: lines },
        },
      },
    });

    // Determine primary payment method from paymentMethods JSON
    const methods = sale.paymentMethods as Record<string, number>;
    let primaryMethod = "cash";
    let maxAmount = 0;
    for (const [method, amount] of Object.entries(methods)) {
      if (amount > maxAmount) {
        maxAmount = amount;
        primaryMethod = method;
      }
    }

    await tx.transaction.create({
      data: {
        tenantId,
        invoiceId: inv.id,
        date: sale.date,
        amount: total,
        method: primaryMethod,
        status: "completed",
        reference: `TPV-${sale.ticketNumber}`,
      },
    });

    return inv;
  });

  log.info(
    { tenantId, saleId, invoiceId: invoice.id, invoiceNumber },
    "Invoice auto-created from TPV sale"
  );

  return invoice;
}
