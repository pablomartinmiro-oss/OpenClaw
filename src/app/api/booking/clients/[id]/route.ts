export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { requireModule } from "@/lib/modules/guard";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-response";
import { validateBody, updateClientSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/clients/${id}`,
  });

  try {
    const client = await prisma.client.findFirst({
      where: { id, tenantId },
    });
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Gather stats
    const [invoiceCount, totalSpent] = await Promise.all([
      prisma.invoice.count({ where: { clientId: id, tenantId } }),
      prisma.invoice.aggregate({
        where: { clientId: id, tenantId },
        _sum: { total: true },
      }),
    ]);

    log.info({ clientId: id }, "Client fetched");
    return NextResponse.json({
      client,
      stats: {
        invoiceCount,
        totalSpent: totalSpent._sum.total ?? 0,
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to fetch client",
      code: "BOOKING_CLIENTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/clients/${id}`,
  });

  try {
    const existing = await prisma.client.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = validateBody(body, updateClientSchema);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const data = validated.data;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email ?? null }),
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.birthDate !== undefined && {
          birthDate: data.birthDate ?? null,
        }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
        ...(data.conversionSource !== undefined && {
          conversionSource: data.conversionSource ?? null,
        }),
      },
    });

    log.info({ clientId: id }, "Client updated");
    return NextResponse.json({ client });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to update client",
      code: "BOOKING_CLIENTS_ERROR",
      logContext: { tenantId },
    });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { id } = await params;
  const { tenantId } = session;
  const moduleError = await requireModule(tenantId, "booking");
  if (moduleError) return moduleError;

  const log = logger.child({
    tenantId,
    path: `/api/booking/clients/${id}`,
  });

  try {
    const existing = await prisma.client.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    await prisma.client.delete({ where: { id } });

    log.info({ clientId: id }, "Client deleted");
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to delete client",
      code: "BOOKING_CLIENTS_ERROR",
      logContext: { tenantId },
    });
  }
}
