"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";
import {
  useDailyOrder,
  useCreateDailyOrder,
  useUpdateDailyOrder,
} from "@/hooks/useBookingOps";

interface Props {
  date: string;
}

export default function DailyOrderSection({ date }: Props) {
  const { data, isLoading } = useDailyOrder(date);
  const createOrder = useCreateDailyOrder();
  const updateOrder = useUpdateDailyOrder();

  const order = data?.order ?? null;
  const [notes, setNotes] = useState("");
  const [dirty, setDirty] = useState(false);

  // Sync notes from fetched order
  useEffect(() => {
    setNotes(order?.notes ?? "");
    setDirty(false);
  }, [order?.id, order?.notes]);

  const handleSave = async () => {
    try {
      if (order) {
        await updateOrder.mutateAsync({ id: order.id, notes });
      } else {
        await createOrder.mutateAsync({ date, notes });
      }
      setDirty(false);
      toast.success("Orden del dia guardada");
    } catch {
      toast.error("Error al guardar orden del dia");
    }
  };

  const isSaving = createOrder.isPending || updateOrder.isPending;

  return (
    <div className="rounded-2xl border border-[#E8E4DE] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4DE]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#E87B5A]" />
          <h3 className="text-sm font-semibold text-[#2D2A26]">
            Orden del dia
          </h3>
        </div>
        {order?.generatedAt && (
          <span className="text-xs text-[#8A8580]">
            Guardado:{" "}
            {new Date(order.generatedAt).toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {isLoading ? (
          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
        ) : (
          <>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setDirty(true);
              }}
              placeholder="Escribe las notas operativas del dia..."
              rows={4}
              className="w-full rounded-xl border border-[#E8E4DE] bg-[#FAF9F7] px-4 py-3 text-sm text-[#2D2A26] placeholder:text-[#8A8580] focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A] resize-none transition-colors"
            />
            <div className="flex items-center justify-end mt-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !dirty}
                className="inline-flex items-center gap-2 rounded-xl bg-[#E87B5A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
