/**
 * GET /api/v1/team/:id - Get team member profile
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  ApiError,
} from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();

    const member = await prisma.user.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        permissionLevel: true,
        isFreelancer: true,
        avatarUrl: true,
        phone: true,
        skills: true,
        weeklyCapacity: true,
        isActive: true,
        startDate: true,
        createdAt: true,
        teamLead: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        teamMembers: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            role: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            briefsAssigned: { where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } },
            timeEntries: true,
          },
        },
      },
    });

    if (!member) {
      throw ApiError.notFound("Team member");
    }

    // Get recent activity summary (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTime = await prisma.timeEntry.aggregate({
      where: {
        userId: id,
        date: { gte: thirtyDaysAgo },
      },
      _sum: { hours: true },
    });

    const completedBriefs = await prisma.brief.count({
      where: {
        assigneeId: id,
        status: "COMPLETED",
        completedAt: { gte: thirtyDaysAgo },
      },
    });

    return success({
      ...member,
      recentActivity: {
        hoursLogged: Number(recentTime._sum.hours || 0),
        briefsCompleted: completedBriefs,
        period: "30 days",
      },
    });
  });
}
