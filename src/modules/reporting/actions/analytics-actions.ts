"use server";

/**
 * Reporting Module - Analytics Actions
 *
 * Provides comprehensive analytics across all modules:
 * - Executive KPIs
 * - Client performance
 * - Team productivity
 * - Content metrics
 * - Retainer health
 *
 * @module reporting/actions/analytics-actions
 */

import { db } from "@/lib/db";

// ============================================
// TYPES
// ============================================

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ExecutiveKPIs {
  // Briefs
  totalBriefs: number;
  completedBriefs: number;
  inProgressBriefs: number;
  briefCompletionRate: number;
  avgBriefDuration: number; // days

  // Time
  totalHoursLogged: number;
  billableHours: number;
  utilizationRate: number;

  // Clients
  activeClients: number;
  atRiskClients: number;
  avgNpsScore: number;

  // Content
  postsPublished: number;
  postsScheduled: number;
  avgApprovalTime: number; // hours

  // Revenue (if applicable)
  retainerRevenue: number;
  projectRevenue: number;
}

export interface ClientReport {
  clientId: string;
  clientName: string;
  clientCode: string;

  // Briefs
  totalBriefs: number;
  completedBriefs: number;
  inProgressBriefs: number;
  briefsByType: Record<string, number>;

  // Time
  totalHours: number;
  hoursThisPeriod: number;
  hoursByDepartment: Record<string, number>;

  // Retainer
  isRetainer: boolean;
  retainerHours: number | null;
  hoursUsed: number;
  burnRate: number; // percentage

  // Content
  totalPosts: number;
  publishedPosts: number;
  pendingApproval: number;

  // Health
  npsScore: number | null;
  openIssues: number;
  relationshipStatus: string;
}

export interface TeamProductivity {
  userId: string;
  userName: string;
  department: string;
  role: string;

  // Hours
  totalHours: number;
  billableHours: number;
  utilizationRate: number;

  // Briefs
  briefsAssigned: number;
  briefsCompleted: number;
  avgCompletionTime: number; // days

  // Capacity
  weeklyCapacity: number;
  currentLoad: number; // hours assigned
  loadPercentage: number;
}

export interface ContentMetrics {
  // Volume
  totalPosts: number;
  postsByPlatform: Record<string, number>;
  postsByType: Record<string, number>;
  postsByClient: Array<{ clientId: string; clientName: string; count: number }>;

  // Status
  draft: number;
  inReview: number;
  approved: number;
  scheduled: number;
  published: number;
  failed: number;

  // Performance
  avgApprovalTime: number; // hours
  revisionRate: number; // percentage needing revisions
  publishSuccessRate: number;

  // Engagement (placeholder for when APIs connected)
  totalEngagement: number;
  avgEngagementRate: number;
}

export interface RetainerHealth {
  clientId: string;
  clientName: string;
  clientCode: string;

  // Hours
  monthlyAllocation: number;
  hoursUsed: number;
  hoursRemaining: number;
  burnRate: number;

  // Trend
  previousMonthUsage: number;
  usageTrend: "up" | "down" | "stable";

  // Scope
  scopeChanges: number;
  additionalHours: number;

  // Status
  status: "healthy" | "warning" | "critical";
  daysRemaining: number;
  projectedOverage: number;
}

// ============================================
// EXECUTIVE DASHBOARD
// ============================================

export async function getExecutiveKPIs(
  organizationId: string,
  dateRange?: DateRange
): Promise<ExecutiveKPIs> {
  const from = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = dateRange?.to || new Date();

  const [
    briefStats,
    timeStats,
    clientStats,
    contentStats,
    npsStats,
  ] = await Promise.all([
    // Brief stats
    db.brief.groupBy({
      by: ["status"],
      where: {
        organizationId,
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    }),

    // Time stats
    db.timeEntry.aggregate({
      where: {
        organizationId,
        date: { gte: from, lte: to },
      },
      _sum: { hours: true },
    }),

    // Client stats
    db.client.groupBy({
      by: ["relationshipStatus"],
      where: { organizationId, isActive: true },
      _count: { id: true },
    }),

    // Content stats
    db.contentPost.groupBy({
      by: ["status"],
      where: {
        organizationId,
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    }),

    // NPS average
    db.nPSResponse.aggregate({
      where: {
        survey: { organizationId },
        submittedAt: { gte: from, lte: to },
      },
      _avg: { score: true },
    }),
  ]);

  // Calculate brief metrics
  const totalBriefs = briefStats.reduce((sum, s) => sum + s._count.id, 0);
  const completedBriefs = briefStats.find((s) => s.status === "COMPLETED")?._count.id || 0;
  const inProgressBriefs = briefStats
    .filter((s) => ["IN_PROGRESS", "IN_REVIEW", "INTERNAL_REVIEW", "CLIENT_REVIEW"].includes(s.status))
    .reduce((sum, s) => sum + s._count.id, 0);

  // Calculate client metrics
  const activeClients = clientStats.find((s) => s.relationshipStatus === "ACTIVE")?._count.id || 0;
  const atRiskClients = clientStats.find((s) => s.relationshipStatus === "AT_RISK")?._count.id || 0;

  // Calculate content metrics
  const postsPublished = contentStats.find((s) => s.status === "PUBLISHED")?._count.id || 0;
  const postsScheduled = contentStats.find((s) => s.status === "SCHEDULED")?._count.id || 0;

  // Get avg approval time
  const approvalTimeResult = await db.$queryRaw<[{ avg_hours: number }]>`
    SELECT AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 3600) as avg_hours
    FROM content_approvals
    WHERE responded_at IS NOT NULL
    AND status = 'APPROVED'
    AND created_at >= ${from}
    AND created_at <= ${to}
  `;

  // Get avg brief duration
  const briefDurationResult = await db.$queryRaw<[{ avg_days: number }]>`
    SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400) as avg_days
    FROM briefs
    WHERE completed_at IS NOT NULL
    AND organization_id = ${organizationId}
    AND created_at >= ${from}
  `;

  // Get total capacity for utilization
  const totalCapacity = await db.user.aggregate({
    where: { organizationId, isActive: true },
    _sum: { weeklyCapacity: true },
  });

  const weeksInPeriod = Math.ceil((to.getTime() - from.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const totalAvailableHours = (totalCapacity._sum.weeklyCapacity || 0) * weeksInPeriod;
  const totalHoursLogged = Number(timeStats._sum.hours || 0);

  return {
    totalBriefs,
    completedBriefs,
    inProgressBriefs,
    briefCompletionRate: totalBriefs > 0 ? (completedBriefs / totalBriefs) * 100 : 0,
    avgBriefDuration: briefDurationResult[0]?.avg_days || 0,

    totalHoursLogged,
    billableHours: totalHoursLogged * 0.85, // Assume 85% billable
    utilizationRate: totalAvailableHours > 0 ? (totalHoursLogged / totalAvailableHours) * 100 : 0,

    activeClients,
    atRiskClients,
    avgNpsScore: npsStats._avg.score || 0,

    postsPublished,
    postsScheduled,
    avgApprovalTime: approvalTimeResult[0]?.avg_hours || 0,

    retainerRevenue: 0, // Placeholder
    projectRevenue: 0, // Placeholder
  };
}

// ============================================
// CLIENT REPORTS
// ============================================

export async function getClientReport(
  clientId: string,
  dateRange?: DateRange
): Promise<ClientReport> {
  const from = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = dateRange?.to || new Date();

  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      _count: {
        select: {
          briefs: true,
          contentPosts: true,
        },
      },
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  const [
    briefsByStatus,
    briefsByType,
    , // timeByDepartment - placeholder for array destructuring
    totalTime,
    contentByStatus,
    npsScore,
    openIssues,
  ] = await Promise.all([
    // Briefs by status
    db.brief.groupBy({
      by: ["status"],
      where: { clientId },
      _count: { id: true },
    }),

    // Briefs by type
    db.brief.groupBy({
      by: ["type"],
      where: { clientId },
      _count: { id: true },
    }),

    // Time by department
    db.timeEntry.groupBy({
      by: ["userId"],
      where: {
        brief: { clientId },
        date: { gte: from, lte: to },
      },
      _sum: { hours: true },
    }),

    // Total time this period
    db.timeEntry.aggregate({
      where: {
        brief: { clientId },
        date: { gte: from, lte: to },
      },
      _sum: { hours: true },
    }),

    // Content by status
    db.contentPost.groupBy({
      by: ["status"],
      where: { clientId },
      _count: { id: true },
    }),

    // Latest NPS
    db.nPSResponse.findFirst({
      where: { survey: { clientId } },
      orderBy: { submittedAt: "desc" },
      select: { score: true },
    }),

    // Open issues
    db.clientComplaint.count({
      where: {
        clientId,
        status: { in: ["NEW", "ACKNOWLEDGED", "IN_PROGRESS"] },
      },
    }),
  ]);

  // Get retainer usage for current period
  const currentYear = to.getFullYear();
  const currentMonth = to.getMonth() + 1;
  const currentPeriod = await db.retainerPeriod.findFirst({
    where: {
      clientId,
      year: currentYear,
      month: currentMonth,
    },
  });

  const completedBriefs = briefsByStatus.find((s) => s.status === "COMPLETED")?._count.id || 0;
  const inProgressBriefs = briefsByStatus
    .filter((s) => ["IN_PROGRESS", "IN_REVIEW"].includes(s.status))
    .reduce((sum, s) => sum + s._count.id, 0);

  const hoursUsed = Number(totalTime._sum.hours || 0);
  const burnRate = currentPeriod?.budgetHours
    ? (hoursUsed / Number(currentPeriod.budgetHours)) * 100
    : 0;

  return {
    clientId: client.id,
    clientName: client.name,
    clientCode: client.code,

    totalBriefs: client._count.briefs,
    completedBriefs,
    inProgressBriefs,
    briefsByType: Object.fromEntries(briefsByType.map((b) => [b.type, b._count.id])),

    totalHours: hoursUsed,
    hoursThisPeriod: hoursUsed,
    hoursByDepartment: {}, // Would need user department lookup

    isRetainer: client.isRetainer,
    retainerHours: client.retainerHours,
    hoursUsed,
    burnRate,

    totalPosts: client._count.contentPosts,
    publishedPosts: contentByStatus.find((s) => s.status === "PUBLISHED")?._count.id || 0,
    pendingApproval: contentByStatus.find((s) => s.status === "CLIENT_REVIEW")?._count.id || 0,

    npsScore: npsScore?.score || null,
    openIssues,
    relationshipStatus: client.relationshipStatus,
  };
}

export async function getAllClientReports(
  organizationId: string,
  dateRange?: DateRange
): Promise<ClientReport[]> {
  const clients = await db.client.findMany({
    where: { organizationId, isActive: true },
    select: { id: true },
  });

  const reports = await Promise.all(
    clients.map((c) => getClientReport(c.id, dateRange))
  );

  return reports.sort((a, b) => b.totalHours - a.totalHours);
}

// ============================================
// TEAM PRODUCTIVITY
// ============================================

export async function getTeamProductivity(
  organizationId: string,
  dateRange?: DateRange
): Promise<TeamProductivity[]> {
  const from = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = dateRange?.to || new Date();

  const users = await db.user.findMany({
    where: { organizationId, isActive: true },
    select: {
      id: true,
      name: true,
      department: true,
      role: true,
      weeklyCapacity: true,
    },
  });

  const productivity: TeamProductivity[] = [];

  for (const user of users) {
    const [timeStats, briefStats, currentAssignments] = await Promise.all([
      // Time logged
      db.timeEntry.aggregate({
        where: {
          userId: user.id,
          date: { gte: from, lte: to },
        },
        _sum: { hours: true },
      }),

      // Brief completions
      db.brief.groupBy({
        by: ["status"],
        where: {
          assigneeId: user.id,
          updatedAt: { gte: from, lte: to },
        },
        _count: { id: true },
      }),

      // Current assignments
      db.brief.aggregate({
        where: {
          assigneeId: user.id,
          status: { in: ["IN_PROGRESS", "IN_REVIEW"] },
        },
        _sum: { estimatedHours: true },
        _count: { id: true },
      }),
    ]);

    const totalHours = Number(timeStats._sum.hours || 0);
    const weeksInPeriod = Math.ceil((to.getTime() - from.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const availableHours = user.weeklyCapacity * weeksInPeriod;

    const briefsCompleted = briefStats.find((s) => s.status === "COMPLETED")?._count.id || 0;
    const briefsAssigned = briefStats.reduce((sum, s) => sum + s._count.id, 0);

    const currentLoad = Number(currentAssignments._sum.estimatedHours || 0);

    productivity.push({
      userId: user.id,
      userName: user.name,
      department: user.department,
      role: user.role,

      totalHours,
      billableHours: totalHours * 0.85,
      utilizationRate: availableHours > 0 ? (totalHours / availableHours) * 100 : 0,

      briefsAssigned,
      briefsCompleted,
      avgCompletionTime: 0, // Would need more complex query

      weeklyCapacity: user.weeklyCapacity,
      currentLoad,
      loadPercentage: user.weeklyCapacity > 0 ? (currentLoad / user.weeklyCapacity) * 100 : 0,
    });
  }

  return productivity.sort((a, b) => b.utilizationRate - a.utilizationRate);
}

// ============================================
// CONTENT METRICS
// ============================================

export async function getContentMetrics(
  organizationId: string,
  dateRange?: DateRange
): Promise<ContentMetrics> {
  const from = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const to = dateRange?.to || new Date();

  const [
    byStatus,
    byPlatformRaw,
    byTypeRaw,
    byClientRaw,
    approvalStats,
    revisionStats,
    publishStats,
  ] = await Promise.all([
    // By status
    db.contentPost.groupBy({
      by: ["status"],
      where: {
        organizationId,
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    }),

    // By platform (need to unnest array)
    db.$queryRaw<Array<{ platform: string; count: bigint }>>`
      SELECT unnest(platforms) as platform, COUNT(*) as count
      FROM content_posts
      WHERE organization_id = ${organizationId}
      AND created_at >= ${from}
      AND created_at <= ${to}
      GROUP BY platform
      ORDER BY count DESC
    `,

    // By content type
    db.contentPost.groupBy({
      by: ["contentType"],
      where: {
        organizationId,
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    }),

    // By client
    db.contentPost.groupBy({
      by: ["clientId"],
      where: {
        organizationId,
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    }),

    // Avg approval time
    db.$queryRaw<[{ avg_hours: number }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 3600) as avg_hours
      FROM content_approvals
      WHERE responded_at IS NOT NULL
      AND created_at >= ${from}
      AND created_at <= ${to}
    `,

    // Revision rate
    db.contentApproval.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    }),

    // Publish success rate
    db.publishJob.groupBy({
      by: ["status"],
      where: {
        organizationId,
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    }),
  ]);

  // Get client names for the report
  const clientIds = byClientRaw.map((c) => c.clientId);
  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true },
  });

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  const totalApprovals = revisionStats.reduce((sum, s) => sum + s._count.id, 0);
  const revisionsRequested = revisionStats.find((s) => s.status === "REVISION_REQUESTED")?._count.id || 0;

  const totalPublishJobs = publishStats.reduce((sum, s) => sum + s._count.id, 0);
  const publishedJobs = publishStats.find((s) => s.status === "PUBLISHED")?._count.id || 0;

  return {
    totalPosts: byStatus.reduce((sum, s) => sum + s._count.id, 0),
    postsByPlatform: Object.fromEntries(byPlatformRaw.map((p) => [p.platform, Number(p.count)])),
    postsByType: Object.fromEntries(byTypeRaw.map((t) => [t.contentType, t._count.id])),
    postsByClient: byClientRaw.map((c) => ({
      clientId: c.clientId,
      clientName: clientMap.get(c.clientId) || "Unknown",
      count: c._count.id,
    })).sort((a, b) => b.count - a.count),

    draft: byStatus.find((s) => s.status === "DRAFT")?._count.id || 0,
    inReview: (byStatus.find((s) => s.status === "INTERNAL_REVIEW")?._count.id || 0) +
              (byStatus.find((s) => s.status === "CLIENT_REVIEW")?._count.id || 0),
    approved: byStatus.find((s) => s.status === "APPROVED")?._count.id || 0,
    scheduled: byStatus.find((s) => s.status === "SCHEDULED")?._count.id || 0,
    published: byStatus.find((s) => s.status === "PUBLISHED")?._count.id || 0,
    failed: byStatus.find((s) => s.status === "FAILED")?._count.id || 0,

    avgApprovalTime: approvalStats[0]?.avg_hours || 0,
    revisionRate: totalApprovals > 0 ? (revisionsRequested / totalApprovals) * 100 : 0,
    publishSuccessRate: totalPublishJobs > 0 ? (publishedJobs / totalPublishJobs) * 100 : 0,

    totalEngagement: 0, // Placeholder
    avgEngagementRate: 0, // Placeholder
  };
}

// ============================================
// RETAINER HEALTH
// ============================================

export async function getRetainerHealth(
  organizationId: string
): Promise<RetainerHealth[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const retainerClients = await db.client.findMany({
    where: {
      organizationId,
      isRetainer: true,
      isActive: true,
    },
    include: {
      retainerPeriods: {
        where: {
          year: currentYear,
          month: currentMonth,
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 1,
      },
    },
  });

  const healthReports: RetainerHealth[] = [];

  for (const client of retainerClients) {
    const currentPeriod = client.retainerPeriods[0];
    const monthlyAllocation = currentPeriod?.budgetHours
      ? Number(currentPeriod.budgetHours)
      : client.retainerHours || 0;

    // Get hours used this month
    const hoursThisMonth = await db.timeEntry.aggregate({
      where: {
        brief: { clientId: client.id },
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { hours: true },
    });

    // Get hours used last month
    const hoursLastMonth = await db.timeEntry.aggregate({
      where: {
        brief: { clientId: client.id },
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { hours: true },
    });

    // Get scope changes this month
    const scopeChanges = await db.scopeChange.count({
      where: {
        brief: { clientId: client.id },
        createdAt: { gte: startOfMonth },
      },
    });

    // Calculate additional hours from scope changes
    const additionalHoursResult = await db.scopeChange.aggregate({
      where: {
        brief: { clientId: client.id },
        createdAt: { gte: startOfMonth },
        approvalStatus: "APPROVED",
      },
      _sum: { estimatedAdditionalHours: true },
    });

    const hoursUsed = Number(hoursThisMonth._sum.hours || 0);
    const previousMonthUsage = Number(hoursLastMonth._sum.hours || 0);
    const hoursRemaining = monthlyAllocation - hoursUsed;
    const burnRate = monthlyAllocation > 0 ? (hoursUsed / monthlyAllocation) * 100 : 0;

    // Calculate days remaining in month
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    const daysElapsed = now.getDate();
    const dailyRate = daysElapsed > 0 ? hoursUsed / daysElapsed : 0;
    const projectedTotal = dailyRate * (daysElapsed + daysRemaining);
    const projectedOverage = Math.max(0, projectedTotal - monthlyAllocation);

    // Determine status
    let status: "healthy" | "warning" | "critical" = "healthy";
    if (burnRate > 100 || projectedOverage > monthlyAllocation * 0.1) {
      status = "critical";
    } else if (burnRate > 80 || projectedOverage > 0) {
      status = "warning";
    }

    // Determine trend
    let usageTrend: "up" | "down" | "stable" = "stable";
    if (previousMonthUsage > 0) {
      const trendRatio = hoursUsed / previousMonthUsage;
      if (trendRatio > 1.1) usageTrend = "up";
      else if (trendRatio < 0.9) usageTrend = "down";
    }

    healthReports.push({
      clientId: client.id,
      clientName: client.name,
      clientCode: client.code,
      monthlyAllocation,
      hoursUsed,
      hoursRemaining,
      burnRate,
      previousMonthUsage,
      usageTrend,
      scopeChanges,
      additionalHours: Number(additionalHoursResult._sum.estimatedAdditionalHours || 0),
      status,
      daysRemaining,
      projectedOverage,
    });
  }

  return healthReports.sort((a, b) => b.burnRate - a.burnRate);
}
