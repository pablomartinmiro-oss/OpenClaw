export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateQuoteSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;

  try {
    const quote = await prisma.quote.findFirst({
      where: { id, tenantId },
      include: { items: { include: { product: true } } },
    });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch quote",
      code: "QUOTE_FETCH_ERROR",
      logContext: { tenantId, quoteId: id },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/quotes/${id}` });

  try {
    const existing = await prisma.quote.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = validateBody(body, updateQuoteSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
        ...(data.sentAt !== undefined && { sentAt: data.sentAt }),
        ...(data.clientNotes !== undefined && { clientNotes: data.clientNotes }),
      },
      include: { items: true },
    });

    log.info({ quoteId: id, status: quote.status }, "Quote updated");
    return NextResponse.json({ quote });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update quote",
      code: "QUOTE_UPDATE_ERROR",
      logContext: { tenantId, quoteId: id },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;
  const { id } = await params;
  const log = logger.child({ tenantId, path: `/api/quotes/${id}` });

  try {
    const existing = await prisma.quote.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    await prisma.quote.delete({ where: { id } });

    log.info({ quoteId: id }, "Quote deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete quote",
      code: "QUOTE_DELETE_ERROR",
      logContext: { tenantId, quoteId: id },
    });
  }
}
