import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, AnalyticsWidgetType, ChartType } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/analytics-widgets/[id] - Get single widget
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { id } = await context.params;

    const widget = await db.analyticsWidget.findFirst({
      where: {
        id,
        dashboard: {
          organizationId: ctx.organizationId,
        },
      },
      include: {
        dashboard: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    if (!widget) {
      return apiError("Widget not found", 404);
    }

    return apiSuccess(widget);
  });
}

// PATCH /api/admin/analytics-widgets/[id] - Update widget
const updateWidgetSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.nativeEnum(AnalyticsWidgetType).optional(),
  chartType: z.nativeEnum(ChartType).nullable().optional(),
  size: z.string().optional(),
  position: z.unknown().nullable().optional(),
  metric: z.string().min(1).optional(),
  dimensions: z.array(z.string()).optional(),
  filters: z.unknown().nullable().optional(),
  timeRange: z.string().nullable().optional(),
  refreshInterval: z.number().int().positive().nullable().optional(),
  compareWith: z.string().nullable().optional(),
  thresholds: z.unknown().nullable().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    // Verify widget exists and belongs to org
    const existing = await db.analyticsWidget.findFirst({
      where: {
        id,
        dashboard: {
          organizationId: ctx.organizationId,
        },
      },
    });

    if (!existing) {
      return apiError("Widget not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateWidgetSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    const updateData: Prisma.AnalyticsWidgetUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.chartType !== undefined) {
      updateData.chartType = data.chartType;
    }
    if (data.size) updateData.size = data.size;
    if (data.position !== undefined) {
      updateData.position = (data.position === null ? Prisma.DbNull : data.position) as Prisma.InputJsonValue;
    }
    if (data.metric) updateData.metric = data.metric;
    if (data.dimensions) updateData.dimensions = data.dimensions;
    if (data.filters !== undefined) {
      updateData.filters = (data.filters === null ? Prisma.DbNull : data.filters) as Prisma.InputJsonValue;
    }
    if (data.timeRange !== undefined) updateData.timeRange = data.timeRange;
    if (data.refreshInterval !== undefined) updateData.refreshInterval = data.refreshInterval;
    if (data.compareWith !== undefined) updateData.compareWith = data.compareWith;
    if (data.thresholds !== undefined) {
      updateData.thresholds = (data.thresholds === null ? Prisma.DbNull : data.thresholds) as Prisma.InputJsonValue;
    }

    const widget = await db.analyticsWidget.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        dashboardId: true,
        name: true,
        type: true,
        chartType: true,
        size: true,
        position: true,
        metric: true,
        dimensions: true,
        filters: true,
        timeRange: true,
        refreshInterval: true,
        compareWith: true,
        thresholds: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess(widget);
  });
}

// DELETE /api/admin/analytics-widgets/[id] - Delete widget
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    const widget = await db.analyticsWidget.findFirst({
      where: {
        id,
        dashboard: {
          organizationId: ctx.organizationId,
        },
      },
    });

    if (!widget) {
      return apiError("Widget not found", 404);
    }

    await db.analyticsWidget.delete({
      where: { id },
    });

    return apiSuccess({ id, deleted: true });
  });
}
