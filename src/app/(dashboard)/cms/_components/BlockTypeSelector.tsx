"use client";

import { ComingSoonBadge } from "@/components/shared/ComingSoonBadge";

const BLOCK_TYPES = [
  { value: "text", label: "Texto", available: true },
  { value: "image", label: "Imagen", available: true },
  { value: "gallery", label: "Galería", available: true },
  { value: "video", label: "Video", available: true },
  { value: "html", label: "HTML", available: true },
  { value: "hero", label: "Hero", available: false },
  { value: "cta", label: "CTA", available: false },
  { value: "faq", label: "FAQ", available: false },
] as const;

const BLOCK_TEMPLATES: Record<string, Record<string, unknown>> = {
  text: { body: "" },
  image: { url: "", alt: "", caption: "" },
  gallery: { images: [] },
  video: { url: "", provider: "youtube" },
  html: { code: "" },
  hero: { heading: "", subheading: "", backgroundUrl: "", ctaText: "", ctaUrl: "" },
  cta: { heading: "", body: "", ctaText: "", ctaUrl: "", variant: "primary" },
  faq: { items: [{ question: "", answer: "" }] },
};

interface BlockTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  onContentInit: (content: Record<string, unknown>) => void;
}

const inputCls = "w-full rounded-[10px] border border-[#E8E4DE] px-3 py-2 text-sm text-[#2D2A26] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]";

export default function BlockTypeSelector({ value, onChange, onContentInit }: BlockTypeSelectorProps) {
  const handleChange = (newType: string) => {
    onChange(newType);
    onContentInit(BLOCK_TEMPLATES[newType] ?? {});
  };

  const selected = BLOCK_TYPES.find((t) => t.value === value);
  const isAdvanced = selected && !selected.available;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#2D2A26] mb-1">Tipo de bloque</label>
      <select value={value} onChange={(e) => handleChange(e.target.value)} className={inputCls}>
        {BLOCK_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}{!t.available ? " (próximamente)" : ""}
          </option>
        ))}
      </select>
      {isAdvanced && (
        <ComingSoonBadge variant="banner" message="El editor visual para este tipo de bloque llega en PORT-12. Por ahora edítalo como JSON." />
      )}
    </div>
  );
}

export { BLOCK_TEMPLATES };
