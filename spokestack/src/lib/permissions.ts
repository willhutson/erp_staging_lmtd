import type { SessionUser } from "@/types";

// Define PermissionLevel locally to avoid Prisma client dependency
type PermissionLevel = "ADMIN" | "LEADERSHIP" | "TEAM_LEAD" | "STAFF" | "FREELANCER" | "CLIENT";

const PERMISSION_HIERARCHY: Record<PermissionLevel, number> = {
  ADMIN: 100,
  LEADERSHIP: 80,
  TEAM_LEAD: 60,
  STAFF: 40,
  FREELANCER: 20,
  CLIENT: 10,
};

type Permission =
  | "brief:create"
  | "brief:view-all"
  | "brief:view-assigned"
  | "brief:assign"
  | "project:create"
  | "time:track"
  | "time:approve"
  | "resource:view"
  | "resource:manage"
  | "rfp:view"
  | "rfp:create"
  | "rfp:manage"
  | "user:manage"
  | "settings:manage";

const PERMISSION_MAP: Record<Permission, PermissionLevel[]> = {
  "brief:create": ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  "brief:view-all": ["ADMIN", "LEADERSHIP"],
  "brief:view-assigned": ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF", "FREELANCER"],
  "brief:assign": ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  "project:create": ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  "time:track": ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF", "FREELANCER"],
  "time:approve": ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  "resource:view": ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
  "resource:manage": ["ADMIN", "LEADERSHIP"],
  "rfp:view": ["ADMIN", "LEADERSHIP"],
  "rfp:create": ["ADMIN", "LEADERSHIP"],
  "rfp:manage": ["ADMIN", "LEADERSHIP"],
  "user:manage": ["ADMIN"],
  "settings:manage": ["ADMIN"],
};

export function can(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false;
  const allowedLevels = PERMISSION_MAP[permission];
  return allowedLevels.includes(user.permissionLevel);
}

export function hasMinLevel(user: SessionUser | null, minLevel: PermissionLevel): boolean {
  if (!user) return false;
  return PERMISSION_HIERARCHY[user.permissionLevel] >= PERMISSION_HIERARCHY[minLevel];
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.permissionLevel === "ADMIN";
}

export function isLeadership(user: SessionUser | null): boolean {
  return hasMinLevel(user, "LEADERSHIP");
}
