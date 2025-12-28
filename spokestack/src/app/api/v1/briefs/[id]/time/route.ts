/**
 * GET /api/v1/briefs/:id/time - Get time entries for brief
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
    const { id: briefId } = await params;
    const context = await getAuthContext();

    // Verify brief belongs to org
    const brief = await prisma.brief.findFirst({
      where: {
        id: briefId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!brief) {
      throw ApiError.notFound("Brief");
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: { briefId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        description: true,
        date: true,
        hours: true,
        startTime: true,
        endTime: true,
        isBillable: true,
        isApproved: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Calculate totals
    const totalHours = timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    );
    const billableHours = timeEntries
      .filter((e) => e.isBillable)
      .reduce((sum, entry) => sum + Number(entry.hours), 0);

    return success({
      entries: timeEntries,
      summary: {
        totalHours,
        billableHours,
        entryCount: timeEntries.length,
      },
    });
  });
}
