"use client";

import { SessionProvider } from "next-auth/react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { InviteTeamStep } from "@/components/onboarding/InviteTeamStep";

function OnboardingStep2Content() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-warm-border bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <StepIndicator currentStep={1} />
        <InviteTeamStep />
      </div>
    </div>
  );
}

export default function OnboardingTeamPage() {
  return (
    <SessionProvider>
      <OnboardingStep2Content />
    </SessionProvider>
  );
}
