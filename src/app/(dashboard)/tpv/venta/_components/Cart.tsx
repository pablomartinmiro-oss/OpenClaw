"use client";

import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

const fmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export interface CartItem {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export default function Cart({
  items,
  onUpdateQty,
  onRemove,
  onClear,
}: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8E4DE] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#2D2A26]">
          Carrito ({items.length})
        </h2>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-[#C75D4A] hover:underline"
          >
            Vaciar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-[#8A8580]" />
              <p className="text-sm text-[#8A8580]">Anade productos</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E4DE]">
            {items.map((item) => {
              const lineTotal = item.unitPrice * item.quantity;
              return (
                <li key={item.productId} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2D2A26]">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs text-[#8A8580]">
                        {fmt.format(item.unitPrice)} x ud
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.productId)}
                      className="rounded-[6px] p-1 text-[#8A8580] hover:bg-red-50 hover:text-[#C75D4A]"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-[10px] border border-[#E8E4DE] bg-[#FAF9F7]">
                      <button
                        onClick={() =>
                          onUpdateQty(item.productId, item.quantity - 1)
                        }
                        className="px-2 py-1 text-[#8A8580] hover:text-[#E87B5A]"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!Number.isNaN(val))
                            onUpdateQty(item.productId, val);
                        }}
                        className="w-10 bg-transparent text-center text-sm font-medium text-[#2D2A26] focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          onUpdateQty(item.productId, item.quantity + 1)
                        }
                        className="px-2 py-1 text-[#8A8580] hover:text-[#E87B5A]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-[#2D2A26]">
                      {fmt.format(lineTotal)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
