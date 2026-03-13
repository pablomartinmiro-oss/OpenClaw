"use client";

import { useSession } from "next-auth/react";
import type { PermissionKey } from "@/types/auth";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/auth/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];

  return {
    permissions,
    can: (permission: PermissionKey) => hasPermission(permissions, permission),
    canAny: (perms: PermissionKey[]) => hasAnyPermission(permissions, perms),
    canAll: (perms: PermissionKey[]) => hasAllPermissions(permissions, perms),
    roleName: session?.user?.roleName ?? "",
  };
}
