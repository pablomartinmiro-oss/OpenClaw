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
  "reservations:view": "View reservations",
  "reservations:create": "Create and confirm reservations",
  "reservations:edit": "Edit and cancel reservations",
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
    "reservations:view",
    "reservations:create",
  ],
  Marketing: ["analytics:view", "analytics:export", "contacts:view"],
  "VA / Admin": [
    "contacts:view",
    "contacts:edit",
    "contacts:create",
    "comms:view",
    "comms:send",
    "reservations:view",
    "reservations:create",
    "reservations:edit",
  ],
};

// ==================== REAL SKICENTER PRODUCTS ====================

interface ProductSeed {
  category: string;
  name: string;
  station: string;
  description?: string;
  personType?: string;
  tier?: string | null;
  includesHelmet: boolean;
  priceType: string;
  price: number;
  pricingMatrix: object;
  sortOrder: number;
}

const PRODUCTS: ProductSeed[] = [
  // ====== ALQUILER - SIN CASCO ======
  {
    category: "alquiler", name: "Equipo completo esquí MEDIA calidad adulto", station: "baqueira",
    personType: "adulto", tier: "media_quality", includesHelmet: false, priceType: "per_day", price: 36, sortOrder: 1,
    pricingMatrix: {
      media: { "1": 36, "2": 72, "3": 108, "4": 144, "5": 147.5, "6": 148.5, "7": 149.5 },
      alta: { "1": 36, "2": 72, "3": 108, "4": 144, "5": 147.5, "6": 148.5, "7": 149.5 },
    },
  },
  {
    category: "alquiler", name: "Equipo completo esquí ALTA calidad adulto", station: "baqueira",
    personType: "adulto", tier: "alta_quality", includesHelmet: false, priceType: "per_day", price: 56, sortOrder: 2,
    pricingMatrix: {
      media: { "1": 56, "2": 111, "3": 167, "4": 222, "5": 226.5, "6": 231, "7": 232 },
      alta: { "1": 56, "2": 111, "3": 167, "4": 222, "5": 226.5, "6": 231, "7": 232 },
    },
  },
  {
    category: "alquiler", name: "Equipo completo esquí niño", station: "baqueira",
    personType: "infantil", tier: null, includesHelmet: false, priceType: "per_day", price: 24.5, sortOrder: 3,
    pricingMatrix: {
      media: { "1": 24.5, "2": 48.5, "3": 72.5, "4": 96.5, "5": 101, "6": 102.5, "7": 103.5 },
      alta: { "1": 24.5, "2": 48.5, "3": 72.5, "4": 96.5, "5": 101, "6": 102.5, "7": 103.5 },
    },
  },
  // ====== ALQUILER - CON CASCO ======
  {
    category: "alquiler", name: "Equipo completo esquí MEDIA calidad adulto + casco", station: "baqueira",
    personType: "adulto", tier: "media_quality", includesHelmet: true, priceType: "per_day", price: 43, sortOrder: 4,
    pricingMatrix: {
      media: { "1": 43, "2": 86, "3": 129, "4": 172, "5": 179.5, "6": 184.5, "7": 189.5 },
      alta: { "1": 43, "2": 86, "3": 129, "4": 172, "5": 179.5, "6": 184.5, "7": 189.5 },
    },
  },
  {
    category: "alquiler", name: "Equipo completo esquí ALTA calidad adulto + casco", station: "baqueira",
    personType: "adulto", tier: "alta_quality", includesHelmet: true, priceType: "per_day", price: 63, sortOrder: 5,
    pricingMatrix: {
      media: { "1": 63, "2": 125, "3": 188, "4": 250, "5": 258.5, "6": 267, "7": 272 },
      alta: { "1": 63, "2": 125, "3": 188, "4": 250, "5": 258.5, "6": 267, "7": 272 },
    },
  },
  {
    category: "alquiler", name: "Equipo completo esquí niño + casco", station: "baqueira",
    personType: "infantil", tier: null, includesHelmet: true, priceType: "per_day", price: 31.5, sortOrder: 6,
    pricingMatrix: {
      media: { "1": 31.5, "2": 62.5, "3": 93.5, "4": 124.5, "5": 133, "6": 138.5, "7": 143.5 },
      alta: { "1": 31.5, "2": 62.5, "3": 93.5, "4": 124.5, "5": 133, "6": 138.5, "7": 143.5 },
    },
  },
  // ====== ALQUILER - SOLO PIEZAS ======
  {
    category: "alquiler", name: "Casco", station: "all",
    includesHelmet: true, priceType: "per_day", price: 7, sortOrder: 10,
    pricingMatrix: {
      media: { "1": 7, "2": 14, "3": 21, "4": 28, "5": 32, "6": 36, "7": 40 },
      alta: { "1": 7, "2": 14, "3": 21, "4": 28, "5": 32, "6": 36, "7": 40 },
    },
  },
  {
    category: "alquiler", name: "Botas", station: "all",
    includesHelmet: false, priceType: "per_day", price: 16.8, sortOrder: 11,
    pricingMatrix: {
      media: { "1": 16.8, "2": 33.7, "3": 50.5, "4": 67.5, "5": 71.5, "6": 72, "7": 72.5 },
      alta: { "1": 16.8, "2": 33.7, "3": 50.5, "4": 67.5, "5": 71.5, "6": 72, "7": 72.5 },
    },
  },
  {
    category: "alquiler", name: "Esquís/tabla infantil", station: "all",
    personType: "infantil", includesHelmet: false, priceType: "per_day", price: 15.95, sortOrder: 12,
    pricingMatrix: {
      media: { "1": 15.95, "2": 31.9, "3": 47.9, "4": 63.8, "5": 66, "6": 67.1, "7": 67.55 },
      alta: { "1": 15.95, "2": 31.9, "3": 47.9, "4": 63.8, "5": 66, "6": 67.1, "7": 67.55 },
    },
  },
  {
    category: "alquiler", name: "Esquís/tabla adulto MEDIA calidad", station: "all",
    personType: "adulto", tier: "media_quality", includesHelmet: false, priceType: "per_day", price: 28.75, sortOrder: 13,
    pricingMatrix: {
      media: { "1": 28.75, "2": 57.5, "3": 86.25, "4": 115, "5": 127, "6": 128, "7": 129 },
      alta: { "1": 28.75, "2": 57.5, "3": 86.25, "4": 115, "5": 127, "6": 128, "7": 129 },
    },
  },
  {
    category: "alquiler", name: "Esquís/tabla adulto ALTA calidad", station: "all",
    personType: "adulto", tier: "alta_quality", includesHelmet: false, priceType: "per_day", price: 48.25, sortOrder: 14,
    pricingMatrix: {
      media: { "1": 48.25, "2": 96.5, "3": 144.75, "4": 193, "5": 205, "6": 206, "7": 207 },
      alta: { "1": 48.25, "2": 96.5, "3": 144.75, "4": 193, "5": 205, "6": 206, "7": 207 },
    },
  },
  // ====== SIERRA NEVADA — EQUIPMENT (same prices as Baqueira) ======
  {
    category: "alquiler", name: "Equipo completo esquí MEDIA calidad adulto", station: "sierra_nevada",
    personType: "adulto", tier: "media_quality", includesHelmet: false, priceType: "per_day", price: 36, sortOrder: 1,
    pricingMatrix: {
      media: { "1": 36, "2": 72, "3": 108, "4": 144, "5": 147.5, "6": 148.5, "7": 149.5 },
      alta: { "1": 36, "2": 72, "3": 108, "4": 144, "5": 147.5, "6": 148.5, "7": 149.5 },
    },
  },
  {
    category: "alquiler", name: "Equipo completo esquí ALTA calidad adulto", station: "sierra_nevada",
    personType: "adulto", tier: "alta_quality", includesHelmet: false, priceType: "per_day", price: 56, sortOrder: 2,
    pricingMatrix: {
      media: { "1": 56, "2": 111, "3": 167, "4": 222, "5": 226.5, "6": 231, "7": 232 },
      alta: { "1": 56, "2": 111, "3": 167, "4": 222, "5": 226.5, "6": 231, "7": 232 },
    },
  },
  {
    category: "alquiler", name: "Equipo completo esquí niño", station: "sierra_nevada",
    personType: "infantil", includesHelmet: false, priceType: "per_day", price: 24.5, sortOrder: 3,
    pricingMatrix: {
      media: { "1": 24.5, "2": 48.5, "3": 72.5, "4": 96.5, "5": 101, "6": 102.5, "7": 103.5 },
      alta: { "1": 24.5, "2": 48.5, "3": 72.5, "4": 96.5, "5": 101, "6": 102.5, "7": 103.5 },
    },
  },
  // ====== LOCKERS ======
  {
    category: "locker", name: "Armario 3 equipos", station: "all",
    includesHelmet: false, priceType: "per_day", price: 20, sortOrder: 20,
    pricingMatrix: {
      media: { "1": 20, "2": 40, "3": 60, "4": 78, "5": 95, "6": 99, "7": 118 },
      alta: { "1": 20, "2": 40, "3": 60, "4": 78, "5": 95, "6": 99, "7": 118 },
    },
  },
  {
    category: "locker", name: "Guarda individual", station: "all",
    includesHelmet: false, priceType: "per_day", price: 8, sortOrder: 21,
    pricingMatrix: {
      media: { "1": 8, "2": 16, "3": 24, "4": 32, "5": 40, "6": 44, "7": 46 },
      alta: { "1": 8, "2": 16, "3": 24, "4": 32, "5": 40, "6": 44, "7": 46 },
    },
  },
  // ====== ESCUELA ======
  {
    category: "escuela", name: "Curso colectivo 3h (todas las edades)", station: "all",
    includesHelmet: false, priceType: "per_day", price: 61, sortOrder: 30,
    pricingMatrix: {
      media: { "1": 61, "2": 122, "3": 183, "4": 244, "5": 305, "6": 366, "7": 427 },
      alta: { "1": 61, "2": 122, "3": 183, "4": 244, "5": 305, "6": 366, "7": 427 },
    },
  },
  {
    category: "escuela", name: "Escuelita 10-15h (niños 4-6 años)", station: "all",
    personType: "infantil", includesHelmet: false, priceType: "per_day", price: 75, sortOrder: 31,
    pricingMatrix: {
      media: { "1": 75, "2": 150, "3": 225, "4": 300, "5": 375, "6": 450, "7": 525 },
      alta: { "1": 75, "2": 150, "3": 225, "4": 300, "5": 375, "6": 450, "7": 525 },
    },
  },
  // ====== CLASES PARTICULARES ======
  {
    category: "clase_particular", name: "Clase particular esquí/snowboard", station: "all",
    includesHelmet: false, priceType: "per_person_per_hour", price: 70, sortOrder: 40,
    pricingMatrix: {
      media: {
        "1h": { "1p": 70, "2p": 75, "3p": 80, "4p": 85, "5p": 90, "6p": 95 },
        "2h": { "1p": 140, "2p": 145, "3p": 150, "4p": 155, "5p": 160, "6p": 165 },
        "3h": { "1p": 210, "2p": 215, "3p": 220, "4p": 225, "5p": 230, "6p": 235 },
        "4h": { "1p": 280, "2p": 285, "3p": 290, "4p": 295, "5p": 300, "6p": 305 },
        "5h": { "1p": 350, "2p": 355, "3p": 360, "4p": 365, "5p": 370, "6p": 375 },
        "6h": { "1p": 420, "2p": 425, "3p": 430, "4p": 435, "5p": 440, "6p": 445 },
      },
      alta: {
        "1h": { "1p": 80, "2p": 85, "3p": 90, "4p": 95, "5p": 100, "6p": 105 },
        "2h": { "1p": 160, "2p": 165, "3p": 170, "4p": 175, "5p": 180, "6p": 185 },
        "3h": { "1p": 240, "2p": 245, "3p": 250, "4p": 255, "5p": 260, "6p": 265 },
        "4h": { "1p": 320, "2p": 325, "3p": 330, "4p": 335, "5p": 340, "6p": 345 },
        "5h": { "1p": 400, "2p": 405, "3p": 410, "4p": 415, "5p": 420, "6p": 425 },
        "6h": { "1p": 480, "2p": 485, "3p": 490, "4p": 495, "5p": 500, "6p": 505 },
      },
    },
  },
  // ====== FORFAITS — SIERRA NEVADA ======
  {
    category: "forfait", name: "Forfait Adulto", station: "sierra_nevada",
    personType: "adulto", includesHelmet: false, priceType: "per_day", price: 69, sortOrder: 50,
    pricingMatrix: {
      media: { "1": 69, "2": 138, "3": 207, "4": 276, "5": 345, "6": 414, "7": 483 },
      alta: { "1": 69, "2": 138, "3": 207, "4": 276, "5": 345, "6": 414, "7": 483 },
    },
  },
  {
    category: "forfait", name: "Forfait Infantil (6-11)", station: "sierra_nevada",
    personType: "infantil", includesHelmet: false, priceType: "per_day", price: 61, sortOrder: 51,
    pricingMatrix: {
      media: { "1": 61, "2": 122, "3": 183, "4": 244, "5": 305, "6": 366, "7": 427 },
      alta: { "1": 61, "2": 122, "3": 183, "4": 244, "5": 305, "6": 366, "7": 427 },
    },
  },
  {
    category: "forfait", name: "Forfait Baby (≤5)", station: "sierra_nevada",
    personType: "baby", includesHelmet: false, priceType: "per_day", price: 61, sortOrder: 52,
    pricingMatrix: {
      media: { "1": 61, "2": 122, "3": 183, "4": 244, "5": 305, "6": 366, "7": 427 },
      alta: { "1": 61, "2": 122, "3": 183, "4": 244, "5": 305, "6": 366, "7": 427 },
    },
  },
  // ====== FORFAITS — LA PINILLA ======
  {
    category: "forfait", name: "Forfait Adulto (12-64)", station: "la_pinilla",
    personType: "adulto", includesHelmet: false, priceType: "per_day", price: 45, sortOrder: 53,
    pricingMatrix: {
      media: { "1": 45, "2": 90, "3": 135, "4": 180, "5": 225, "6": 270, "7": 315 },
      alta: { "1": 45, "2": 90, "3": 135, "4": 180, "5": 225, "6": 270, "7": 315 },
    },
  },
  {
    category: "forfait", name: "Forfait Infantil (6-11)", station: "la_pinilla",
    personType: "infantil", includesHelmet: false, priceType: "per_day", price: 26, sortOrder: 54,
    pricingMatrix: {
      media: { "1": 26, "2": 52, "3": 78, "4": 104, "5": 130, "6": 156, "7": 182 },
      alta: { "1": 26, "2": 52, "3": 78, "4": 104, "5": 130, "6": 156, "7": 182 },
    },
  },
  // ====== APRÈS-SKI ======
  {
    category: "apreski", name: "Motos de Nieve", station: "all",
    includesHelmet: false, priceType: "per_session", price: 65, sortOrder: 60,
    pricingMatrix: { media: { "1": 65 }, alta: { "1": 65 } },
  },
  {
    category: "apreski", name: "Mushing (Trineo de perros)", station: "all",
    includesHelmet: false, priceType: "per_session", price: 55, sortOrder: 61,
    pricingMatrix: { media: { "1": 55 }, alta: { "1": 55 } },
  },
  {
    category: "apreski", name: "Raquetas de Nieve", station: "all",
    includesHelmet: false, priceType: "per_session", price: 35, sortOrder: 62,
    pricingMatrix: { media: { "1": 35 }, alta: { "1": 35 } },
  },
  {
    category: "apreski", name: "Spa/Termas", station: "all",
    includesHelmet: false, priceType: "per_session", price: 30, sortOrder: 63,
    pricingMatrix: { media: { "1": 30 }, alta: { "1": 30 } },
  },
];

// ====== SEASON CALENDAR (2025/2026 season) ======
const SEASON_CALENDAR = [
  { station: "all", season: "alta", startDate: "2025-12-20", endDate: "2026-01-06", label: "Navidades" },
  { station: "all", season: "alta", startDate: "2026-02-14", endDate: "2026-03-01", label: "Carnaval / Semana blanca" },
  { station: "all", season: "alta", startDate: "2026-03-28", endDate: "2026-04-12", label: "Semana Santa" },
];

// ====== MOCK QUOTES ======
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

  // Delete old products and seed with real pricing
  await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        category: product.category,
        name: product.name,
        station: product.station,
        description: product.description || null,
        personType: product.personType || null,
        tier: product.tier || null,
        includesHelmet: product.includesHelmet,
        priceType: product.priceType,
        price: product.price,
        pricingMatrix: JSON.parse(JSON.stringify(product.pricingMatrix)),
        sortOrder: product.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${PRODUCTS.length} products with real Skicenter pricing`);

  // Seed season calendar
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

  // Seed mock quotes
  const existingQuotes = await prisma.quote.count({ where: { tenantId: tenant.id } });
  if (existingQuotes === 0) {
    for (const quote of MOCK_QUOTES) {
      await prisma.quote.create({ data: { tenantId: tenant.id, ...quote } });
    }
    console.log(`Seeded ${MOCK_QUOTES.length} mock quotes`);
  }

  // Seed reservations
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

  // Seed station capacity
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

  console.log("Seed complete: Skicenter demo with real pricing + season calendar");
}

main().catch(console.error).finally(() => prisma.$disconnect());
