/**
 * GET /api/v1/leave/calendar - Team leave calendar view
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  parseFilters,
} from "@/lib/api";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(searchParams, [
      "startDate",
      "endDate",
      "department",
    ]);

    // Default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDate = filters.startDate ? new Date(filters.startDate) : startOfMonth;
    const endDate = filters.endDate ? new Date(filters.endDate) : endOfMonth;

    const where: Record<string, unknown> = {
      user: { organizationId: context.organizationId },
      status: "APPROVED",
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    };

    if (filters.department) {
      where.user = {
        organizationId: context.organizationId,
        department: filters.department,
      };
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalDays: true,
        isHalfDay: true,
        halfDayPeriod: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            department: true,
          },
        },
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    // Get public holidays in range
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    return success({
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      leaveRequests,
      holidays,
    });
  });
}
