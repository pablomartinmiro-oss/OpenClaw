"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ModuleState } from "@/lib/modules/types";

function fetchJSON<T>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  });
}

export function useModules() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ modules: ModuleState[] }>({
    queryKey: ["modules"],
    queryFn: () => fetchJSON("/api/settings/modules"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ slug, isEnabled }: { slug: string; isEnabled: boolean }) => {
      const res = await fetch("/api/settings/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, isEnabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle module");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
  });

  const modules = data?.modules || [];

  return {
    modules,
    isLoading,
    error,
    isEnabled: (slug: string) => {
      const mod = modules.find((m) => m.slug === slug);
      return mod ? mod.isEnabled || mod.isCore : false;
    },
    toggleModule: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}
