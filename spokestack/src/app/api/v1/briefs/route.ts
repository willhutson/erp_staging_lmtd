/**
 * GET /api/v1/briefs - List briefs
 * POST /api/v1/briefs - Create a new brief
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
  parseSort,
  parseFilters,
  paginated,
  ApiError,
} from "@/lib/api";

const CreateBriefSchema = z.object({
  clientId: z.string().cuid(),
  projectId: z.string().cuid().optional().nullable(),
  type: z.enum([
    "VIDEO_SHOOT",
    "VIDEO_EDIT",
    "DESIGN",
    "COPYWRITING_EN",
    "COPYWRITING_AR",
    "PAID_MEDIA",
    "REPORT",
  ]),
  title: z.string().min(1).max(500),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  deadline: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  formData: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const { page, limit, skip } = parsePagination(searchParams);

    const { field: sortField, order: sortOrder } = parseSort(
      searchParams,
      ["title", "createdAt", "deadline", "priority", "status", "type"],
      "createdAt",
      "desc"
    );

    const filters = parseFilters(searchParams, [
      "status",
      "type",
      "priority",
      "clientId",
      "projectId",
      "assigneeId",
      "createdById",
      "search",
    ]);

    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.priority) where.priority = filters.priority;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.createdById) where.createdById = filters.createdById;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { briefNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [briefs, total] = await Promise.all([
      prisma.brief.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          briefNumber: true,
          type: true,
          title: true,
          status: true,
          priority: true,
          deadline: true,
          startDate: true,
          endDate: true,
          estimatedHours: true,
          actualHours: true,
          revisionCount: true,
          createdAt: true,
          client: {
            select: { id: true, name: true, code: true, logoUrl: true },
          },
          project: {
            select: { id: true, name: true, code: true },
          },
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.brief.count({ where }),
    ]);

    return paginated(briefs, { page, limit, total });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const data = await validateBody(request, CreateBriefSchema);

    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        organizationId: context.organizationId,
      },
    });

    if (!client) {
      throw ApiError.notFound("Client");
    }

    // Verify project if provided
    if (data.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: data.projectId,
          organizationId: context.organizationId,
          clientId: data.clientId,
        },
      });

      if (!project) {
        throw ApiError.notFound("Project");
      }
    }

    // Verify assignee if provided
    if (data.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assigneeId,
          organizationId: context.organizationId,
          isActive: true,
        },
      });

      if (!assignee) {
        throw ApiError.badRequest("Invalid assignee");
      }
    }

    // Generate brief number
    const count = await prisma.brief.count({
      where: { organizationId: context.organizationId },
    });
    const briefNumber = `BRF-${String(count + 1).padStart(5, "0")}`;

    const brief = await prisma.brief.create({
      data: {
        ...data,
        briefNumber,
        organizationId: context.organizationId,
        createdById: context.user.id,
        status: "DRAFT",
        assignedById: data.assigneeId ? context.user.id : null,
        assignedAt: data.assigneeId ? new Date() : null,
        formData: data.formData || {},
      },
      select: {
        id: true,
        briefNumber: true,
        type: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        createdAt: true,
        client: {
          select: { id: true, name: true, code: true },
        },
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    return created(brief);
  });
}
