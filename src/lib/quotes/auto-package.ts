import type { Product } from "@/hooks/useProducts";
import type { Season, DayPricingMatrix } from "@/lib/pricing/types";

interface QuoteFormData {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  wantsAccommodation: boolean;
  wantsForfait: boolean;
  wantsClases: boolean;
  wantsEquipment: boolean;
}

interface PackageItem {
  productId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  breakdown?: string;
}

interface Upsell {
  product: Product;
  reason: string;
}

function getDays(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

/**
 * Get price from pricingMatrix for given days and season, falls back to base price.
 */
function getMatrixPrice(product: Product, season: Season, days: number): number {
  if (product.pricingMatrix) {
    const matrix = product.pricingMatrix as unknown as DayPricingMatrix;
    const seasonPrices = matrix[season];
    if (seasonPrices) {
      const dayStr = String(days);
      if (seasonPrices[dayStr] !== undefined) return seasonPrices[dayStr];
      // Fallback: highest available or per-day rate
      const keys = Object.keys(seasonPrices).map(Number).sort((a, b) => a - b);
      if (days > keys[keys.length - 1]) return seasonPrices[String(keys[keys.length - 1])];
      return (seasonPrices["1"] || product.price) * days;
    }
  }
  return product.price * days;
}

function findByStation(products: Product[], station: string, category: string): Product[] {
  return products.filter(
    (p) => p.category === category && (p.station === station || p.station === "all") && p.isActive
  );
}

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function autoGeneratePackage(
  formData: QuoteFormData,
  products: Product[],
  season: Season = "media"
): { items: PackageItem[]; upsells: Upsell[] } {
  const items: PackageItem[] = [];
  const upsells: Upsell[] = [];
  const days = getDays(formData.checkIn, formData.checkOut);
  const station = formData.destination;

  // 1. Forfaits
  if (formData.wantsForfait) {
    const forfaits = findByStation(products, station, "forfait");
    const adultForfait = forfaits.find((p) => p.personType === "adulto");
    if (adultForfait && formData.adults > 0) {
      const priceForDays = getMatrixPrice(adultForfait, season, days);
      items.push({
        productId: adultForfait.id, name: adultForfait.name, description: adultForfait.description,
        quantity: formData.adults, unitPrice: priceForDays, discount: 0, totalPrice: priceForDays * formData.adults,
        breakdown: `${days} días × ${formData.adults} adultos = ${EUR.format(priceForDays * formData.adults)}`,
      });
    }
    if (formData.children > 0) {
      const childForfait = forfaits.find((p) => p.personType === "infantil");
      if (childForfait) {
        const priceForDays = getMatrixPrice(childForfait, season, days);
        items.push({
          productId: childForfait.id, name: childForfait.name, description: childForfait.description,
          quantity: formData.children, unitPrice: priceForDays, discount: 0, totalPrice: priceForDays * formData.children,
          breakdown: `${days} días × ${formData.children} niños = ${EUR.format(priceForDays * formData.children)}`,
        });
      }
    }
  }

  // 2. Classes (group courses)
  if (formData.wantsClases) {
    const escuelas = findByStation(products, station, "escuela");
    const curso = escuelas.find((p) => p.name.includes("Curso colectivo"));
    if (curso) {
      const totalPax = formData.adults + formData.children;
      const priceForDays = getMatrixPrice(curso, season, days);
      items.push({
        productId: curso.id, name: curso.name, description: curso.description,
        quantity: totalPax, unitPrice: priceForDays, discount: 0, totalPrice: priceForDays * totalPax,
        breakdown: `${days} días × ${totalPax} pers. = ${EUR.format(priceForDays * totalPax)}`,
      });
    }
  }

  // 3. Equipment Rental
  if (formData.wantsEquipment) {
    const alquiler = findByStation(products, station, "alquiler");

    if (formData.adults > 0) {
      const pack = alquiler.find((p) => p.personType === "adulto" && p.tier === "media_quality" && p.includesHelmet)
        || alquiler.find((p) => p.personType === "adulto" && p.tier === "media_quality");
      if (pack) {
        const priceForDays = getMatrixPrice(pack, season, days);
        items.push({
          productId: pack.id, name: pack.name, description: pack.description,
          quantity: formData.adults, unitPrice: priceForDays, discount: 0, totalPrice: priceForDays * formData.adults,
          breakdown: `${days} días × ${formData.adults} adultos = ${EUR.format(priceForDays * formData.adults)}`,
        });
      }
    }
    if (formData.children > 0) {
      const pack = alquiler.find((p) => p.personType === "infantil" && p.includesHelmet)
        || alquiler.find((p) => p.personType === "infantil" && !p.tier);
      if (pack) {
        const priceForDays = getMatrixPrice(pack, season, days);
        items.push({
          productId: pack.id, name: pack.name, description: pack.description,
          quantity: formData.children, unitPrice: priceForDays, discount: 0, totalPrice: priceForDays * formData.children,
          breakdown: `${days} días × ${formData.children} niños = ${EUR.format(priceForDays * formData.children)}`,
        });
      }
    }
  }

  // 4. Upsells (après-ski)
  const apresSkiProducts = products.filter((p) => p.category === "apreski" && p.isActive);
  for (const product of apresSkiProducts) {
    upsells.push({ product, reason: "Actividad complementaria popular" });
  }

  return { items, upsells };
}

export type { PackageItem, Upsell, QuoteFormData };
