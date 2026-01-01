/**
 * GET /api/v1/projects/:id/time - Get time entries for project
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  parseFilters,
  ApiError,
} from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: projectId } = await params;
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(searchParams, ["startDate", "endDate", "userId"]);

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: context.organizationId,
      },
      select: { id: true, name: true, budgetHours: true },
    });

    if (!project) {
      throw ApiError.notFound("Project");
    }

    const where: Record<string, unknown> = { projectId };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        (where.date as Record<string, unknown>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.date as Record<string, unknown>).lte = new Date(filters.endDate);
      }
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      orderBy: { date: "desc" },
      select: {
        id: true,
        description: true,
        date: true,
        hours: true,
        isBillable: true,
        isApproved: true,
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        brief: {
          select: { id: true, briefNumber: true, title: true },
        },
      },
    });

    type Entry = typeof timeEntries[number];

    // Calculate summary
    const totalHours = timeEntries.reduce(
      (sum: number, e: Entry) => sum + Number(e.hours),
      0
    );
    const billableHours = timeEntries
      .filter((e: Entry) => e.isBillable)
      .reduce((sum: number, e: Entry) => sum + Number(e.hours), 0);

    // Group by user
    const byUser: Record<string, { name: string | null; hours: number }> = {};
    timeEntries.forEach((e: Entry) => {
      if (!byUser[e.user.id]) {
        byUser[e.user.id] = { name: e.user.name, hours: 0 };
      }
      byUser[e.user.id].hours += Number(e.hours);
    });

    return success({
      project: {
        id: project.id,
        name: project.name,
        budgetHours: project.budgetHours,
      },
      entries: timeEntries,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        billableHours: Math.round(billableHours * 100) / 100,
        budgetUtilization: project.budgetHours
          ? Math.round((totalHours / project.budgetHours) * 100)
          : null,
        entryCount: timeEntries.length,
      },
      byUser: Object.entries(byUser).map(([id, data]) => ({ id, ...data })),
    });
  });
}
