export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireTenant } from "@/lib/auth/guard";
import { apiError } from "@/lib/api-response";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { buildFullCatalog, SEASON_CALENDAR } from "@/lib/constants/product-catalog";
import {
  DEMO_CONTACTS,
  DEMO_RESERVATIONS,
  DEMO_QUOTES,
  DEMO_DEALS,
  DEMO_CONVERSATIONS,
  DEMO_CAPACITY,
} from "@/lib/constants/demo-seed-data";

const log = logger.child({ route: "reset-demo" });

/**
 * POST /api/admin/reset-demo
 * Deletes ALL data for the demo tenant and re-seeds everything fresh.
 * Only callable by demo tenant users.
 */
export async function POST() {
  const [session, authError] = await requireTenant();
  if (authError) return authError;

  const { tenantId } = session;

  // Verify this is the demo tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { isDemo: true },
  });

  if (!tenant?.isDemo) {
    return NextResponse.json(
      { error: "Solo disponible para la cuenta demo" },
      { status: 403 },
    );
  }

  try {
    // 1. Delete all data
    await Promise.all([
      prisma.reservation.deleteMany({ where: { tenantId } }),
      prisma.quote.deleteMany({ where: { tenantId } }),
      prisma.cachedContact.deleteMany({ where: { tenantId } }),
      prisma.cachedConversation.deleteMany({ where: { tenantId } }),
      prisma.cachedOpportunity.deleteMany({ where: { tenantId } }),
      prisma.cachedPipeline.deleteMany({ where: { tenantId } }),
      prisma.stationCapacity.deleteMany({ where: { tenantId } }),
      prisma.product.deleteMany({ where: { tenantId } }),
      prisma.seasonCalendar.deleteMany({ where: { tenantId } }),
      prisma.notification.deleteMany({ where: { tenantId } }),
    ]);

    // 2. Re-seed products
    const catalog = buildFullCatalog();
    for (const p of catalog) {
      await prisma.product.create({
        data: {
          tenantId,
          category: p.category,
          name: p.name,
          station: p.station,
          description: p.description ?? null,
          personType: p.personType ?? null,
          tier: p.tier ?? null,
          includesHelmet: p.includesHelmet ?? false,
          priceType: p.priceType,
          price: p.price,
          pricingMatrix: JSON.parse(JSON.stringify(p.pricingMatrix)),
          sortOrder: p.sortOrder,
          isActive: true,
        },
      });
    }

    // 3. Re-seed season calendar
    for (const entry of SEASON_CALENDAR) {
      await prisma.seasonCalendar.create({
        data: {
          tenantId,
          station: entry.station,
          season: entry.season,
          startDate: new Date(entry.startDate),
          endDate: new Date(entry.endDate),
          label: entry.label,
        },
      });
    }

    // 4. Re-seed demo data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Contacts
    const contactIds: string[] = [];
    for (let i = 0; i < DEMO_CONTACTS.length; i++) {
      const c = DEMO_CONTACTS[i];
      const id = `demo-contact-${String(i).padStart(3, "0")}`;
      contactIds.push(id);
      await prisma.cachedContact.create({
        data: {
          id,
          tenantId,
          firstName: c.firstName,
          lastName: c.lastName,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          phone: c.phone,
          tags: c.tags,
          source: c.source,
          dateAdded: new Date(today.getTime() - Math.random() * 30 * 86400000),
          dnd: false,
          raw: {},
          cachedAt: new Date(),
        },
      });
    }

    // Reservations
    for (const r of DEMO_RESERVATIONS) {
      const c = DEMO_CONTACTS[r.contactIndex];
      const activityDate = new Date(today);
      activityDate.setDate(activityDate.getDate() + r.daysOffset);
      await prisma.reservation.create({
        data: {
          tenantId,
          ghlContactId: contactIds[r.contactIndex],
          clientName: `${c.firstName} ${c.lastName}`,
          clientPhone: c.phone,
          clientEmail: c.email,
          couponCode: r.couponCode ?? null,
          source: r.source,
          station: r.station,
          activityDate,
          schedule: r.schedule,
          totalPrice: r.totalPrice,
          status: r.status,
          paymentMethod: r.paymentMethod ?? null,
          notes: r.notes ?? null,
          services: [{ type: r.services, quantity: 1 }],
          voucherCouponCode: r.couponCode ?? null,
          voucherRedeemed: r.source === "groupon" && r.status === "confirmada",
          voucherPricePaid: r.source === "groupon" ? r.totalPrice : null,
        },
      });
    }

    // Quotes
    for (const q of DEMO_QUOTES) {
      const c = DEMO_CONTACTS[q.contactIndex];
      const checkIn = new Date(today);
      checkIn.setDate(checkIn.getDate() + q.checkIn);
      const checkOut = new Date(today);
      checkOut.setDate(checkOut.getDate() + q.checkOut);
      await prisma.quote.create({
        data: {
          tenantId,
          ghlContactId: contactIds[q.contactIndex],
          clientName: `${c.firstName} ${c.lastName}`,
          clientEmail: c.email,
          clientPhone: c.phone,
          clientNotes: q.notes ?? null,
          destination: q.destination,
          checkIn,
          checkOut,
          adults: q.adults,
          children: q.children,
          wantsForfait: q.wantsForfait,
          wantsClases: q.wantsClases,
          wantsEquipment: q.wantsEquipment,
          status: q.status,
          totalAmount: q.totalAmount,
          expiresAt: new Date(today.getTime() + 14 * 86400000),
        },
      });
    }

    // Pipeline + Deals
    const STAGE_MAP: Record<string, { id: string; name: string; position: number }> = {
      nuevo_lead: { id: "demo-stage-1", name: "Nuevo Lead", position: 0 },
      contactado: { id: "demo-stage-2", name: "Contactado", position: 1 },
      presupuesto_enviado: { id: "demo-stage-3", name: "Presupuesto Enviado", position: 2 },
      aceptado: { id: "demo-stage-4", name: "Aceptado", position: 3 },
      cerrado: { id: "demo-stage-5", name: "Cerrado", position: 4 },
    };
    await prisma.cachedPipeline.create({
      data: {
        id: "demo-pipeline-1",
        tenantId,
        name: "Pipeline Comercial",
        stages: Object.values(STAGE_MAP),
        raw: {},
        cachedAt: new Date(),
      },
    });
    for (let i = 0; i < DEMO_DEALS.length; i++) {
      const d = DEMO_DEALS[i];
      const c = DEMO_CONTACTS[d.contactIndex];
      const stage = STAGE_MAP[d.stage];
      await prisma.cachedOpportunity.create({
        data: {
          id: `demo-opp-${String(i).padStart(3, "0")}`,
          tenantId,
          pipelineId: "demo-pipeline-1",
          pipelineStageId: stage.id,
          name: d.name,
          contactId: contactIds[d.contactIndex],
          contactName: `${c.firstName} ${c.lastName}`,
          monetaryValue: d.value,
          status: d.stage === "cerrado" ? "won" : "open",
          raw: {},
          cachedAt: new Date(),
        },
      });
    }

    // Conversations
    for (let i = 0; i < DEMO_CONVERSATIONS.length; i++) {
      const conv = DEMO_CONVERSATIONS[i];
      const c = DEMO_CONTACTS[conv.contactIndex];
      const lastMsg = conv.messages[conv.messages.length - 1];
      await prisma.cachedConversation.create({
        data: {
          id: `demo-conv-${String(i).padStart(3, "0")}`,
          tenantId,
          contactId: contactIds[conv.contactIndex],
          contactName: `${c.firstName} ${c.lastName}`,
          contactPhone: c.phone,
          contactEmail: c.email,
          lastMessageBody: lastMsg.body,
          lastMessageDate: new Date(Date.now() - lastMsg.minutesAgo * 60000),
          lastMessageType: conv.type,
          unreadCount: lastMsg.direction === "inbound" ? 1 : 0,
          raw: JSON.parse(JSON.stringify({ messages: conv.messages })),
          cachedAt: new Date(),
        },
      });
    }

    // Capacity
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      for (const cap of DEMO_CAPACITY) {
        const factor = d === 0 ? 1 : 0.3 + Math.random() * 0.3;
        await prisma.stationCapacity.create({
          data: { tenantId, station: cap.station, date, serviceType: "cursillo_adulto", maxCapacity: cap.cursillo_max, booked: d === 0 ? cap.cursillo_booked : Math.floor(cap.cursillo_max * factor) },
        });
        await prisma.stationCapacity.create({
          data: { tenantId, station: cap.station, date, serviceType: "clase_particular", maxCapacity: cap.clase_max, booked: d === 0 ? cap.clase_booked : Math.floor(cap.clase_max * factor) },
        });
      }
    }

    log.info("Demo reset complete");

    return NextResponse.json({
      success: true,
      seeded: {
        contacts: DEMO_CONTACTS.length,
        reservations: DEMO_RESERVATIONS.length,
        quotes: DEMO_QUOTES.length,
        deals: DEMO_DEALS.length,
        conversations: DEMO_CONVERSATIONS.length,
        products: catalog.length,
      },
    });
  } catch (error) {
    return apiError(error, {
      publicMessage: "Failed to reset demo data",
      code: "ADMIN_ERROR",
      logContext: { tenantId },
    });
  }
}
