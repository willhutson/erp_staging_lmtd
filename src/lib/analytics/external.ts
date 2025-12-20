/**
 * External Analytics Service
 * Client-facing metrics with real-time and time-period views
 * Supports multi-party/multi-factor analysis
 */

import { db } from "@/lib/db";
import { subDays, subWeeks, startOfDay, endOfDay, differenceInDays } from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

// Real-time metrics (current state)
export interface RealTimeMetrics {
  briefsInProgress: number;
  briefsInReview: number;
  briefsPendingApproval: number;
  activeTeamMembers: number;
  hoursLoggedToday: number;
  upcomingDeadlines: DeadlineItem[];
  recentActivity: ActivityItem[];
}

export interface DeadlineItem {
  briefId: string;
  title: string;
  deadline: Date;
  assignee: string;
  status: string;
  daysUntil: number;
  isOverdue: boolean;
}

export interface ActivityItem {
  id: string;
  type: "brief_created" | "brief_completed" | "approval_received" | "comment_added" | "file_uploaded";
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
  briefId?: string;
  briefTitle?: string;
}

// Time-period metrics (historical)
export interface PeriodMetrics {
  period: string;
  briefsCreated: number;
  briefsCompleted: number;
  avgTurnaroundDays: number;
  onTimeDeliveryRate: number;
  totalHours: number;
  billableHours: number;
  clientSatisfactionAvg: number;
  revisionRate: number;
}

// Client-specific analytics
export interface ClientAnalytics {
  clientId: string;
  clientName: string;
  realTime: ClientRealTimeMetrics;
  periodComparison: PeriodComparisonMetrics;
  briefsByType: BriefTypeBreakdown[];
  monthlyTrend: MonthlyTrendData[];
  teamAllocation: TeamAllocationData[];
}

export interface ClientRealTimeMetrics {
  activeBriefs: number;
  pendingApprovals: number;
  inReview: number;
  completedThisMonth: number;
  avgResponseTime: number; // hours
}

export interface PeriodComparisonMetrics {
  currentPeriod: PeriodMetrics;
  previousPeriod: PeriodMetrics;
  changes: {
    briefsCompleted: number;
    turnaroundChange: number;
    onTimeChange: number;
    hoursChange: number;
  };
}

export interface BriefTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
  avgTurnaround: number;
  totalHours: number;
}

export interface MonthlyTrendData {
  month: string;
  briefs: number;
  hours: number;
  onTimeRate: number;
}

export interface TeamAllocationData {
  userId: string;
  userName: string;
  department: string;
  briefsAssigned: number;
  hoursLogged: number;
  percentageOfTotal: number;
}

// Multi-factor analysis
export interface MultiFactorAnalysis {
  factorCorrelations: FactorCorrelation[];
  performanceDrivers: PerformanceDriver[];
  bottleneckAnalysis: BottleneckData[];
  capacityForecast: CapacityForecastData[];
}

export interface FactorCorrelation {
  factor1: string;
  factor2: string;
  correlation: number; // -1 to 1
  sampleSize: number;
  significance: "high" | "medium" | "low";
}

export interface PerformanceDriver {
  factor: string;
  impact: number; // percentage impact on performance
  trend: "improving" | "declining" | "stable";
  recommendation?: string;
}

export interface BottleneckData {
  stage: string;
  avgWaitTime: number; // hours
  briefsStuck: number;
  impactedClients: string[];
}

export interface CapacityForecastData {
  week: string;
  projectedBriefs: number;
  availableCapacity: number;
  utilizationForecast: number;
  risk: "low" | "medium" | "high";
}

class ExternalAnalyticsService {
  /**
   * Get real-time metrics (current state snapshot)
   */
  async getRealTimeMetrics(
    organizationId: string,
    clientId?: string
  ): Promise<RealTimeMetrics> {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const clientFilter = clientId ? { clientId } : {};

    // Parallel queries for real-time data
    const [
      inProgressBriefs,
      inReviewBriefs,
      pendingApprovalBriefs,
      todayTimeEntries,
      activeUsers,
      upcomingBriefs,
      recentBriefs,
    ] = await Promise.all([
      // Briefs in progress
      db.brief.count({
        where: {
          organizationId,
          ...clientFilter,
          status: "IN_PROGRESS",
        },
      }),
      // Briefs in review
      db.brief.count({
        where: {
          organizationId,
          ...clientFilter,
          status: { in: ["INTERNAL_REVIEW", "CLIENT_REVIEW"] },
        },
      }),
      // Pending approval (from client portal)
      db.submissionApproval.count({
        where: {
          organizationId,
          status: "PENDING",
        },
      }),
      // Hours logged today
      db.timeEntry.findMany({
        where: {
          organizationId,
          date: { gte: startOfToday, lte: endOfToday },
        },
        select: { hours: true, userId: true },
      }),
      // Active users (logged time this week)
      db.timeEntry.findMany({
        where: {
          organizationId,
          date: { gte: subDays(today, 7) },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      // Upcoming deadlines (next 7 days)
      db.brief.findMany({
        where: {
          organizationId,
          ...clientFilter,
          deadline: { gte: today, lte: subDays(today, -7) },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
        select: {
          id: true,
          title: true,
          deadline: true,
          status: true,
          assignee: { select: { name: true } },
        },
        orderBy: { deadline: "asc" },
        take: 10,
      }),
      // Recent activity (last 24 hours)
      db.brief.findMany({
        where: {
          organizationId,
          ...clientFilter,
          updatedAt: { gte: subDays(today, 1) },
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          assignee: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
    ]);

    const hoursLoggedToday = todayTimeEntries.reduce(
      (sum, e) => sum + Number(e.hours),
      0
    );

    // Build upcoming deadlines
    const upcomingDeadlines: DeadlineItem[] = upcomingBriefs.map((brief) => ({
      briefId: brief.id,
      title: brief.title,
      deadline: brief.deadline!,
      assignee: brief.assignee?.name || "Unassigned",
      status: brief.status,
      daysUntil: differenceInDays(brief.deadline!, today),
      isOverdue: brief.deadline! < today,
    }));

    // Build recent activity
    const recentActivity: ActivityItem[] = recentBriefs.map((brief) => ({
      id: brief.id,
      type: brief.status === "COMPLETED" ? "brief_completed" : "brief_created",
      description:
        brief.status === "COMPLETED"
          ? `${brief.title} was completed`
          : `${brief.title} was updated`,
      timestamp: brief.updatedAt,
      userName: brief.assignee?.name,
      briefId: brief.id,
      briefTitle: brief.title,
    }));

    return {
      briefsInProgress: inProgressBriefs,
      briefsInReview: inReviewBriefs,
      briefsPendingApproval: pendingApprovalBriefs,
      activeTeamMembers: activeUsers.length,
      hoursLoggedToday: Math.round(hoursLoggedToday * 10) / 10,
      upcomingDeadlines,
      recentActivity,
    };
  }

  /**
   * Get period-based metrics with comparison
   */
  async getPeriodMetrics(
    organizationId: string,
    dateRange: DateRange,
    clientId?: string
  ): Promise<PeriodComparisonMetrics> {
    const duration = dateRange.end.getTime() - dateRange.start.getTime();
    const previousRange: DateRange = {
      start: new Date(dateRange.start.getTime() - duration),
      end: new Date(dateRange.start.getTime() - 1),
    };

    const [current, previous] = await Promise.all([
      this.calculatePeriodMetrics(organizationId, dateRange, clientId),
      this.calculatePeriodMetrics(organizationId, previousRange, clientId),
    ]);

    return {
      currentPeriod: current,
      previousPeriod: previous,
      changes: {
        briefsCompleted: current.briefsCompleted - previous.briefsCompleted,
        turnaroundChange: current.avgTurnaroundDays - previous.avgTurnaroundDays,
        onTimeChange: current.onTimeDeliveryRate - previous.onTimeDeliveryRate,
        hoursChange: current.totalHours - previous.totalHours,
      },
    };
  }

  /**
   * Get comprehensive client analytics
   */
  async getClientAnalytics(
    organizationId: string,
    clientId: string,
    dateRange: DateRange
  ): Promise<ClientAnalytics> {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { name: true },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    const [realTime, periodComparison, briefsByType, monthlyTrend, teamAllocation] =
      await Promise.all([
        this.getClientRealTimeMetrics(organizationId, clientId),
        this.getPeriodMetrics(organizationId, dateRange, clientId),
        this.getBriefTypeBreakdown(organizationId, clientId, dateRange),
        this.getMonthlyTrend(organizationId, clientId),
        this.getTeamAllocation(organizationId, clientId, dateRange),
      ]);

    return {
      clientId,
      clientName: client.name,
      realTime,
      periodComparison,
      briefsByType,
      monthlyTrend,
      teamAllocation,
    };
  }

  /**
   * Multi-factor analysis for advanced insights
   */
  async getMultiFactorAnalysis(
    organizationId: string,
    dateRange: DateRange
  ): Promise<MultiFactorAnalysis> {
    const [correlations, drivers, bottlenecks, forecast] = await Promise.all([
      this.calculateFactorCorrelations(organizationId, dateRange),
      this.identifyPerformanceDrivers(organizationId, dateRange),
      this.analyzeBottlenecks(organizationId),
      this.forecastCapacity(organizationId),
    ]);

    return {
      factorCorrelations: correlations,
      performanceDrivers: drivers,
      bottleneckAnalysis: bottlenecks,
      capacityForecast: forecast,
    };
  }

  // Private helper methods

  private async calculatePeriodMetrics(
    organizationId: string,
    dateRange: DateRange,
    clientId?: string
  ): Promise<PeriodMetrics> {
    const clientFilter = clientId ? { clientId } : {};

    const [briefs, timeEntries, npsResponses] = await Promise.all([
      db.brief.findMany({
        where: {
          organizationId,
          ...clientFilter,
          OR: [
            { createdAt: { gte: dateRange.start, lte: dateRange.end } },
            { completedAt: { gte: dateRange.start, lte: dateRange.end } },
          ],
        },
        select: {
          status: true,
          createdAt: true,
          completedAt: true,
          deadline: true,
        },
      }),
      db.timeEntry.findMany({
        where: {
          organizationId,
          date: { gte: dateRange.start, lte: dateRange.end },
          ...(clientId ? { brief: { clientId } } : {}),
        },
        select: { hours: true, isBillable: true },
      }),
      clientId
        ? db.nPSResponse.findMany({
            where: {
              organizationId,
              clientId,
              createdAt: { gte: dateRange.start, lte: dateRange.end },
            },
            select: { score: true },
          })
        : Promise.resolve([]),
    ]);

    const created = briefs.filter(
      (b) => b.createdAt >= dateRange.start && b.createdAt <= dateRange.end
    );
    const completed = briefs.filter(
      (b) => b.status === "COMPLETED" && b.completedAt
    );

    // Calculate turnaround
    const turnarounds = completed
      .filter((b) => b.completedAt)
      .map((b) => differenceInDays(b.completedAt!, b.createdAt));
    const avgTurnaround =
      turnarounds.length > 0
        ? turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length
        : 0;

    // On-time rate
    const withDeadlines = completed.filter((b) => b.deadline);
    const onTime = withDeadlines.filter(
      (b) => b.completedAt && b.completedAt <= b.deadline!
    );
    const onTimeRate =
      withDeadlines.length > 0
        ? (onTime.length / withDeadlines.length) * 100
        : 100;

    // Hours
    const totalHours = timeEntries.reduce((s, e) => s + Number(e.hours), 0);
    const billableHours = timeEntries
      .filter((e) => e.isBillable)
      .reduce((s, e) => s + Number(e.hours), 0);

    // Client satisfaction
    const avgSatisfaction =
      npsResponses.length > 0
        ? npsResponses.reduce((s, r) => s + r.score, 0) / npsResponses.length
        : 0;

    // Revision rate (placeholder - revisionCount not tracked on Brief model)
    const revisionRate = 0;

    return {
      period: `${dateRange.start.toISOString().split("T")[0]} - ${
        dateRange.end.toISOString().split("T")[0]
      }`,
      briefsCreated: created.length,
      briefsCompleted: completed.length,
      avgTurnaroundDays: Math.round(avgTurnaround * 10) / 10,
      onTimeDeliveryRate: Math.round(onTimeRate),
      totalHours: Math.round(totalHours),
      billableHours: Math.round(billableHours),
      clientSatisfactionAvg: Math.round(avgSatisfaction * 10) / 10,
      revisionRate: Math.round(revisionRate * 100) / 100,
    };
  }

  private async getClientRealTimeMetrics(
    organizationId: string,
    clientId: string
  ): Promise<ClientRealTimeMetrics> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [active, pending, review, completedThisMonth, approvals] =
      await Promise.all([
        db.brief.count({
          where: {
            organizationId,
            clientId,
            status: { notIn: ["COMPLETED", "CANCELLED"] },
          },
        }),
        db.submissionApproval.count({
          where: {
            brief: { organizationId, clientId },
            status: "PENDING",
          },
        }),
        db.brief.count({
          where: { organizationId, clientId, status: "CLIENT_REVIEW" },
        }),
        db.brief.count({
          where: {
            organizationId,
            clientId,
            status: "COMPLETED",
            completedAt: { gte: startOfMonth },
          },
        }),
        db.submissionApproval.findMany({
          where: {
            brief: { organizationId, clientId },
            status: { not: "PENDING" },
            respondedAt: { not: null },
          },
          select: { createdAt: true, respondedAt: true },
        }),
      ]);

    // Calculate avg response time
    const responseTimes = approvals
      .filter((a) => a.respondedAt)
      .map((a) => (a.respondedAt!.getTime() - a.createdAt.getTime()) / 3600000);
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    return {
      activeBriefs: active,
      pendingApprovals: pending,
      inReview: review,
      completedThisMonth,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
    };
  }

  private async getBriefTypeBreakdown(
    organizationId: string,
    clientId: string,
    dateRange: DateRange
  ): Promise<BriefTypeBreakdown[]> {
    const briefs = await db.brief.findMany({
      where: {
        organizationId,
        clientId,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      select: {
        type: true,
        status: true,
        createdAt: true,
        completedAt: true,
        timeEntries: { select: { hours: true } },
      },
    });

    const byType = new Map<
      string,
      { count: number; turnarounds: number[]; hours: number }
    >();

    briefs.forEach((brief) => {
      if (!byType.has(brief.type)) {
        byType.set(brief.type, { count: 0, turnarounds: [], hours: 0 });
      }
      const data = byType.get(brief.type)!;
      data.count++;

      if (brief.completedAt) {
        data.turnarounds.push(differenceInDays(brief.completedAt, brief.createdAt));
      }

      data.hours += brief.timeEntries.reduce((s, e) => s + Number(e.hours), 0);
    });

    const total = briefs.length;

    return Array.from(byType.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      avgTurnaround:
        data.turnarounds.length > 0
          ? Math.round(
              (data.turnarounds.reduce((a, b) => a + b, 0) /
                data.turnarounds.length) *
                10
            ) / 10
          : 0,
      totalHours: Math.round(data.hours),
    }));
  }

  private async getMonthlyTrend(
    organizationId: string,
    clientId: string
  ): Promise<MonthlyTrendData[]> {
    const today = new Date();
    const months: MonthlyTrendData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const [briefs, timeEntries] = await Promise.all([
        db.brief.findMany({
          where: {
            organizationId,
            clientId,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          select: { deadline: true, completedAt: true },
        }),
        db.timeEntry.aggregate({
          where: {
            organizationId,
            brief: { clientId },
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { hours: true },
        }),
      ]);

      const withDeadlines = briefs.filter((b) => b.deadline && b.completedAt);
      const onTime = withDeadlines.filter((b) => b.completedAt! <= b.deadline!);
      const onTimeRate =
        withDeadlines.length > 0
          ? (onTime.length / withDeadlines.length) * 100
          : 100;

      months.push({
        month: monthStart.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        briefs: briefs.length,
        hours: Math.round(Number(timeEntries._sum.hours || 0)),
        onTimeRate: Math.round(onTimeRate),
      });
    }

    return months;
  }

  private async getTeamAllocation(
    organizationId: string,
    clientId: string,
    dateRange: DateRange
  ): Promise<TeamAllocationData[]> {
    const timeEntries = await db.timeEntry.findMany({
      where: {
        organizationId,
        brief: { clientId },
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      select: {
        hours: true,
        user: {
          select: { id: true, name: true, department: true },
        },
      },
    });

    const briefs = await db.brief.findMany({
      where: {
        organizationId,
        clientId,
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      select: { assigneeId: true },
    });

    const byUser = new Map<
      string,
      { name: string; department: string; hours: number; briefs: number }
    >();

    timeEntries.forEach((entry) => {
      const userId = entry.user.id;
      if (!byUser.has(userId)) {
        byUser.set(userId, {
          name: entry.user.name,
          department: entry.user.department || "Other",
          hours: 0,
          briefs: 0,
        });
      }
      byUser.get(userId)!.hours += Number(entry.hours);
    });

    briefs.forEach((brief) => {
      if (brief.assigneeId && byUser.has(brief.assigneeId)) {
        byUser.get(brief.assigneeId)!.briefs++;
      }
    });

    const totalHours = Array.from(byUser.values()).reduce(
      (s, u) => s + u.hours,
      0
    );

    return Array.from(byUser.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.name,
        department: data.department,
        briefsAssigned: data.briefs,
        hoursLogged: Math.round(data.hours * 10) / 10,
        percentageOfTotal:
          totalHours > 0 ? Math.round((data.hours / totalHours) * 100) : 0,
      }))
      .sort((a, b) => b.hoursLogged - a.hoursLogged);
  }

  private async calculateFactorCorrelations(
    organizationId: string,
    dateRange: DateRange
  ): Promise<FactorCorrelation[]> {
    // Analyze correlations between different factors
    const briefs = await db.brief.findMany({
      where: {
        organizationId,
        status: "COMPLETED",
        completedAt: { gte: dateRange.start, lte: dateRange.end },
      },
      select: {
        type: true,
        createdAt: true,
        completedAt: true,
        deadline: true,
        priority: true,
        timeEntries: { select: { hours: true } },
        assignee: { select: { department: true } },
      },
    });

    const correlations: FactorCorrelation[] = [];

    // Example correlations (simplified - real implementation would use statistical methods)
    // Turnaround vs Hours correlation
    const turnaroundHoursData = briefs.map((b) => ({
      turnaround: differenceInDays(b.completedAt!, b.createdAt),
      hours: b.timeEntries.reduce((s, e) => s + Number(e.hours), 0),
    }));

    if (turnaroundHoursData.length > 5) {
      correlations.push({
        factor1: "Turnaround Time",
        factor2: "Hours Logged",
        correlation: this.calculateCorrelation(
          turnaroundHoursData.map((d) => d.turnaround),
          turnaroundHoursData.map((d) => d.hours)
        ),
        sampleSize: turnaroundHoursData.length,
        significance: turnaroundHoursData.length > 30 ? "high" : "medium",
      });
    }

    // Note: Priority vs Revisions correlation removed - revisionCount not tracked on Brief model

    return correlations;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
  }

  private async identifyPerformanceDrivers(
    organizationId: string,
    dateRange: DateRange
  ): Promise<PerformanceDriver[]> {
    const [currentBriefs, previousBriefs] = await Promise.all([
      db.brief.findMany({
        where: {
          organizationId,
          status: "COMPLETED",
          completedAt: { gte: dateRange.start, lte: dateRange.end },
        },
        select: {
          createdAt: true,
          completedAt: true,
          deadline: true,
          assignee: { select: { department: true } },
        },
      }),
      db.brief.findMany({
        where: {
          organizationId,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(
              dateRange.start.getTime() -
                (dateRange.end.getTime() - dateRange.start.getTime())
            ),
            lt: dateRange.start,
          },
        },
        select: {
          createdAt: true,
          completedAt: true,
          deadline: true,
          assignee: { select: { department: true } },
        },
      }),
    ]);

    const drivers: PerformanceDriver[] = [];

    // Calculate on-time rate change
    const currentOnTime = currentBriefs.filter(
      (b) => b.deadline && b.completedAt! <= b.deadline
    ).length;
    const previousOnTime = previousBriefs.filter(
      (b) => b.deadline && b.completedAt! <= b.deadline
    ).length;

    const currentRate = currentBriefs.length > 0 ? currentOnTime / currentBriefs.length : 0;
    const previousRate = previousBriefs.length > 0 ? previousOnTime / previousBriefs.length : 0;

    drivers.push({
      factor: "On-Time Delivery",
      impact: Math.round(currentRate * 100),
      trend:
        currentRate > previousRate * 1.05
          ? "improving"
          : currentRate < previousRate * 0.95
          ? "declining"
          : "stable",
      recommendation:
        currentRate < 0.8
          ? "Consider adjusting deadline estimates or resource allocation"
          : undefined,
    });

    // Throughput
    const throughputChange =
      previousBriefs.length > 0
        ? ((currentBriefs.length - previousBriefs.length) / previousBriefs.length) *
          100
        : 0;

    drivers.push({
      factor: "Brief Throughput",
      impact: Math.round(throughputChange),
      trend:
        throughputChange > 5
          ? "improving"
          : throughputChange < -5
          ? "declining"
          : "stable",
    });

    return drivers;
  }

  private async analyzeBottlenecks(
    organizationId: string
  ): Promise<BottleneckData[]> {
    // Find briefs stuck in various stages
    const statusDurations = await db.brief.findMany({
      where: {
        organizationId,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      select: {
        status: true,
        updatedAt: true,
        client: { select: { name: true } },
      },
    });

    const byStatus = new Map<
      string,
      { count: number; totalWait: number; clients: Set<string> }
    >();

    const now = new Date();
    statusDurations.forEach((brief) => {
      if (!byStatus.has(brief.status)) {
        byStatus.set(brief.status, {
          count: 0,
          totalWait: 0,
          clients: new Set(),
        });
      }
      const data = byStatus.get(brief.status)!;
      data.count++;
      data.totalWait += (now.getTime() - brief.updatedAt.getTime()) / 3600000;
      data.clients.add(brief.client.name);
    });

    return Array.from(byStatus.entries())
      .map(([stage, data]) => ({
        stage,
        avgWaitTime: Math.round((data.totalWait / data.count) * 10) / 10,
        briefsStuck: data.count,
        impactedClients: Array.from(data.clients),
      }))
      .filter((b) => b.avgWaitTime > 24) // Only show if avg wait > 24 hours
      .sort((a, b) => b.avgWaitTime - a.avgWaitTime);
  }

  private async forecastCapacity(
    organizationId: string
  ): Promise<CapacityForecastData[]> {
    const today = new Date();
    const forecast: CapacityForecastData[] = [];

    // Get team capacity
    const users = await db.user.findMany({
      where: { organizationId, isActive: true },
      select: { weeklyCapacity: true },
    });
    const weeklyCapacity = users.reduce((s, u) => s + u.weeklyCapacity, 0);

    // Get average brief load from past weeks
    const pastBriefs = await db.brief.findMany({
      where: {
        organizationId,
        createdAt: { gte: subWeeks(today, 4) },
      },
      select: { createdAt: true },
    });

    const avgWeeklyBriefs = pastBriefs.length / 4;

    // Project next 4 weeks
    for (let week = 1; week <= 4; week++) {
      const projectedBriefs = Math.round(avgWeeklyBriefs * (1 + (week - 1) * 0.05)); // Slight growth
      const utilizationForecast = Math.round((projectedBriefs / weeklyCapacity) * 100);

      forecast.push({
        week: `Week ${week}`,
        projectedBriefs,
        availableCapacity: weeklyCapacity,
        utilizationForecast: Math.min(utilizationForecast, 150),
        risk:
          utilizationForecast > 90
            ? "high"
            : utilizationForecast > 70
            ? "medium"
            : "low",
      });
    }

    return forecast;
  }
}

export const externalAnalytics = new ExternalAnalyticsService();
