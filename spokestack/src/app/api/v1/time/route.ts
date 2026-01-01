/**
 * GET /api/v1/time - List time entries
 * POST /api/v1/time - Log a time entry
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  created,
  handleRoute,
  validateBody,
  parsePagination,
  parseFilters,
  paginated,
  ApiError,
} from "@/lib/api";

const CreateTimeEntrySchema = z.object({
  briefId: z.string().cuid().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  date: z.coerce.date(),
  hours: z.number().min(0.25).max(24),
  startTime: z.coerce.date().optional().nullable(),
  endTime: z.coerce.date().optional().nullable(),
  isBillable: z.boolean().default(true),
});

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const { page, limit, skip } = parsePagination(searchParams);

    const filters = parseFilters(searchParams, [
      "userId",
      "briefId",
      "projectId",
      "startDate",
      "endDate",
      "isBillable",
      "isApproved",
    ]);

    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
    };

    // Non-admins can only see their own entries
    if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(context.user.permissionLevel)) {
      where.userId = context.user.id;
    } else if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.briefId) where.briefId = filters.briefId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.isBillable !== undefined) {
      where.isBillable = filters.isBillable === "true";
    }
    if (filters.isApproved !== undefined) {
      where.isApproved = filters.isApproved === "true";
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        (where.date as Record<string, Date>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.date as Record<string, Date>).lte = new Date(filters.endDate);
      }
    }

    const [entries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          description: true,
          date: true,
          hours: true,
          startTime: true,
          endTime: true,
          isRunning: true,
          isBillable: true,
          isApproved: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
          brief: {
            select: { id: true, briefNumber: true, title: true },
          },
          project: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.timeEntry.count({ where }),
    ]);

    return paginated(entries, { page, limit, total });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const data = await validateBody(request, CreateTimeEntrySchema);

    // Validate brief if provided
    if (data.briefId) {
      const brief = await prisma.brief.findFirst({
        where: {
          id: data.briefId,
          organizationId: context.organizationId,
        },
      });

      if (!brief) {
        throw ApiError.notFound("Brief");
      }

      // Auto-set projectId from brief if not provided
      if (!data.projectId && brief.projectId) {
        data.projectId = brief.projectId;
      }
    }

    // Validate project if provided
    if (data.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: data.projectId,
          organizationId: context.organizationId,
        },
      });

      if (!project) {
        throw ApiError.notFound("Project");
      }
    }

    const entry = await prisma.timeEntry.create({
      data: {
        ...data,
        organizationId: context.organizationId,
        userId: context.user.id,
      },
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
        brief: {
          select: { id: true, briefNumber: true, title: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    // Update brief actual hours if linked
    if (data.briefId) {
      const totalHours = await prisma.timeEntry.aggregate({
        where: { briefId: data.briefId },
        _sum: { hours: true },
      });

      await prisma.brief.update({
        where: { id: data.briefId },
        data: { actualHours: totalHours._sum.hours },
      });
    }

    return created(entry);
  });
}
