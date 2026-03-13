"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LinkIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectGHLStepProps {
  isConnected: boolean;
}

export function ConnectGHLStep({ isConnected }: ConnectGHLStepProps) {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  function handleConnect() {
    setConnecting(true);
    window.location.href = "/api/ghl/oauth/authorize";
  }

  if (isConnected) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">GoHighLevel Connected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your GHL sub-account is linked successfully.
          </p>
        </div>
        <Button onClick={() => router.push("/onboarding/team")}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
        <LinkIcon className="h-8 w-8 text-blue-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Connect GoHighLevel</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your GHL sub-account to start syncing contacts, conversations,
          and pipelines.
        </p>
      </div>
      <Button onClick={handleConnect} disabled={connecting} size="lg">
        {connecting ? "Redirecting to GHL..." : "Connect GoHighLevel"}
      </Button>
    </div>
  );
}
