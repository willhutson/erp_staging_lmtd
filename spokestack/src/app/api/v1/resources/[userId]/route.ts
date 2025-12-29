/**
 * GET /api/v1/resources/:userId - Get detailed resource view for a team member
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  success,
  handleRoute,
  parseFilters,
  ApiError,
} from "@/lib/api";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { userId } = await params;
    const context = await getAuthContext();
    requireTeamLead(context);

    const { searchParams } = new URL(request.url);
    const filters = parseFilters(searchParams, ["startDate", "endDate"]);

    // Verify user belongs to org
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: context.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        weeklyCapacity: true,
        skills: true,
        isFreelancer: true,
        isActive: true,
      },
    });

    if (!user) {
      throw ApiError.notFound("Team member");
    }

    // Default to current week if no dates specified
    let startDate: Date;
    let endDate: Date;

    if (filters.startDate && filters.endDate) {
      startDate = new Date(filters.startDate);
      endDate = new Date(filters.endDate);
    } else {
      const now = new Date();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    }

    // Get time entries
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        date: { gte: startDate, lt: endDate },
      },
      select: {
        id: true,
        date: true,
        hours: true,
        description: true,
        isBillable: true,
        project: {
          select: { id: true, name: true, code: true },
        },
        brief: {
          select: { id: true, briefNumber: true, title: true },
        },
      },
      orderBy: { date: "desc" },
    });

    type TimeEntry = (typeof timeEntries)[number];

    // Get active briefs
    const activeBriefs = await prisma.brief.findMany({
      where: {
        assigneeId: userId,
        status: { in: ["IN_PROGRESS", "APPROVED", "SUBMITTED"] },
      },
      select: {
        id: true,
        briefNumber: true,
        title: true,
        type: true,
        status: true,
        priority: true,
        deadline: true,
        estimatedHours: true,
        project: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { deadline: "asc" },
    });

    // Get upcoming leave
    const upcomingLeave = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: "APPROVED",
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        reason: true,
        leaveType: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { startDate: "asc" },
      take: 5,
    });

    // Calculate stats
    const totalHours = timeEntries.reduce(
      (sum: number, e: TimeEntry) => sum + Number(e.hours),
      0
    );
    const billableHours = timeEntries
      .filter((e: TimeEntry) => e.isBillable)
      .reduce((sum: number, e: TimeEntry) => sum + Number(e.hours), 0);

    type Brief = (typeof activeBriefs)[number];
    const totalEstimated = activeBriefs.reduce(
      (sum: number, b: Brief) => sum + Number(b.estimatedHours || 0),
      0
    );

    // Group time by day
    const byDay: Record<string, number> = {};
    timeEntries.forEach((e: TimeEntry) => {
      const day = e.date.toISOString().split("T")[0];
      byDay[day] = (byDay[day] || 0) + Number(e.hours);
    });

    // Group time by project
    const byProject: Record<string, { name: string; hours: number }> = {};
    timeEntries.forEach((e: TimeEntry) => {
      if (e.project) {
        if (!byProject[e.project.id]) {
          byProject[e.project.id] = { name: e.project.name, hours: 0 };
        }
        byProject[e.project.id].hours += Number(e.hours);
      }
    });

    const capacity = user.weeklyCapacity || 40;
    const utilization = capacity > 0 ? (totalHours / capacity) * 100 : 0;

    return success({
      user: {
        ...user,
        weeklyCapacity: capacity,
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      timeEntries,
      activeBriefs,
      upcomingLeave,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        billablePercentage: totalHours > 0
          ? Math.round((billableHours / totalHours) * 100)
          : 0,
        capacity,
        utilization: Math.round(utilization),
        activeBriefCount: activeBriefs.length,
        totalEstimatedHours: totalEstimated,
        byDay,
        byProject: Object.entries(byProject).map(([id, data]) => ({
          id,
          ...data,
          hours: Math.round(data.hours * 100) / 100,
        })),
      },
    });
  });
}
