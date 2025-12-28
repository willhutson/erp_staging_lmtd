/**
 * GET /api/v1/resources - Get team capacity and utilization
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  success,
  handleRoute,
  parseFilters,
} from "@/lib/api";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireTeamLead(context);

    const { searchParams } = new URL(request.url);
    const filters = parseFilters(searchParams, ["department", "week"]);

    // Determine date range
    let startOfWeek: Date;
    let endOfWeek: Date;

    if (filters.week) {
      // Parse ISO week (e.g., "2024-W01")
      const [year, week] = filters.week.split("-W");
      const jan4 = new Date(parseInt(year), 0, 4);
      const dayOfWeek = jan4.getDay() || 7;
      startOfWeek = new Date(jan4);
      startOfWeek.setDate(jan4.getDate() - dayOfWeek + 1 + (parseInt(week) - 1) * 7);
      startOfWeek.setHours(0, 0, 0, 0);
    } else {
      // Current week
      const now = new Date();
      startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
    }

    endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Build user filter
    const userWhere: Record<string, unknown> = {
      organizationId: context.organizationId,
      isActive: true,
    };
    if (filters.department) {
      userWhere.department = filters.department;
    }

    // Get all active team members
    const users = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        role: true,
        department: true,
        avatarUrl: true,
        weeklyCapacity: true,
        skills: true,
        isFreelancer: true,
      },
      orderBy: { name: "asc" },
    });

    type User = (typeof users)[number];

    // Get time entries for the week
    const timeEntries = await prisma.timeEntry.groupBy({
      by: ["userId"],
      where: {
        userId: { in: users.map((u: User) => u.id) },
        date: { gte: startOfWeek, lt: endOfWeek },
      },
      _sum: { hours: true },
    });

    type TimeEntry = (typeof timeEntries)[number];

    // Get active briefs count
    const briefCounts = await prisma.brief.groupBy({
      by: ["assigneeId"],
      where: {
        assigneeId: { in: users.map((u: User) => u.id) },
        status: { in: ["IN_PROGRESS", "APPROVED", "SUBMITTED"] },
      },
      _count: true,
    });

    type BriefCount = (typeof briefCounts)[number];

    // Get leave for the week
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId: { in: users.map((u: User) => u.id) },
        status: "APPROVED",
        OR: [
          { startDate: { gte: startOfWeek, lt: endOfWeek } },
          { endDate: { gte: startOfWeek, lt: endOfWeek } },
          {
            AND: [
              { startDate: { lte: startOfWeek } },
              { endDate: { gte: endOfWeek } },
            ],
          },
        ],
      },
      select: { userId: true, startDate: true, endDate: true },
    });

    type LeaveRequest = (typeof leaveRequests)[number];

    // Calculate days off for each user
    const userLeave: Record<string, number> = {};
    leaveRequests.forEach((leave: LeaveRequest) => {
      const start = new Date(Math.max(leave.startDate.getTime(), startOfWeek.getTime()));
      const end = new Date(Math.min(leave.endDate.getTime(), endOfWeek.getTime()));
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      userLeave[leave.userId] = (userLeave[leave.userId] || 0) + days;
    });

    // Merge data
    const team = users.map((user: User) => {
      const timeEntry = timeEntries.find((t: TimeEntry) => t.userId === user.id);
      const briefCount = briefCounts.find((b: BriefCount) => b.assigneeId === user.id);
      const daysOff = userLeave[user.id] || 0;

      const baseCapacity = user.weeklyCapacity || 40;
      const hoursPerDay = baseCapacity / 5;
      const adjustedCapacity = Math.max(0, baseCapacity - daysOff * hoursPerDay);
      const hoursLogged = Number(timeEntry?._sum.hours || 0);
      const utilization = adjustedCapacity > 0 ? (hoursLogged / adjustedCapacity) * 100 : 0;

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        department: user.department,
        avatarUrl: user.avatarUrl,
        skills: user.skills,
        isFreelancer: user.isFreelancer,
        capacity: {
          base: baseCapacity,
          adjusted: Math.round(adjustedCapacity),
          daysOff,
        },
        hoursLogged: Math.round(hoursLogged * 100) / 100,
        utilization: Math.round(utilization),
        activeBriefs: briefCount?._count || 0,
        status:
          utilization >= 100 ? "overallocated" :
          utilization >= 80 ? "high" :
          utilization >= 50 ? "good" : "available",
      };
    });

    // Calculate summary stats
    type TeamMember = (typeof team)[number];
    const totalCapacity = team.reduce((sum: number, m: TeamMember) => sum + m.capacity.adjusted, 0);
    const totalLogged = team.reduce((sum: number, m: TeamMember) => sum + m.hoursLogged, 0);
    const avgUtilization = totalCapacity > 0 ? (totalLogged / totalCapacity) * 100 : 0;

    const byDepartment: Record<string, { members: number; capacity: number; logged: number }> = {};
    team.forEach((m: TeamMember) => {
      const dept = m.department || "Other";
      if (!byDepartment[dept]) {
        byDepartment[dept] = { members: 0, capacity: 0, logged: 0 };
      }
      byDepartment[dept].members++;
      byDepartment[dept].capacity += m.capacity.adjusted;
      byDepartment[dept].logged += m.hoursLogged;
    });

    return success({
      week: {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString(),
      },
      team,
      summary: {
        teamSize: team.length,
        totalCapacity,
        totalLogged: Math.round(totalLogged * 100) / 100,
        avgUtilization: Math.round(avgUtilization),
        overallocated: team.filter((m: TeamMember) => m.status === "overallocated").length,
        available: team.filter((m: TeamMember) => m.status === "available").length,
        byDepartment,
      },
    });
  });
}
