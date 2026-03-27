"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import type { Upsell } from "@/lib/quotes/auto-package";
import { ProductVariableForm, type ProductVariables } from "./ProductVariableForm";
import { ProductSearchPicker } from "./ProductSearchPicker";

export interface EditableItem {
  id?: string;
  productId: string | null;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  // Per-product variables
  startDate: string | null;
  endDate: string | null;
  numDays: number | null;
  numPersons: number | null;
  ageDetails: Array<{ age: number; type: string }> | null;
  modalidad: string | null;
  nivel: string | null;
  sector: string | null;
  idioma: string | null;
  horario: string | null;
  puntoEncuentro: string | null;
  tipoCliente: string | null;
  gama: string | null;
  casco: boolean | null;
  tipoActividad: string | null;
  regimen: string | null;
  alojamientoNombre: string | null;
  seguroIncluido: boolean | null;
  notes: string | null;
}

interface PackageTableProps {
  items: EditableItem[];
  upsells: Upsell[];
  products: Product[];
  showAddProduct: boolean;
  onToggleAddProduct: () => void;
  onUpdateItem: (index: number, field: keyof EditableItem, value: number) => void;
  onUpdateItemVars: (index: number, vars: Partial<ProductVariables>) => void;
  onRemoveItem: (index: number) => void;
  onAddProduct: (product: Product) => void;
  onAddUpsell: (upsell: Upsell) => void;
}

export function PackageTable({
  items, upsells, products, showAddProduct,
  onToggleAddProduct, onUpdateItem, onUpdateItemVars, onRemoveItem, onAddProduct, onAddUpsell,
}: PackageTableProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const excludeIds = new Set(items.map((i) => i.productId).filter(Boolean) as string[]);

  return (
    <div className="flex-1 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Paquete</h3>
        <button onClick={onToggleAddProduct} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-surface transition-colors">
          <Plus className="h-3.5 w-3.5" /> Añadir producto
        </button>
      </div>

      {showAddProduct && (
        <ProductSearchPicker
          products={products}
          excludeIds={excludeIds}
          onSelect={onAddProduct}
          onClose={onToggleAddProduct}
        />
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface/50 border-b border-border">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">Producto</th>
              <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500 w-20">Cant.</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 w-24">P. Unit.</th>
              <th className="px-4 py-2.5 text-center text-xs font-medium text-slate-500 w-20">Dto. %</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-slate-500 w-24">Total</th>
              <th className="px-4 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-surface/30">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-900">{item.name}</div>
                  {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                  <ProductVariableForm
                    category={item.category}
                    variables={item}
                    onChange={(vars) => onUpdateItemVars(index, vars)}
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <input type="number" min="1" value={item.quantity} onChange={(e) => onUpdateItem(index, "quantity", parseInt(e.target.value) || 1)} className="w-full rounded border border-border px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none" />
                </td>
                <td className="px-4 py-3 align-top">
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => onUpdateItem(index, "unitPrice", parseFloat(e.target.value) || 0)} className="w-full rounded border border-border px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none" />
                </td>
                <td className="px-4 py-3 align-top">
                  <input type="number" min="0" max="100" value={item.discount} onChange={(e) => onUpdateItem(index, "discount", parseFloat(e.target.value) || 0)} className="w-full rounded border border-border px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none" />
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 align-top">
                  {item.totalPrice.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </td>
                <td className="px-4 py-3 align-top">
                  <button onClick={() => onRemoveItem(index)} className="rounded p-1 text-slate-500 hover:text-danger transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-border bg-surface/50 px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-900">TOTAL</span>
          <span className="text-lg font-bold text-coral">
            {totalAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
          </span>
        </div>
      </div>

      {upsells.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Sugerencias</h4>
          <div className="flex flex-wrap gap-2">
            {upsells.map((upsell) => (
              <button key={upsell.product.id} onClick={() => onAddUpsell(upsell)} className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm hover:border-blue-500 hover:bg-blue-50/30 transition-colors">
                <Plus className="h-3.5 w-3.5 text-coral" />
                <span className="text-slate-900">{upsell.product.name}</span>
                <span className="text-slate-500">{upsell.product.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
