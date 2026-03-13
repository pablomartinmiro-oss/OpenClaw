"use client";

import { useState } from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GHLStatusBanner() {
  const [dismissed, setDismissed] = useState(false);
  // In future, this will be driven by a hook that checks GHL connection status.
  // For now, always hidden unless explicitly shown via props/state.
  const ghlError: string | null = null;

  if (!ghlError || dismissed) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 border-b border-orange-200 bg-orange-50 px-6 py-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 text-orange-600" />
      <p className="flex-1 text-sm text-orange-800">{ghlError}</p>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-100"
        onClick={() => {
          window.location.href = "/api/ghl/oauth/authorize";
        }}
      >
        <RefreshCw className="h-3 w-3" />
        Reconnect
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="rounded p-0.5 text-orange-400 hover:text-orange-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
