/**
 * GET /api/v1/clients/:id/projects - List client projects
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  parsePagination,
  parseFilters,
  paginated,
  ApiError,
} from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: clientId } = await params;
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!client) {
      throw ApiError.notFound("Client");
    }

    const { page, limit, skip } = parsePagination(searchParams);
    const filters = parseFilters(searchParams, ["status", "type"]);

    const where: Record<string, unknown> = { clientId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
          budgetHours: true,
          budgetAmount: true,
          description: true,
          createdAt: true,
          _count: {
            select: {
              briefs: true,
              timeEntries: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return paginated(projects, { page, limit, total });
  });
}
