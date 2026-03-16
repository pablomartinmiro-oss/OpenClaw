import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

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
  "settings:team": "Manage team members and roles",
  "settings:tenant": "Manage integrations and tenant config",
} as const;

const DEFAULT_ROLES: Record<string, string[]> = {
  "Owner / Manager": Object.keys(PERMISSIONS),
  "Sales Rep": [
    "comms:view",
    "comms:send",
    "pipelines:view",
    "pipelines:edit",
    "pipelines:create",
    "contacts:view",
  ],
  Marketing: ["analytics:view", "analytics:export", "contacts:view"],
  "VA / Admin": [
    "contacts:view",
    "contacts:edit",
    "contacts:create",
    "comms:view",
    "comms:send",
  ],
};

// ==================== PRODUCT CATALOG ====================
const PRODUCTS = [
  // Alojamiento
  { category: "alojamiento", name: "Apt. Maladeta 1500 (2 pax)", description: "Apartamento para 2 personas en Baqueira", destination: "baqueira", price: 85, priceType: "per_night" },
  { category: "alojamiento", name: "Apt. Maladeta 1500 (4 pax)", description: "Apartamento para 4 personas en Baqueira", destination: "baqueira", price: 120, priceType: "per_night" },
  { category: "alojamiento", name: "Hotel Val de Neu 4* (2 pax)", description: "Hotel 4 estrellas en Baqueira", destination: "baqueira", price: 150, priceType: "per_night" },
  { category: "alojamiento", name: "Apt. Sierra Nevada (2 pax)", description: "Apartamento para 2 personas en Sierra Nevada", destination: "sierra_nevada", price: 70, priceType: "per_night" },
  { category: "alojamiento", name: "Apt. Sierra Nevada (4 pax)", description: "Apartamento para 4 personas en Sierra Nevada", destination: "sierra_nevada", price: 95, priceType: "per_night" },
  { category: "alojamiento", name: "Apt. Formigal (2 pax)", description: "Apartamento para 2 personas en Formigal", destination: "formigal", price: 65, priceType: "per_night" },
  { category: "alojamiento", name: "Apt. Alto Campoo (2 pax)", description: "Apartamento para 2 personas en Alto Campoo", destination: "alto_campoo", price: 55, priceType: "per_night" },
  // Forfaits
  { category: "forfait", name: "Forfait Adulto Baqueira", description: "Forfait adulto por día", destination: "baqueira", price: 58, priceType: "per_day" },
  { category: "forfait", name: "Forfait Infantil Baqueira", description: "Forfait infantil por día", destination: "baqueira", price: 42, priceType: "per_day" },
  { category: "forfait", name: "Forfait Adulto Sierra Nevada", description: "Forfait adulto por día", destination: "sierra_nevada", price: 52, priceType: "per_day" },
  { category: "forfait", name: "Forfait Infantil Sierra Nevada", description: "Forfait infantil por día", destination: "sierra_nevada", price: 38, priceType: "per_day" },
  { category: "forfait", name: "Forfait Adulto Formigal", description: "Forfait adulto por día", destination: "formigal", price: 48, priceType: "per_day" },
  { category: "forfait", name: "Forfait Adulto Alto Campoo", description: "Forfait adulto por día", destination: "alto_campoo", price: 32, priceType: "per_day" },
  { category: "forfait", name: "Forfait Adulto Grandvalira", description: "Forfait adulto por día", destination: "grandvalira", price: 55, priceType: "per_day" },
  // Cursillos
  { category: "cursillo", name: "Cursillo Adulto 3 días 3h", description: "Clases colectivas adulto, 3h/día, 3 días", destination: null, price: 183, priceType: "fixed" },
  { category: "cursillo", name: "Cursillo Adulto 5 días 3h", description: "Clases colectivas adulto, 3h/día, 5 días", destination: null, price: 275, priceType: "fixed" },
  { category: "cursillo", name: "Cursillo Infantil 3 días 3h", description: "Clases colectivas infantil, 3h/día, 3 días", destination: null, price: 183, priceType: "fixed" },
  { category: "cursillo", name: "Cursillo Infantil 5 días 3h", description: "Clases colectivas infantil, 3h/día, 5 días", destination: null, price: 275, priceType: "fixed" },
  { category: "cursillo", name: "Clase Particular 1h", description: "Clase particular 1 hora, 1 persona", destination: null, price: 65, priceType: "fixed" },
  { category: "cursillo", name: "Clase Particular 2h", description: "Clase particular 2 horas, 1 persona", destination: null, price: 120, priceType: "fixed" },
  // Alquiler Material
  { category: "alquiler", name: "Pack Esquí Adulto", description: "Esquís + botas + bastones", destination: null, price: 22, priceType: "per_day" },
  { category: "alquiler", name: "Pack Esquí Infantil", description: "Esquís + botas + bastones infantil", destination: null, price: 16, priceType: "per_day" },
  { category: "alquiler", name: "Pack Snowboard Adulto", description: "Tabla + botas snowboard", destination: null, price: 25, priceType: "per_day" },
  { category: "alquiler", name: "Pack Snowboard Infantil", description: "Tabla + botas snowboard infantil", destination: null, price: 18, priceType: "per_day" },
  { category: "alquiler", name: "Solo Botas", description: "Alquiler de botas de esquí", destination: null, price: 10, priceType: "per_day" },
  { category: "alquiler", name: "Casco", description: "Alquiler de casco", destination: null, price: 6, priceType: "per_day" },
  // Après-ski
  { category: "apres_ski", name: "Motos de Nieve", description: "Excursión en moto de nieve", destination: null, price: 65, priceType: "per_person" },
  { category: "apres_ski", name: "Mushing (Trineo de perros)", description: "Paseo en trineo tirado por perros", destination: null, price: 55, priceType: "per_person" },
  { category: "apres_ski", name: "Raquetas de Nieve", description: "Excursión con raquetas de nieve", destination: null, price: 35, priceType: "per_person" },
  { category: "apres_ski", name: "Spa/Termas", description: "Entrada a spa o termas", destination: null, price: 30, priceType: "per_person" },
];

// ==================== MOCK QUOTE REQUESTS ====================
const MOCK_QUOTES = [
  {
    clientName: "María García López",
    clientEmail: "maria.garcia@email.com",
    clientPhone: "+34 612 345 678",
    clientNotes: "Primera vez esquiando. Quieren algo cómodo y con clases para los niños.",
    destination: "baqueira",
    checkIn: new Date("2026-03-20"),
    checkOut: new Date("2026-03-25"),
    adults: 2,
    children: 2,
    wantsAccommodation: true,
    wantsForfait: true,
    wantsClases: true,
    wantsEquipment: true,
    status: "nuevo",
  },
  {
    clientName: "Carlos Fernández",
    clientEmail: "carlos.f@email.com",
    clientPhone: "+34 678 901 234",
    clientNotes: "Grupo de amigos, nivel intermedio. Interesados en après-ski.",
    destination: "sierra_nevada",
    checkIn: new Date("2026-04-01"),
    checkOut: new Date("2026-04-04"),
    adults: 4,
    children: 0,
    wantsAccommodation: true,
    wantsForfait: true,
    wantsClases: false,
    wantsEquipment: true,
    status: "nuevo",
  },
  {
    clientName: "Ana Martínez Ruiz",
    clientEmail: "ana.martinez@email.com",
    clientPhone: "+34 655 123 456",
    clientNotes: "Viaje de pareja. Quieren hotel de calidad.",
    destination: "baqueira",
    checkIn: new Date("2026-03-28"),
    checkOut: new Date("2026-03-31"),
    adults: 2,
    children: 0,
    wantsAccommodation: true,
    wantsForfait: true,
    wantsClases: false,
    wantsEquipment: false,
    status: "en_proceso",
  },
  {
    clientName: "Pedro Sánchez Gómez",
    clientEmail: "pedro.sg@email.com",
    clientPhone: "+34 699 876 543",
    clientNotes: "Familia con presupuesto ajustado. Prefieren apartamento.",
    destination: "formigal",
    checkIn: new Date("2026-04-05"),
    checkOut: new Date("2026-04-10"),
    adults: 2,
    children: 3,
    wantsAccommodation: true,
    wantsForfait: true,
    wantsClases: true,
    wantsEquipment: true,
    status: "nuevo",
  },
  {
    clientName: "Laura Díaz Navarro",
    clientEmail: "laura.diaz@email.com",
    clientPhone: "+34 633 456 789",
    clientNotes: "Solo quieren forfaits y alquiler. Ya tienen alojamiento.",
    destination: "alto_campoo",
    checkIn: new Date("2026-03-22"),
    checkOut: new Date("2026-03-24"),
    adults: 3,
    children: 1,
    wantsAccommodation: false,
    wantsForfait: true,
    wantsClases: false,
    wantsEquipment: true,
    status: "enviado",
  },
  {
    clientName: "Javier Romero Torres",
    clientEmail: "javi.romero@email.com",
    clientPhone: "+34 611 222 333",
    clientNotes: "Viaje de empresa. 6 adultos, nivel avanzado. Quieren actividades de grupo.",
    destination: "sierra_nevada",
    checkIn: new Date("2026-04-12"),
    checkOut: new Date("2026-04-15"),
    adults: 6,
    children: 0,
    wantsAccommodation: true,
    wantsForfait: true,
    wantsClases: false,
    wantsEquipment: true,
    status: "nuevo",
  },
];

async function main() {
  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Skicenter Spain",
      slug: "demo",
      onboardingComplete: true,
    },
  });

  // Create default roles
  const roles = {
    owner: await prisma.role.upsert({
      where: { name_tenantId: { name: "Owner / Manager", tenantId: tenant.id } },
      update: {},
      create: {
        name: "Owner / Manager",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["Owner / Manager"],
      },
    }),
    sales: await prisma.role.upsert({
      where: { name_tenantId: { name: "Sales Rep", tenantId: tenant.id } },
      update: {},
      create: {
        name: "Sales Rep",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["Sales Rep"],
      },
    }),
    marketing: await prisma.role.upsert({
      where: { name_tenantId: { name: "Marketing", tenantId: tenant.id } },
      update: {},
      create: {
        name: "Marketing",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["Marketing"],
      },
    }),
    va: await prisma.role.upsert({
      where: { name_tenantId: { name: "VA / Admin", tenantId: tenant.id } },
      update: {},
      create: {
        name: "VA / Admin",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["VA / Admin"],
      },
    }),
  };

  // Create demo admin user
  await prisma.user.upsert({
    where: { email_tenantId: { email: "admin@demo.com", tenantId: tenant.id } },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Demo Admin",
      passwordHash: await hash("demo1234", 12),
      tenantId: tenant.id,
      roleId: roles.owner.id,
    },
  });

  // Create demo sales rep
  await prisma.user.upsert({
    where: { email_tenantId: { email: "sales@demo.com", tenantId: tenant.id } },
    update: {},
    create: {
      email: "sales@demo.com",
      name: "Demo Sales Rep",
      passwordHash: await hash("demo1234", 12),
      tenantId: tenant.id,
      roleId: roles.sales.id,
    },
  });

  // Enable all modules for demo tenant
  for (const mod of ["comms", "pipelines", "analytics", "contacts"]) {
    await prisma.moduleConfig.upsert({
      where: { tenantId_module: { tenantId: tenant.id, module: mod } },
      update: {},
      create: { tenantId: tenant.id, module: mod, isEnabled: true },
    });
  }

  // Seed product catalog
  const existingProducts = await prisma.product.count({ where: { tenantId: tenant.id } });
  if (existingProducts === 0) {
    for (const product of PRODUCTS) {
      await prisma.product.create({
        data: {
          tenantId: tenant.id,
          ...product,
        },
      });
    }
    console.log(`Seeded ${PRODUCTS.length} products`);
  } else {
    console.log(`Products already exist (${existingProducts}), skipping`);
  }

  // Seed mock quotes
  const existingQuotes = await prisma.quote.count({ where: { tenantId: tenant.id } });
  if (existingQuotes === 0) {
    for (const quote of MOCK_QUOTES) {
      await prisma.quote.create({
        data: {
          tenantId: tenant.id,
          ...quote,
        },
      });
    }
    console.log(`Seeded ${MOCK_QUOTES.length} mock quotes`);
  } else {
    console.log(`Quotes already exist (${existingQuotes}), skipping`);
  }

  console.log("Seed complete: Skicenter demo tenant with products + quotes created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
