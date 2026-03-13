export type PermissionKey =
  | "comms:view"
  | "comms:send"
  | "comms:assign"
  | "pipelines:view"
  | "pipelines:edit"
  | "pipelines:create"
  | "pipelines:delete"
  | "analytics:view"
  | "analytics:export"
  | "contacts:view"
  | "contacts:edit"
  | "contacts:create"
  | "contacts:delete"
  | "settings:team"
  | "settings:tenant";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  tenantId: string;
  roleId: string;
  roleName: string;
  permissions: PermissionKey[];
  onboardingComplete: boolean;
}
