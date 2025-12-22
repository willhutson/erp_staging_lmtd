import { db } from "@/lib/db";

// Inferred types from Prisma queries (no @prisma/client import needed)
export type User = Awaited<ReturnType<typeof db.user.findFirst>>;
export type Organization = Awaited<ReturnType<typeof db.organization.findFirst>>;

// Permission levels as const for type-safety
export type PermissionLevel = "ADMIN" | "LEADERSHIP" | "TEAM_LEAD" | "STAFF" | "FREELANCER" | "CLIENT";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  permissionLevel: PermissionLevel;
  department: string;
  role: string;
  avatarUrl?: string | null;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  requiredPermissions?: PermissionLevel[];
}
