"use client";

import { useState } from "react";
import {
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import type { Quote, QuoteItem } from "@/hooks/useQuotes";
import { useUpdateQuote, useUpdateQuoteItems } from "@/hooks/useQuotes";
import type { Product } from "@/hooks/useProducts";
import { autoGeneratePackage } from "@/lib/quotes/auto-package";
import type { Upsell } from "@/lib/quotes/auto-package";
import { DESTINATION_LABELS } from "./QuoteList";

interface QuoteDetailProps {
  quote: Quote;
  products: Product[];
  onPreviewEmail: (quote: Quote, items: EditableItem[]) => void;
}

interface EditableItem {
  id?: string;
  productId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitialState(quote: Quote, products: Product[]) {
  if (quote.items && quote.items.length > 0) {
    return {
      items: quote.items.map((item: QuoteItem) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
      })),
      upsells: [] as Upsell[],
    };
  }
  const result = autoGeneratePackage(
    {
      destination: quote.destination,
      checkIn: quote.checkIn,
      checkOut: quote.checkOut,
      adults: quote.adults,
      children: quote.children,
      wantsAccommodation: quote.wantsAccommodation,
      wantsForfait: quote.wantsForfait,
      wantsClases: quote.wantsClases,
      wantsEquipment: quote.wantsEquipment,
    },
    products
  );
  return { items: result.items, upsells: result.upsells };
}

export function QuoteDetail({ quote, products, onPreviewEmail }: QuoteDetailProps) {
  const initial = getInitialState(quote, products);
  const [items, setItems] = useState<EditableItem[]>(initial.items);
  const [upsells, setUpsells] = useState<Upsell[]>(initial.upsells);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const updateQuote = useUpdateQuote();
  const updateItems = useUpdateQuoteItems();

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(quote.checkOut).getTime() - new Date(quote.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const handleAutoGenerate = () => {
    const result = autoGeneratePackage(
      {
        destination: quote.destination,
        checkIn: quote.checkIn,
        checkOut: quote.checkOut,
        adults: quote.adults,
        children: quote.children,
        wantsAccommodation: quote.wantsAccommodation,
        wantsForfait: quote.wantsForfait,
        wantsClases: quote.wantsClases,
        wantsEquipment: quote.wantsEquipment,
      },
      products
    );
    setItems(result.items);
    setUpsells(result.upsells);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const updateItem = (index: number, field: keyof EditableItem, value: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === "quantity") item.quantity = value;
      if (field === "unitPrice") item.unitPrice = value;
      if (field === "discount") item.discount = value;
      item.totalPrice = item.unitPrice * item.quantity * (1 - item.discount / 100);
      updated[index] = item;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addUpsell = (upsell: Upsell) => {
    const totalPax = quote.adults + quote.children;
    const newItem: EditableItem = {
      productId: upsell.product.id,
      name: upsell.product.name,
      description: upsell.product.description,
      quantity: totalPax,
      unitPrice: upsell.product.price,
      discount: 0,
      totalPrice: upsell.product.price * totalPax,
    };
    setItems((prev) => [...prev, newItem]);
    setUpsells((prev) => prev.filter((u) => u.product.id !== upsell.product.id));
  };

  const addProduct = (product: Product) => {
    const newItem: EditableItem = {
      productId: product.id,
      name: product.name,
      description: product.description,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      totalPrice: product.price,
    };
    setItems((prev) => [...prev, newItem]);
    setShowAddProduct(false);
  };

  const handleSaveDraft = async () => {
    try {
      await updateItems.mutateAsync({
        quoteId: quote.id,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
      });
      if (quote.status === "nuevo") {
        await updateQuote.mutateAsync({ id: quote.id, status: "en_proceso" });
      }
      toast.success("Borrador guardado");
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleSendQuote = async () => {
    try {
      await updateItems.mutateAsync({
        quoteId: quote.id,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
        })),
      });
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 5);
      await updateQuote.mutateAsync({
        id: quote.id,
        status: "enviado",
        totalAmount,
        sentAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      });
      toast.success("Presupuesto enviado");
    } catch {
      toast.error("Error al enviar");
    }
  };

  const availableProducts = products.filter(
    (p) => p.isActive && !items.some((item) => item.productId === p.id)
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Client info */}
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{quote.clientName}</h2>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-secondary">
              {quote.clientPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {quote.clientPhone}
                </span>
              )}
              {quote.clientEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {quote.clientEmail}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-2 rounded-lg border border-coral bg-coral-light px-3 py-2 text-sm font-medium text-coral hover:bg-coral-light transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Auto-generar
          </button>
        </div>

        {quote.clientNotes && (
          <p className="mt-3 text-sm text-text-secondary italic">
            &ldquo;{quote.clientNotes}&rdquo;
          </p>
        )}
      </div>

      {/* Request summary */}
      <div className="border-b border-border bg-surface/50 px-6 py-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Resumen de solicitud</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-coral" />
            <span>{DESTINATION_LABELS[quote.destination] || quote.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-coral" />
            <span>{formatDate(quote.checkIn)} — {formatDate(quote.checkOut)} ({nights} noches)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-coral" />
            <span>{quote.adults} adultos{quote.children > 0 ? `, ${quote.children} niños` : ""}</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {quote.wantsAccommodation && <ServiceBadge label="Alojamiento" />}
          {quote.wantsForfait && <ServiceBadge label="Forfait" />}
          {quote.wantsClases && <ServiceBadge label="Clases" />}
          {quote.wantsEquipment && <ServiceBadge label="Alquiler" />}
        </div>
      </div>

      {/* Package builder table */}
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Paquete</h3>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir producto
          </button>
        </div>

        {/* Add product dropdown */}
        {showAddProduct && (
          <div className="mb-4 rounded-lg border border-border bg-white shadow-lg max-h-48 overflow-y-auto">
            {availableProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addProduct(product)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-surface transition-colors"
              >
                <span className="text-text-primary">{product.name}</span>
                <span className="text-text-secondary">
                  {product.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface/50 border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">Producto</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-text-secondary w-20">Cant.</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-text-secondary w-24">P. Unit.</th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-text-secondary w-20">Dto. %</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-text-secondary w-24">Total</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-surface/30">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-text-primary">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-text-secondary">{item.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full rounded border border-border px-2 py-1 text-center text-sm focus:border-coral focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-border px-2 py-1 text-right text-sm focus:border-coral focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={(e) => updateItem(index, "discount", parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-border px-2 py-1 text-center text-sm focus:border-coral focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                    {item.totalPrice.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeItem(index)}
                      className="rounded p-1 text-text-secondary hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total */}
          <div className="border-t border-border bg-surface/50 px-4 py-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-text-primary">TOTAL</span>
            <span className="text-lg font-bold text-coral">
              {totalAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </span>
          </div>
        </div>

        {/* Upsell suggestions */}
        {upsells.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              Sugerencias
            </h4>
            <div className="flex flex-wrap gap-2">
              {upsells.map((upsell) => (
                <button
                  key={upsell.product.id}
                  onClick={() => addUpsell(upsell)}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm hover:border-coral hover:bg-coral-light/30 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 text-coral" />
                  <span className="text-text-primary">{upsell.product.name}</span>
                  <span className="text-text-secondary">
                    {upsell.product.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="border-t border-border bg-white px-6 py-4 flex items-center justify-end gap-3">
        <button
          onClick={handleSaveDraft}
          disabled={updateItems.isPending}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          Guardar Borrador
        </button>
        <button
          onClick={() => onPreviewEmail(quote, items)}
          className="flex items-center gap-2 rounded-lg border border-coral px-4 py-2.5 text-sm font-medium text-coral hover:bg-coral-light transition-colors"
        >
          <Eye className="h-4 w-4" />
          Vista Previa Email
        </button>
        <button
          onClick={handleSendQuote}
          disabled={updateQuote.isPending || items.length === 0}
          className="flex items-center gap-2 rounded-lg bg-coral px-4 py-2.5 text-sm font-medium text-white hover:bg-coral-hover transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Enviar Presupuesto
        </button>
      </div>
    </div>
  );
}

function ServiceBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-coral-light px-2.5 py-0.5 text-xs font-medium text-coral">
      {label}
    </span>
  );
}
