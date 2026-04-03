import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { ReavExpedient } from "@/generated/prisma/client";

const log = logger.child({ module: "auto-reav" });

// REAV margin percentage for travel agency special regime
const REAV_VAT_RATE = 21; // %

/**
 * Auto-create a REAV expedient from an invoice if it contains
 * lines with fiscalRegime = "reav".
 * Returns null if no REAV lines exist.
 */
export async function createReavFromInvoice(
  tenantId: string,
  invoiceId: string
): Promise<ReavExpedient | null> {
  // 1. Fetch invoice with lines
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId },
    include: { lines: true },
  });

  if (!invoice) {
    log.warn({ tenantId, invoiceId }, "Invoice not found for REAV check");
    return null;
  }

  // 2. Filter REAV lines only
  const reavLines = invoice.lines.filter(
    (l) => l.fiscalRegime === "reav"
  );

  if (reavLines.length === 0) {
    log.info({ invoiceId }, "No REAV lines — skipping expedient creation");
    return null;
  }

  // 3. Check if REAV expedient already exists
  const existing = await prisma.reavExpedient.findFirst({
    where: { tenantId, invoiceId },
  });

  if (existing) {
    log.info(
      { invoiceId, expedientId: existing.id },
      "REAV expedient already exists"
    );
    return existing;
  }

  // 4. Calculate REAV amounts
  // Sale amount = sum of REAV line totals
  const saleAmount = reavLines.reduce((sum, l) => sum + l.lineTotal, 0);

  // Cost is estimated as the non-margin part (a simplified approach).
  // In REAV, the travel agency only pays VAT on the margin.
  // Default cost percentage = 80% (typical for travel agencies)
  const costPercentage = 80;
  const costAmount = saleAmount * (costPercentage / 100);
  const marginAmount = saleAmount - costAmount;
  const marginPercentage =
    saleAmount > 0 ? (marginAmount / saleAmount) * 100 : 0;

  // Taxable base = margin amount / (1 + VAT_RATE/100)
  const taxableBase = marginAmount / (1 + REAV_VAT_RATE / 100);
  const vat = marginAmount - taxableBase;

  // 5. Create REAV expedient
  const expedient = await prisma.reavExpedient.create({
    data: {
      tenantId,
      invoiceId,
      operationType: "standard",
      costPercentage,
      marginPercentage,
      marginAmount,
      taxableBase,
      vat,
    },
  });

  log.info(
    {
      tenantId,
      invoiceId,
      expedientId: expedient.id,
      saleAmount,
      marginAmount,
    },
    "REAV expedient auto-created from invoice"
  );

  return expedient;
}
