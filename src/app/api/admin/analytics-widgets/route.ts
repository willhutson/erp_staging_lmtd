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
import { Prisma, AnalyticsWidgetType, ChartType } from "@prisma/client";

// GET /api/admin/analytics-widgets - List widgets
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause - widgets belong to dashboards which have organizationId
    const where: Prisma.AnalyticsWidgetWhereInput = {
      dashboard: {
        organizationId: ctx.organizationId,
      },
      ...(filters.dashboardId && { dashboardId: filters.dashboardId }),
      ...(filters.type && { type: filters.type as AnalyticsWidgetType }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { metric: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [widgets, total] = await Promise.all([
      db.analyticsWidget.findMany({
        where,
        select: {
          id: true,
          dashboardId: true,
          name: true,
          type: true,
          chartType: true,
          size: true,
          metric: true,
          timeRange: true,
          createdAt: true,
          updatedAt: true,
          dashboard: {
            select: { id: true, name: true },
          },
        },
        orderBy: sort.length > 0 ? buildOrderBy(sort) : { name: "asc" },
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.analyticsWidget.count({ where }),
    ]);

    return apiPaginated(widgets, total, pagination);
  });
}

// POST /api/admin/analytics-widgets - Create widget
const createWidgetSchema = z.object({
  dashboardId: z.string().min(1),
  name: z.string().min(2).max(100),
  type: z.nativeEnum(AnalyticsWidgetType),
  chartType: z.nativeEnum(ChartType).optional(),
  size: z.string().optional().default("medium"),
  position: z.unknown().optional(),
  metric: z.string().min(1),
  dimensions: z.array(z.string()).optional().default([]),
  filters: z.unknown().optional(),
  timeRange: z.string().optional(),
  refreshInterval: z.number().int().positive().optional(),
  compareWith: z.string().optional(),
  thresholds: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createWidgetSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Verify dashboard exists and belongs to org
    const dashboard = await db.analyticsDashboard.findFirst({
      where: {
        id: data.dashboardId,
        organizationId: ctx.organizationId,
      },
    });

    if (!dashboard) {
      return apiError("Dashboard not found", 404);
    }

    const widget = await db.analyticsWidget.create({
      data: {
        dashboardId: data.dashboardId,
        name: data.name,
        type: data.type,
        chartType: data.chartType,
        size: data.size,
        position: (data.position ?? Prisma.DbNull) as Prisma.InputJsonValue,
        metric: data.metric,
        dimensions: data.dimensions,
        filters: (data.filters ?? Prisma.DbNull) as Prisma.InputJsonValue,
        timeRange: data.timeRange,
        refreshInterval: data.refreshInterval,
        compareWith: data.compareWith,
        thresholds: (data.thresholds ?? Prisma.DbNull) as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        dashboardId: true,
        name: true,
        type: true,
        size: true,
        metric: true,
        createdAt: true,
      },
    });

    return apiSuccess(widget, 201);
  });
}
