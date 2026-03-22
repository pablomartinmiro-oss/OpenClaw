import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/email/client";
import { buildCancellationClientEmailHTML, buildCancellationAdminEmailHTML } from "@/lib/email/templates";

// Holiday blackout periods: Dec 22 – Jan 6, Feb 1–28
function isBlackoutDate(date: Date): boolean {
  const m = date.getMonth() + 1; // 1-indexed
  const d = date.getDate();
  if (m === 12 && d >= 22) return true;
  if (m === 1 && d <= 6) return true;
  if (m === 2) return true;
  return false;
}

function isGrouponQuote(items: Array<{ name: string }>): boolean {
  return items.some(
    (i) => i.name.toLowerCase().includes("groupon") || i.name.toLowerCase().includes("cupón")
  );
}

function generateBonoCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BONO-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tenantId = session.user.tenantId;
  const log = logger.child({ tenantId, quoteId: id, path: "/api/quotes/[id]/cancel" });

  try {
    const body = await request.json();
    const { reason, notes, action, iban, titular } = body as {
      reason: string;
      notes?: string;
      action?: "bono" | "devolucion";
      iban?: string;
      titular?: string;
    };

    if (!reason) {
      return NextResponse.json({ error: "Motivo de cancelación requerido" }, { status: 400 });
    }

    const quote = await prisma.quote.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
    }

    if (!["enviado", "pagado"].includes(quote.status)) {
      return NextResponse.json(
        { error: "Solo se pueden cancelar presupuestos enviados o pagados" },
        { status: 400 }
      );
    }

    // Check Groupon block
    if (isGrouponQuote(quote.items)) {
      return NextResponse.json(
        {
          error: "Los productos Groupon no admiten cancelación ni cambio de fecha.",
          cancelType: "groupon",
        },
        { status: 400 }
      );
    }

    // Check blackout dates
    if (isBlackoutDate(quote.checkIn)) {
      return NextResponse.json(
        {
          error: "No se admiten cancelaciones ni devoluciones en fechas de Navidades (22 dic – 6 ene) ni febrero.",
          cancelType: "sin_devolucion",
        },
        { status: 400 }
      );
    }

    // Calculate days until check-in
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilCheckIn = Math.floor((quote.checkIn.getTime() - now.getTime()) / msPerDay);

    const quoteNumber = quote.id.slice(-8).toUpperCase();
    let cancelType: string;
    let refundStatus: string | null = null;
    let bonoCode: string | null = null;
    let bonoAmount: number | null = null;
    let bonoExpiresAt: Date | null = null;

    if (daysUntilCheckIn < 15) {
      // Less than 15 days: no refund
      cancelType = "sin_devolucion";
    } else if (action === "bono") {
      // Client accepts voucher
      cancelType = "bono";
      bonoCode = generateBonoCode();
      bonoAmount = quote.totalAmount;
      bonoExpiresAt = new Date();
      bonoExpiresAt.setFullYear(bonoExpiresAt.getFullYear() + 1);
    } else if (action === "devolucion") {
      // Client requests refund
      if (!iban || !titular) {
        return NextResponse.json(
          { error: "IBAN y titular requeridos para la devolución" },
          { status: 400 }
        );
      }
      cancelType = "devolucion";
      refundStatus = "pendiente";
    } else {
      // Default for >15 days: return options to frontend
      return NextResponse.json({
        daysUntilCheckIn,
        canRefund: true,
        message: "¿Desea un bono por el importe total o solicitar la devolución?",
        options: ["bono", "devolucion"],
      });
    }

    // Update quote
    const updated = await prisma.quote.update({
      where: { id },
      data: {
        status: "cancelado",
        cancelledAt: new Date(),
        cancelReason: reason,
        cancelType,
        cancelNotes: notes ?? null,
        refundIban: iban ?? null,
        refundTitular: titular ?? null,
        refundStatus,
        bonoCode,
        bonoAmount,
        bonoExpiresAt,
      },
    });

    // Send cancellation email to client (non-blocking)
    if (quote.clientEmail) {
      try {
        const html = buildCancellationClientEmailHTML({
          quoteNumber,
          clientName: quote.clientName,
          cancelType,
          bonoCode,
          bonoAmount,
          bonoExpiresAt: bonoExpiresAt?.toLocaleDateString("es-ES") ?? null,
        });
        await sendEmail({
          tenantId,
          contactId: quote.ghlContactId ?? null,
          to: quote.clientEmail,
          subject: `Cancelación presupuesto N.º ${quoteNumber}`,
          html,
        });
      } catch (emailErr) {
        log.error({ error: emailErr }, "Failed to send cancellation email to client");
      }
    }

    // If refund requested, email admin
    if (cancelType === "devolucion") {
      try {
        const html = buildCancellationAdminEmailHTML({
          quoteNumber,
          clientName: quote.clientName,
          clientEmail: quote.clientEmail ?? "",
          clientPhone: quote.clientPhone ?? "",
          totalAmount: quote.totalAmount,
          iban: iban!,
          titular: titular!,
          reason,
        });
        await sendEmail({
          tenantId,
          contactId: null,
          to: "administracion@skicenter.es",
          subject: `Solicitud devolución — Presupuesto ${quoteNumber}`,
          html,
        });
      } catch (emailErr) {
        log.error({ error: emailErr }, "Failed to send refund email to admin");
      }
    }

    log.info({ cancelType, daysUntilCheckIn }, "Quote cancelled");
    return NextResponse.json({
      quote: updated,
      cancelType,
      daysUntilCheckIn,
      bonoCode,
      bonoAmount,
    });
  } catch (error) {
    log.error({ error }, "Failed to cancel quote");
    return NextResponse.json({ error: "Error al cancelar presupuesto" }, { status: 500 });
  }
}
