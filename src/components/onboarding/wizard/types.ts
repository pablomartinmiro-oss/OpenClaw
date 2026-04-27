export type BusinessType = "ski_school" | "hotel" | "spa" | "restaurant" | "multi";

export interface BusinessInfo {
  businessType: BusinessType;
  city: string;
  phone: string;
  website: string;
  logoUrl: string;
}

export interface SampleProduct {
  name: string;
  category: string;
  price: number;
}

export interface StorefrontConfig {
  siteTitle: string;
  description: string;
  primaryColor: string;
}

export interface WizardData {
  business: BusinessInfo;
  enabledModules: string[];
  products: SampleProduct[];
  storefront: StorefrontConfig;
}

export const BUSINESS_TYPES: Array<{ value: BusinessType; label: string; description: string }> = [
  { value: "ski_school", label: "Escuela de esqui", description: "Clases, alquiler, forfaits" },
  { value: "hotel", label: "Hotel", description: "Habitaciones, restauracion, spa" },
  { value: "spa", label: "Spa", description: "Tratamientos y citas" },
  { value: "restaurant", label: "Restaurante", description: "Mesas, turnos y menus" },
  { value: "multi", label: "Multi-actividad", description: "Combinacion de servicios" },
];

export const MODULE_PRESETS: Record<BusinessType, string[]> = {
  ski_school: ["catalog", "booking", "rental", "storefront", "ticketing", "finance", "instructors"],
  hotel: ["catalog", "booking", "hotel", "restaurant", "spa", "storefront", "finance"],
  spa: ["catalog", "booking", "spa", "storefront", "finance"],
  restaurant: ["restaurant", "finance", "storefront", "cms"],
  multi: ["catalog", "booking", "hotel", "spa", "restaurant", "rental", "storefront", "ticketing", "finance", "cms"],
};

export const PRODUCT_TEMPLATES: Record<BusinessType, SampleProduct[]> = {
  ski_school: [
    { name: "Clase de esqui en grupo (2h)", category: "escuela", price: 45 },
    { name: "Alquiler de esquis (1 dia)", category: "alquiler", price: 25 },
    { name: "Forfait dia adulto", category: "forfait", price: 50 },
  ],
  hotel: [
    { name: "Habitacion doble", category: "alojamiento", price: 120 },
    { name: "Suite", category: "alojamiento", price: 220 },
    { name: "Desayuno buffet", category: "restauracion", price: 15 },
  ],
  spa: [
    { name: "Masaje relajante (60 min)", category: "spa", price: 80 },
    { name: "Circuito termal", category: "spa", price: 45 },
  ],
  restaurant: [
    { name: "Menu degustacion", category: "restauracion", price: 45 },
    { name: "Menu del dia", category: "restauracion", price: 18 },
  ],
  multi: [
    { name: "Pack basico (1 dia)", category: "pack", price: 89 },
  ],
};

export const STEPS = [
  { id: 1, label: "Tu negocio" },
  { id: 2, label: "Modulos" },
  { id: 3, label: "Productos" },
  { id: 4, label: "Tienda" },
  { id: 5, label: "Listo" },
] as const;
