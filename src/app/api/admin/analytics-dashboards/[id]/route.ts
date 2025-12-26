import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, AnalyticsDashboardType } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/analytics-dashboards/[id] - Get single dashboard
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { id } = await context.params;

    const dashboard = await db.analyticsDashboard.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        widgets: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { widgets: true },
        },
      },
    });

    if (!dashboard) {
      return apiError("Dashboard not found", 404);
    }

    return apiSuccess(dashboard);
  });
}

// PATCH /api/admin/analytics-dashboards/[id] - Update dashboard
const updateDashboardSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(AnalyticsDashboardType).optional(),
  isPublic: z.boolean().optional(),
  ownerId: z.string().nullable().optional(),
  layout: z.array(z.unknown()).optional(),
  defaultFilters: z.unknown().nullable().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    // Verify dashboard exists and belongs to org
    const existing = await db.analyticsDashboard.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!existing) {
      return apiError("Dashboard not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check name uniqueness if changing
    if (data.name && data.name !== existing.name) {
      const nameTaken = await db.analyticsDashboard.findFirst({
        where: {
          organizationId: ctx.organizationId,
          name: data.name,
          NOT: { id },
        },
      });
      if (nameTaken) {
        return apiError("A dashboard with this name already exists", 409);
      }
    }

    const updateData: Prisma.AnalyticsDashboardUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.ownerId !== undefined) {
      updateData.ownerId = data.ownerId;
    }
    if (data.layout) updateData.layout = data.layout;
    if (data.defaultFilters !== undefined) {
      updateData.defaultFilters = data.defaultFilters === null ? Prisma.DbNull : data.defaultFilters;
    }

    const dashboard = await db.analyticsDashboard.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        isPublic: true,
        ownerId: true,
        layout: true,
        defaultFilters: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess(dashboard);
  });
}

// DELETE /api/admin/analytics-dashboards/[id] - Delete dashboard
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const dashboard = await db.analyticsDashboard.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: {
        _count: { select: { widgets: true } },
      },
    });

    if (!dashboard) {
      return apiError("Dashboard not found", 404);
    }

    // Delete cascade will handle widgets
    await db.analyticsDashboard.delete({
      where: { id },
    });

    return apiSuccess({ id, deleted: true, widgetsDeleted: dashboard._count.widgets });
  });
}
