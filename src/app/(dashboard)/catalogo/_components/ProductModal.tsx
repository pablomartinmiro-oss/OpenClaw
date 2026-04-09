"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { CATEGORY_LABELS, PRICE_TYPE_LABELS, STATION_LABELS } from "./ProductTable";

const PLANNING_CATEGORIES = ["escuela", "clase_particular", "snowcamp"];

function getInitialForm(product: Product | null) {
  if (product) {
    return {
      category: product.category,
      name: product.name,
      description: product.description || "",
      station: product.station || "all",
      personType: product.personType || "",
      tier: product.tier || "",
      includesHelmet: product.includesHelmet,
      price: product.price.toString(),
      priceType: product.priceType,
      isActive: product.isActive,
      discipline: (product as unknown as Record<string, unknown>).discipline as string || "",
      minAge: ((product as unknown as Record<string, unknown>).minAge as number)?.toString() || "",
      maxAge: ((product as unknown as Record<string, unknown>).maxAge as number)?.toString() || "",
      maxParticipants: ((product as unknown as Record<string, unknown>).maxParticipants as number)?.toString() || "10",
      requiresGrouping: ((product as unknown as Record<string, unknown>).requiresGrouping as boolean) || false,
      planningMode: (product as unknown as Record<string, unknown>).planningMode as string || "",
    };
  }
  return {
    category: "alquiler",
    name: "",
    description: "",
    station: "all",
    personType: "",
    tier: "",
    includesHelmet: false,
    price: "",
    priceType: "per_day",
    isActive: true,
    discipline: "",
    minAge: "",
    maxAge: "",
    maxParticipants: "10",
    requiresGrouping: false,
    planningMode: "",
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
    const data: Record<string, unknown> = {
      ...(product && { id: product.id }),
      category: form.category,
      name: form.name,
      description: form.description || null,
      station: form.station || "all",
      personType: form.personType || null,
      tier: form.tier || null,
      includesHelmet: form.includesHelmet,
      price: parseFloat(form.price) || 0,
      priceType: form.priceType,
      isActive: form.isActive,
    };
    if (PLANNING_CATEGORIES.includes(form.category)) {
      data.discipline = form.discipline || null;
      data.minAge = form.minAge ? parseInt(form.minAge) : null;
      data.maxAge = form.maxAge ? parseInt(form.maxAge) : null;
      data.maxParticipants = form.maxParticipants ? parseInt(form.maxParticipants) : null;
      data.requiresGrouping = form.requiresGrouping;
      data.planningMode = form.planningMode || null;
    }
    onSave(data as Partial<Product>);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-surface transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Estación</label>
              <select
                value={form.station}
                onChange={(e) => setForm({ ...form, station: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(STATION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Descripción</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Tipo persona</label>
              <select
                value={form.personType}
                onChange={(e) => setForm({ ...form, personType: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Sin especificar</option>
                <option value="adulto">Adulto</option>
                <option value="infantil">Infantil</option>
                <option value="baby">Baby</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Calidad</label>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Sin especificar</option>
                <option value="media">Media calidad</option>
                <option value="alta">Alta calidad</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  checked={form.includesHelmet}
                  onChange={(e) => setForm({ ...form, includesHelmet: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                />
                Incluye casco
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Precio base (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Tipo de Precio</label>
              <select
                value={form.priceType}
                onChange={(e) => setForm({ ...form, priceType: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.entries(PRICE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Planning fields — only for school products */}
          {PLANNING_CATEGORIES.includes(form.category) && (
            <div className="rounded-xl border border-[#E87B5A]/20 bg-[#E87B5A]/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-[#E87B5A] uppercase tracking-wide">Configuracion de Planning</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Disciplina</label>
                  <select value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">Sin especificar</option>
                    <option value="esqui">Esqui alpino</option>
                    <option value="snow">Snowboard</option>
                    <option value="telemark">Telemark</option>
                    <option value="freestyle">Freestyle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Modo Planning</label>
                  <select value={form.planningMode} onChange={(e) => setForm({ ...form, planningMode: e.target.value })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                    <option value="">Sin especificar</option>
                    <option value="dynamic_grouping">Agrupacion dinamica (cursillos)</option>
                    <option value="fixed_slot">Slot fijo (particulares)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Edad min</label>
                  <input type="number" min="0" value={form.minAge} onChange={(e) => setForm({ ...form, minAge: e.target.value })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="3" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Edad max</label>
                  <input type="number" min="0" value={form.maxAge} onChange={(e) => setForm({ ...form, maxAge: e.target.value })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="99" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Max participantes</label>
                  <input type="number" min="1" max="15" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="10" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input type="checkbox" checked={form.requiresGrouping} onChange={(e) => setForm({ ...form, requiresGrouping: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-[#E87B5A] focus:ring-[#E87B5A]" />
                Requiere agrupacion automatica
              </label>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-900">Producto activo</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-500 hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-blue-600-hover transition-colors"
            >
              {product ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
