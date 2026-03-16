// Pricing matrix types for different product categories

/** Equipment rental: price varies by number of days */
export interface DayPricingMatrix {
  media: Record<string, number>; // "1": 36, "2": 72, ...
  alta: Record<string, number>;
}

/** Private lessons: price varies by hours AND number of people */
export interface PrivateLessonMatrix {
  media: Record<string, Record<string, number>>; // "1h": { "1p": 70, "2p": 75, ... }
  alta: Record<string, Record<string, number>>;
}

/** Generic pricing matrix — union type */
export type PricingMatrix = DayPricingMatrix | PrivateLessonMatrix;

export type Season = "media" | "alta";

export interface PricingRequest {
  tenantId: string;
  station: string;
  activityDate: Date;
  items: PricingItem[];
}

export interface PricingItem {
  productId: string;
  quantity: number;
  days?: number;
  hours?: number;
  people?: number;
}

export interface PricingResultItem {
  productId: string;
  productName: string;
  category: string;
  season: Season;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  breakdown: string; // "3 días × 2 adultos × 108,00 € = 216,00 €"
}

export interface PricingResult {
  items: PricingResultItem[];
  total: number;
  season: Season;
  seasonLabel: string;
}

export interface SeasonPeriod {
  id: string;
  station: string;
  season: Season;
  startDate: string;
  endDate: string;
  label: string | null;
}

// Product categories used in pricing
export const PRODUCT_CATEGORIES = {
  alquiler: "Alquiler Material",
  escuela: "Escuela (Cursos Colectivos)",
  clase_particular: "Clases Particulares",
  forfait: "Forfaits",
  locker: "Lockers / Guardaropa",
  apreski: "Après-ski / Actividades",
  menu: "Menú / Restauración",
  snowcamp: "SnowCamp / Guardería",
  taxi: "Transfers / Taxi",
  pack: "Packs All-in-One",
} as const;

export const STATIONS = {
  baqueira: "Baqueira Beret",
  sierra_nevada: "Sierra Nevada",
  valdesqui: "Valdesquí",
  la_pinilla: "La Pinilla",
  grandvalira: "Grandvalira",
  formigal: "Formigal",
  alto_campoo: "Alto Campoo",
  all: "Todas las estaciones",
} as const;

export type StationKey = keyof typeof STATIONS;
export type CategoryKey = keyof typeof PRODUCT_CATEGORIES;
