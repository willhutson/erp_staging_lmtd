/**
 * Internal Analytics Service
 * Calculates team performance, resource utilization, and operational metrics
 */

import { db } from "@/lib/db";
import { startOfWeek } from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface MetricResult {
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: "up" | "down" | "flat";
}

export interface TeamMemberMetrics {
  userId: string;
  name: string;
  department: string;
  briefsCompleted: number;
  briefsInProgress: number;
  hoursLogged: number;
  utilizationRate: number;
  avgTurnaroundDays: number;
  onTimeRate: number;
}

export interface DepartmentMetrics {
  department: string;
  teamSize: number;
  briefsCompleted: number;
  totalHours: number;
  avgUtilization: number;
  briefsPerMember: number;
}

class InternalAnalyticsService {
  /**
   * Get overview metrics for the organization
   */
  async getOverviewMetrics(
    organizationId: string,
    dateRange: DateRange
  ): Promise<Record<string, MetricResult>> {
    const previousRange = this.getPreviousPeriod(dateRange);

    const [current, previous] = await Promise.all([
      this.calculatePeriodMetrics(organizationId, dateRange),
      this.calculatePeriodMetrics(organizationId, previousRange),
    ]);

    return {
      totalBriefs: this.compareMetrics(current.totalBriefs, previous.totalBriefs),
      completedBriefs: this.compareMetrics(current.completedBriefs, previous.completedBriefs),
      avgTurnaround: this.compareMetrics(current.avgTurnaround, previous.avgTurnaround, false),
      onTimeRate: this.compareMetrics(current.onTimeRate, previous.onTimeRate),
      totalHours: this.compareMetrics(current.totalHours, previous.totalHours),
      utilizationRate: this.compareMetrics(current.utilizationRate, previous.utilizationRate),
      activeClients: this.compareMetrics(current.activeClients, previous.activeClients),
      revenueHours: this.compareMetrics(current.revenueHours, previous.revenueHours),
    };
  }

  /**
   * Get team performance leaderboard
   */
  async getTeamPerformance(
    organizationId: string,
    dateRange: DateRange
  ): Promise<TeamMemberMetrics[]> {
    const users = await db.user.findMany({
      where: {
        organizationId,
        isActive: true,
        permissionLevel: { in: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"] },
      },
      select: {
        id: true,
        name: true,
        department: true,
        weeklyCapacity: true,
      },
    });

    const metrics = await Promise.all(
      users.map(async (user) => {
        const [briefs, timeEntries] = await Promise.all([
          db.brief.findMany({
            where: {
              assigneeId: user.id,
              updatedAt: { gte: dateRange.start, lte: dateRange.end },
            },
            select: {
              id: true,
              status: true,
              deadline: true,
              completedAt: true,
              createdAt: true,
            },
          }),
          db.timeEntry.findMany({
            where: {
              userId: user.id,
              date: { gte: dateRange.start, lte: dateRange.end },
            },
            select: { hours: true },
          }),
        ]);

        const completed = briefs.filter((b) => b.status === "COMPLETED");
        const inProgress = briefs.filter((b) =>
          ["IN_PROGRESS", "INTERNAL_REVIEW", "CLIENT_REVIEW"].includes(b.status)
        );

        const totalHours = timeEntries.reduce(
          (sum, e) => sum + Number(e.hours),
          0
        );

        // Calculate weeks in range
        const weeks = Math.ceil(
          (dateRange.end.getTime() - dateRange.start.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );
        const expectedHours = weeks * user.weeklyCapacity;
        const utilizationRate = expectedHours > 0
          ? (totalHours / expectedHours) * 100
          : 0;

        // Calculate avg turnaround
        const turnarounds = completed
          .filter((b) => b.completedAt)
          .map((b) => {
            const start = b.createdAt.getTime();
            const end = b.completedAt!.getTime();
            return (end - start) / (24 * 60 * 60 * 1000);
          });
        const avgTurnaround = turnarounds.length > 0
          ? turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length
          : 0;

        // On-time rate
        const withDeadlines = completed.filter((b) => b.deadline);
        const onTime = withDeadlines.filter(
          (b) => b.completedAt && b.completedAt <= b.deadline!
        );
        const onTimeRate = withDeadlines.length > 0
          ? (onTime.length / withDeadlines.length) * 100
          : 100;

        return {
          userId: user.id,
          name: user.name,
          department: user.department,
          briefsCompleted: completed.length,
          briefsInProgress: inProgress.length,
          hoursLogged: Math.round(totalHours * 10) / 10,
          utilizationRate: Math.round(utilizationRate),
          avgTurnaroundDays: Math.round(avgTurnaround * 10) / 10,
          onTimeRate: Math.round(onTimeRate),
        };
      })
    );

    return metrics.sort((a, b) => b.briefsCompleted - a.briefsCompleted);
  }

  /**
   * Get department breakdown
   */
  async getDepartmentMetrics(
    organizationId: string,
    dateRange: DateRange
  ): Promise<DepartmentMetrics[]> {
    const teamMetrics = await this.getTeamPerformance(organizationId, dateRange);

    const byDepartment = new Map<string, TeamMemberMetrics[]>();
    teamMetrics.forEach((m) => {
      const dept = m.department || "Other";
      if (!byDepartment.has(dept)) {
        byDepartment.set(dept, []);
      }
      byDepartment.get(dept)!.push(m);
    });

    const result: DepartmentMetrics[] = [];
    byDepartment.forEach((members, department) => {
      const totalBriefs = members.reduce((s, m) => s + m.briefsCompleted, 0);
      const totalHours = members.reduce((s, m) => s + m.hoursLogged, 0);
      const avgUtil = members.reduce((s, m) => s + m.utilizationRate, 0) / members.length;

      result.push({
        department,
        teamSize: members.length,
        briefsCompleted: totalBriefs,
        totalHours: Math.round(totalHours),
        avgUtilization: Math.round(avgUtil),
        briefsPerMember: Math.round((totalBriefs / members.length) * 10) / 10,
      });
    });

    return result.sort((a, b) => b.briefsCompleted - a.briefsCompleted);
  }

  /**
   * Get brief throughput over time
   */
  async getBriefThroughput(
    organizationId: string,
    dateRange: DateRange,
    granularity: "day" | "week" | "month" = "day"
  ): Promise<Array<{ date: string; created: number; completed: number }>> {
    const briefs = await db.brief.findMany({
      where: {
        organizationId,
        OR: [
          { createdAt: { gte: dateRange.start, lte: dateRange.end } },
          { completedAt: { gte: dateRange.start, lte: dateRange.end } },
        ],
      },
      select: {
        createdAt: true,
        completedAt: true,
      },
    });

    // Group by granularity
    const buckets = new Map<string, { created: number; completed: number }>();

    briefs.forEach((brief) => {
      const createdKey = this.getDateKey(brief.createdAt, granularity);
      const completedKey = brief.completedAt
        ? this.getDateKey(brief.completedAt, granularity)
        : null;

      if (brief.createdAt >= dateRange.start && brief.createdAt <= dateRange.end) {
        if (!buckets.has(createdKey)) {
          buckets.set(createdKey, { created: 0, completed: 0 });
        }
        buckets.get(createdKey)!.created++;
      }

      if (completedKey && brief.completedAt! >= dateRange.start && brief.completedAt! <= dateRange.end) {
        if (!buckets.has(completedKey)) {
          buckets.set(completedKey, { created: 0, completed: 0 });
        }
        buckets.get(completedKey)!.completed++;
      }
    });

    return Array.from(buckets.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get capacity utilization heatmap
   */
  async getCapacityHeatmap(
    organizationId: string,
    dateRange: DateRange
  ): Promise<Array<{ userId: string; name: string; data: Array<{ date: string; hours: number; capacity: number }> }>> {
    const users = await db.user.findMany({
      where: {
        organizationId,
        isActive: true,
        permissionLevel: { in: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"] },
      },
      select: {
        id: true,
        name: true,
        weeklyCapacity: true,
      },
    });

    const timeEntries = await db.timeEntry.findMany({
      where: {
        organizationId,
        date: { gte: dateRange.start, lte: dateRange.end },
      },
      select: {
        userId: true,
        date: true,
        hours: true,
      },
    });

    // Group by user and day
    const byUserDay = new Map<string, Map<string, number>>();
    timeEntries.forEach((entry) => {
      const dateKey = entry.date.toISOString().split("T")[0];
      const userKey = entry.userId;

      if (!byUserDay.has(userKey)) {
        byUserDay.set(userKey, new Map());
      }
      const userMap = byUserDay.get(userKey)!;
      userMap.set(dateKey, (userMap.get(dateKey) || 0) + Number(entry.hours));
    });

    return users.map((user) => {
      const userEntries = byUserDay.get(user.id) || new Map();
      const dailyCapacity = user.weeklyCapacity / 5; // Assume 5-day week

      const data: Array<{ date: string; hours: number; capacity: number }> = [];
      const current = new Date(dateRange.start);
      while (current <= dateRange.end) {
        const dateKey = current.toISOString().split("T")[0];
        data.push({
          date: dateKey,
          hours: userEntries.get(dateKey) || 0,
          capacity: dailyCapacity,
        });
        current.setDate(current.getDate() + 1);
      }

      return { userId: user.id, name: user.name, data };
    });
  }

  // Private helpers

  private async calculatePeriodMetrics(organizationId: string, dateRange: DateRange) {
    const [briefs, timeEntries, clients, users] = await Promise.all([
      db.brief.findMany({
        where: {
          organizationId,
          createdAt: { gte: dateRange.start, lte: dateRange.end },
        },
        select: {
          status: true,
          deadline: true,
          completedAt: true,
          createdAt: true,
        },
      }),
      db.timeEntry.findMany({
        where: {
          organizationId,
          date: { gte: dateRange.start, lte: dateRange.end },
        },
        select: { hours: true, isBillable: true },
      }),
      db.client.findMany({
        where: {
          organizationId,
          briefs: {
            some: {
              createdAt: { gte: dateRange.start, lte: dateRange.end },
            },
          },
        },
        select: { id: true },
      }),
      db.user.findMany({
        where: { organizationId, isActive: true },
        select: { weeklyCapacity: true },
      }),
    ]);

    const completed = briefs.filter((b) => b.status === "COMPLETED");
    const totalHours = timeEntries.reduce((s, e) => s + Number(e.hours), 0);
    const billableHours = timeEntries
      .filter((e) => e.isBillable)
      .reduce((s, e) => s + Number(e.hours), 0);

    // Turnaround
    const turnarounds = completed
      .filter((b) => b.completedAt)
      .map((b) => (b.completedAt!.getTime() - b.createdAt.getTime()) / (24 * 60 * 60 * 1000));
    const avgTurnaround = turnarounds.length > 0
      ? turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length
      : 0;

    // On-time
    const withDeadlines = completed.filter((b) => b.deadline);
    const onTime = withDeadlines.filter((b) => b.completedAt && b.completedAt <= b.deadline!);
    const onTimeRate = withDeadlines.length > 0
      ? (onTime.length / withDeadlines.length) * 100
      : 100;

    // Utilization
    const weeks = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const totalCapacity = users.reduce((s, u) => s + u.weeklyCapacity * weeks, 0);
    const utilizationRate = totalCapacity > 0 ? (totalHours / totalCapacity) * 100 : 0;

    return {
      totalBriefs: briefs.length,
      completedBriefs: completed.length,
      avgTurnaround,
      onTimeRate,
      totalHours,
      utilizationRate,
      activeClients: clients.length,
      revenueHours: billableHours,
    };
  }

  private getPreviousPeriod(range: DateRange): DateRange {
    const duration = range.end.getTime() - range.start.getTime();
    return {
      start: new Date(range.start.getTime() - duration),
      end: new Date(range.start.getTime() - 1),
    };
  }

  private compareMetrics(
    current: number,
    previous: number,
    _higherIsBetter = true
  ): MetricResult {
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    let trend: "up" | "down" | "flat" = "flat";
    if (Math.abs(changePercent) > 1) {
      trend = change > 0 ? "up" : "down";
    }

    return {
      value: Math.round(current * 100) / 100,
      previousValue: Math.round(previous * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 10) / 10,
      trend,
    };
  }

  private getDateKey(date: Date, granularity: "day" | "week" | "month"): string {
    switch (granularity) {
      case "day":
        return date.toISOString().split("T")[0];
      case "week":
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        return weekStart.toISOString().split("T")[0];
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
  }
}

export const internalAnalytics = new InternalAnalyticsService();
