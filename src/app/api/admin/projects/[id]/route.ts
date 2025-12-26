import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { ProjectStatus, ProjectType } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/projects/[id] - Get single project
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "STAFF" }, async (ctx) => {
    const { id } = await context.params;

    const project = await db.project.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        briefs: {
          select: { id: true, title: true, briefNumber: true, status: true },
          take: 20,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { briefs: true, timeEntries: true },
        },
      },
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    return apiSuccess(project);
  });
}

// PATCH /api/admin/projects/[id] - Update project
const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).toUpperCase().optional(),
  type: z.nativeEnum(ProjectType).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  budgetHours: z.number().int().positive().nullable().optional(),
  budgetAmount: z.number().positive().nullable().optional(),
  description: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { id } = await context.params;

    // Verify project exists and belongs to org
    const existingProject = await db.project.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!existingProject) {
      return apiError("Project not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    const project = await db.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.type && { type: data.type }),
        ...(data.status && { status: data.status }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.budgetHours !== undefined && { budgetHours: data.budgetHours }),
        ...(data.budgetAmount !== undefined && {
          budgetAmount: data.budgetAmount,
        }),
        ...(data.description !== undefined && { description: data.description }),
      },
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
        createdAt: true,
        updatedAt: true,
        client: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(project);
  });
}

// DELETE /api/admin/projects/[id] - Archive project
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    const project = await db.project.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!project) {
      return apiError("Project not found", 404);
    }

    // Archive by setting status to ARCHIVED
    await db.project.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return apiSuccess({ id, deleted: true });
  });
}
