/**
 * GET /api/v1/projects/:id/briefs - Get briefs for project
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

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: projectId } = await params;
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(searchParams, ["status"]);

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: context.organizationId,
      },
      select: { id: true, name: true },
    });

    if (!project) {
      throw ApiError.notFound("Project");
    }

    const where: Record<string, unknown> = { projectId };
    if (filters.status) where.status = filters.status;

    const briefs = await prisma.brief.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        briefNumber: true,
        type: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        estimatedHours: true,
        actualHours: true,
        createdAt: true,
        assignee: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Calculate summary
    type Brief = typeof briefs[number];
    const summary = {
      total: briefs.length,
      byStatus: briefs.reduce((acc: Record<string, number>, b: Brief) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      }, {}),
      estimatedHours: briefs.reduce(
        (sum: number, b: Brief) => sum + Number(b.estimatedHours || 0),
        0
      ),
      actualHours: briefs.reduce(
        (sum: number, b: Brief) => sum + Number(b.actualHours || 0),
        0
      ),
    };

    return success({
      project: { id: project.id, name: project.name },
      briefs,
      summary,
    });
  });
}
