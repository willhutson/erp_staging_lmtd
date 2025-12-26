/**
 * Comprehensive Audit Logging System
 *
 * Captures all significant actions for compliance, debugging, and security.
 * Supports automatic backup to external storage for long-term retention.
 *
 * Usage:
 *   await audit.log({
 *     action: "CREATE",
 *     resource: "client",
 *     resourceId: client.id,
 *     resourceName: client.name,
 *     newState: client,
 *   });
 */

import { db } from "@/lib/db";
import { AuditAction, AccessEffect, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export interface AuditContext {
  organizationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
}

export interface AuditLogEntry {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  resourceName?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changesSummary?: string;
  accessDecision?: AccessEffect;
  accessRuleId?: string;
  accessPolicyId?: string;
  correlationId?: string;
}

/**
 * Audit logger with context
 */
export class AuditLogger {
  private context: AuditContext;
  private ipAddress?: string;
  private userAgent?: string;
  private requestPath?: string;
  private requestMethod?: string;
  private sessionId?: string;

  constructor(context: AuditContext) {
    this.context = context;
  }

  /**
   * Set request context from headers
   */
  async setRequestContext(): Promise<void> {
    try {
      const headersList = await headers();
      this.ipAddress =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        undefined;
      this.userAgent = headersList.get("user-agent") || undefined;
      this.requestPath = headersList.get("x-invoke-path") || undefined;
      this.requestMethod = headersList.get("x-invoke-method") || undefined;
    } catch {
      // Headers not available (e.g., in non-request context)
    }
  }

  /**
   * Set session ID for correlation
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Log an action
   */
  async log(entry: AuditLogEntry): Promise<string> {
    const log = await db.auditLog.create({
      data: {
        organizationId: this.context.organizationId,
        userId: this.context.userId,
        userEmail: this.context.userEmail,
        userName: this.context.userName,
        userRole: this.context.userRole,
        ipAddress: this.ipAddress,
        userAgent: this.userAgent,
        requestPath: this.requestPath,
        requestMethod: this.requestMethod,
        sessionId: this.sessionId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        resourceName: entry.resourceName,
        previousState: entry.previousState as Prisma.InputJsonValue,
        newState: entry.newState as Prisma.InputJsonValue,
        changesSummary: entry.changesSummary,
        accessDecision: entry.accessDecision,
        accessRuleId: entry.accessRuleId,
        accessPolicyId: entry.accessPolicyId,
        correlationId: entry.correlationId,
      },
    });

    return log.id;
  }

  /**
   * Log a create action
   */
  async logCreate(
    resource: string,
    resourceId: string,
    resourceName: string,
    newState: Record<string, unknown>
  ): Promise<string> {
    return this.log({
      action: "CREATE",
      resource,
      resourceId,
      resourceName,
      newState,
      changesSummary: `Created ${resource}: ${resourceName}`,
    });
  }

  /**
   * Log an update action with diff
   */
  async logUpdate(
    resource: string,
    resourceId: string,
    resourceName: string,
    previousState: Record<string, unknown>,
    newState: Record<string, unknown>
  ): Promise<string> {
    const changes = this.computeChanges(previousState, newState);
    return this.log({
      action: "UPDATE",
      resource,
      resourceId,
      resourceName,
      previousState,
      newState,
      changesSummary: `Updated ${resource}: ${resourceName}. Changes: ${changes}`,
    });
  }

  /**
   * Log a delete/archive action
   */
  async logDelete(
    resource: string,
    resourceId: string,
    resourceName: string,
    previousState: Record<string, unknown>,
    isArchive = false
  ): Promise<string> {
    return this.log({
      action: isArchive ? "ARCHIVE" : "DELETE",
      resource,
      resourceId,
      resourceName,
      previousState,
      changesSummary: `${isArchive ? "Archived" : "Deleted"} ${resource}: ${resourceName}`,
    });
  }

  /**
   * Log an access decision
   */
  async logAccess(
    resource: string,
    resourceId: string | undefined,
    decision: AccessEffect,
    ruleId?: string,
    policyId?: string
  ): Promise<string> {
    return this.log({
      action: decision === "ALLOW" ? "ACCESS_GRANTED" : "ACCESS_DENIED",
      resource,
      resourceId,
      accessDecision: decision,
      accessRuleId: ruleId,
      accessPolicyId: policyId,
      changesSummary: `Access ${decision.toLowerCase()} for ${resource}${resourceId ? `: ${resourceId}` : ""}`,
    });
  }

  /**
   * Log policy changes
   */
  async logPolicyChange(
    action: AuditAction,
    policyId: string,
    policyName: string,
    previousState?: Record<string, unknown>,
    newState?: Record<string, unknown>,
    summary?: string
  ): Promise<string> {
    return this.log({
      action,
      resource: "access_policy",
      resourceId: policyId,
      resourceName: policyName,
      previousState,
      newState,
      accessPolicyId: policyId,
      changesSummary: summary || `Policy ${action.toLowerCase()}: ${policyName}`,
    });
  }

  /**
   * Compute human-readable changes summary
   */
  private computeChanges(
    previous: Record<string, unknown>,
    current: Record<string, unknown>
  ): string {
    const changes: string[] = [];

    for (const key of Object.keys(current)) {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changes.push(key);
      }
    }

    if (changes.length === 0) {
      return "No changes detected";
    }

    if (changes.length <= 3) {
      return changes.join(", ");
    }

    return `${changes.slice(0, 3).join(", ")} and ${changes.length - 3} more`;
  }
}

/**
 * Create an audit logger from session context
 */
export function createAuditLogger(ctx: {
  organizationId: string;
  userId: string;
  email: string;
  name: string;
  role: string;
}): AuditLogger {
  return new AuditLogger({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    userEmail: ctx.email,
    userName: ctx.name,
    userRole: ctx.role,
  });
}

/**
 * Query audit logs with filtering
 */
export async function queryAuditLogs(
  organizationId: string,
  options: {
    userId?: string;
    resource?: string;
    resourceId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ logs: Prisma.AuditLogGetPayload<object>[]; total: number }> {
  const where: Prisma.AuditLogWhereInput = {
    organizationId,
    ...(options.userId && { userId: options.userId }),
    ...(options.resource && { resource: options.resource }),
    ...(options.resourceId && { resourceId: options.resourceId }),
    ...(options.action && { action: options.action }),
    ...(options.startDate && { occurredAt: { gte: options.startDate } }),
    ...(options.endDate && { occurredAt: { lte: options.endDate } }),
  };

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    db.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get audit trail for a specific resource
 */
export async function getResourceAuditTrail(
  organizationId: string,
  resource: string,
  resourceId: string
): Promise<Prisma.AuditLogGetPayload<object>[]> {
  return db.auditLog.findMany({
    where: {
      organizationId,
      resource,
      resourceId,
    },
    orderBy: { occurredAt: "desc" },
  });
}
