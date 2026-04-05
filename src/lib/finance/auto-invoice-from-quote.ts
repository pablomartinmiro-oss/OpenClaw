import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { Invoice } from "@/generated/prisma/client";

const log = logger.child({ module: "auto-invoice-from-quote" });

/**
 * Auto-generate an invoice from a paid Quote.
 * Creates Invoice + InvoiceLines from QuoteItems,
 * marks as "paid", and creates a Transaction record.
 *
 * Should be called fire-and-forget after marking a quote as paid.
 */
export async function createInvoiceFromQuote(
  tenantId: string,
  quoteId: string
): Promise<Invoice> {
  // 1. Fetch quote with items and linked reservations
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, tenantId },
    include: {
      items: true,
      reservations: { take: 1, select: { id: true } },
    },
  });

  if (!quote) {
    throw new Error(`Quote ${quoteId} no encontrada`);
  }

  if (!quote.items.length) {
    throw new Error(`Quote ${quoteId} no tiene items`);
  }

  // 2. Generate next invoice number FAC-YYYY-NNNN
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const lastInvoice = await prisma.invoice.findFirst({
    where: { tenantId, number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });

  let seq = 1;
  if (lastInvoice?.number) {
    const match = lastInvoice.number.match(/FAC-\d{4}-(\d+)/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }
  const invoiceNumber = `${prefix}${String(seq).padStart(4, "0")}`;

  // 3. Build invoice lines from quote items
  const TAX_RATE = 21;
  const lines = quote.items.map((item) => ({
    tenantId,
    description: item.name + (item.description ? ` — ${item.description}` : ""),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.totalPrice,
    taxRate: TAX_RATE,
    fiscalRegime: "general" as const,
  }));

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const taxAmount = Math.round(subtotal * (TAX_RATE / 100) * 100) / 100;
  const total = quote.totalAmount;

  // 4. Create Invoice + InvoiceLines + Transaction in a single tx
  const quoteNumber = quote.id.slice(-8).toUpperCase();
  const paymentMethod = quote.paymentMethod ?? "transfer";

  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        tenantId,
        number: invoiceNumber,
        reservationId: quote.reservations?.[0]?.id ?? null,
        status: "paid",
        subtotal,
        taxAmount,
        total,
        issuedAt: new Date(),
        paidAt: quote.paidAt ?? new Date(),
        notes: `Auto-generada desde presupuesto ${quoteNumber} (${quote.clientName})`,
        lines: {
          createMany: { data: lines },
        },
      },
    });

    await tx.transaction.create({
      data: {
        tenantId,
        invoiceId: inv.id,
        date: quote.paidAt ?? new Date(),
        amount: total,
        method: paymentMethod,
        status: "completed",
        reference: `QUOTE-${quoteNumber}`,
      },
    });

    return inv;
  });

  log.info(
    { tenantId, quoteId, invoiceId: invoice.id, invoiceNumber },
    "Invoice auto-created from paid quote"
  );

  return invoice;
}
