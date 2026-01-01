/**
 * GET /api/v1/resources/departments - Get department-level capacity overview
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  success,
  handleRoute,
  parseFilters,
} from "@/lib/api";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireTeamLead(context);

    const { searchParams } = new URL(request.url);
    const filters = parseFilters(searchParams, ["week"]);

    // Determine date range
    let startOfWeek: Date;
    let endOfWeek: Date;

    if (filters.week) {
      const [year, week] = filters.week.split("-W");
      const jan4 = new Date(parseInt(year), 0, 4);
      const dayOfWeek = jan4.getDay() || 7;
      startOfWeek = new Date(jan4);
      startOfWeek.setDate(jan4.getDate() - dayOfWeek + 1 + (parseInt(week) - 1) * 7);
      startOfWeek.setHours(0, 0, 0, 0);
    } else {
      const now = new Date();
      startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
    }

    endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get all active users with department info
    const users = await prisma.user.findMany({
      where: {
        organizationId: context.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        department: true,
        weeklyCapacity: true,
      },
    });

    type User = (typeof users)[number];

    // Get time entries grouped by user
    const timeEntries = await prisma.timeEntry.groupBy({
      by: ["userId"],
      where: {
        userId: { in: users.map((u: User) => u.id) },
        date: { gte: startOfWeek, lt: endOfWeek },
      },
      _sum: { hours: true },
    });

    type TimeEntry = (typeof timeEntries)[number];

    // Get active briefs count by assignee
    const briefCounts = await prisma.brief.groupBy({
      by: ["assigneeId"],
      where: {
        assigneeId: { in: users.map((u: User) => u.id) },
        status: { in: ["IN_PROGRESS", "APPROVED", "SUBMITTED"] },
      },
      _count: true,
    });

    type BriefCount = (typeof briefCounts)[number];

    // Build department data
    const departments: Record<
      string,
      {
        members: number;
        capacity: number;
        logged: number;
        activeBriefs: number;
        userIds: string[];
      }
    > = {};

    users.forEach((user: User) => {
      const dept = user.department || "Other";
      if (!departments[dept]) {
        departments[dept] = {
          members: 0,
          capacity: 0,
          logged: 0,
          activeBriefs: 0,
          userIds: [],
        };
      }

      departments[dept].members++;
      departments[dept].capacity += user.weeklyCapacity || 40;
      departments[dept].userIds.push(user.id);

      const timeEntry = timeEntries.find((t: TimeEntry) => t.userId === user.id);
      if (timeEntry) {
        departments[dept].logged += Number(timeEntry._sum.hours || 0);
      }

      const briefCount = briefCounts.find((b: BriefCount) => b.assigneeId === user.id);
      if (briefCount) {
        departments[dept].activeBriefs += briefCount._count;
      }
    });

    // Calculate utilization and format response
    type DeptEntry = [string, { members: number; capacity: number; logged: number; activeBriefs: number }];
    const result = Object.entries(departments).map(([name, data]: DeptEntry) => ({
      name,
      members: data.members,
      capacity: data.capacity,
      logged: Math.round(data.logged * 100) / 100,
      utilization: data.capacity > 0
        ? Math.round((data.logged / data.capacity) * 100)
        : 0,
      activeBriefs: data.activeBriefs,
      status:
        data.capacity > 0 && data.logged / data.capacity >= 1
          ? "overallocated"
          : data.capacity > 0 && data.logged / data.capacity >= 0.8
          ? "high"
          : data.capacity > 0 && data.logged / data.capacity >= 0.5
          ? "good"
          : "available",
    }));

    // Sort by utilization descending
    result.sort((a, b) => b.utilization - a.utilization);

    // Overall summary
    const totalCapacity = result.reduce((sum, d) => sum + d.capacity, 0);
    const totalLogged = result.reduce((sum, d) => sum + d.logged, 0);

    return success({
      week: {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString(),
      },
      departments: result,
      summary: {
        totalDepartments: result.length,
        totalMembers: users.length,
        totalCapacity,
        totalLogged: Math.round(totalLogged * 100) / 100,
        avgUtilization: totalCapacity > 0
          ? Math.round((totalLogged / totalCapacity) * 100)
          : 0,
      },
    });
  });
}
