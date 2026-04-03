import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "pdf" });

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

interface InvoicePDFParams {
  tenantName: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string | null;
  status: string;
  issuedAt?: Date | string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string | null;
  lines: InvoiceLine[];
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
  cancelled: "Anulada",
};

const CORAL = rgb(232 / 255, 123 / 255, 90 / 255);
const DARK = rgb(45 / 255, 42 / 255, 38 / 255);
const GRAY = rgb(138 / 255, 133 / 255, 128 / 255);
const LIGHT_BG = rgb(250 / 255, 249 / 255, 247 / 255);
const WHITE = rgb(1, 1, 1);
const TABLE_BORDER = rgb(232 / 255, 228 / 255, 222 / 255);

export async function generateInvoicePDF(
  params: InvoicePDFParams
): Promise<Buffer> {
  log.info({ invoiceNumber: params.invoiceNumber }, "Generating invoice PDF");

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;
  const marginLeft = 50;
  const marginRight = width - 50;
  const contentWidth = marginRight - marginLeft;

  // Header background
  page.drawRectangle({
    x: 0, y: height - 100, width, height: 100,
    color: DARK,
  });

  // Header text
  page.drawText(params.tenantName.toUpperCase(), {
    x: marginLeft, y: height - 55, size: 28,
    font: fontBold, color: WHITE,
  });
  page.drawText(`Factura ${params.invoiceNumber}`, {
    x: marginLeft, y: height - 78, size: 12,
    font: fontRegular, color: CORAL,
  });

  // Status badge right-aligned
  const statusText = STATUS_LABELS[params.status] ?? params.status;
  const statusWidth = fontBold.widthOfTextAtSize(statusText, 11);
  page.drawText(statusText, {
    x: marginRight - statusWidth, y: height - 55,
    size: 11, font: fontBold, color: CORAL,
  });

  y = height - 130;

  // Client data block
  page.drawText("DATOS DEL CLIENTE", {
    x: marginLeft, y, size: 11, font: fontBold, color: CORAL,
  });
  y -= 20;

  const clientInfo = [
    `Nombre: ${params.clientName}`,
    ...(params.clientEmail ? [`Email: ${params.clientEmail}`] : []),
  ];
  for (const line of clientInfo) {
    page.drawText(line, {
      x: marginLeft, y, size: 10, font: fontRegular, color: DARK,
    });
    y -= 16;
  }

  y -= 10;

  // Table header
  const colX = [
    marginLeft,
    marginLeft + 200,
    marginLeft + 270,
    marginLeft + 340,
    marginLeft + 400,
  ];
  const headers = ["Descripcion", "Cantidad", "Precio/ud", "IVA %", "Total"];

  page.drawRectangle({
    x: marginLeft - 5, y: y - 4,
    width: contentWidth + 10, height: 20,
    color: LIGHT_BG,
  });

  for (let i = 0; i < headers.length; i++) {
    page.drawText(headers[i], {
      x: colX[i], y, size: 9, font: fontBold, color: GRAY,
    });
  }
  y -= 6;

  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: marginRight, y },
    thickness: 1, color: TABLE_BORDER,
  });
  y -= 16;

  // Line items
  for (const line of params.lines) {
    const name = line.description.length > 30
      ? line.description.substring(0, 27) + "..."
      : line.description;

    page.drawText(name, {
      x: colX[0], y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(String(line.quantity), {
      x: colX[1] + 15, y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(formatEUR(line.unitPrice), {
      x: colX[2], y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(`${line.taxRate}%`, {
      x: colX[3] + 5, y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(formatEUR(line.lineTotal), {
      x: colX[4], y, size: 9, font: fontBold, color: DARK,
    });

    y -= 18;
    if (y < 160) break;
  }

  // Summary section
  y -= 8;
  page.drawLine({
    start: { x: marginLeft, y: y + 10 },
    end: { x: marginRight, y: y + 10 },
    thickness: 1, color: TABLE_BORDER,
  });

  // Subtotal
  const labelX = colX[3] - 40;
  const valueX = colX[4];

  page.drawText("Subtotal", {
    x: labelX, y, size: 10, font: fontRegular, color: GRAY,
  });
  page.drawText(formatEUR(params.subtotal), {
    x: valueX, y, size: 10, font: fontRegular, color: DARK,
  });
  y -= 16;

  // Tax total
  page.drawText("IVA", {
    x: labelX, y, size: 10, font: fontRegular, color: GRAY,
  });
  page.drawText(formatEUR(params.taxAmount), {
    x: valueX, y, size: 10, font: fontRegular, color: DARK,
  });
  y -= 20;

  // Grand total
  page.drawLine({
    start: { x: labelX, y: y + 8 },
    end: { x: marginRight, y: y + 8 },
    thickness: 2, color: DARK,
  });

  page.drawText("TOTAL", {
    x: labelX, y, size: 12, font: fontBold, color: DARK,
  });
  page.drawText(formatEUR(params.total), {
    x: valueX, y, size: 12, font: fontBold, color: CORAL,
  });

  y -= 30;

  // Notes
  if (params.notes) {
    page.drawText("OBSERVACIONES", {
      x: marginLeft, y, size: 11, font: fontBold, color: CORAL,
    });
    y -= 18;
    const truncatedNotes = params.notes.length > 200
      ? params.notes.substring(0, 197) + "..."
      : params.notes;
    page.drawText(truncatedNotes, {
      x: marginLeft, y, size: 9, font: fontRegular, color: DARK,
    });
    y -= 20;
  }

  // Footer
  const dateLabel = `Fecha de emision: ${formatDate(params.issuedAt)}`;
  page.drawText(dateLabel, {
    x: marginLeft, y: 50, size: 9, font: fontRegular, color: GRAY,
  });

  page.drawText(
    `${params.tenantName} | Factura generada automaticamente`,
    { x: marginLeft, y: 30, size: 8, font: fontRegular, color: GRAY }
  );

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
