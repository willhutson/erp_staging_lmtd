/**
 * GET /api/v1/projects - List projects
 * POST /api/v1/projects - Create a new project
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

const CreateProjectSchema = z.object({
  clientId: z.string().cuid(),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(["RETAINER", "PROJECT", "PITCH", "INTERNAL"]).default("PROJECT"),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  budgetAmount: z.number().min(0).optional().nullable(),
  budgetHours: z.number().min(0).optional().nullable(),
  budgetCurrency: z.string().length(3).default("USD"),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const { page, limit, skip } = parsePagination(searchParams);

    const { field: sortField, order: sortOrder } = parseSort(
      searchParams,
      ["name", "createdAt", "startDate", "endDate", "status", "type"],
      "createdAt",
      "desc"
    );

    const filters = parseFilters(searchParams, [
      "status",
      "type",
      "clientId",
      "search",
    ]);

    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
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
          budgetAmount: true,
          budgetHours: true,
          budgetCurrency: true,
          createdAt: true,
          client: {
            select: { id: true, name: true, code: true, logoUrl: true },
          },
          _count: {
            select: { briefs: true, timeEntries: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return paginated(projects, { page, limit, total });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const data = await validateBody(request, CreateProjectSchema);

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

    // Generate project code if not provided
    let code = data.code;
    if (!code) {
      const clientCode = client.code || client.name.substring(0, 3).toUpperCase();
      const count = await prisma.project.count({
        where: { clientId: data.clientId },
      });
      code = `${clientCode}-P${String(count + 1).padStart(3, "0")}`;
    }

    const project = await prisma.project.create({
      data: {
        ...data,
        code,
        organizationId: context.organizationId,
        status: "DRAFT",
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        budgetAmount: true,
        budgetHours: true,
        createdAt: true,
        client: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return created(project);
  });
}
