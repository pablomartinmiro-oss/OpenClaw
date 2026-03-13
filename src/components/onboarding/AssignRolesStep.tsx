"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  roleName: string;
}

const ROLE_OPTIONS = [
  "Owner / Manager",
  "Sales Rep",
  "Marketing",
  "VA / Admin",
];

export function AssignRolesStep() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch("/api/onboarding/team");
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members);
          // Pre-fill current roles
          const initial: Record<string, string> = {};
          for (const m of data.members) {
            initial[m.id] = m.roleName;
          }
          setAssignments(initial);
        }
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to assign roles");
      }

      router.push("/onboarding/done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign roles");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Loading team members...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">No Team Members Yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You haven&apos;t invited any team members. You can manage roles
            later in Settings.
          </p>
        </div>
        <Button onClick={() => router.push("/onboarding/done")}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold">Assign Roles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set permissions for each team member.
        </p>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-md border border-border p-3"
          >
            <div>
              <p className="text-sm font-medium">
                {member.name ?? member.email}
              </p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
            <Select
              value={assignments[member.id] ?? "Sales Rep"}
              onValueChange={(val) => {
                if (val !== null) {
                  setAssignments((prev) => ({ ...prev, [member.id]: val }));
                }
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} disabled={submitting} className="w-full">
        {submitting ? "Saving..." : "Save & Continue"}
      </Button>
    </div>
  );
}
