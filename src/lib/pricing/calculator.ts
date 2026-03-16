import { prisma } from "@/lib/db";
import type {
  Season,
  PricingRequest,
  PricingResult,
  PricingResultItem,
  DayPricingMatrix,
  PrivateLessonMatrix,
} from "./types";

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/**
 * Determine the season for a given station and date.
 * Checks SeasonCalendar entries, falls back to "all" station, defaults to "media".
 */
export async function getSeason(
  tenantId: string,
  station: string,
  date: Date
): Promise<Season> {
  // Check station-specific calendar first, then "all"
  const entry = await prisma.seasonCalendar.findFirst({
    where: {
      tenantId,
      station: { in: [station, "all"] },
      season: "alta",
      startDate: { lte: date },
      endDate: { gte: date },
    },
    orderBy: { station: "desc" }, // station-specific match wins over "all"
  });

  return entry ? "alta" : "media";
}

/**
 * Get the price from a day-based pricing matrix (equipment, forfaits, group lessons).
 * Returns the price for the given number of days.
 */
function getDayPrice(matrix: DayPricingMatrix, season: Season, days: number): number {
  const seasonPrices = matrix[season];
  if (!seasonPrices) return 0;

  // Try exact match, then closest lower key
  const dayStr = String(days);
  if (seasonPrices[dayStr] !== undefined) return seasonPrices[dayStr];

  // If days exceeds max in matrix, use highest available
  const availableDays = Object.keys(seasonPrices).map(Number).sort((a, b) => a - b);
  if (days > availableDays[availableDays.length - 1]) {
    return seasonPrices[String(availableDays[availableDays.length - 1])];
  }

  // Interpolate for missing entries — use per-day rate
  const perDayPrice = seasonPrices["1"] || 0;
  return perDayPrice * days;
}

/**
 * Get the price from a private lesson pricing matrix.
 * Returns the price for the given hours and number of people.
 */
function getPrivateLessonPrice(
  matrix: PrivateLessonMatrix,
  season: Season,
  hours: number,
  people: number
): number {
  const seasonPrices = matrix[season];
  if (!seasonPrices) return 0;

  const hourKey = `${hours}h`;
  const peopleKey = `${people}p`;

  if (seasonPrices[hourKey]?.[peopleKey] !== undefined) {
    return seasonPrices[hourKey][peopleKey];
  }

  // Fall back to closest available
  if (seasonPrices[hourKey]) {
    const availPeople = Object.keys(seasonPrices[hourKey]).map((k) => parseInt(k));
    const closest = availPeople.reduce((prev, curr) =>
      Math.abs(curr - people) < Math.abs(prev - people) ? curr : prev
    );
    return seasonPrices[hourKey][`${closest}p`] || 0;
  }

  return 0;
}

/**
 * Check if a pricing matrix is a private lesson matrix (has nested hour/people keys).
 */
function isPrivateLessonMatrix(matrix: unknown): matrix is PrivateLessonMatrix {
  if (!matrix || typeof matrix !== "object") return false;
  const m = matrix as Record<string, unknown>;
  const seasonData = m.media || m.alta;
  if (!seasonData || typeof seasonData !== "object") return false;
  // Check if first key looks like "1h", "2h", etc.
  const firstKey = Object.keys(seasonData as object)[0];
  return firstKey?.endsWith("h") ?? false;
}

/**
 * Calculate prices for a set of items at a given station and date.
 */
export async function calculatePrice(request: PricingRequest): Promise<PricingResult> {
  const season = await getSeason(request.tenantId, request.station, request.activityDate);
  const seasonLabel = season === "alta" ? "Temporada Alta" : "Temporada Media";

  const productIds = request.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      tenantId: request.tenantId,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const resultItems: PricingResultItem[] = [];

  for (const item of request.items) {
    const product = productMap.get(item.productId);
    if (!product) continue;

    let unitPrice = 0;
    let subtotal = 0;
    let breakdown = "";
    const days = item.days || 1;
    const hours = item.hours || 1;
    const people = item.people || 1;
    const qty = item.quantity;

    if (product.pricingMatrix) {
      const matrix = product.pricingMatrix as unknown;

      if (product.category === "clase_particular" && isPrivateLessonMatrix(matrix)) {
        unitPrice = getPrivateLessonPrice(matrix, season, hours, people);
        subtotal = unitPrice * qty;
        breakdown = `${hours}h × ${people} pers. × ${qty} = ${EUR.format(subtotal)}`;
      } else {
        // Day-based pricing (equipment, forfaits, group lessons, lockers)
        const dayMatrix = matrix as DayPricingMatrix;
        unitPrice = getDayPrice(dayMatrix, season, days);
        subtotal = unitPrice * qty;

        if (days > 1) {
          breakdown = `${days} días × ${qty} = ${EUR.format(subtotal)}`;
        } else {
          breakdown = `${qty} × ${EUR.format(unitPrice)} = ${EUR.format(subtotal)}`;
        }
      }
    } else {
      // Fallback to simple price
      unitPrice = product.price;
      subtotal = unitPrice * qty * days;
      breakdown = days > 1
        ? `${days} días × ${qty} × ${EUR.format(unitPrice)} = ${EUR.format(subtotal)}`
        : `${qty} × ${EUR.format(unitPrice)} = ${EUR.format(subtotal)}`;
    }

    resultItems.push({
      productId: product.id,
      productName: product.name,
      category: product.category,
      season,
      unitPrice,
      quantity: qty,
      subtotal,
      breakdown,
    });
  }

  return {
    items: resultItems,
    total: resultItems.reduce((sum, item) => sum + item.subtotal, 0),
    season,
    seasonLabel,
  };
}

/**
 * Get a single product's price for given parameters (used for live form calculations).
 * Client-side compatible — uses pre-fetched product data.
 */
export function getProductPrice(
  pricingMatrix: unknown,
  category: string,
  season: Season,
  days: number = 1,
  hours: number = 1,
  people: number = 1
): number {
  if (!pricingMatrix) return 0;

  if (category === "clase_particular" && isPrivateLessonMatrix(pricingMatrix)) {
    return getPrivateLessonPrice(pricingMatrix, season, hours, people);
  }

  return getDayPrice(pricingMatrix as DayPricingMatrix, season, days);
}

export { EUR };
