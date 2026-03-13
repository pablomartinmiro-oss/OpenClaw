"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  href: string;
}

const STEPS: Step[] = [
  { label: "Connect GHL", href: "/onboarding" },
  { label: "Invite Team", href: "/onboarding/team" },
  { label: "Assign Roles", href: "/onboarding/roles" },
  { label: "Done", href: "/onboarding/done" },
];

interface StepIndicatorProps {
  currentStep: number; // 0-indexed
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-center gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isCompleted &&
                    "bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-2 border-primary bg-white text-primary",
                  !isCompleted &&
                    !isCurrent &&
                    "border border-border bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 sm:w-12",
                  index < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
