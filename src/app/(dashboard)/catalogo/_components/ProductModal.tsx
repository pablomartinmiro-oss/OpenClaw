"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { CATEGORY_LABELS, PRICE_TYPE_LABELS, STATION_LABELS } from "./ProductTable";
import { hasNonDefaultValues } from "./CollapsibleSection";
import { slugify } from "./slugify";
import { PublicationSection, FiscalSection, DiscountSection, SeoSection } from "./ProductFormSections";
import type { SectionFormState } from "./ProductFormSections";
import { buildSubmitData } from "./buildSubmitData";

const PLANNING_CATEGORIES = ["escuela", "clase_particular", "snowcamp"];
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const inputCls = "w-full rounded-lg border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";
const labelCls = "block text-sm font-medium text-[#2D2A26] mb-1";
const smallLabelCls = "block text-xs font-medium text-[#8A8580] mb-1";

interface ProductForm extends SectionFormState {
  category: string;
  name: string;
  description: string;
  station: string;
  personType: string;
  tier: string;
  includesHelmet: boolean;
  price: string;
  priceType: string;
  isActive: boolean;
  slug: string;
  discipline: string;
  minAge: string;
  maxAge: string;
  maxParticipants: string;
  requiresGrouping: boolean;
  planningMode: string;
}

function getInitialForm(product: Product | null): ProductForm {
  const p = product as unknown as Record<string, unknown> | null;
  if (p) {
    return {
      category: (p.category as string) || "alquiler",
      name: (p.name as string) || "",
      description: (p.description as string) || "",
      station: (p.station as string) || "all",
      personType: (p.personType as string) || "",
      tier: (p.tier as string) || "",
      includesHelmet: (p.includesHelmet as boolean) || false,
      price: String(p.price ?? ""),
      priceType: (p.priceType as string) || "per_day",
      isActive: (p.isActive as boolean) ?? true,
      discipline: (p.discipline as string) || "",
      minAge: p.minAge != null ? String(p.minAge) : "",
      maxAge: p.maxAge != null ? String(p.maxAge) : "",
      maxParticipants: p.maxParticipants != null ? String(p.maxParticipants) : "10",
      requiresGrouping: (p.requiresGrouping as boolean) || false,
      planningMode: (p.planningMode as string) || "",
      slug: (p.slug as string) || "",
      isPublished: (p.isPublished as boolean) ?? true,
      isFeatured: (p.isFeatured as boolean) || false,
      isPresentialSale: (p.isPresentialSale as boolean) || false,
      difficulty: (p.difficulty as string) || "",
      productType: (p.productType as string) || "",
      fiscalRegime: (p.fiscalRegime as string) || "general",
      providerPercent: p.providerPercent != null ? String(p.providerPercent) : "",
      agencyMarginPercent: p.agencyMarginPercent != null ? String(p.agencyMarginPercent) : "",
      supplierCommissionPercent: p.supplierCommissionPercent != null ? String(p.supplierCommissionPercent) : "",
      supplierCostType: (p.supplierCostType as string) || "",
      settlementFrequency: (p.settlementFrequency as string) || "",
      isSettlable: (p.isSettlable as boolean) || false,
      discountPercent: p.discountPercent != null ? String(p.discountPercent) : "",
      discountExpiresAt: p.discountExpiresAt ? (p.discountExpiresAt as string).slice(0, 16) : "",
      coverImageUrl: (p.coverImageUrl as string) || "",
      images: Array.isArray(p.images) ? (p.images as string[]) : [],
      includes: Array.isArray(p.includes) ? (p.includes as string[]) : [],
      excludes: Array.isArray(p.excludes) ? (p.excludes as string[]) : [],
      metaTitle: (p.metaTitle as string) || "",
      metaDescription: (p.metaDescription as string) || "",
    };
  }
  return {
    category: "alquiler", name: "", description: "", station: "all",
    personType: "", tier: "", includesHelmet: false, price: "", priceType: "per_day",
    isActive: true, discipline: "", minAge: "", maxAge: "", maxParticipants: "10",
    requiresGrouping: false, planningMode: "",
    slug: "", isPublished: true, isFeatured: false, isPresentialSale: false,
    difficulty: "", productType: "", fiscalRegime: "general",
    providerPercent: "", agencyMarginPercent: "", supplierCommissionPercent: "",
    supplierCostType: "", settlementFrequency: "", isSettlable: false,
    discountPercent: "", discountExpiresAt: "",
    coverImageUrl: "", images: [], includes: [], excludes: [],
    metaTitle: "", metaDescription: "",
  };
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}

export function ProductModal({ product, isOpen, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState<ProductForm>(getInitialForm(product));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!product);
  const [slugError, setSlugError] = useState("");
  const [discountWarning, setDiscountWarning] = useState("");
  const isEditMode = !!product;

  useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm(product));
      setSlugManuallyEdited(!!product);
      setSlugError("");
      setDiscountWarning("");
    }
  }, [isOpen, product]);

  // Auto-slug in create mode
  useEffect(() => {
    if (!isEditMode && !slugManuallyEdited && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(form.name) }));
    }
  }, [form.name, isEditMode, slugManuallyEdited]);

  useEffect(() => {
    setSlugError(form.slug && !SLUG_REGEX.test(form.slug) ? "Solo minúsculas, números y guiones." : "");
  }, [form.slug]);

  useEffect(() => {
    const hasP = form.discountPercent !== "";
    const hasD = form.discountExpiresAt !== "";
    setDiscountWarning((hasP && !hasD) || (!hasP && hasD) ? "Descuento y fecha de expiración deben configurarse juntos." : "");
  }, [form.discountPercent, form.discountExpiresAt]);

  if (!isOpen) return null;

  const update = (patch: Partial<ProductForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(buildSubmitData(form, product?.id));
  };

  const pubOpen = hasNonDefaultValues({ isFeatured: form.isFeatured, isPresentialSale: form.isPresentialSale, difficulty: form.difficulty, productType: form.productType }) || !form.isPublished;
  const fiscalOpen = hasNonDefaultValues({ providerPercent: form.providerPercent, agencyMarginPercent: form.agencyMarginPercent, supplierCommissionPercent: form.supplierCommissionPercent, supplierCostType: form.supplierCostType, settlementFrequency: form.settlementFrequency, isSettlable: form.isSettlable }, { fiscalRegime: "general" }) || form.fiscalRegime !== "general";
  const discountOpen = hasNonDefaultValues({ discountPercent: form.discountPercent, discountExpiresAt: form.discountExpiresAt });
  const seoOpen = hasNonDefaultValues({ coverImageUrl: form.coverImageUrl, metaTitle: form.metaTitle, metaDescription: form.metaDescription }) || form.images.length > 0 || form.includes.length > 0 || form.excludes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E8E4DE] px-6 py-4 shrink-0">
          <h2 className="text-lg font-semibold text-[#2D2A26]">{product ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#8A8580] hover:bg-[#FAF9F7] transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 p-6">
          {/* ═══ BÁSICOS ═══ */}
          <div>
            <label className={labelCls}>Nombre</label>
            <input type="text" value={form.name} onChange={(e) => update({ name: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>
              Slug (URL pública)
              {!isEditMode && !slugManuallyEdited && form.slug && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-[#E87B5A]" title="Auto-generado desde el nombre"><Sparkles className="h-3 w-3" /> auto</span>
              )}
            </label>
            <input type="text" value={form.slug} onChange={(e) => { setSlugManuallyEdited(true); update({ slug: e.target.value }); }} placeholder="ej: forfait-baqueira-adulto" className={`${inputCls} ${slugError ? "border-[#C75D4A] focus:border-[#C75D4A] focus:ring-[#C75D4A]" : ""}`} />
            {slugError && <p className="mt-1 text-xs text-[#C75D4A]">{slugError}</p>}
            {isEditMode && <p className="mt-1 text-xs text-[#8A8580]">Cambiar el slug puede romper enlaces existentes.</p>}
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <input type="text" value={form.description} onChange={(e) => update({ description: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Categoría</label>
              <select value={form.category} onChange={(e) => update({ category: e.target.value })} className={inputCls}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Estación</label>
              <select value={form.station} onChange={(e) => update({ station: e.target.value })} className={inputCls}>
                {Object.entries(STATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Tipo persona</label>
              <select value={form.personType} onChange={(e) => update({ personType: e.target.value })} className={inputCls}>
                <option value="">Sin especificar</option>
                <option value="adulto">Adulto</option>
                <option value="infantil">Infantil</option>
                <option value="baby">Baby</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Calidad</label>
              <select value={form.tier} onChange={(e) => update({ tier: e.target.value })} className={inputCls}>
                <option value="">Sin especificar</option>
                <option value="media">Media calidad</option>
                <option value="alta">Alta calidad</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-[#2D2A26]">
                <input type="checkbox" checked={form.includesHelmet} onChange={(e) => update({ includesHelmet: e.target.checked })} className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]" />
                Incluye casco
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Precio base (€)</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => update({ price: e.target.value })} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Tipo de Precio</label>
              <select value={form.priceType} onChange={(e) => update({ priceType: e.target.value })} className={inputCls}>
                {Object.entries(PRICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* ═══ PLANNING (condicional) ═══ */}
          {PLANNING_CATEGORIES.includes(form.category) && (
            <div className="rounded-xl border border-[#E87B5A]/20 bg-[#E87B5A]/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-[#E87B5A] uppercase tracking-wide">Configuración de Planning</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={smallLabelCls}>Disciplina</label>
                  <select value={form.discipline} onChange={(e) => update({ discipline: e.target.value })} className={inputCls}>
                    <option value="">Sin especificar</option>
                    <option value="esqui">Esquí alpino</option>
                    <option value="snow">Snowboard</option>
                    <option value="telemark">Telemark</option>
                    <option value="freestyle">Freestyle</option>
                  </select>
                </div>
                <div>
                  <label className={smallLabelCls}>Modo Planning</label>
                  <select value={form.planningMode} onChange={(e) => update({ planningMode: e.target.value })} className={inputCls}>
                    <option value="">Sin especificar</option>
                    <option value="dynamic_grouping">Agrupación dinámica</option>
                    <option value="fixed_slot">Slot fijo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className={smallLabelCls}>Edad mín</label><input type="number" min="0" value={form.minAge} onChange={(e) => update({ minAge: e.target.value })} className={inputCls} placeholder="3" /></div>
                <div><label className={smallLabelCls}>Edad máx</label><input type="number" min="0" value={form.maxAge} onChange={(e) => update({ maxAge: e.target.value })} className={inputCls} placeholder="99" /></div>
                <div><label className={smallLabelCls}>Máx participantes</label><input type="number" min="1" max="15" value={form.maxParticipants} onChange={(e) => update({ maxParticipants: e.target.value })} className={inputCls} placeholder="10" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#2D2A26]">
                <input type="checkbox" checked={form.requiresGrouping} onChange={(e) => update({ requiresGrouping: e.target.checked })} className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]" />
                Requiere agrupación automática
              </label>
            </div>
          )}

          {/* ═══ 4 COLLAPSIBLE SECTIONS ═══ */}
          <PublicationSection form={form} onChange={update} defaultOpen={pubOpen} />
          <FiscalSection form={form} onChange={update} defaultOpen={fiscalOpen} />
          <DiscountSection form={form} onChange={update} defaultOpen={discountOpen} warning={discountWarning} />
          <SeoSection form={form} onChange={update} defaultOpen={seoOpen} />

          {/* ═══ FOOTER ═══ */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => update({ isActive: e.target.checked })} className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]" />
            <label htmlFor="isActive" className="text-sm text-[#2D2A26]">Producto activo</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#E8E4DE] px-4 py-2 text-sm font-medium text-[#8A8580] hover:bg-[#FAF9F7] transition-colors">Cancelar</button>
            <button type="submit" className="rounded-lg bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] transition-colors">{product ? "Guardar Cambios" : "Crear Producto"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
