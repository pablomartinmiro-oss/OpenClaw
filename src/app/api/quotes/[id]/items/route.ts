export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const { id: quoteId } = await params;
  const log = logger.child({ tenantId, path: `/api/quotes/${quoteId}/items` });

  try {
    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, tenantId },
    });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const body = await request.json();
    const unitPrice = parseFloat(body.unitPrice);
    const quantity = parseInt(body.quantity) || 1;
    const discount = parseFloat(body.discount) || 0;
    const totalPrice = unitPrice * quantity * (1 - discount / 100);

    const item = await prisma.quoteItem.create({
      data: {
        quoteId,
        productId: body.productId || null,
        name: body.name,
        description: body.description || null,
        category: body.category || null,
        quantity,
        unitPrice,
        discount,
        totalPrice,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        numDays: body.numDays ? parseInt(body.numDays) : null,
        numPersons: body.numPersons ? parseInt(body.numPersons) : null,
        modalidad: body.modalidad || null,
        nivel: body.nivel || null,
        sector: body.sector || null,
        idioma: body.idioma || null,
        horario: body.horario || null,
        tipoCliente: body.tipoCliente || null,
        gama: body.gama || null,
        casco: body.casco ?? null,
        tipoActividad: body.tipoActividad || null,
        seguroIncluido: body.seguroIncluido ?? null,
        notes: body.notes || null,
      },
    });

    // Recalculate quote total
    const items = await prisma.quoteItem.findMany({ where: { quoteId } });
    const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0);
    await prisma.quote.update({
      where: { id: quoteId },
      data: { totalAmount },
    });

    log.info({ quoteId, itemId: item.id }, "Quote item added");
    return NextResponse.json({ item, totalAmount }, { status: 201 });
  } catch (error) {
    log.error({ error }, "Failed to add quote item");
    return NextResponse.json(
      { error: "Failed to add item", code: "QUOTES_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tenantId } = session.user;
  const { id: quoteId } = await params;
  const log = logger.child({ tenantId, path: `/api/quotes/${quoteId}/items` });

  try {
    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, tenantId },
    });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const body = await request.json();

    // Bulk replace all items
    await prisma.quoteItem.deleteMany({ where: { quoteId } });

    const items = [];
    let totalAmount = 0;
    for (const itemData of body.items) {
      const unitPrice = parseFloat(itemData.unitPrice);
      const quantity = parseInt(itemData.quantity) || 1;
      const discount = parseFloat(itemData.discount) || 0;
      const totalPrice = unitPrice * quantity * (1 - discount / 100);
      totalAmount += totalPrice;

      const item = await prisma.quoteItem.create({
        data: {
          quoteId,
          productId: itemData.productId || null,
          name: itemData.name,
          description: itemData.description || null,
          category: itemData.category || null,
          quantity,
          unitPrice,
          discount,
          totalPrice,
          // Per-product variables
          startDate: itemData.startDate ? new Date(itemData.startDate) : null,
          endDate: itemData.endDate ? new Date(itemData.endDate) : null,
          numDays: itemData.numDays ? parseInt(itemData.numDays) : null,
          numPersons: itemData.numPersons ? parseInt(itemData.numPersons) : null,
          ageDetails: itemData.ageDetails ?? null,
          modalidad: itemData.modalidad || null,
          nivel: itemData.nivel || null,
          sector: itemData.sector || null,
          idioma: itemData.idioma || null,
          horario: itemData.horario || null,
          puntoEncuentro: itemData.puntoEncuentro || null,
          tipoCliente: itemData.tipoCliente || null,
          gama: itemData.gama || null,
          casco: itemData.casco ?? null,
          tipoActividad: itemData.tipoActividad || null,
          regimen: itemData.regimen || null,
          alojamientoNombre: itemData.alojamientoNombre || null,
          seguroIncluido: itemData.seguroIncluido ?? null,
          notes: itemData.notes || null,
        },
      });
      items.push(item);
    }

    await prisma.quote.update({
      where: { id: quoteId },
      data: { totalAmount },
    });

    log.info({ quoteId, itemCount: items.length }, "Quote items replaced");
    return NextResponse.json({ items, totalAmount });
  } catch (error) {
    log.error({ error }, "Failed to update quote items");
    return NextResponse.json(
      { error: "Failed to update items", code: "QUOTES_ERROR" },
      { status: 500 }
    );
  }
}
