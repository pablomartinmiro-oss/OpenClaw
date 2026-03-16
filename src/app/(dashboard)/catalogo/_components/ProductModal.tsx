"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { CATEGORY_LABELS, PRICE_TYPE_LABELS, DESTINATION_LABELS } from "./ProductTable";

function getInitialForm(product: Product | null) {
  if (product) {
    return {
      category: product.category,
      name: product.name,
      description: product.description || "",
      destination: product.destination || "",
      price: product.price.toString(),
      priceType: product.priceType,
      isActive: product.isActive,
    };
  }
  return {
    category: "alojamiento",
    name: "",
    description: "",
    destination: "",
    price: "",
    priceType: "per_night",
    isActive: true,
  };
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}

export function ProductModal({ product, isOpen, onClose, onSave }: ProductModalProps) {
  const [form, setForm] = useState(getInitialForm(product));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(product && { id: product.id }),
      category: form.category,
      name: form.name,
      description: form.description || null,
      destination: form.destination || null,
      price: parseFloat(form.price),
      priceType: form.priceType,
      isActive: form.isActive,
    } as Partial<Product>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-[14px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Destino
              </label>
              <select
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
              >
                <option value="">Todos los destinos</option>
                {Object.entries(DESTINATION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Precio (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Tipo de Precio
              </label>
              <select
                value={form.priceType}
                onChange={(e) => setForm({ ...form, priceType: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
              >
                {Object.entries(PRICE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-cyan focus:ring-cyan"
            />
            <label htmlFor="isActive" className="text-sm text-text-primary">
              Producto activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-white hover:bg-cyan/90 transition-colors"
            >
              {product ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
