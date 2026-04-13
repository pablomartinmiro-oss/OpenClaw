"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { EditableList } from "./EditableList";

const inputCls = "w-full rounded-lg border border-[#E8E4DE] px-3 py-2 text-sm focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";
const smallLabelCls = "block text-xs font-medium text-[#8A8580] mb-1";

export const PRODUCT_TYPE_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "experiencia", label: "Experiencia" },
  { value: "actividad", label: "Actividad" },
  { value: "transporte", label: "Transporte" },
  { value: "alojamiento", label: "Alojamiento" },
  { value: "restauracion", label: "Restauración" },
  { value: "pack", label: "Pack" },
  { value: "alquiler", label: "Alquiler" },
  { value: "otro", label: "Otro" },
];

export const DIFFICULTY_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "facil", label: "Fácil" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
  { value: "experto", label: "Experto" },
];

const FISCAL_OPTIONS = [
  { value: "general", label: "General (21%)" },
  { value: "reav", label: "REAV" },
  { value: "mixed", label: "Mixto" },
];

const COST_TYPE_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "percentage", label: "Porcentaje" },
  { value: "fixed", label: "Fijo" },
  { value: "margin", label: "Margen" },
  { value: "hybrid", label: "Híbrido" },
];

const SETTLEMENT_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
];

// Shared form state type for the section components
export interface SectionFormState {
  isPublished: boolean;
  isFeatured: boolean;
  isPresentialSale: boolean;
  difficulty: string;
  productType: string;
  fiscalRegime: string;
  providerPercent: string;
  agencyMarginPercent: string;
  supplierCommissionPercent: string;
  supplierCostType: string;
  settlementFrequency: string;
  isSettlable: boolean;
  discountPercent: string;
  discountExpiresAt: string;
  coverImageUrl: string;
  images: string[];
  includes: string[];
  excludes: string[];
  metaTitle: string;
  metaDescription: string;
}

interface SectionProps {
  form: SectionFormState;
  onChange: (patch: Partial<SectionFormState>) => void;
  defaultOpen: boolean;
}

function PercentInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={smallLabelCls}>{label}</label>
      <div className="relative">
        <input type="number" min="0" max="100" step="0.01" value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} pr-8`} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8A8580]">%</span>
      </div>
    </div>
  );
}

export function PublicationSection({ form, onChange, defaultOpen }: SectionProps) {
  return (
    <CollapsibleSection title="Publicación y visibilidad" defaultOpen={defaultOpen}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={smallLabelCls}>Tipo de producto</label>
          <select value={form.productType} onChange={(e) => onChange({ productType: e.target.value })} className={inputCls}>
            {PRODUCT_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={smallLabelCls}>Dificultad</label>
          <select value={form.difficulty} onChange={(e) => onChange({ difficulty: e.target.value })} className={inputCls}>
            {DIFFICULTY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {([["isPublished", "Publicado"], ["isFeatured", "Destacado"], ["isPresentialSale", "Venta presencial"]] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-[#2D2A26]">
            <input type="checkbox" checked={form[key] as boolean} onChange={(e) => onChange({ [key]: e.target.checked })} className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]" />
            {label}
          </label>
        ))}
      </div>
    </CollapsibleSection>
  );
}

export function FiscalSection({ form, onChange, defaultOpen }: SectionProps) {
  return (
    <CollapsibleSection title="Fiscal y proveedor" defaultOpen={defaultOpen}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={smallLabelCls}>Régimen fiscal</label>
          <select value={form.fiscalRegime} onChange={(e) => onChange({ fiscalRegime: e.target.value })} className={inputCls}>
            {FISCAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={smallLabelCls}>Tipo coste proveedor</label>
          <select value={form.supplierCostType} onChange={(e) => onChange({ supplierCostType: e.target.value })} className={inputCls}>
            {COST_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <PercentInput label="% Proveedor" value={form.providerPercent} onChange={(v) => onChange({ providerPercent: v })} />
        <PercentInput label="% Agencia" value={form.agencyMarginPercent} onChange={(v) => onChange({ agencyMarginPercent: v })} />
        <PercentInput label="% Comisión" value={form.supplierCommissionPercent} onChange={(v) => onChange({ supplierCommissionPercent: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={smallLabelCls}>Frecuencia liquidación</label>
          <select value={form.settlementFrequency} onChange={(e) => onChange({ settlementFrequency: e.target.value })} className={inputCls}>
            {SETTLEMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-[#2D2A26]">
            <input type="checkbox" checked={form.isSettlable} onChange={(e) => onChange({ isSettlable: e.target.checked })} className="h-4 w-4 rounded border-[#E8E4DE] text-[#E87B5A] focus:ring-[#E87B5A]" />
            Liquidable
          </label>
        </div>
      </div>
    </CollapsibleSection>
  );
}

export function DiscountSection({ form, onChange, defaultOpen, warning }: SectionProps & { warning: string }) {
  return (
    <CollapsibleSection title="Descuentos" defaultOpen={defaultOpen}>
      <div className="grid grid-cols-2 gap-3">
        <PercentInput label="Descuento" value={form.discountPercent} onChange={(v) => onChange({ discountPercent: v })} />
        <div>
          <label className={smallLabelCls}>Expira</label>
          <input type="datetime-local" value={form.discountExpiresAt} onChange={(e) => onChange({ discountExpiresAt: e.target.value })} className={inputCls} />
        </div>
      </div>
      {warning && <p className="text-xs text-[#D4A853]">{warning}</p>}
    </CollapsibleSection>
  );
}

export function SeoSection({ form, onChange, defaultOpen }: SectionProps) {
  return (
    <CollapsibleSection title="Imágenes y SEO" defaultOpen={defaultOpen}>
      <div>
        <label className={smallLabelCls}>Imagen de portada (URL)</label>
        <div className="flex items-center gap-3">
          <input type="url" value={form.coverImageUrl} onChange={(e) => onChange({ coverImageUrl: e.target.value })} placeholder="https://..." className={`flex-1 ${inputCls}`} />
          {form.coverImageUrl && /^https?:\/\/.+/.test(form.coverImageUrl) && (
            <img src={form.coverImageUrl} alt="Preview" className="h-[60px] w-[60px] rounded-lg object-cover border border-[#E8E4DE]" />
          )}
        </div>
      </div>
      <div>
        <label className={smallLabelCls}>Galería de imágenes</label>
        <EditableList items={form.images} onChange={(v) => onChange({ images: v })} inputType="url" placeholder="https://..." addLabel="+ Añadir imagen" />
      </div>
      <div>
        <label className={smallLabelCls}>Incluye</label>
        <EditableList items={form.includes} onChange={(v) => onChange({ includes: v })} placeholder="ej: Seguro, Material, Monitor" addLabel="+ Añadir" />
      </div>
      <div>
        <label className={smallLabelCls}>No incluye</label>
        <EditableList items={form.excludes} onChange={(v) => onChange({ excludes: v })} placeholder="ej: Transporte, Comida" addLabel="+ Añadir" />
      </div>
      <div>
        <label className={smallLabelCls}>
          Título SEO
          <span className="ml-2 font-normal text-[#8A8580]">{form.metaTitle.length}/60</span>
        </label>
        <input type="text" maxLength={60} value={form.metaTitle} onChange={(e) => onChange({ metaTitle: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className={smallLabelCls}>
          Descripción SEO
          <span className="ml-2 font-normal text-[#8A8580]">{form.metaDescription.length}/160</span>
        </label>
        <textarea maxLength={160} rows={2} value={form.metaDescription} onChange={(e) => onChange({ metaDescription: e.target.value })} className={inputCls} />
      </div>
    </CollapsibleSection>
  );
}
