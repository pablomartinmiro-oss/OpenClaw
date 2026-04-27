"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "./types";

interface StepperProps {
  current: number; // 1-indexed
}

export function Stepper({ current }: StepperProps) {
  return (
    <nav aria-label="Progreso del onboarding" className="flex items-center justify-center gap-1.5 sm:gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = step.id < current;
        const isCurrent = step.id === current;
        return (
          <div key={step.id} className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isCompleted && "bg-coral text-white",
                  isCurrent && "border-2 border-coral bg-white text-coral",
                  !isCompleted && !isCurrent && "border border-warm-border bg-surface text-slate-500"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  isCurrent ? "text-slate-900" : "text-slate-500"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  step.id < current ? "bg-coral" : "bg-warm-border"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
