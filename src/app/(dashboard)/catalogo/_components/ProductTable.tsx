"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/hooks/useProducts";

const CATEGORY_LABELS: Record<string, string> = {
  alojamiento: "Alojamiento",
  forfait: "Forfaits",
  cursillo: "Cursillos",
  alquiler: "Alquiler Material",
  apres_ski: "Après-ski",
};

const PRICE_TYPE_LABELS: Record<string, string> = {
  per_night: "/noche",
  per_day: "/día",
  per_person: "/persona",
  fixed: "fijo",
};

const DESTINATION_LABELS: Record<string, string> = {
  baqueira: "Baqueira",
  sierra_nevada: "Sierra Nevada",
  formigal: "Formigal",
  alto_campoo: "Alto Campoo",
  grandvalira: "Grandvalira",
};

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd: () => void;
}

export function ProductTable({ products, onEdit, onDelete, onAdd }: ProductTableProps) {
  const [filterCategory, setFilterCategory] = useState<string>("");
  const categories = Object.keys(CATEGORY_LABELS);

  const filtered = filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products;

  // Group by category
  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    const cat = p.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catálogo de Productos</h1>
          <p className="text-sm text-text-secondary mt-1">
            {products.length} productos en el catálogo
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2.5 text-sm font-medium text-white hover:bg-coral-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Añadir Producto
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory("")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            !filterCategory
              ? "bg-coral text-white"
              : "bg-white text-text-secondary border border-border hover:bg-surface"
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filterCategory === cat
                ? "bg-coral text-white"
                : "bg-white text-text-secondary border border-border hover:bg-surface"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Tables by category */}
      {Object.entries(grouped).map(([category, categoryProducts]) => (
        <div
          key={category}
          className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {CATEGORY_LABELS[category] || category}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categoryProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-sm text-text-primary">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-text-secondary mt-0.5">{product.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {product.destination
                        ? DESTINATION_LABELS[product.destination] || product.destination
                        : "Todos"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-sm text-text-primary">
                        {product.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                      </span>
                      <span className="text-xs text-text-secondary ml-1">
                        {PRICE_TYPE_LABELS[product.priceType] || product.priceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          product.isActive
                            ? "bg-sage-light text-sage"
                            : "bg-muted-red-light text-muted-red"
                        )}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="rounded-lg p-1.5 text-text-secondary hover:bg-warm-muted hover:text-coral transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="rounded-lg p-1.5 text-text-secondary hover:bg-red-50 hover:text-danger transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export { CATEGORY_LABELS, PRICE_TYPE_LABELS, DESTINATION_LABELS };
