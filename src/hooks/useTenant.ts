"use client";

import { useSession } from "next-auth/react";

export function useTenant() {
  const { data: session } = useSession();

  return {
    tenantId: session?.user?.tenantId ?? "",
    isLoaded: !!session?.user?.tenantId,
  };
}
