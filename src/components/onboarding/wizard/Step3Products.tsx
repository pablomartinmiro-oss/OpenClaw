"use client";

import { Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SampleProduct } from "./types";

interface Step3Props {
  products: SampleProduct[];
  onChange: (next: SampleProduct[]) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  loading: boolean;
  error: string | null;
}

export function Step3Products({
  products,
  onChange,
  onBack,
  onNext,
  onSkip,
  loading,
  error,
}: Step3Props) {
  function update(idx: number, patch: Partial<SampleProduct>) {
    onChange(products.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function remove(idx: number) {
    onChange(products.filter((_, i) => i !== idx));
  }

  function add() {
    onChange([...products, { name: "", category: "general", price: 0 }]);
  }

  const valid = products.every((p) => p.name.trim().length > 0 && p.price >= 0);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-coral" />
          <h2 className="text-xl font-semibold text-slate-900">Tu primer producto</h2>
        </div>
        <p className="text-sm text-slate-500">
          Hemos preparado plantillas segun tu tipo de negocio. Edita, elimina o anade los que
          necesites — siempre podras hacerlo desde Catalogo.
        </p>
      </header>

      <div className="space-y-2">
        {products.length === 0 && (
          <div className="rounded-xl border border-dashed border-warm-border p-6 text-center">
            <p className="text-sm text-slate-500">
              No hay productos preparados. Puedes anadir uno o saltar este paso.
            </p>
          </div>
        )}
        {products.map((p, idx) => (
          <div
            key={idx}
            className="grid gap-2 rounded-xl border border-warm-border bg-white p-3 sm:grid-cols-[1fr_140px_120px_auto]"
          >
            <Input
              value={p.name}
              onChange={(e) => update(idx, { name: e.target.value })}
              placeholder="Nombre del producto"
            />
            <Input
              value={p.category}
              onChange={(e) => update(idx, { category: e.target.value })}
              placeholder="Categoria"
            />
            <div className="relative">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={p.price}
                onChange={(e) => update(idx, { price: Number(e.target.value) })}
                placeholder="0"
                className="pr-8"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                EUR
              </span>
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Eliminar producto"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-warm-border px-3 py-2 text-sm font-medium text-slate-500 hover:bg-surface transition-colors"
        >
          <Plus className="h-4 w-4" />
          Anadir producto
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          Atras
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSkip} disabled={loading}>
            Saltar
          </Button>
          <Button onClick={onNext} disabled={!valid || loading}>
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
