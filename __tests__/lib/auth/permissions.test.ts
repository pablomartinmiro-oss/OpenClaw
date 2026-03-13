import { describe, it, expect } from "vitest";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  DEFAULT_ROLES,
  ALL_PERMISSIONS,
} from "@/lib/auth/permissions";
import type { PermissionKey } from "@/types/auth";

describe("permissions", () => {
  describe("hasPermission", () => {
    it("returns true when user has the permission", () => {
      const perms: PermissionKey[] = ["comms:view", "comms:send"];
      expect(hasPermission(perms, "comms:view")).toBe(true);
    });

    it("returns false when user lacks the permission", () => {
      const perms: PermissionKey[] = ["comms:view"];
      expect(hasPermission(perms, "comms:send")).toBe(false);
    });

    it("returns false for empty permissions", () => {
      expect(hasPermission([], "comms:view")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns true when user has at least one of the required", () => {
      const perms: PermissionKey[] = ["comms:view"];
      expect(hasAnyPermission(perms, ["comms:view", "comms:send"])).toBe(true);
    });

    it("returns false when user has none of the required", () => {
      const perms: PermissionKey[] = ["analytics:view"];
      expect(hasAnyPermission(perms, ["comms:view", "comms:send"])).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("returns true when user has all required", () => {
      const perms: PermissionKey[] = ["comms:view", "comms:send", "comms:assign"];
      expect(hasAllPermissions(perms, ["comms:view", "comms:send"])).toBe(true);
    });

    it("returns false when user is missing one", () => {
      const perms: PermissionKey[] = ["comms:view"];
      expect(hasAllPermissions(perms, ["comms:view", "comms:send"])).toBe(false);
    });
  });

  describe("DEFAULT_ROLES", () => {
    it("Owner / Manager has all permissions", () => {
      expect(DEFAULT_ROLES["Owner / Manager"]).toEqual(ALL_PERMISSIONS);
      expect(DEFAULT_ROLES["Owner / Manager"].length).toBe(15);
    });

    it("Sales Rep has comms and pipeline permissions but not analytics", () => {
      const sales = DEFAULT_ROLES["Sales Rep"];
      expect(sales).toContain("comms:view");
      expect(sales).toContain("comms:send");
      expect(sales).toContain("pipelines:view");
      expect(sales).toContain("pipelines:edit");
      expect(sales).not.toContain("analytics:view");
      expect(sales).not.toContain("settings:team");
    });

    it("Marketing has analytics but not comms:send", () => {
      const marketing = DEFAULT_ROLES["Marketing"];
      expect(marketing).toContain("analytics:view");
      expect(marketing).toContain("analytics:export");
      expect(marketing).toContain("contacts:view");
      expect(marketing).not.toContain("comms:send");
    });

    it("VA / Admin has contacts and comms but not pipelines", () => {
      const va = DEFAULT_ROLES["VA / Admin"];
      expect(va).toContain("contacts:view");
      expect(va).toContain("contacts:edit");
      expect(va).toContain("comms:view");
      expect(va).not.toContain("pipelines:view");
    });
  });
});
