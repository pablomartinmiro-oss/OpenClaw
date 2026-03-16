"use client";

import { useMutation } from "@tanstack/react-query";
import type { PricingResult, Season } from "@/lib/pricing/types";

// Re-export client-safe pricing utilities (no Prisma dependency)
export { getProductPrice } from "@/lib/pricing/client";

interface CalculatePriceInput {
  station: string;
  activityDate: string;
  items: {
    productId: string;
    quantity: number;
    days?: number;
    hours?: number;
    people?: number;
  }[];
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export function useCalculatePrice() {
  return useMutation({
    mutationFn: (data: CalculatePriceInput) =>
      fetchJSON<PricingResult>("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  });
}

/**
 * Client-side season detection from pre-fetched calendar entries.
 */
export function getSeasonFromCalendar(
  entries: { station: string; season: string; startDate: string; endDate: string }[],
  station: string,
  date: Date
): Season {
  const matching = entries.find(
    (e) =>
      (e.station === station || e.station === "all") &&
      e.season === "alta" &&
      new Date(e.startDate) <= date &&
      new Date(e.endDate) >= date
  );
  return matching ? "alta" : "media";
}
