export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, createTransactionSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: "/api/finance/transactions" });
  const { searchParams } = request.nextUrl;

  try {
    const where: Record<string, unknown> = { tenantId };
    if (searchParams.get("invoiceId")) where.invoiceId = searchParams.get("invoiceId");
    if (searchParams.get("method")) where.method = searchParams.get("method");
    if (searchParams.get("status")) where.status = searchParams.get("status");

    const transactions = await prisma.transaction.findMany({
      where,
      include: { invoice: { select: { id: true, number: true } } },
      orderBy: { date: "desc" },
    });

    log.info({ count: transactions.length }, "Transactions fetched");
    return NextResponse.json({ transactions });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al obtener transacciones", code: "TRANSACTIONS_ERROR", logContext: { tenantId } });
  }
}

export async function POST(request: NextRequest) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;
  const { tenantId } = session;
  const modErr = await requireModule(tenantId, "finance");
  if (modErr) return modErr;
  const log = logger.child({ tenantId, path: "/api/finance/transactions" });

  try {
    const body = await request.json();
    const validated = validateBody(body, createTransactionSchema);
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const data = validated.data;

    const transaction = await prisma.transaction.create({
      data: { tenantId, ...data, invoiceId: data.invoiceId ?? null, reference: data.reference ?? null },
    });

    log.info({ transactionId: transaction.id }, "Transaction created");
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    return apiError(error, { publicMessage: "Error al crear transacción", code: "TRANSACTION_CREATE_ERROR", logContext: { tenantId } });
  }
}
