import type { PermissionLevel, User, Organization } from "@prisma/client";

export type { PermissionLevel, User, Organization };

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
