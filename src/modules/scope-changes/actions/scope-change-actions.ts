"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export type ScopeChangeImpact = "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";
export type ScopeApprovalStatus = "NOT_REQUIRED" | "PENDING" | "ACKNOWLEDGED" | "APPROVED" | "DISPUTED";

export interface CreateScopeChangeInput {
  briefId: string;
  title: string;
  originalDirection: string;
  newDirection: string;
  reason?: string;
  impactLevel: ScopeChangeImpact;
  hoursSpentBefore?: number;
  estimatedAdditionalHours?: number;
  costImpact?: number;
  requiresApproval?: boolean;
}

export interface UpdateScopeChangeInput {
  title?: string;
  originalDirection?: string;
  newDirection?: string;
  reason?: string;
  impactLevel?: ScopeChangeImpact;
  hoursSpentBefore?: number;
  estimatedAdditionalHours?: number;
  costImpact?: number;
  requiresApproval?: boolean;
  approvalStatus?: ScopeApprovalStatus;
  clientNotes?: string;
}

// Inferred types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ScopeChangeRecord = Awaited<ReturnType<typeof db.scopeChange.findMany>>[number];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ScopeChangeWithBrief = Awaited<ReturnType<typeof db.scopeChange.findFirst<{
  include: { brief: { include: { client: true } } }
}>>>;

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all scope changes for the organization
 */
export async function getScopeChanges(options?: {
  briefId?: string;
  clientId?: string;
  impactLevel?: ScopeChangeImpact;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.briefId) where.briefId = options.briefId;
  if (options?.impactLevel) where.impactLevel = options.impactLevel;
  if (options?.clientId) {
    where.brief = { clientId: options.clientId };
  }

  return db.scopeChange.findMany({
    where,
    include: {
      brief: {
        include: {
          client: { select: { id: true, name: true, code: true } },
          assignee: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
}

/**
 * Get a single scope change by ID
 */
export async function getScopeChange(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const scopeChange = await db.scopeChange.findUnique({
    where: { id },
    include: {
      brief: {
        include: {
          client: true,
          assignee: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!scopeChange || scopeChange.organizationId !== session.user.organizationId) {
    return null;
  }

  return scopeChange;
}

/**
 * Get scope changes for a specific brief
 */
export async function getScopeChangesForBrief(briefId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify brief exists and belongs to org
  const brief = await db.brief.findUnique({
    where: { id: briefId },
    select: { organizationId: true },
  });

  if (!brief || brief.organizationId !== session.user.organizationId) {
    throw new Error("Brief not found");
  }

  return db.scopeChange.findMany({
    where: { briefId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Create a new scope change
 */
export async function createScopeChange(input: CreateScopeChangeInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify brief exists and belongs to org
  const brief = await db.brief.findUnique({
    where: { id: input.briefId },
    select: { organizationId: true, clientId: true },
  });

  if (!brief || brief.organizationId !== session.user.organizationId) {
    throw new Error("Brief not found");
  }

  const scopeChange = await db.scopeChange.create({
    data: {
      organizationId: session.user.organizationId,
      briefId: input.briefId,
      title: input.title,
      originalDirection: input.originalDirection,
      newDirection: input.newDirection,
      reason: input.reason,
      impactLevel: input.impactLevel,
      hoursSpentBefore: input.hoursSpentBefore,
      estimatedAdditionalHours: input.estimatedAdditionalHours,
      costImpact: input.costImpact,
      requiresApproval: input.requiresApproval ?? false,
      approvalStatus: input.requiresApproval ? "PENDING" : "NOT_REQUIRED",
      createdById: session.user.id,
    },
  });

  revalidatePath(`/briefs/${input.briefId}`);
  revalidatePath("/scope-changes");

  return scopeChange;
}

/**
 * Update a scope change
 */
export async function updateScopeChange(id: string, input: UpdateScopeChangeInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.scopeChange.findUnique({
    where: { id },
    include: { brief: { select: { organizationId: true } } },
  });

  if (!existing || existing.brief.organizationId !== session.user.organizationId) {
    throw new Error("Scope change not found");
  }

  const scopeChange = await db.scopeChange.update({
    where: { id },
    data: {
      title: input.title,
      originalDirection: input.originalDirection,
      newDirection: input.newDirection,
      reason: input.reason,
      impactLevel: input.impactLevel,
      hoursSpentBefore: input.hoursSpentBefore,
      estimatedAdditionalHours: input.estimatedAdditionalHours,
      costImpact: input.costImpact,
      requiresApproval: input.requiresApproval,
      approvalStatus: input.approvalStatus,
      clientNotes: input.clientNotes,
    },
  });

  revalidatePath(`/briefs/${existing.briefId}`);
  revalidatePath("/scope-changes");

  return scopeChange;
}

/**
 * Delete a scope change
 */
export async function deleteScopeChange(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.scopeChange.findUnique({
    where: { id },
    include: { brief: { select: { organizationId: true } } },
  });

  if (!existing || existing.brief.organizationId !== session.user.organizationId) {
    throw new Error("Scope change not found");
  }

  await db.scopeChange.delete({ where: { id } });

  revalidatePath(`/briefs/${existing.briefId}`);
  revalidatePath("/scope-changes");
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get scope change stats for a client
 */
export async function getScopeChangeStats(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [total, byImpact, recentChanges] = await Promise.all([
    db.scopeChange.count({
      where: {
        organizationId: session.user.organizationId,
        brief: { clientId },
      },
    }),

    db.scopeChange.groupBy({
      by: ["impactLevel"],
      where: {
        organizationId: session.user.organizationId,
        brief: { clientId },
      },
      _count: true,
    }),

    db.scopeChange.findMany({
      where: {
        organizationId: session.user.organizationId,
        brief: { clientId },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        brief: { select: { id: true, title: true } },
      },
    }),
  ]);

  // Calculate total hours impact
  const hoursImpact = await db.scopeChange.aggregate({
    where: {
      organizationId: session.user.organizationId,
      brief: { clientId },
    },
    _sum: {
      hoursSpentBefore: true,
      estimatedAdditionalHours: true,
      costImpact: true,
    },
  });

  return {
    total,
    byImpact: Object.fromEntries(byImpact.map((i: { impactLevel: string; _count: number }) => [i.impactLevel, i._count])),
    recentChanges,
    hoursSpentBeforeTotal: hoursImpact._sum.hoursSpentBefore ?? 0,
    additionalHoursTotal: hoursImpact._sum.estimatedAdditionalHours ?? 0,
    costImpactTotal: hoursImpact._sum.costImpact ?? 0,
  };
}

/**
 * Get monthly scope change trends
 */
export async function getScopeChangeTrends(months: number = 6) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const changes = await db.scopeChange.findMany({
    where: {
      organizationId: session.user.organizationId,
      createdAt: { gte: startDate },
    },
    include: {
      brief: {
        include: {
          client: { select: { id: true, name: true, code: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by month and client
  const byMonth: Record<string, { total: number; byClient: Record<string, number>; byImpact: Record<string, number> }> = {};

  for (const change of changes) {
    const monthKey = `${change.createdAt.getFullYear()}-${String(change.createdAt.getMonth() + 1).padStart(2, "0")}`;

    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { total: 0, byClient: {}, byImpact: {} };
    }

    byMonth[monthKey].total++;

    const clientCode = change.brief.client.code;
    byMonth[monthKey].byClient[clientCode] = (byMonth[monthKey].byClient[clientCode] || 0) + 1;

    byMonth[monthKey].byImpact[change.impactLevel] = (byMonth[monthKey].byImpact[change.impactLevel] || 0) + 1;
  }

  return byMonth;
}
