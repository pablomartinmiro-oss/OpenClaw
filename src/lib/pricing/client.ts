/**
 * Client-safe pricing utilities. No Prisma dependency.
 */

import type { Season, DayPricingMatrix, PrivateLessonMatrix } from "./types";

function isPrivateLessonMatrix(matrix: unknown): matrix is PrivateLessonMatrix {
  if (!matrix || typeof matrix !== "object") return false;
  const m = matrix as Record<string, unknown>;
  const seasonData = m.media || m.alta;
  if (!seasonData || typeof seasonData !== "object") return false;
  const firstKey = Object.keys(seasonData as object)[0];
  return firstKey?.endsWith("h") ?? false;
}

function getDayPrice(matrix: DayPricingMatrix, season: Season, days: number): number {
  const seasonPrices = matrix[season];
  if (!seasonPrices) return 0;
  const dayStr = String(days);
  if (seasonPrices[dayStr] !== undefined) return seasonPrices[dayStr];
  const availableDays = Object.keys(seasonPrices).map(Number).sort((a, b) => a - b);
  if (days > availableDays[availableDays.length - 1]) {
    return seasonPrices[String(availableDays[availableDays.length - 1])];
  }
  return (seasonPrices["1"] || 0) * days;
}

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
 * Get a single product's price for given parameters.
 * Pure function — safe for client components.
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

export const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
