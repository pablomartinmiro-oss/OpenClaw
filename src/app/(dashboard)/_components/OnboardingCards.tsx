"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTenantSettings } from "@/hooks/useSettings";
import { useQuotes } from "@/hooks/useQuotes";
import { useProducts } from "@/hooks/useProducts";
import { useReservationStats } from "@/hooks/useReservations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, FileText, CalendarCheck, Check } from "lucide-react";

/**
 * Onboarding cards shown on Dashboard when GHL is connected
 * but the tenant has no products/quotes/reservations yet.
 */
export function OnboardingCards() {
  const { data: session } = useSession();
  const { data: settings } = useTenantSettings();
  const { data: quotes } = useQuotes();
  const { data: products } = useProducts();
  const { data: resStats } = useReservationStats();
  const queryClient = useQueryClient();

  const dismissMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingDismissed: true }),
      });
      if (!res.ok) throw new Error("Failed to dismiss");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant-settings"] }),
  });

  // Don't show for demo accounts
  if (session?.user?.isDemo) return null;

  // Don't show if dismissed
  if (settings?.tenant?.onboardingDismissed) return null;

  // Only show when GHL is connected
  if (!settings?.tenant?.ghlLocationId) return null;

  const hasProducts = (products?.length ?? 0) > 0;
  const hasQuotes = (quotes?.length ?? 0) > 0;
  const hasReservations = (resStats?.today.total ?? 0) > 0 || (resStats?.weekly.totalReservations ?? 0) > 0;

  // If all steps done, don't show
  if (hasProducts && hasQuotes && hasReservations) return null;

  const contactCount = settings?.syncStatus?.contactCount ?? 0;

  const steps = [
    {
      done: hasProducts,
      icon: Package,
      title: "Paso 1: Configura tu catálogo de productos",
      description: "Define tus servicios y precios para poder crear presupuestos.",
      href: "/catalogo",
      linkLabel: "Ir a Catálogo",
    },
    {
      done: hasQuotes,
      icon: FileText,
      title: "Paso 2: Crea tu primer presupuesto",
      description: "Prepara un presupuesto personalizado para tus clientes.",
      href: "/presupuestos",
      linkLabel: "Ir a Presupuestos",
    },
    {
      done: hasReservations,
      icon: CalendarCheck,
      title: "Paso 3: Procesa tu primera reserva",
      description: "Confirma reservas y envía confirmaciones automáticas.",
      href: "/reservas",
      linkLabel: "Ir a Reservas",
    },
  ];

  return (
    <div className="rounded-2xl border border-warm-border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          ¡Bienvenido! Tu cuenta de GHL está conectada con {contactCount.toLocaleString("es-ES")} contactos.
        </h2>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.href}
            className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${
              step.done
                ? "border-sage/30 bg-sage/5"
                : "border-warm-border bg-white"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                step.done ? "bg-sage/20" : "bg-warm-muted"
              }`}
            >
              {step.done ? (
                <Check className="h-5 w-5 text-sage" />
              ) : (
                <step.icon className="h-5 w-5 text-text-secondary" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${step.done ? "text-sage line-through" : "text-text-primary"}`}>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">{step.description}</p>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className="shrink-0 rounded-[8px] bg-coral px-3 py-1.5 text-xs font-medium text-white hover:bg-coral-hover transition-colors"
              >
                {step.linkLabel} →
              </Link>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => dismissMutation.mutate()}
        className="mt-3 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        Ocultar guía
      </button>
    </div>
  );
}
