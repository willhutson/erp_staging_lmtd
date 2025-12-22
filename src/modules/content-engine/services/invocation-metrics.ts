"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ============================================
// TYPES
// ============================================

export interface InvocationMetrics {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  avgDurationMs: number;
  totalDurationMs: number;
}

export interface SkillMetrics extends InvocationMetrics {
  skillId: string;
  skillSlug: string;
  skillName: string;
  category: string;
  lastInvokedAt: Date | null;
}

export interface TimeSeriesDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  invocations: number;
  successful: number;
  failed: number;
  avgDurationMs: number;
}

export interface DashboardMetrics {
  overall: InvocationMetrics;
  bySkill: SkillMetrics[];
  byCategory: Record<string, InvocationMetrics>;
  byTriggerType: Record<string, InvocationMetrics>;
  timeSeries: TimeSeriesDataPoint[];
  recentInvocations: RecentInvocation[];
}

export interface RecentInvocation {
  id: string;
  skillName: string;
  skillSlug: string;
  status: string;
  triggeredBy: string;
  durationMs: number | null;
  createdAt: Date;
  error: string | null;
}

// ============================================
// DASHBOARD METRICS
// ============================================

/**
 * Get comprehensive metrics for the Content Engine dashboard
 */
export async function getDashboardMetrics(
  options?: {
    days?: number;
    skillSlugs?: string[];
  }
): Promise<DashboardMetrics> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const organizationId = session.user.organizationId;
  const days = options?.days ?? 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Base query conditions
  const whereCondition = {
    organizationId,
    createdAt: { gte: startDate },
    ...(options?.skillSlugs && {
      skill: { slug: { in: options.skillSlugs } },
    }),
  };

  // Get all invocations in date range
  const invocations = await db.agentInvocation.findMany({
    where: whereCondition,
    include: {
      skill: {
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate overall metrics
  const overall = calculateMetrics(invocations);

  // Group by skill
  const bySkillMap = new Map<string, typeof invocations>();
  for (const inv of invocations) {
    if (!inv.skill) continue;
    const key = inv.skill.id;
    if (!bySkillMap.has(key)) {
      bySkillMap.set(key, []);
    }
    bySkillMap.get(key)!.push(inv);
  }

  const bySkill: SkillMetrics[] = [];
  for (const [skillId, skillInvocations] of bySkillMap) {
    const skill = skillInvocations[0].skill!;
    const metrics = calculateMetrics(skillInvocations);
    bySkill.push({
      ...metrics,
      skillId,
      skillSlug: skill.slug,
      skillName: skill.name,
      category: skill.category,
      lastInvokedAt: skillInvocations[0].createdAt,
    });
  }

  // Sort by total invocations
  bySkill.sort((a, b) => b.total - a.total);

  // Group by category
  const byCategory: Record<string, InvocationMetrics> = {};
  for (const [, skillInvocations] of bySkillMap) {
    const category = skillInvocations[0].skill?.category ?? "UNKNOWN";
    if (!byCategory[category]) {
      byCategory[category] = calculateMetrics([]);
    }
    const categoryMetrics = calculateMetrics(skillInvocations);
    byCategory[category] = mergeMetrics(byCategory[category], categoryMetrics);
  }

  // Group by trigger type
  const byTriggerMap = new Map<string, typeof invocations>();
  for (const inv of invocations) {
    const key = inv.triggeredBy;
    if (!byTriggerMap.has(key)) {
      byTriggerMap.set(key, []);
    }
    byTriggerMap.get(key)!.push(inv);
  }

  const byTriggerType: Record<string, InvocationMetrics> = {};
  for (const [triggerType, triggerInvocations] of byTriggerMap) {
    byTriggerType[triggerType] = calculateMetrics(triggerInvocations);
  }

  // Build time series
  const timeSeries = buildTimeSeries(invocations, days);

  // Get recent invocations
  const recentInvocations: RecentInvocation[] = invocations.slice(0, 10).map((inv) => ({
    id: inv.id,
    skillName: inv.skill?.name ?? "Unknown",
    skillSlug: inv.skill?.slug ?? "unknown",
    status: inv.status,
    triggeredBy: inv.triggeredBy,
    durationMs: inv.durationMs,
    createdAt: inv.createdAt,
    error: inv.error,
  }));

  return {
    overall,
    bySkill,
    byCategory,
    byTriggerType,
    timeSeries,
    recentInvocations,
  };
}

// ============================================
// SKILL-SPECIFIC METRICS
// ============================================

/**
 * Get detailed metrics for a specific skill
 */
export async function getSkillMetrics(
  skillSlug: string,
  options?: { days?: number }
): Promise<{
  metrics: SkillMetrics;
  timeSeries: TimeSeriesDataPoint[];
  recentInvocations: RecentInvocation[];
  errorBreakdown: Record<string, number>;
}> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const organizationId = session.user.organizationId;
  const days = options?.days ?? 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get skill
  const skill = await db.agentSkill.findUnique({
    where: {
      organizationId_slug: { organizationId, slug: skillSlug },
    },
  });

  if (!skill) {
    throw new Error(`Skill not found: ${skillSlug}`);
  }

  // Get invocations
  const invocations = await db.agentInvocation.findMany({
    where: {
      organizationId,
      skillId: skill.id,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: "desc" },
  });

  const baseMetrics = calculateMetrics(invocations);
  const metrics: SkillMetrics = {
    ...baseMetrics,
    skillId: skill.id,
    skillSlug: skill.slug,
    skillName: skill.name,
    category: skill.category,
    lastInvokedAt: invocations[0]?.createdAt ?? null,
  };

  const timeSeries = buildTimeSeries(invocations, days);

  const recentInvocations: RecentInvocation[] = invocations.slice(0, 20).map((inv) => ({
    id: inv.id,
    skillName: skill.name,
    skillSlug: skill.slug,
    status: inv.status,
    triggeredBy: inv.triggeredBy,
    durationMs: inv.durationMs,
    createdAt: inv.createdAt,
    error: inv.error,
  }));

  // Error breakdown
  const errorBreakdown: Record<string, number> = {};
  for (const inv of invocations) {
    if (inv.error) {
      const errorType = categorizeError(inv.error);
      errorBreakdown[errorType] = (errorBreakdown[errorType] ?? 0) + 1;
    }
  }

  return {
    metrics,
    timeSeries,
    recentInvocations,
    errorBreakdown,
  };
}

// ============================================
// INVOCATION DETAILS
// ============================================

/**
 * Get details of a specific invocation
 */
export async function getInvocationDetails(invocationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const invocation = await db.agentInvocation.findUnique({
    where: { id: invocationId },
    include: {
      skill: {
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
        },
      },
    },
  });

  if (!invocation || invocation.organizationId !== session.user.organizationId) {
    return null;
  }

  return {
    id: invocation.id,
    skill: invocation.skill,
    status: invocation.status,
    triggeredBy: invocation.triggeredBy,
    triggerContext: invocation.triggerContext,
    inputData: invocation.inputData,
    outputData: invocation.outputData,
    error: invocation.error,
    durationMs: invocation.durationMs,
    tokensUsed: invocation.tokensUsed,
    createdAt: invocation.createdAt,
    completedAt: invocation.completedAt,
  };
}

/**
 * Get invocations for a specific entity (brief, client, etc.)
 */
export async function getEntityInvocations(
  entityType: string,
  entityId: string
): Promise<RecentInvocation[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Search in triggerContext for entity references
  const invocations = await db.agentInvocation.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [
        { triggerContext: { path: ["entityId"], equals: entityId } },
        { triggerContext: { path: ["entityType"], equals: entityType } },
        { inputData: { path: [`${entityType}Id`], equals: entityId } },
      ],
    },
    include: {
      skill: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return invocations.map((inv) => ({
    id: inv.id,
    skillName: inv.skill?.name ?? "Unknown",
    skillSlug: inv.skill?.slug ?? "unknown",
    status: inv.status,
    triggeredBy: inv.triggeredBy,
    durationMs: inv.durationMs,
    createdAt: inv.createdAt,
    error: inv.error,
  }));
}

// ============================================
// HELPERS
// ============================================

type InvocationRecord = Awaited<ReturnType<typeof db.agentInvocation.findMany>>[number];

function calculateMetrics(invocations: InvocationRecord[]): InvocationMetrics {
  const total = invocations.length;
  const successful = invocations.filter((i) => i.status === "COMPLETED").length;
  const failed = invocations.filter((i) => i.status === "FAILED").length;

  const durations = invocations
    .filter((i) => i.durationMs !== null)
    .map((i) => i.durationMs!);

  const totalDurationMs = durations.reduce((sum, d) => sum + d, 0);
  const avgDurationMs = durations.length > 0 ? totalDurationMs / durations.length : 0;

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    avgDurationMs: Math.round(avgDurationMs),
    totalDurationMs,
  };
}

function mergeMetrics(a: InvocationMetrics, b: InvocationMetrics): InvocationMetrics {
  const total = a.total + b.total;
  const successful = a.successful + b.successful;
  const failed = a.failed + b.failed;
  const totalDurationMs = a.totalDurationMs + b.totalDurationMs;

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    avgDurationMs: total > 0 ? Math.round(totalDurationMs / total) : 0,
    totalDurationMs,
  };
}

function buildTimeSeries(
  invocations: InvocationRecord[],
  days: number
): TimeSeriesDataPoint[] {
  const series: TimeSeriesDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayInvocations = invocations.filter((inv) => {
      const invDate = inv.createdAt.toISOString().split("T")[0];
      return invDate === dateStr;
    });

    const metrics = calculateMetrics(dayInvocations);

    series.push({
      date: dateStr,
      invocations: metrics.total,
      successful: metrics.successful,
      failed: metrics.failed,
      avgDurationMs: metrics.avgDurationMs,
    });
  }

  return series;
}

function categorizeError(error: string): string {
  const lowerError = error.toLowerCase();

  if (lowerError.includes("timeout")) return "Timeout";
  if (lowerError.includes("unauthorized") || lowerError.includes("permission")) return "Permission";
  if (lowerError.includes("not found")) return "Not Found";
  if (lowerError.includes("invalid") || lowerError.includes("validation")) return "Validation";
  if (lowerError.includes("dependency")) return "Dependency";
  if (lowerError.includes("rate limit")) return "Rate Limit";

  return "Other";
}
