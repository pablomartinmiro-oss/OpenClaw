"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionKey } from "@/types/auth";

interface RoleGateProps {
  permission: PermissionKey;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGate({
  permission,
  fallback = null,
  children,
}: RoleGateProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
