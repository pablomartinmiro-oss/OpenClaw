export interface NavItemDef {
  label: string;
  href: string;
  icon: string; // Lucide icon name
  permission: string | null;
  roles?: string[];
  badge?: string; // hook key for badge count
}

export interface ModuleDefinition {
  slug: string;
  name: string;
  icon: string;
  description: string;
  dependencies: string[];
  isCore: boolean;
  section: "principal" | "ventas" | "operaciones" | "gestion" | "online";
  navItems: NavItemDef[];
  permissions: string[];
}

export interface ModuleState {
  slug: string;
  name: string;
  isEnabled: boolean;
  isCore: boolean;
  config: Record<string, unknown>;
}
