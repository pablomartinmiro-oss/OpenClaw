import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "pdf" });

interface SettlementLineItem {
  serviceType: string;
  serviceDate: Date | string;
  paxCount: number;
  saleAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
}

interface SettlementPDFParams {
  tenantName: string;
  settlementNumber: string;
  startDate: Date | string;
  endDate: Date | string;
  supplierFiscalName: string;
  supplierNif: string;
  supplierIban?: string | null;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  lines: SettlementLineItem[];
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const SERVICE_LABELS: Record<string, string> = {
  activity: "Actividad",
  hotel: "Hotel",
  restaurant: "Restaurante",
  spa: "Spa",
};

const CORAL = rgb(232 / 255, 123 / 255, 90 / 255);
const DARK = rgb(45 / 255, 42 / 255, 38 / 255);
const GRAY = rgb(138 / 255, 133 / 255, 128 / 255);
const LIGHT_BG = rgb(250 / 255, 249 / 255, 247 / 255);
const WHITE = rgb(1, 1, 1);
const TABLE_BORDER = rgb(232 / 255, 228 / 255, 222 / 255);

export async function generateSettlementPDF(
  params: SettlementPDFParams
): Promise<Buffer> {
  log.info(
    { settlementNumber: params.settlementNumber },
    "Generating settlement PDF"
  );

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
  page.drawText(`Liquidacion ${params.settlementNumber}`, {
    x: marginLeft, y: height - 78, size: 12,
    font: fontRegular, color: CORAL,
  });

  // Period right-aligned
  const periodText = `${formatDate(params.startDate)} — ${formatDate(params.endDate)}`;
  const periodWidth = fontRegular.widthOfTextAtSize(periodText, 10);
  page.drawText(periodText, {
    x: marginRight - periodWidth, y: height - 55,
    size: 10, font: fontRegular, color: rgb(0.8, 0.8, 0.8),
  });

  y = height - 130;

  // Supplier info block
  page.drawText("DATOS DEL PROVEEDOR", {
    x: marginLeft, y, size: 11, font: fontBold, color: CORAL,
  });
  y -= 20;

  const supplierInfo = [
    `Razon social: ${params.supplierFiscalName}`,
    `NIF: ${params.supplierNif}`,
    ...(params.supplierIban ? [`IBAN: ${params.supplierIban}`] : []),
  ];
  for (const line of supplierInfo) {
    page.drawText(line, {
      x: marginLeft, y, size: 10, font: fontRegular, color: DARK,
    });
    y -= 16;
  }

  y -= 10;

  // Table header
  const colX = [
    marginLeft,           // Tipo servicio
    marginLeft + 100,     // Fecha
    marginLeft + 180,     // Pax
    marginLeft + 220,     // Importe venta
    marginLeft + 320,     // Comision %
    marginLeft + 400,     // Comision
  ];
  const headers = [
    "Tipo servicio", "Fecha", "Pax",
    "Importe venta", "Comision %", "Comision",
  ];

  page.drawRectangle({
    x: marginLeft - 5, y: y - 4,
    width: contentWidth + 10, height: 20,
    color: LIGHT_BG,
  });

  for (let i = 0; i < headers.length; i++) {
    page.drawText(headers[i], {
      x: colX[i], y, size: 8, font: fontBold, color: GRAY,
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
    const svcLabel = SERVICE_LABELS[line.serviceType] ?? line.serviceType;

    page.drawText(svcLabel, {
      x: colX[0], y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(formatDate(line.serviceDate), {
      x: colX[1], y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(String(line.paxCount), {
      x: colX[2] + 5, y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(formatEUR(line.saleAmount), {
      x: colX[3], y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(`${line.commissionPercentage}%`, {
      x: colX[4] + 15, y, size: 9, font: fontRegular, color: DARK,
    });
    page.drawText(formatEUR(line.commissionAmount), {
      x: colX[5], y, size: 9, font: fontBold, color: DARK,
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

  const labelX = colX[4] - 60;
  const valueX = colX[5];

  // Bruto
  page.drawText("Bruto", {
    x: labelX, y, size: 10, font: fontRegular, color: GRAY,
  });
  page.drawText(formatEUR(params.grossAmount), {
    x: valueX, y, size: 10, font: fontRegular, color: DARK,
  });
  y -= 16;

  // Comision
  page.drawText("Comision", {
    x: labelX, y, size: 10, font: fontRegular, color: GRAY,
  });
  page.drawText(formatEUR(params.commissionAmount), {
    x: valueX, y, size: 10, font: fontRegular, color: DARK,
  });
  y -= 20;

  // Neto
  page.drawLine({
    start: { x: labelX, y: y + 8 },
    end: { x: marginRight, y: y + 8 },
    thickness: 2, color: DARK,
  });

  page.drawText("NETO", {
    x: labelX, y, size: 12, font: fontBold, color: DARK,
  });
  page.drawText(formatEUR(params.netAmount), {
    x: valueX, y, size: 12, font: fontBold, color: CORAL,
  });

  // Footer
  page.drawText(
    `${params.tenantName} | Liquidacion generada automaticamente`,
    { x: marginLeft, y: 30, size: 8, font: fontRegular, color: GRAY }
  );

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
