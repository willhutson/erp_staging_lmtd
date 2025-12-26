/**
 * Refine Access Control Provider
 *
 * Integrates with our configurable access control system.
 * Falls back to permission level checks when policies aren't loaded.
 */

import { AccessControlProvider } from "@refinedev/core";
import { PermissionLevel } from "@prisma/client";

// Map permission levels to numeric values for comparison
const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  ADMIN: 100,
  LEADERSHIP: 80,
  TEAM_LEAD: 60,
  STAFF: 40,
  FREELANCER: 20,
  CLIENT: 10,
};

export interface UserPermissions {
  permissionLevel: PermissionLevel;
  policies?: Array<{
    name: string;
    rules: Array<{
      resource: string;
      action: string;
      effect: "ALLOW" | "DENY";
    }>;
  }>;
}

/**
 * Create an access control provider for Refine
 */
export function createAccessControlProvider(
  getUserPermissions: () => UserPermissions | null
): AccessControlProvider {
  return {
    can: async ({ resource, action }) => {
      const permissions = getUserPermissions();

      if (!permissions) {
        return { can: false, reason: "Not authenticated" };
      }

      // Check if user has explicit policy rules
      if (permissions.policies && permissions.policies.length > 0) {
        for (const policy of permissions.policies) {
          for (const rule of policy.rules) {
            if (rule.resource === resource && rule.action === action) {
              if (rule.effect === "DENY") {
                return { can: false, reason: `Denied by policy: ${policy.name}` };
              }
              if (rule.effect === "ALLOW") {
                return { can: true };
              }
            }
          }
        }
      }

      // Fall back to permission level checks
      const { permissionLevel } = permissions;
      const userLevel = PERMISSION_HIERARCHY[permissionLevel];

      // Resource-specific default rules based on permission level
      const resourceDefaults: Record<
        string,
        Record<string, PermissionLevel>
      > = {
        users: {
          list: "TEAM_LEAD",
          show: "TEAM_LEAD",
          create: "ADMIN",
          edit: "ADMIN",
          delete: "ADMIN",
        },
        clients: {
          list: "STAFF",
          show: "STAFF",
          create: "LEADERSHIP",
          edit: "LEADERSHIP",
          delete: "ADMIN",
        },
        projects: {
          list: "STAFF",
          show: "STAFF",
          create: "TEAM_LEAD",
          edit: "TEAM_LEAD",
          delete: "LEADERSHIP",
        },
        briefs: {
          list: "STAFF",
          show: "STAFF",
          create: "STAFF",
          edit: "STAFF",
          delete: "TEAM_LEAD",
        },
        "access-policies": {
          list: "LEADERSHIP",
          show: "LEADERSHIP",
          create: "LEADERSHIP", // Creates as draft
          edit: "ADMIN",
          delete: "ADMIN",
        },
        "audit-logs": {
          list: "LEADERSHIP",
          show: "LEADERSHIP",
          create: "ADMIN", // Should never be created manually
          edit: "ADMIN", // Should never be edited
          delete: "ADMIN", // Should never be deleted
        },
      };

      const resourceRules = resourceDefaults[resource];
      if (resourceRules) {
        const requiredLevel = resourceRules[action];
        if (requiredLevel) {
          const required = PERMISSION_HIERARCHY[requiredLevel];
          if (userLevel >= required) {
            return { can: true };
          }
          return {
            can: false,
            reason: `Requires ${requiredLevel} permission or higher`,
          };
        }
      }

      // Default: ADMIN always allowed, others denied for unknown resources
      if (permissionLevel === "ADMIN") {
        return { can: true };
      }

      return {
        can: false,
        reason: "No explicit permission for this action",
      };
    },

    options: {
      // Button visibility based on permissions
      buttons: {
        enableAccessControl: true,
        hideIfUnauthorized: true,
      },
    },
  };
}
