"use client";

import { useEffect, useMemo, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Stepper } from "@/components/onboarding/wizard/Stepper";
import { Step1Business } from "@/components/onboarding/wizard/Step1Business";
import { Step2Modules } from "@/components/onboarding/wizard/Step2Modules";
import { Step3Products } from "@/components/onboarding/wizard/Step3Products";
import { Step4Storefront } from "@/components/onboarding/wizard/Step4Storefront";
import { Step5Done } from "@/components/onboarding/wizard/Step5Done";
import {
  BusinessType,
  MODULE_PRESETS,
  PRODUCT_TEMPLATES,
  STEPS,
  WizardData,
} from "@/components/onboarding/wizard/types";

interface TenantInfo {
  tenant: { id: string; name: string; slug: string; isDemo: boolean };
}

function useTenantSlug() {
  return useQuery<TenantInfo>({
    queryKey: ["tenant-settings"],
    queryFn: async () => {
      const r = await fetch("/api/settings/tenant");
      if (!r.ok) throw new Error("Failed to load tenant");
      return r.json();
    },
  });
}

function WizardShell() {
  const { data: session } = useSession();
  const { data: tenantInfo } = useTenantSlug();
  const tenant = tenantInfo?.tenant;

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const initialBusiness: BusinessType = "ski_school";
  const [data, setData] = useState<WizardData>({
    business: {
      businessType: initialBusiness,
      city: "",
      phone: "",
      website: "",
      logoUrl: "",
    },
    enabledModules: MODULE_PRESETS[initialBusiness],
    products: PRODUCT_TEMPLATES[initialBusiness],
    storefront: {
      siteTitle: "",
      description: "",
      primaryColor: "#42A5F5",
    },
  });

  // When tenant info loads, default storefront title to tenant name (if not yet set)
  useEffect(() => {
    if (tenant?.name && !data.storefront.siteTitle) {
      setData((d) => ({ ...d, storefront: { ...d.storefront, siteTitle: tenant.name } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.name]);

  // When business type changes, refresh module + product presets if user hasn't customized
  function changeBusiness(next: WizardData["business"]) {
    const typeChanged = next.businessType !== data.business.businessType;
    setData((d) => ({
      ...d,
      business: next,
      enabledModules: typeChanged ? MODULE_PRESETS[next.businessType] : d.enabledModules,
      products: typeChanged ? PRODUCT_TEMPLATES[next.businessType] : d.products,
    }));
  }

  async function postJSON<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || "Error de servidor");
    }
    return json as T;
  }

  async function go(next: number) {
    setError(null);
    setLoading(true);
    try {
      if (step === 1) {
        await postJSON("/api/onboarding/business", data.business);
      } else if (step === 2) {
        await postJSON("/api/onboarding/modules", { enabled: data.enabledModules });
      } else if (step === 3) {
        if (data.products.length > 0) {
          await postJSON("/api/onboarding/sample-products", { products: data.products });
        }
      } else if (step === 4) {
        await postJSON("/api/onboarding/storefront", data.storefront);
      }
      setStep(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
    setError(null);
    setLoading(true);
    try {
      await postJSON("/api/onboarding/complete", {});
      // Force a full reload so the JWT picks up onboardingComplete=true from the DB
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al finalizar");
      setLoading(false);
    }
  }

  function skipProducts() {
    setError(null);
    setData((d) => ({ ...d, products: [] }));
    setStep(4);
  }

  const stepContent = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <Step1Business
            data={data.business}
            onChange={changeBusiness}
            onNext={() => go(2)}
            loading={loading}
            error={error}
          />
        );
      case 2:
        return (
          <Step2Modules
            enabled={data.enabledModules}
            onChange={(enabled) => setData((d) => ({ ...d, enabledModules: enabled }))}
            onBack={() => setStep(1)}
            onNext={() => go(3)}
            loading={loading}
            error={error}
          />
        );
      case 3:
        return (
          <Step3Products
            products={data.products}
            onChange={(products) => setData((d) => ({ ...d, products }))}
            onBack={() => setStep(2)}
            onNext={() => go(4)}
            onSkip={skipProducts}
            loading={loading}
            error={error}
          />
        );
      case 4:
        return (
          <Step4Storefront
            data={data.storefront}
            tenantSlug={tenant?.slug ?? null}
            onChange={(storefront) => setData((d) => ({ ...d, storefront }))}
            onBack={() => setStep(3)}
            onNext={() => go(5)}
            loading={loading}
            error={error}
          />
        );
      case 5:
        return (
          <Step5Done
            data={data}
            tenantSlug={tenant?.slug ?? null}
            onFinish={finish}
            loading={loading}
            error={error}
          />
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, data, loading, error, tenant?.slug]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl border border-warm-border bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Paso {step} de {STEPS.length}
            </span>
            <span>
              Hola{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""} 👋
            </span>
          </div>
          <Stepper current={step} />
        </div>
        {stepContent}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30 * 1000, retry: 1 } } })
  );
  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        <WizardShell />
      </QueryClientProvider>
    </SessionProvider>
  );
}
