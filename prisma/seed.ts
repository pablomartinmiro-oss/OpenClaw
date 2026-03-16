import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { buildFullCatalog, SEASON_CALENDAR } from "../src/lib/constants/product-catalog";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = {
  "comms:view": "View conversations",
  "comms:send": "Send SMS messages",
  "comms:assign": "Assign/reassign conversations",
  "pipelines:view": "View pipelines and deals",
  "pipelines:edit": "Move deals, edit deal details",
  "pipelines:create": "Create new opportunities",
  "pipelines:delete": "Delete opportunities",
  "analytics:view": "View marketing analytics",
  "analytics:export": "Export analytics data",
  "contacts:view": "View contacts",
  "contacts:edit": "Edit contacts, add notes",
  "contacts:create": "Create new contacts",
  "contacts:delete": "Delete contacts",
  "reservations:view": "View reservations",
  "reservations:create": "Create and confirm reservations",
  "reservations:edit": "Edit and cancel reservations",
  "settings:team": "Manage team members and roles",
  "settings:tenant": "Manage integrations and tenant config",
} as const;

const DEFAULT_ROLES: Record<string, string[]> = {
  "Owner / Manager": Object.keys(PERMISSIONS),
  "Sales Rep": [
    "comms:view", "comms:send", "pipelines:view", "pipelines:edit",
    "pipelines:create", "contacts:view", "reservations:view", "reservations:create",
  ],
  Marketing: ["analytics:view", "analytics:export", "contacts:view"],
  "VA / Admin": [
    "contacts:view", "contacts:edit", "contacts:create",
    "comms:view", "comms:send",
    "reservations:view", "reservations:create", "reservations:edit",
  ],
};

// ==================== MOCK QUOTES ====================
const MOCK_QUOTES = [
  { clientName: "María García López", clientEmail: "maria.garcia@email.com", clientPhone: "+34 612 345 678", clientNotes: "Primera vez esquiando. Quieren algo cómodo y con clases para los niños.", destination: "baqueira", checkIn: new Date("2026-03-20"), checkOut: new Date("2026-03-25"), adults: 2, children: 2, wantsAccommodation: false, wantsForfait: true, wantsClases: true, wantsEquipment: true, status: "nuevo" },
  { clientName: "Carlos Fernández", clientEmail: "carlos.f@email.com", clientPhone: "+34 678 901 234", clientNotes: "Grupo de amigos, nivel intermedio.", destination: "sierra_nevada", checkIn: new Date("2026-04-01"), checkOut: new Date("2026-04-04"), adults: 4, children: 0, wantsAccommodation: false, wantsForfait: true, wantsClases: false, wantsEquipment: true, status: "nuevo" },
  { clientName: "Ana Martínez Ruiz", clientEmail: "ana.martinez@email.com", clientPhone: "+34 655 123 456", clientNotes: "Viaje de pareja.", destination: "baqueira", checkIn: new Date("2026-03-28"), checkOut: new Date("2026-03-31"), adults: 2, children: 0, wantsAccommodation: false, wantsForfait: false, wantsClases: false, wantsEquipment: true, status: "en_proceso" },
  { clientName: "Pedro Sánchez Gómez", clientEmail: "pedro.sg@email.com", clientPhone: "+34 699 876 543", clientNotes: "Familia con presupuesto ajustado.", destination: "formigal", checkIn: new Date("2026-04-05"), checkOut: new Date("2026-04-10"), adults: 2, children: 3, wantsAccommodation: false, wantsForfait: false, wantsClases: true, wantsEquipment: true, status: "nuevo" },
  { clientName: "Laura Díaz Navarro", clientEmail: "laura.diaz@email.com", clientPhone: "+34 633 456 789", clientNotes: "Solo quieren alquiler.", destination: "alto_campoo", checkIn: new Date("2026-03-22"), checkOut: new Date("2026-03-24"), adults: 3, children: 1, wantsAccommodation: false, wantsForfait: false, wantsClases: false, wantsEquipment: true, status: "enviado" },
  { clientName: "Javier Romero Torres", clientEmail: "javi.romero@email.com", clientPhone: "+34 611 222 333", clientNotes: "Viaje de empresa. 6 adultos.", destination: "sierra_nevada", checkIn: new Date("2026-04-12"), checkOut: new Date("2026-04-15"), adults: 6, children: 0, wantsAccommodation: false, wantsForfait: true, wantsClases: false, wantsEquipment: true, status: "nuevo" },
];

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "Skicenter Spain", slug: "demo", onboardingComplete: true },
  });

  const roles = {
    owner: await prisma.role.upsert({ where: { name_tenantId: { name: "Owner / Manager", tenantId: tenant.id } }, update: {}, create: { name: "Owner / Manager", tenantId: tenant.id, isSystem: true, permissions: DEFAULT_ROLES["Owner / Manager"] } }),
    sales: await prisma.role.upsert({ where: { name_tenantId: { name: "Sales Rep", tenantId: tenant.id } }, update: {}, create: { name: "Sales Rep", tenantId: tenant.id, isSystem: true, permissions: DEFAULT_ROLES["Sales Rep"] } }),
    marketing: await prisma.role.upsert({ where: { name_tenantId: { name: "Marketing", tenantId: tenant.id } }, update: {}, create: { name: "Marketing", tenantId: tenant.id, isSystem: true, permissions: DEFAULT_ROLES["Marketing"] } }),
    va: await prisma.role.upsert({ where: { name_tenantId: { name: "VA / Admin", tenantId: tenant.id } }, update: {}, create: { name: "VA / Admin", tenantId: tenant.id, isSystem: true, permissions: DEFAULT_ROLES["VA / Admin"] } }),
  };

  await prisma.user.upsert({ where: { email_tenantId: { email: "admin@demo.com", tenantId: tenant.id } }, update: {}, create: { email: "admin@demo.com", name: "Demo Admin", passwordHash: await hash("demo1234", 12), tenantId: tenant.id, roleId: roles.owner.id } });
  await prisma.user.upsert({ where: { email_tenantId: { email: "sales@demo.com", tenantId: tenant.id } }, update: {}, create: { email: "sales@demo.com", name: "Demo Sales Rep", passwordHash: await hash("demo1234", 12), tenantId: tenant.id, roleId: roles.sales.id } });

  for (const mod of ["comms", "pipelines", "analytics", "contacts"]) {
    await prisma.moduleConfig.upsert({ where: { tenantId_module: { tenantId: tenant.id, module: mod } }, update: {}, create: { tenantId: tenant.id, module: mod, isEnabled: true } });
  }

  // ==================== PRODUCTS (Full 2025/2026 Catalog) ====================
  const PRODUCTS = buildFullCatalog();
  await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        category: product.category,
        name: product.name,
        station: product.station,
        description: product.description ?? null,
        personType: product.personType ?? null,
        tier: product.tier ?? null,
        includesHelmet: product.includesHelmet ?? false,
        priceType: product.priceType,
        price: product.price,
        pricingMatrix: JSON.parse(JSON.stringify(product.pricingMatrix)),
        sortOrder: product.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${PRODUCTS.length} products (complete 2025/2026 Skicenter catalog)`);

  // ==================== SEASON CALENDAR ====================
  await prisma.seasonCalendar.deleteMany({ where: { tenantId: tenant.id } });
  for (const entry of SEASON_CALENDAR) {
    await prisma.seasonCalendar.create({
      data: {
        tenantId: tenant.id,
        station: entry.station,
        season: entry.season,
        startDate: new Date(entry.startDate),
        endDate: new Date(entry.endDate),
        label: entry.label,
      },
    });
  }
  console.log(`Seeded ${SEASON_CALENDAR.length} season calendar entries`);

  // ==================== MOCK QUOTES ====================
  const existingQuotes = await prisma.quote.count({ where: { tenantId: tenant.id } });
  if (existingQuotes === 0) {
    for (const quote of MOCK_QUOTES) {
      await prisma.quote.create({ data: { tenantId: tenant.id, ...quote } });
    }
    console.log(`Seeded ${MOCK_QUOTES.length} mock quotes`);
  }

  // ==================== MOCK RESERVATIONS ====================
  const existingReservations = await prisma.reservation.count({ where: { tenantId: tenant.id } });
  if (existingReservations === 0) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const MOCK_RESERVATIONS = [
      { clientName: "Elena Rodríguez", clientPhone: "+34 611 223 344", clientEmail: "elena.r@email.com", couponCode: "GRP-8834", source: "groupon", station: "baqueira", activityDate: today, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", notes: "Principiante absoluta", emailSentAt: new Date(), whatsappSentAt: new Date(), notificationType: "confirmacion" },
      { clientName: "Roberto Jiménez", clientPhone: "+34 622 334 455", clientEmail: "roberto.j@email.com", couponCode: "GRP-9921", source: "groupon", station: "baqueira", activityDate: today, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", emailSentAt: new Date(), whatsappSentAt: new Date(), notificationType: "confirmacion" },
      { clientName: "Fernando Vega", clientPhone: "+34 644 556 677", clientEmail: "fernando.v@email.com", couponCode: "GRP-5567", source: "groupon", station: "baqueira", activityDate: tomorrow, schedule: "10:00-13:00", totalPrice: 275, status: "pendiente", paymentMethod: "groupon" },
      { clientName: "Diego Navarro", clientPhone: "+34 666 778 899", clientEmail: "diego.n@email.com", source: "caja", station: "sierra_nevada", activityDate: today, schedule: "10:00-14:00", totalPrice: 120, status: "confirmada", paymentMethod: "efectivo", emailSentAt: new Date(), notificationType: "confirmacion" },
      { clientName: "Patricia Herrera", clientPhone: "+34 688 990 011", clientEmail: "patricia.h@email.com", source: "caja", station: "baqueira", activityDate: tomorrow, schedule: "10:00-13:00", totalPrice: 275, status: "pendiente" },
    ];
    for (const reservation of MOCK_RESERVATIONS) {
      await prisma.reservation.create({ data: { tenantId: tenant.id, ...reservation } });
    }
    console.log(`Seeded ${MOCK_RESERVATIONS.length} reservations`);
  }

  // ==================== STATION CAPACITY ====================
  const existingCapacity = await prisma.stationCapacity.count({ where: { tenantId: tenant.id } });
  if (existingCapacity === 0) {
    const stations = ["baqueira", "sierra_nevada", "grandvalira", "formigal", "alto_campoo", "la_pinilla"];
    const serviceTypes = [{ type: "cursillo_adulto", max: 50 }, { type: "cursillo_infantil", max: 30 }, { type: "clase_particular", max: 10 }];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let d = 0; d < 7; d++) {
      const date = new Date(today); date.setDate(date.getDate() + d);
      for (const station of stations) {
        for (const svc of serviceTypes) {
          await prisma.stationCapacity.create({ data: { tenantId: tenant.id, station, date, serviceType: svc.type, maxCapacity: svc.max, booked: d === 0 ? Math.floor(Math.random() * svc.max * 0.8) : Math.floor(Math.random() * svc.max * 0.3) } });
        }
      }
    }
    console.log("Seeded station capacity for 7 days");
  }

  console.log("Seed complete: Skicenter demo with full 2025/2026 catalog + season calendar");
}

main().catch(console.error).finally(() => prisma.$disconnect());
