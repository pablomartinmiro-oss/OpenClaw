/**
 * Demo seed data for the Rental module.
 * Generates inventory pools, rental orders, and customer sizing profiles.
 */

// ==================== INVENTORY SEED ====================

type InventorySeed = {
  stationSlug: string;
  equipmentType: string;
  size: string;
  qualityTier: string;
  totalQuantity: number;
  availableQuantity: number;
  minStockAlert: number;
};

function generateSkiInventory(station: string): InventorySeed[] {
  const sizes = ["120", "130", "140", "150", "160", "170", "180"];
  const items: InventorySeed[] = [];
  for (const tier of ["media", "alta"]) {
    for (const size of sizes) {
      const total = tier === "media" ? 10 : 6;
      const rented = Math.floor(Math.random() * 3);
      items.push({
        stationSlug: station,
        equipmentType: "SKI",
        size,
        qualityTier: tier,
        totalQuantity: total,
        availableQuantity: total - rented,
        minStockAlert: 3,
      });
    }
  }
  return items;
}

function generateBootInventory(station: string): InventorySeed[] {
  const sizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
  const items: InventorySeed[] = [];
  for (const tier of ["media", "alta"]) {
    for (const size of sizes) {
      const total = tier === "media" ? 8 : 5;
      const rented = Math.floor(Math.random() * 2);
      items.push({
        stationSlug: station,
        equipmentType: "BOOT",
        size,
        qualityTier: tier,
        totalQuantity: total,
        availableQuantity: total - rented,
        minStockAlert: 2,
      });
    }
  }
  return items;
}

function generateHelmetInventory(station: string): InventorySeed[] {
  const sizes = ["S", "M", "L", "XL"];
  return sizes.flatMap((size) =>
    ["media", "alta"].map((tier) => ({
      stationSlug: station,
      equipmentType: "HELMET" as const,
      size,
      qualityTier: tier,
      totalQuantity: 15,
      availableQuantity: 15 - Math.floor(Math.random() * 4),
      minStockAlert: 4,
    }))
  );
}

function generatePoleInventory(station: string): InventorySeed[] {
  const sizes = ["100", "110", "115", "120", "125", "130"];
  return sizes.map((size) => ({
    stationSlug: station,
    equipmentType: "POLE" as const,
    size,
    qualityTier: "media",
    totalQuantity: 12,
    availableQuantity: 12 - Math.floor(Math.random() * 3),
    minStockAlert: 3,
  }));
}

function generateSnowboardInventory(station: string): InventorySeed[] {
  const sizes = ["140", "145", "150", "155", "160"];
  const items: InventorySeed[] = [];
  for (const tier of ["media", "alta"]) {
    for (const size of sizes) {
      const total = tier === "media" ? 5 : 3;
      items.push({
        stationSlug: station,
        equipmentType: "SNOWBOARD",
        size,
        qualityTier: tier,
        totalQuantity: total,
        availableQuantity: total - Math.floor(Math.random() * 2),
        minStockAlert: 2,
      });
    }
  }
  return items;
}

export function buildRentalInventorySeed(): InventorySeed[] {
  const stations = ["baqueira", "sierra_nevada", "la_pinilla"];
  const items: InventorySeed[] = [];

  for (const station of stations) {
    items.push(
      ...generateSkiInventory(station),
      ...generateBootInventory(station),
      ...generateHelmetInventory(station),
      ...generatePoleInventory(station),
      ...generateSnowboardInventory(station)
    );
  }

  return items;
}

// ==================== ORDERS SEED ====================

export interface RentalOrderSeed {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  stationSlug: string;
  pickupDaysOffset: number;
  returnDaysOffset: number;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  items: {
    participantName: string;
    equipmentType: string;
    size: string | null;
    qualityTier: string;
    dinSetting: number | null;
    itemStatus: string;
    conditionOnReturn: string | null;
    unitPrice: number;
  }[];
}

export const RENTAL_ORDERS_SEED: RentalOrderSeed[] = [
  // 5 RESERVED (upcoming)
  {
    clientName: "Carlos Martinez",
    clientEmail: "carlos@example.com",
    clientPhone: "+34600111222",
    stationSlug: "baqueira",
    pickupDaysOffset: 1,
    returnDaysOffset: 4,
    status: "RESERVED",
    totalPrice: 108,
    paymentStatus: "pending",
    items: [
      { participantName: "Carlos Martinez", equipmentType: "SKI", size: null, qualityTier: "media", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 36 },
      { participantName: "Carlos Martinez", equipmentType: "BOOT", size: null, qualityTier: "media", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 0 },
      { participantName: "Carlos Martinez", equipmentType: "HELMET", size: null, qualityTier: "media", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 0 },
    ],
  },
  {
    clientName: "Ana Lopez",
    clientEmail: "ana@example.com",
    clientPhone: "+34600222333",
    stationSlug: "baqueira",
    pickupDaysOffset: 2,
    returnDaysOffset: 5,
    status: "RESERVED",
    totalPrice: 216,
    paymentStatus: "paid",
    items: [
      { participantName: "Ana Lopez", equipmentType: "SKI", size: null, qualityTier: "alta", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 72 },
      { participantName: "Pablo Lopez", equipmentType: "SKI", size: null, qualityTier: "media", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 36 },
    ],
  },
  {
    clientName: "Maria Garcia",
    clientEmail: "maria@example.com",
    clientPhone: "+34600333444",
    stationSlug: "sierra_nevada",
    pickupDaysOffset: 0,
    returnDaysOffset: 2,
    status: "RESERVED",
    totalPrice: 72,
    paymentStatus: "pending",
    items: [
      { participantName: "Maria Garcia", equipmentType: "SNOWBOARD", size: null, qualityTier: "media", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 72 },
    ],
  },
  {
    clientName: "Pedro Sanchez",
    clientEmail: "pedro@example.com",
    clientPhone: "+34600444555",
    stationSlug: "la_pinilla",
    pickupDaysOffset: 3,
    returnDaysOffset: 5,
    status: "RESERVED",
    totalPrice: 144,
    paymentStatus: "pending",
    items: [
      { participantName: "Pedro Sanchez", equipmentType: "SKI", size: null, qualityTier: "alta", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 72 },
      { participantName: "Pedro Sanchez", equipmentType: "HELMET", size: null, qualityTier: "alta", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 0 },
    ],
  },
  {
    clientName: "Laura Fernandez",
    clientEmail: "laura@example.com",
    clientPhone: "+34600555666",
    stationSlug: "baqueira",
    pickupDaysOffset: 1,
    returnDaysOffset: 3,
    status: "RESERVED",
    totalPrice: 72,
    paymentStatus: "paid",
    items: [
      { participantName: "Laura Fernandez", equipmentType: "SKI", size: null, qualityTier: "media", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 72 },
    ],
  },
  // 3 PREPARED
  {
    clientName: "Javier Torres",
    clientEmail: "javier@example.com",
    clientPhone: "+34600666777",
    stationSlug: "baqueira",
    pickupDaysOffset: 0,
    returnDaysOffset: 3,
    status: "PREPARED",
    totalPrice: 108,
    paymentStatus: "paid",
    items: [
      { participantName: "Javier Torres", equipmentType: "SKI", size: "170", qualityTier: "alta", dinSetting: null, itemStatus: "ASSIGNED", conditionOnReturn: null, unitPrice: 108 },
    ],
  },
  {
    clientName: "Elena Ruiz",
    clientEmail: "elena@example.com",
    clientPhone: "+34600777888",
    stationSlug: "sierra_nevada",
    pickupDaysOffset: 0,
    returnDaysOffset: 2,
    status: "PREPARED",
    totalPrice: 72,
    paymentStatus: "pending",
    items: [
      { participantName: "Elena Ruiz", equipmentType: "SKI", size: "160", qualityTier: "media", dinSetting: null, itemStatus: "ASSIGNED", conditionOnReturn: null, unitPrice: 72 },
    ],
  },
  {
    clientName: "Diego Moreno",
    clientEmail: "diego@example.com",
    clientPhone: "+34600888999",
    stationSlug: "baqueira",
    pickupDaysOffset: 0,
    returnDaysOffset: 1,
    status: "PREPARED",
    totalPrice: 36,
    paymentStatus: "paid",
    items: [
      { participantName: "Diego Moreno", equipmentType: "SNOWBOARD", size: "155", qualityTier: "media", dinSetting: null, itemStatus: "ASSIGNED", conditionOnReturn: null, unitPrice: 36 },
    ],
  },
  // 4 PICKED_UP (active rentals)
  {
    clientName: "Carmen Diaz",
    clientEmail: "carmen@example.com",
    clientPhone: "+34600999000",
    stationSlug: "baqueira",
    pickupDaysOffset: -1,
    returnDaysOffset: 1,
    status: "PICKED_UP",
    totalPrice: 144,
    paymentStatus: "paid",
    items: [
      { participantName: "Carmen Diaz", equipmentType: "SKI", size: "160", qualityTier: "alta", dinSetting: 5.5, itemStatus: "PICKED_UP", conditionOnReturn: null, unitPrice: 72 },
      { participantName: "Carmen Diaz", equipmentType: "BOOT", size: "38", qualityTier: "alta", dinSetting: null, itemStatus: "PICKED_UP", conditionOnReturn: null, unitPrice: 0 },
      { participantName: "Carmen Diaz", equipmentType: "HELMET", size: "M", qualityTier: "alta", dinSetting: null, itemStatus: "PICKED_UP", conditionOnReturn: null, unitPrice: 0 },
    ],
  },
  {
    clientName: "Roberto Jimenez",
    clientEmail: "roberto@example.com",
    clientPhone: "+34601000111",
    stationSlug: "sierra_nevada",
    pickupDaysOffset: -2,
    returnDaysOffset: 0,
    status: "PICKED_UP",
    totalPrice: 108,
    paymentStatus: "paid",
    items: [
      { participantName: "Roberto Jimenez", equipmentType: "SKI", size: "180", qualityTier: "media", dinSetting: 7.5, itemStatus: "PICKED_UP", conditionOnReturn: null, unitPrice: 108 },
    ],
  },
  {
    clientName: "Sofia Navarro",
    clientEmail: "sofia@example.com",
    clientPhone: "+34601111222",
    stationSlug: "baqueira",
    pickupDaysOffset: -1,
    returnDaysOffset: 2,
    status: "PICKED_UP",
    totalPrice: 216,
    paymentStatus: "paid",
    items: [
      { participantName: "Sofia Navarro", equipmentType: "SKI", size: "150", qualityTier: "alta", dinSetting: 4.5, itemStatus: "PICKED_UP", conditionOnReturn: null, unitPrice: 108 },
      { participantName: "Marcos Navarro", equipmentType: "SKI", size: "120", qualityTier: "media", dinSetting: 2.25, itemStatus: "PICKED_UP", conditionOnReturn: null, unitPrice: 72 },
    ],
  },
  {
    clientName: "Isabel Herrera",
    clientEmail: "isabel@example.com",
    clientPhone: "+34601222333",
    stationSlug: "la_pinilla",
    pickupDaysOffset: -1,
    returnDaysOffset: 0,
    status: "PICKED_UP",
    totalPrice: 72,
    paymentStatus: "paid",
    items: [
      { participantName: "Isabel Herrera", equipmentType: "SNOWBOARD", size: "145", qualityTier: "media", dinSetting: null, itemStatus: "PICKED_UP", conditionOnReturn: null, unitPrice: 72 },
    ],
  },
  // 2 RETURNED
  {
    clientName: "Raul Vargas",
    clientEmail: "raul@example.com",
    clientPhone: "+34601333444",
    stationSlug: "baqueira",
    pickupDaysOffset: -4,
    returnDaysOffset: -1,
    status: "RETURNED",
    totalPrice: 108,
    paymentStatus: "paid",
    items: [
      { participantName: "Raul Vargas", equipmentType: "SKI", size: "170", qualityTier: "media", dinSetting: 6.5, itemStatus: "RETURNED", conditionOnReturn: "OK", unitPrice: 108 },
    ],
  },
  {
    clientName: "Paula Romero",
    clientEmail: "paula@example.com",
    clientPhone: "+34601444555",
    stationSlug: "sierra_nevada",
    pickupDaysOffset: -3,
    returnDaysOffset: -1,
    status: "RETURNED",
    totalPrice: 144,
    paymentStatus: "paid",
    items: [
      { participantName: "Paula Romero", equipmentType: "SKI", size: "160", qualityTier: "alta", dinSetting: 5.0, itemStatus: "RETURNED", conditionOnReturn: "OK", unitPrice: 72 },
      { participantName: "Paula Romero", equipmentType: "BOOT", size: "39", qualityTier: "alta", dinSetting: null, itemStatus: "RETURNED", conditionOnReturn: "NEEDS_SERVICE", unitPrice: 0 },
    ],
  },
  // 1 CANCELLED
  {
    clientName: "Fernando Gil",
    clientEmail: "fernando@example.com",
    clientPhone: "+34601555666",
    stationSlug: "la_pinilla",
    pickupDaysOffset: 2,
    returnDaysOffset: 4,
    status: "CANCELLED",
    totalPrice: 72,
    paymentStatus: "refunded",
    items: [
      { participantName: "Fernando Gil", equipmentType: "SKI", size: null, qualityTier: "media", dinSetting: null, itemStatus: "RESERVED", conditionOnReturn: null, unitPrice: 72 },
    ],
  },
];

// ==================== SIZING PROFILES SEED ====================

export interface SizingProfileSeed {
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  height: number;
  weight: number;
  shoeSize: string;
  age: number;
  abilityLevel: string;
  bootSoleLength: number;
  preferredDinSetting: number;
}

export const SIZING_PROFILES_SEED: SizingProfileSeed[] = [
  { clientEmail: "carlos@example.com", clientName: "Carlos Martinez", clientPhone: "+34600111222", height: 178, weight: 82, shoeSize: "43", age: 35, abilityLevel: "intermediate", bootSoleLength: 310, preferredDinSetting: 6.5 },
  { clientEmail: "ana@example.com", clientName: "Ana Lopez", clientPhone: "+34600222333", height: 165, weight: 58, shoeSize: "38", age: 28, abilityLevel: "advanced", bootSoleLength: 285, preferredDinSetting: 5.5 },
  { clientEmail: "maria@example.com", clientName: "Maria Garcia", clientPhone: "+34600333444", height: 160, weight: 55, shoeSize: "37", age: 25, abilityLevel: "beginner", bootSoleLength: 275, preferredDinSetting: 3.5 },
  { clientEmail: "pedro@example.com", clientName: "Pedro Sanchez", clientPhone: "+34600444555", height: 185, weight: 90, shoeSize: "45", age: 42, abilityLevel: "expert", bootSoleLength: 330, preferredDinSetting: 8.5 },
  { clientEmail: "laura@example.com", clientName: "Laura Fernandez", clientPhone: "+34600555666", height: 170, weight: 62, shoeSize: "39", age: 30, abilityLevel: "intermediate", bootSoleLength: 290, preferredDinSetting: 5.0 },
  { clientEmail: "carmen@example.com", clientName: "Carmen Diaz", clientPhone: "+34600999000", height: 163, weight: 56, shoeSize: "38", age: 33, abilityLevel: "advanced", bootSoleLength: 285, preferredDinSetting: 5.5 },
  { clientEmail: "roberto@example.com", clientName: "Roberto Jimenez", clientPhone: "+34601000111", height: 182, weight: 88, shoeSize: "44", age: 38, abilityLevel: "advanced", bootSoleLength: 320, preferredDinSetting: 7.5 },
  { clientEmail: "sofia@example.com", clientName: "Sofia Navarro", clientPhone: "+34601111222", height: 155, weight: 50, shoeSize: "36", age: 27, abilityLevel: "intermediate", bootSoleLength: 265, preferredDinSetting: 4.5 },
  { clientEmail: "raul@example.com", clientName: "Raul Vargas", clientPhone: "+34601333444", height: 175, weight: 78, shoeSize: "42", age: 45, abilityLevel: "intermediate", bootSoleLength: 305, preferredDinSetting: 6.5 },
  { clientEmail: "paula@example.com", clientName: "Paula Romero", clientPhone: "+34601444555", height: 168, weight: 60, shoeSize: "39", age: 31, abilityLevel: "advanced", bootSoleLength: 290, preferredDinSetting: 5.0 },
];
