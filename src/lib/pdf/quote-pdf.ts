import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "pdf" });

interface QuotePDFParams {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paymentUrl?: string;
  expiresAt?: string;
  iban: string;
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

const CORAL = rgb(232 / 255, 123 / 255, 90 / 255);
const DARK = rgb(45 / 255, 42 / 255, 38 / 255);
const GRAY = rgb(138 / 255, 133 / 255, 128 / 255);
const LIGHT_BG = rgb(250 / 255, 249 / 255, 247 / 255);
const WHITE = rgb(1, 1, 1);
const TABLE_BORDER = rgb(232 / 255, 228 / 255, 222 / 255);

export async function generateQuotePDF(
  params: QuotePDFParams
): Promise<Buffer> {
  log.info({ quoteNumber: params.quoteNumber }, "Generating quote PDF");

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
  page.drawText("SKICENTER", {
    x: marginLeft, y: height - 55, size: 28,
    font: fontBold, color: WHITE,
  });
  page.drawText(`Presupuesto N.o ${params.quoteNumber}`, {
    x: marginLeft, y: height - 78, size: 12,
    font: fontRegular, color: CORAL,
  });

  // Contact info right-aligned
  const contactLines = [
    "reservas@skicenter.es",
    "639 576 627",
  ];
  contactLines.forEach((line, i) => {
    const textWidth = fontRegular.widthOfTextAtSize(line, 10);
    page.drawText(line, {
      x: marginRight - textWidth, y: height - 55 - i * 14,
      size: 10, font: fontRegular, color: rgb(0.8, 0.8, 0.8),
    });
  });

  y = height - 130;

  // Client data block
  page.drawText("DATOS DEL CLIENTE", {
    x: marginLeft, y, size: 11, font: fontBold, color: CORAL,
  });
  y -= 20;

  const clientInfo = [
    `Nombre: ${params.clientName}`,
    `Email: ${params.clientEmail}`,
    `Destino: ${params.destination}`,
    `Fechas: ${params.checkIn} — ${params.checkOut}`,
  ];
  clientInfo.forEach((line) => {
    page.drawText(line, {
      x: marginLeft, y, size: 10, font: fontRegular, color: DARK,
    });
    y -= 16;
  });

  y -= 10;

  // Product table header
  const colX = [marginLeft, marginLeft + 240, marginLeft + 310, marginLeft + 380, marginLeft + 440];
  const headers = ["Concepto", "Cant.", "Precio/ud", "Dto.", "Total"];

  page.drawRectangle({
    x: marginLeft - 5, y: y - 4,
    width: contentWidth + 10, height: 20,
    color: LIGHT_BG,
  });

  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colX[i], y, size: 9, font: fontBold, color: GRAY,
    });
  });
  y -= 6;

  // Separator line
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: marginRight, y },
    thickness: 1, color: TABLE_BORDER,
  });
  y -= 16;

  // Product rows
  for (const item of params.items) {
    // Truncate long names
    const name =
      item.name.length > 38 ? item.name.substring(0, 35) + "..." : item.name;

    page.drawText(name, {
      x: colX[0], y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(String(item.quantity), {
      x: colX[1] + 10, y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(formatEUR(item.unitPrice), {
      x: colX[2], y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(
      item.discount > 0 ? `${item.discount}%` : "—",
      { x: colX[3] + 5, y, size: 9, font: fontRegular, color: DARK }
    );
    page.drawText(formatEUR(item.totalPrice), {
      x: colX[4], y, size: 9, font: fontBold, color: DARK,
    });

    y -= 18;

    if (y < 120) {
      // Would need a new page for very long quotes
      break;
    }
  }

  // Total line
  y -= 4;
  page.drawLine({
    start: { x: marginLeft, y: y + 10 },
    end: { x: marginRight, y: y + 10 },
    thickness: 2, color: DARK,
  });
  page.drawText("TOTAL", {
    x: colX[3] - 20, y, size: 12, font: fontBold, color: DARK,
  });
  page.drawText(formatEUR(params.totalAmount), {
    x: colX[4], y, size: 12, font: fontBold, color: CORAL,
  });

  y -= 30;

  // Payment info
  page.drawText("FORMA DE PAGO", {
    x: marginLeft, y, size: 11, font: fontBold, color: CORAL,
  });
  y -= 18;

  if (params.paymentUrl) {
    page.drawText("Pago online:", {
      x: marginLeft, y, size: 10, font: fontBold, color: DARK,
    });
    y -= 14;
    page.drawText(params.paymentUrl, {
      x: marginLeft, y, size: 8, font: fontRegular, color: CORAL,
    });
    y -= 18;
  }

  page.drawText("Transferencia bancaria:", {
    x: marginLeft, y, size: 10, font: fontBold, color: DARK,
  });
  y -= 14;
  page.drawText(`IBAN: ${params.iban}`, {
    x: marginLeft, y, size: 10, font: fontRegular, color: DARK,
  });
  y -= 14;
  page.drawText(`Concepto: Presupuesto ${params.quoteNumber}`, {
    x: marginLeft, y, size: 10, font: fontRegular, color: DARK,
  });

  if (params.expiresAt) {
    y -= 24;
    page.drawText(`Presupuesto valido hasta: ${params.expiresAt}`, {
      x: marginLeft, y, size: 10, font: fontBold, color: GRAY,
    });
  }

  // Footer
  page.drawText(
    "Skicenter — Agencia de viajes de esqui | reservas@skicenter.es | 639 576 627",
    { x: marginLeft, y: 30, size: 8, font: fontRegular, color: GRAY }
  );

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
