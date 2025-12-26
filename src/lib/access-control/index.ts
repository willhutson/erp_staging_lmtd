/**
 * Configurable Access Control System
 *
 * This module provides dynamic, policy-based access control that can be
 * configured through the admin UI rather than hardcoded in application logic.
 *
 * Key concepts:
 * - AccessPolicy: Named collection of rules (e.g., "Freelancer Restricted")
 * - AccessRule: Individual permission rule within a policy
 * - PolicyAssignment: Links policies to users (overrides default level)
 *
 * Usage:
 *   const accessControl = new AccessControl(ctx.organizationId, ctx.userId);
 *   const canList = await accessControl.can("clients", "LIST");
 *   const filter = await accessControl.getFilter("clients", "LIST");
 */

import { db } from "@/lib/db";
import {
  AccessAction,
  AccessCondition,
  AccessEffect,
  PermissionLevel,
  Prisma,
} from "@prisma/client";

export type ResourceName =
  | "users"
  | "clients"
  | "projects"
  | "briefs"
  | "time_entries"
  | "rfps"
  | "files";

export interface AccessContext {
  organizationId: string;
  userId: string;
  permissionLevel: PermissionLevel;
}

export interface AccessDecision {
  allowed: boolean;
  effect: AccessEffect;
  rule?: {
    id: string;
    policyId: string;
    policyName: string;
    conditionType: AccessCondition;
  };
  filter?: Prisma.JsonValue;
  allowedFields?: string[];
  deniedFields?: string[];
}

interface PolicyRule {
  id: string;
  policyId: string;
  policyName: string;
  policyPriority: number;
  resource: string;
  action: AccessAction;
  effect: AccessEffect;
  conditionType: AccessCondition;
  conditionParams: Prisma.JsonValue;
  allowedFields: string[];
  deniedFields: string[];
}

/**
 * AccessControl provides dynamic, configurable access control evaluation
 */
export class AccessControl {
  private organizationId: string;
  private userId: string;
  private permissionLevel: PermissionLevel;
  private rulesCache: PolicyRule[] | null = null;

  constructor(ctx: AccessContext) {
    this.organizationId = ctx.organizationId;
    this.userId = ctx.userId;
    this.permissionLevel = ctx.permissionLevel;
  }

  /**
   * Load all applicable rules for this user (from default level + assignments)
   */
  private async loadRules(): Promise<PolicyRule[]> {
    if (this.rulesCache) {
      return this.rulesCache;
    }

    // Get policies assigned to this user OR matching their permission level
    const policies = await db.accessPolicy.findMany({
      where: {
        organizationId: this.organizationId,
        isActive: true,
        OR: [
          // Policies with default level matching user's level
          { defaultLevel: this.permissionLevel },
          // Policies explicitly assigned to this user
          {
            assignments: {
              some: {
                userId: this.userId,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
              },
            },
          },
        ],
      },
      include: {
        rules: {
          where: { isActive: true },
        },
      },
      orderBy: { priority: "desc" }, // Higher priority first
    });

    // Flatten rules with policy metadata
    this.rulesCache = policies.flatMap((policy) =>
      policy.rules.map((rule) => ({
        id: rule.id,
        policyId: policy.id,
        policyName: policy.name,
        policyPriority: policy.priority,
        resource: rule.resource,
        action: rule.action,
        effect: rule.effect,
        conditionType: rule.conditionType,
        conditionParams: rule.conditionParams,
        allowedFields: rule.allowedFields,
        deniedFields: rule.deniedFields,
      }))
    );

    return this.rulesCache;
  }

  /**
   * Check if user can perform action on resource
   */
  async can(resource: ResourceName, action: AccessAction): Promise<boolean> {
    const decision = await this.evaluate(resource, action);
    return decision.allowed;
  }

  /**
   * Evaluate access and return full decision with metadata
   */
  async evaluate(
    resource: ResourceName,
    action: AccessAction
  ): Promise<AccessDecision> {
    const rules = await this.loadRules();

    // Find matching rules for this resource/action
    const matchingRules = rules.filter(
      (r) => r.resource === resource && r.action === action
    );

    // If no rules, check for fallback behavior:
    // - ADMIN/LEADERSHIP: default allow
    // - Others: default deny
    if (matchingRules.length === 0) {
      const defaultAllow =
        this.permissionLevel === "ADMIN" ||
        this.permissionLevel === "LEADERSHIP";
      return {
        allowed: defaultAllow,
        effect: defaultAllow ? "ALLOW" : "DENY",
      };
    }

    // Rules are already sorted by policy priority (desc)
    // First matching DENY wins, then first ALLOW
    for (const rule of matchingRules) {
      if (rule.effect === "DENY") {
        return {
          allowed: false,
          effect: "DENY",
          rule: {
            id: rule.id,
            policyId: rule.policyId,
            policyName: rule.policyName,
            conditionType: rule.conditionType,
          },
        };
      }
    }

    // Find first ALLOW rule
    const allowRule = matchingRules.find((r) => r.effect === "ALLOW");
    if (allowRule) {
      return {
        allowed: true,
        effect: "ALLOW",
        rule: {
          id: allowRule.id,
          policyId: allowRule.policyId,
          policyName: allowRule.policyName,
          conditionType: allowRule.conditionType,
        },
        allowedFields: allowRule.allowedFields,
        deniedFields: allowRule.deniedFields,
      };
    }

    // No rules matched
    return { allowed: false, effect: "DENY" };
  }

  /**
   * Build Prisma where clause filter based on access rules
   */
  async buildFilter<T extends Record<string, unknown>>(
    resource: ResourceName,
    action: AccessAction
  ): Promise<T> {
    const rules = await this.loadRules();

    // Find matching ALLOW rule for this resource/action
    const allowRule = rules.find(
      (r) =>
        r.resource === resource && r.action === action && r.effect === "ALLOW"
    );

    if (!allowRule) {
      // No matching rule - return impossible filter to return no results
      return { id: "__ACCESS_DENIED__" } as unknown as T;
    }

    // Build filter based on condition type
    switch (allowRule.conditionType) {
      case "ALL":
        // No additional filtering beyond organizationId (handled by caller)
        return {} as T;

      case "OWN":
        // Only records created by this user
        return { createdById: this.userId } as unknown as T;

      case "ASSIGNED":
        // Only records assigned to this user
        return { assigneeId: this.userId } as unknown as T;

      case "TEAM": {
        // Records for user's team members
        const teamMemberIds = await this.getTeamMemberIds();
        return {
          OR: [
            { createdById: { in: teamMemberIds } },
            { assigneeId: { in: teamMemberIds } },
          ],
        } as unknown as T;
      }

      case "CLIENT": {
        // Records for clients the user has briefs assigned to
        const clientIds = await this.getAssignedClientIds();
        return { clientId: { in: clientIds } } as unknown as T;
      }

      case "CUSTOM":
        // Use conditionParams JSON for custom logic
        return this.parseCustomCondition(allowRule.conditionParams) as unknown as T;

      default:
        return {} as T;
    }
  }

  /**
   * Get IDs of users in this user's team (as team lead)
   */
  private async getTeamMemberIds(): Promise<string[]> {
    const members = await db.user.findMany({
      where: {
        organizationId: this.organizationId,
        teamLeadId: this.userId,
        isActive: true,
      },
      select: { id: true },
    });
    return [this.userId, ...members.map((m) => m.id)];
  }

  /**
   * Get client IDs where user has assigned briefs
   */
  private async getAssignedClientIds(): Promise<string[]> {
    const briefs = await db.brief.findMany({
      where: {
        organizationId: this.organizationId,
        assigneeId: this.userId,
      },
      select: { clientId: true },
      distinct: ["clientId"],
    });
    return briefs.map((b) => b.clientId);
  }

  /**
   * Parse custom condition params into Prisma filter
   */
  private parseCustomCondition<T extends Record<string, unknown>>(
    params: Prisma.JsonValue
  ): T {
    if (!params || typeof params !== "object") {
      return {} as T;
    }

    const p = params as Record<string, unknown>;

    // Simple field comparison
    if (p.field && p.operator && p.value !== undefined) {
      const field = String(p.field);
      const op = String(p.operator);
      let value = p.value;

      // Replace variables
      if (value === "$userId") {
        value = this.userId;
      } else if (value === "$organizationId") {
        value = this.organizationId;
      }

      switch (op) {
        case "eq":
          return { [field]: value } as unknown as T;
        case "neq":
          return { [field]: { not: value } } as unknown as T;
        case "in":
          return { [field]: { in: value } } as unknown as T;
        case "contains":
          return {
            [field]: { contains: value, mode: "insensitive" },
          } as unknown as T;
        default:
          return { [field]: value } as unknown as T;
      }
    }

    // Return empty filter if can't parse
    return {} as T;
  }

  /**
   * Filter fields from a record based on access rules
   */
  async filterFields<T extends Record<string, unknown>>(
    resource: ResourceName,
    action: AccessAction,
    record: T
  ): Promise<Partial<T>> {
    const decision = await this.evaluate(resource, action);

    if (!decision.allowed) {
      return {};
    }

    // If no field restrictions, return full record
    if (
      (!decision.allowedFields || decision.allowedFields.length === 0) &&
      (!decision.deniedFields || decision.deniedFields.length === 0)
    ) {
      return record;
    }

    const result: Partial<T> = {};

    for (const [key, value] of Object.entries(record)) {
      // Check denied fields first
      if (decision.deniedFields?.includes(key)) {
        continue;
      }

      // If allowed fields specified, check if this field is in the list
      if (
        decision.allowedFields &&
        decision.allowedFields.length > 0 &&
        !decision.allowedFields.includes(key)
      ) {
        continue;
      }

      result[key as keyof T] = value as T[keyof T];
    }

    return result;
  }
}

/**
 * Create default policies for a new organization
 * Called when an organization is first set up
 */
export async function createDefaultPolicies(
  organizationId: string,
  createdById: string
): Promise<void> {
  // Admin Full Access
  await db.accessPolicy.create({
    data: {
      organizationId,
      name: "Admin Full Access",
      description: "Full access to all resources",
      defaultLevel: "ADMIN",
      priority: 100,
      createdById,
      rules: {
        create: [
          { resource: "users", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "users", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "users", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "users", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "users", action: "DELETE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "DELETE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "DELETE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "DELETE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "ASSIGN", effect: "ALLOW", conditionType: "ALL" },
        ],
      },
    },
  });

  // Leadership Access
  await db.accessPolicy.create({
    data: {
      organizationId,
      name: "Leadership Access",
      description: "Full view access, limited write access",
      defaultLevel: "LEADERSHIP",
      priority: 90,
      createdById,
      rules: {
        create: [
          { resource: "users", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "users", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "ASSIGN", effect: "ALLOW", conditionType: "ALL" },
        ],
      },
    },
  });

  // Team Lead Access
  await db.accessPolicy.create({
    data: {
      organizationId,
      name: "Team Lead Access",
      description: "Team-scoped access with assignment capabilities",
      defaultLevel: "TEAM_LEAD",
      priority: 80,
      createdById,
      rules: {
        create: [
          { resource: "users", action: "LIST", effect: "ALLOW", conditionType: "TEAM" },
          { resource: "users", action: "VIEW", effect: "ALLOW", conditionType: "TEAM" },
          { resource: "clients", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "CREATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "UPDATE", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "ASSIGN", effect: "ALLOW", conditionType: "TEAM" },
        ],
      },
    },
  });

  // Staff Access
  await db.accessPolicy.create({
    data: {
      organizationId,
      name: "Staff Access",
      description: "View all, edit assigned",
      defaultLevel: "STAFF",
      priority: 70,
      createdById,
      rules: {
        create: [
          { resource: "clients", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "clients", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "projects", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "LIST", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "VIEW", effect: "ALLOW", conditionType: "ALL" },
          { resource: "briefs", action: "UPDATE", effect: "ALLOW", conditionType: "ASSIGNED" },
        ],
      },
    },
  });

  // Freelancer Access (Restrictive)
  await db.accessPolicy.create({
    data: {
      organizationId,
      name: "Freelancer Access",
      description: "Access only to assigned work and related clients",
      defaultLevel: "FREELANCER",
      priority: 60,
      createdById,
      rules: {
        create: [
          // Only see clients they have briefs for
          { resource: "clients", action: "LIST", effect: "ALLOW", conditionType: "CLIENT" },
          { resource: "clients", action: "VIEW", effect: "ALLOW", conditionType: "CLIENT" },
          // Only see projects they have briefs for
          { resource: "projects", action: "LIST", effect: "ALLOW", conditionType: "ASSIGNED" },
          { resource: "projects", action: "VIEW", effect: "ALLOW", conditionType: "ASSIGNED" },
          // Only see assigned briefs
          { resource: "briefs", action: "LIST", effect: "ALLOW", conditionType: "ASSIGNED" },
          { resource: "briefs", action: "VIEW", effect: "ALLOW", conditionType: "ASSIGNED" },
          { resource: "briefs", action: "UPDATE", effect: "ALLOW", conditionType: "ASSIGNED" },
          // Field restrictions - hide sensitive data
          {
            resource: "clients",
            action: "VIEW",
            effect: "ALLOW",
            conditionType: "CLIENT",
            deniedFields: ["retainerHours", "notes", "linkedIn"],
          },
        ],
      },
    },
  });
}

/**
 * Helper to check access in middleware
 */
export async function checkAccess(
  ctx: AccessContext,
  resource: ResourceName,
  action: AccessAction
): Promise<{ allowed: boolean; filter?: Record<string, unknown> }> {
  const ac = new AccessControl(ctx);
  const allowed = await ac.can(resource, action);

  if (!allowed) {
    return { allowed: false };
  }

  const filter = await ac.buildFilter(resource, action);
  return { allowed: true, filter };
}
