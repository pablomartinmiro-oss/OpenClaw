"use client";

import { useState } from "react";
import { Plus, X, Star, Flame, Snowflake, Search } from "lucide-react";
import { toast } from "sonner";
import { useHomeModuleItems, useCreateHomeModuleItem, useDeleteHomeModuleItem } from "@/hooks/useCmsExtended";
import { useProducts } from "@/hooks/useProducts";
import type { HomeModuleItem } from "@/hooks/useCmsExtended";
import type { Product } from "@/hooks/useProducts";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import { ComingSoonBadge } from "@/components/shared/ComingSoonBadge";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";

const MODULES = [
  { key: "featured", label: "Destacados", icon: Star, emoji: "⭐" },
  { key: "popular", label: "Populares", icon: Flame, emoji: "🔥" },
  { key: "seasonal", label: "Temporada", icon: Snowflake, emoji: "❄" },
] as const;

export default function HomeModulesManager() {
  const { data, isLoading } = useHomeModuleItems();
  const { data: products } = useProducts();
  const createItem = useCreateHomeModuleItem();
  const deleteItem = useDeleteHomeModuleItem();
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const items = data?.items ?? [];
  const allProducts = products ?? [];

  const handleAdd = async (moduleKey: string, productId: string) => {
    try {
      const count = items.filter((i) => i.moduleKey === moduleKey).length;
      await createItem.mutateAsync({ moduleKey, productId, sortOrder: count });
      toast.success("Producto añadido");
      setPickerOpen(null);
      setSearch("");
    } catch { toast.error("Error al añadir producto"); }
  };

  const handleRemove = async (item: HomeModuleItem) => {
    if (!confirm("Quitar este producto del módulo?")) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success("Producto eliminado del módulo");
    } catch { toast.error("Error al eliminar"); }
  };

  const getProduct = (id: string | null) => allProducts.find((p) => p.id === id);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <ComingSoonBadge variant="banner" message="Estos módulos aparecerán en la home pública del storefront cuando se construya en PORT-12. Configúralos ahora para que estén listos." />

      {MODULES.map((mod) => {
        const moduleItems = items.filter((i) => i.moduleKey === mod.key);
        const existingProductIds = new Set(moduleItems.map((i) => i.productId));
        const filtered = allProducts.filter((p) =>
          !existingProductIds.has(p.id) &&
          (p.name.toLowerCase().includes(search.toLowerCase()) || (p.slug?.toLowerCase().includes(search.toLowerCase()) ?? false))
        );

        return (
          <CollapsibleSection key={mod.key} title={`${mod.emoji} ${mod.label} (${moduleItems.length} producto${moduleItems.length !== 1 ? "s" : ""})`} defaultOpen={moduleItems.length > 0}>
            {moduleItems.length === 0 ? (
              <p className="text-sm text-[#8A8580]">No hay productos en esta sección</p>
            ) : (
              <div className="space-y-2">
                {moduleItems.map((item) => {
                  const product = getProduct(item.productId);
                  return (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E8E4DE] p-3">
                      {product?.coverImageUrl ? (
                        <img src={product.coverImageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <ImagePlaceholder size="sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2D2A26] truncate">{product?.name ?? "Producto eliminado"}</p>
                        {product && <p className="text-xs text-[#8A8580]">{product.category}</p>}
                      </div>
                      <button onClick={() => handleRemove(item)} className="rounded-[10px] p-1.5 text-[#8A8580] hover:bg-red-50 hover:text-[#C75D4A] transition-colors" aria-label="Quitar">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {pickerOpen === mod.key ? (
              <div className="mt-3 rounded-xl border border-[#E8E4DE] p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8580]" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto por nombre o slug..." className="w-full rounded-[10px] border border-[#E8E4DE] pl-9 pr-3 py-2 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:border-[#E87B5A] focus:outline-none focus:ring-1 focus:ring-[#E87B5A]" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filtered.length === 0 ? (
                    <p className="text-xs text-[#8A8580] py-2">No se encontraron productos. <a href="/catalogo" className="text-[#E87B5A] underline">Crear nuevo en Catálogo</a></p>
                  ) : (
                    filtered.slice(0, 20).map((p) => (
                      <button key={p.id} onClick={() => handleAdd(mod.key, p.id)} className="flex items-center gap-3 w-full rounded-lg p-2 text-left hover:bg-[#FAF9F7] transition-colors">
                        {p.coverImageUrl ? (
                          <img src={p.coverImageUrl} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <ImagePlaceholder size="sm" className="h-8 w-8" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#2D2A26] truncate">{p.name}</p>
                          <p className="text-xs text-[#8A8580]">{p.category}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <button onClick={() => { setPickerOpen(null); setSearch(""); }} className="text-xs text-[#8A8580] hover:text-[#2D2A26]">Cerrar</button>
              </div>
            ) : (
              <button onClick={() => setPickerOpen(mod.key)} className="mt-2 flex items-center gap-1 text-xs font-medium text-[#E87B5A] hover:text-[#D56E4F] transition-colors">
                <Plus className="h-3.5 w-3.5" /> Añadir producto
              </button>
            )}
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
