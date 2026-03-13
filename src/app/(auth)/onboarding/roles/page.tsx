"use client";

import { SessionProvider } from "next-auth/react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { AssignRolesStep } from "@/components/onboarding/AssignRolesStep";

function OnboardingStep3Content() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-lg space-y-8 rounded-lg border border-border bg-white p-8 shadow-sm">
        <StepIndicator currentStep={2} />
        <AssignRolesStep />
      </div>
    </div>
  );
}

export default function OnboardingRolesPage() {
  return (
    <SessionProvider>
      <OnboardingStep3Content />
    </SessionProvider>
  );
}
