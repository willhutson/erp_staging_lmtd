/**
 * GET /api/v1/time/reports/weekly - Weekly time summary
 * GET /api/v1/time/reports/user/:id - User time report
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  parseFilters,
} from "@/lib/api";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(searchParams, [
      "userId",
      "startDate",
      "endDate",
      "groupBy",
    ]);

    // Default to current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startDate = filters.startDate ? new Date(filters.startDate) : startOfWeek;
    const endDate = filters.endDate ? new Date(filters.endDate) : endOfWeek;

    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Non-admins can only see their own data
    if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(context.user.permissionLevel)) {
      where.userId = context.user.id;
    } else if (filters.userId) {
      where.userId = filters.userId;
    }

    // Get all entries in range
    const entries = await prisma.timeEntry.findMany({
      where,
      select: {
        id: true,
        date: true,
        hours: true,
        isBillable: true,
        isApproved: true,
        userId: true,
        briefId: true,
        projectId: true,
        user: {
          select: { id: true, name: true, department: true },
        },
        brief: {
          select: { id: true, briefNumber: true, title: true, clientId: true },
        },
        project: {
          select: { id: true, name: true, clientId: true },
        },
      },
    });

    type Entry = typeof entries[number];

    // Calculate summaries
    const totalHours = entries.reduce((sum: number, e: Entry) => sum + Number(e.hours), 0);
    const billableHours = entries
      .filter((e: Entry) => e.isBillable)
      .reduce((sum: number, e: Entry) => sum + Number(e.hours), 0);

    // Group by day
    const byDay: Record<string, number> = {};
    entries.forEach((e: Entry) => {
      const day = e.date.toISOString().split("T")[0];
      byDay[day] = (byDay[day] || 0) + Number(e.hours);
    });

    // Group by user (if multiple users)
    const byUser: Record<string, { name: string | null; hours: number }> = {};
    entries.forEach((e: Entry) => {
      if (!byUser[e.userId]) {
        byUser[e.userId] = { name: e.user.name, hours: 0 };
      }
      byUser[e.userId].hours += Number(e.hours);
    });

    // Group by brief
    const byBrief: Record<string, { title: string; hours: number }> = {};
    entries.forEach((e: Entry) => {
      if (e.briefId && e.brief) {
        if (!byBrief[e.briefId]) {
          byBrief[e.briefId] = { title: e.brief.title, hours: 0 };
        }
        byBrief[e.briefId].hours += Number(e.hours);
      }
    });

    return success({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        utilizationRate: totalHours > 0
          ? Math.round((billableHours / totalHours) * 100)
          : 0,
        entryCount: entries.length,
      },
      byDay,
      byUser: Object.values(byUser),
      byBrief: Object.values(byBrief),
    });
  });
}
