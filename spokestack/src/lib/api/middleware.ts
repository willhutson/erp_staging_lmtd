/**
 * API Middleware for Authentication and Authorization
 */

import { headers } from "next/headers";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { ApiError } from "./errors";

// Permission levels defined locally to avoid Prisma client import issues
type PermissionLevel = "ADMIN" | "LEADERSHIP" | "TEAM_LEAD" | "STAFF" | "FREELANCER" | "CLIENT";

export interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string;
    permissionLevel: PermissionLevel;
    organizationId: string;
    isFreelancer: boolean;
    isActive: boolean;
  };
  organizationId: string;
  tenantIdentifier: string;
  tenantType: "subdomain" | "custom" | "default";
}

/**
 * Get authenticated user context for API routes
 * Throws ApiError if not authenticated
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();

  if (!supabase) {
    throw ApiError.internal("Authentication service unavailable");
  }

  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    throw ApiError.unauthorized();
  }

  // Get user from database
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: supabaseUser.id },
        { email: supabaseUser.email },
      ],
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      permissionLevel: true,
      organizationId: true,
      isFreelancer: true,
      isActive: true,
    },
  });

  if (!user) {
    throw ApiError.unauthorized("User account not found");
  }

  // Get tenant info from headers (set by middleware)
  const headersList = await headers();
  const tenantType = (headersList.get("x-tenant-type") || "default") as "subdomain" | "custom" | "default";
  const tenantIdentifier = headersList.get("x-tenant-identifier") || "default";

  return {
    user,
    organizationId: user.organizationId,
    tenantIdentifier,
    tenantType,
  };
}

/**
 * Check if user has required permission level
 */
export function requirePermission(
  context: AuthContext,
  requiredLevel: PermissionLevel | PermissionLevel[]
): void {
  const levels = Array.isArray(requiredLevel) ? requiredLevel : [requiredLevel];

  const levelHierarchy: Record<PermissionLevel, number> = {
    ADMIN: 5,
    LEADERSHIP: 4,
    TEAM_LEAD: 3,
    STAFF: 2,
    FREELANCER: 1,
    CLIENT: 0,
  };

  const userLevel = levelHierarchy[context.user.permissionLevel];
  const hasPermission = levels.some(level => userLevel >= levelHierarchy[level]);

  if (!hasPermission) {
    throw ApiError.forbidden("Insufficient permissions");
  }
}

/**
 * Require admin permission
 */
export function requireAdmin(context: AuthContext): void {
  requirePermission(context, "ADMIN");
}

/**
 * Require leadership or higher
 */
export function requireLeadership(context: AuthContext): void {
  requirePermission(context, ["ADMIN", "LEADERSHIP"]);
}

/**
 * Require team lead or higher
 */
export function requireTeamLead(context: AuthContext): void {
  requirePermission(context, ["ADMIN", "LEADERSHIP", "TEAM_LEAD"]);
}

/**
 * Check if user can access a specific resource
 */
export function canAccessResource(
  context: AuthContext,
  resourceOwnerId: string,
  resourceOrgId: string
): boolean {
  // Must be same organization
  if (resourceOrgId !== context.organizationId) {
    return false;
  }

  // Admins and leadership can access anything in their org
  if (["ADMIN", "LEADERSHIP"].includes(context.user.permissionLevel)) {
    return true;
  }

  // Team leads can access their team's resources (simplified - would need team lookup)
  if (context.user.permissionLevel === "TEAM_LEAD") {
    return true; // TODO: Add team membership check
  }

  // Staff and freelancers can only access their own resources
  return resourceOwnerId === context.user.id;
}

/**
 * Validate organization access
 */
export function validateOrgAccess(context: AuthContext, orgId: string): void {
  if (orgId !== context.organizationId) {
    throw ApiError.forbidden("Access denied to this organization");
  }
}

/**
 * Optional auth - returns null if not authenticated
 */
export async function getOptionalAuthContext(): Promise<AuthContext | null> {
  try {
    return await getAuthContext();
  } catch {
    return null;
  }
}

/**
 * Get API key context (for external integrations)
 */
export async function getApiKeyContext(): Promise<{
  apiKey: { id: string; organizationId: string; scopes: string[] };
  organizationId: string;
} | null> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader?.startsWith("Bearer sk_")) {
    return null;
  }

  const keyValue = authHeader.replace("Bearer ", "");
  const keyHash = createHash("sha256").update(keyValue).digest("hex");

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    select: {
      id: true,
      organizationId: true,
      scopes: true,
    },
  });

  if (!apiKey) {
    return null;
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    apiKey,
    organizationId: apiKey.organizationId,
  };
}
