"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { toast } from "sonner";

function OnboardingDoneContent() {
  const [completing, setCompleting] = useState(false);

  async function handleComplete() {
    setCompleting(true);
    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to complete onboarding");
      }
      // Force a full reload to refresh the JWT with onboardingComplete=true
      window.location.href = "/";
    } catch {
      toast.error("Failed to complete setup. Please try again.");
      setCompleting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-warm-border bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <StepIndicator currentStep={3} />

        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">You&apos;re All Set!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your dashboard is ready. You can manage team members, roles, and
              integrations from Settings at any time.
            </p>
          </div>
          <Button
            onClick={handleComplete}
            disabled={completing}
            size="lg"
          >
            {completing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Go to Dashboard"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingDonePage() {
  return (
    <SessionProvider>
      <OnboardingDoneContent />
    </SessionProvider>
  );
}
