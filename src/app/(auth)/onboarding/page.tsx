"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { ConnectGHLStep } from "@/components/onboarding/ConnectGHLStep";

function OnboardingStep1Content() {
  const searchParams = useSearchParams();
  // After GHL OAuth callback, redirect includes ?ghl_connected=true
  const isConnected = searchParams.get("ghl_connected") === "true";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-warm-border bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <StepIndicator currentStep={0} />
        <ConnectGHLStep isConnected={isConnected} />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <Suspense>
        <OnboardingStep1Content />
      </Suspense>
    </SessionProvider>
  );
}
