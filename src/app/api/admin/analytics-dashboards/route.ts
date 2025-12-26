import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiPaginated,
  apiError,
  parseRefineParams,
  buildOrderBy,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, AnalyticsDashboardType } from "@prisma/client";

// GET /api/admin/analytics-dashboards - List dashboards
export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause
    const where: Prisma.AnalyticsDashboardWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.type && { type: filters.type as AnalyticsDashboardType }),
      ...(filters.isPublic !== undefined && {
        isPublic: filters.isPublic === "true",
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [dashboards, total] = await Promise.all([
      db.analyticsDashboard.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          isPublic: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { widgets: true },
          },
        },
        orderBy: sort.length > 0 ? buildOrderBy(sort) : { name: "asc" },
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.analyticsDashboard.count({ where }),
    ]);

    return apiPaginated(dashboards, total, pagination);
  });
}

// POST /api/admin/analytics-dashboards - Create dashboard
const createDashboardSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  type: z.nativeEnum(AnalyticsDashboardType),
  isPublic: z.boolean().optional().default(false),
  ownerId: z.string().optional(),
  layout: z.array(z.unknown()).optional().default([]),
  defaultFilters: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check name uniqueness within organization
    const existing = await db.analyticsDashboard.findFirst({
      where: {
        organizationId: ctx.organizationId,
        name: data.name,
      },
    });

    if (existing) {
      return apiError("A dashboard with this name already exists", 409);
    }

    const dashboard = await db.analyticsDashboard.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        description: data.description,
        type: data.type,
        isPublic: data.isPublic,
        ownerId: data.ownerId || ctx.userId,
        layout: data.layout,
        defaultFilters: data.defaultFilters ?? Prisma.DbNull,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isPublic: true,
        createdAt: true,
      },
    });

    return apiSuccess(dashboard, 201);
  });
}
