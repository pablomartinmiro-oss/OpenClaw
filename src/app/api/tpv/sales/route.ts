export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createTpvSaleSchema } from "@/lib/validation";
import { Prisma } from "@/generated/prisma/client";
import { createInvoiceFromTpvSale } from "@/lib/finance/auto-invoice";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/tpv/sales" });
  const { searchParams } = request.nextUrl;
  const sessionId = searchParams.get("sessionId");
  const date = searchParams.get("date");

  try {
    const where: Record<string, unknown> = { tenantId };
    if (sessionId) where.sessionId = sessionId;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    }

    const sales = await prisma.tpvSale.findMany({
      where,
      include: {
        items: true,
        session: {
          select: {
            id: true,
            register: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    log.info({ count: sales.length }, "TPV sales fetched");
    return NextResponse.json({ sales });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al obtener ventas",
      code: "SALES_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "tpv");
  if (modErr) return modErr;

  const log = logger.child({ tenantId, path: "/api/tpv/sales" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createTpvSaleSchema);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: 400 }
      );
    }
    const data = validated.data;

    // Verify session belongs to tenant and is open
    const cashSession = await prisma.cashSession.findFirst({
      where: { id: data.sessionId, tenantId, status: "open" },
    });
    if (!cashSession) {
      return NextResponse.json(
        { error: "Sesion no encontrada o cerrada" },
        { status: 404 }
      );
    }

    // Auto-generate ticket number TKT-YYYY-NNNN
    const year = new Date().getFullYear();
    const prefix = `TKT-${year}-`;
    const lastSale = await prisma.tpvSale.findFirst({
      where: { tenantId, ticketNumber: { startsWith: prefix } },
      orderBy: { ticketNumber: "desc" },
      select: { ticketNumber: true },
    });
    const seq = lastSale
      ? parseInt(lastSale.ticketNumber.split("-")[2]) + 1
      : 1;
    const ticketNumber = `${prefix}${String(seq).padStart(4, "0")}`;

    // Calculate line totals and tax
    let totalAmount = 0;
    let totalTax = 0;
    const itemsData = data.items.map((item) => {
      const qty = item.quantity ?? 1;
      const discount = item.discountAmount ?? 0;
      const lineTotal = qty * item.unitPrice - discount;
      const taxRate = item.taxRate ?? 21;
      const taxPerLine = Math.round(lineTotal * (taxRate / 100) * 100) / 100;
      totalAmount += lineTotal;
      totalTax += taxPerLine;
      return {
        tenantId,
        productId: item.productId ?? null,
        description: item.description,
        quantity: qty,
        unitPrice: item.unitPrice,
        lineTotal: Math.round(lineTotal * 100) / 100,
        discountAmount: discount,
        fiscalRegime: item.fiscalRegime ?? "general",
        taxPerLine,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;
    totalTax = Math.round(totalTax * 100) / 100;
    const discountApplied = data.discountApplied ?? 0;

    const sale = await prisma.$transaction(async (tx) => {
      const tpvSale = await tx.tpvSale.create({
        data: {
          tenantId,
          sessionId: data.sessionId,
          ticketNumber,
          date: data.date ? new Date(data.date) : new Date(),
          totalAmount,
          discountApplied,
          totalTax,
          paymentMethods: JSON.parse(
            JSON.stringify(data.paymentMethods)
          ) as Prisma.InputJsonValue,
          clientId: data.clientId ?? null,
        },
      });

      await tx.tpvSaleItem.createMany({
        data: itemsData.map((item) => ({
          ...item,
          saleId: tpvSale.id,
        })),
      });

      return tpvSale;
    });

    log.info(
      { saleId: sale.id, ticketNumber },
      "TPV sale created"
    );

    // Auto-generate invoice from TPV sale (fire-and-forget)
    createInvoiceFromTpvSale(tenantId, sale.id).catch((invoiceError) => {
      log.error(
        { error: invoiceError, saleId: sale.id },
        "Failed to auto-create invoice from TPV sale"
      );
    });

    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Error al crear venta",
      code: "SALE_CREATE_ERROR",
      logContext: { tenantId },
    });
  }
}
