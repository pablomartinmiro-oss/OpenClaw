import type { Product } from "@/hooks/useProducts";

const PLANNING_CATEGORIES = ["escuela", "clase_particular", "snowcamp"];

interface FormValues {
  category: string; name: string; description: string; station: string;
  personType: string; tier: string; includesHelmet: boolean; price: string;
  priceType: string; isActive: boolean; slug: string;
  isPublished: boolean; isFeatured: boolean; isPresentialSale: boolean;
  difficulty: string; productType: string; fiscalRegime: string;
  providerPercent: string; agencyMarginPercent: string;
  supplierCommissionPercent: string; supplierCostType: string;
  settlementFrequency: string; isSettlable: boolean;
  discountPercent: string; discountExpiresAt: string;
  coverImageUrl: string; images: string[]; includes: string[];
  excludes: string[]; metaTitle: string; metaDescription: string;
  discipline: string; minAge: string; maxAge: string;
  maxParticipants: string; requiresGrouping: boolean; planningMode: string;
}

export function buildSubmitData(form: FormValues, productId?: string): Partial<Product> {
  const data: Record<string, unknown> = {
    ...(productId && { id: productId }),
    category: form.category, name: form.name,
    description: form.description || null, station: form.station || "all",
    personType: form.personType || null, tier: form.tier || null,
    includesHelmet: form.includesHelmet, price: parseFloat(form.price) || 0,
    priceType: form.priceType, isActive: form.isActive,
    slug: form.slug || null, isPublished: form.isPublished,
    isFeatured: form.isFeatured, isPresentialSale: form.isPresentialSale,
    difficulty: form.difficulty || null, productType: form.productType || null,
    fiscalRegime: form.fiscalRegime || "general",
    providerPercent: form.providerPercent ? parseFloat(form.providerPercent) : null,
    agencyMarginPercent: form.agencyMarginPercent ? parseFloat(form.agencyMarginPercent) : null,
    supplierCommissionPercent: form.supplierCommissionPercent ? parseFloat(form.supplierCommissionPercent) : null,
    supplierCostType: form.supplierCostType || null,
    settlementFrequency: form.settlementFrequency || null,
    isSettlable: form.isSettlable,
    discountPercent: form.discountPercent ? parseFloat(form.discountPercent) : null,
    discountExpiresAt: form.discountExpiresAt ? new Date(form.discountExpiresAt).toISOString() : null,
    coverImageUrl: form.coverImageUrl || null,
    images: form.images.filter(Boolean),
    includes: form.includes.filter(Boolean).length > 0 ? form.includes.filter(Boolean) : null,
    excludes: form.excludes.filter(Boolean).length > 0 ? form.excludes.filter(Boolean) : null,
    metaTitle: form.metaTitle || null, metaDescription: form.metaDescription || null,
  };
  if (PLANNING_CATEGORIES.includes(form.category)) {
    data.discipline = form.discipline || null;
    data.minAge = form.minAge ? parseInt(form.minAge) : null;
    data.maxAge = form.maxAge ? parseInt(form.maxAge) : null;
    data.maxParticipants = form.maxParticipants ? parseInt(form.maxParticipants) : null;
    data.requiresGrouping = form.requiresGrouping;
    data.planningMode = form.planningMode || null;
  }
  return data as Partial<Product>;
}
