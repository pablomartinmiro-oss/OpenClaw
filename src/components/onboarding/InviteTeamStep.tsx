"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Invite {
  email: string;
  name: string;
}

export function InviteTeamStep() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", name: "" }]);
  const [submitting, setSubmitting] = useState(false);

  function addRow() {
    setInvites((prev) => [...prev, { email: "", name: "" }]);
  }

  function removeRow(index: number) {
    setInvites((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof Invite, value: string) {
    setInvites((prev) =>
      prev.map((inv, i) => (i === index ? { ...inv, [field]: value } : inv))
    );
  }

  async function handleSubmit() {
    const validInvites = invites.filter((inv) => inv.email.trim());
    if (validInvites.length === 0) {
      // Skip is fine — user can invite later
      router.push("/onboarding/roles");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invites: validInvites }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to invite team members");
      }

      toast.success(`Invited ${validInvites.length} team member(s)`);
      router.push("/onboarding/roles");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">Invite Your Team</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add team members who will use the dashboard. You can skip this and
          invite later.
        </p>
      </div>

      <div className="space-y-3">
        {invites.map((invite, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Name"
              value={invite.name}
              onChange={(e) => updateRow(index, "name", e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="email@company.com"
              type="email"
              value={invite.email}
              onChange={(e) => updateRow(index, "email", e.target.value)}
              className="flex-1"
            />
            {invites.length > 1 && (
              <button
                onClick={() => removeRow(index)}
                className="rounded p-1 text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addRow} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Add another
      </Button>

      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/roles")}
          className="flex-1"
        >
          Skip for now
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
          {submitting ? "Inviting..." : "Invite & Continue"}
        </Button>
      </div>
    </div>
  );
}
