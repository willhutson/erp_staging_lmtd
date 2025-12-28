/**
 * GET /api/v1/projects/:id - Get project by ID
 * PATCH /api/v1/projects/:id - Update project
 * DELETE /api/v1/projects/:id - Delete project
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  success,
  noContent,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  type: z.enum(["RETAINER", "PROJECT", "PITCH", "INTERNAL"]).optional(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  budgetAmount: z.number().min(0).optional().nullable(),
  budgetHours: z.number().min(0).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();

    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        budgetAmount: true,
        budgetHours: true,
        budgetCurrency: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: { id: true, name: true, code: true, logoUrl: true },
        },
        _count: {
          select: {
            briefs: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!project) {
      throw ApiError.notFound("Project");
    }

    // Get time summary
    const timeAgg = await prisma.timeEntry.aggregate({
      where: { projectId: id },
      _sum: { hours: true },
    });

    return success({
      ...project,
      actualHours: Number(timeAgg._sum.hours || 0),
      budgetUtilization: project.budgetHours
        ? Math.round((Number(timeAgg._sum.hours || 0) / project.budgetHours) * 100)
        : null,
    });
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    const data = await validateBody(request, UpdateProjectSchema);

    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Project");
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        type: true,
        startDate: true,
        endDate: true,
        budgetAmount: true,
        budgetHours: true,
        updatedAt: true,
      },
    });

    return success(updated);
  });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireTeamLead(context);

    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      include: {
        _count: { select: { briefs: true, timeEntries: true } },
      },
    });

    if (!existing) {
      throw ApiError.notFound("Project");
    }

    // Only allow deletion if no briefs or time entries
    if (existing._count.briefs > 0 || existing._count.timeEntries > 0) {
      throw ApiError.badRequest(
        "Cannot delete project with existing briefs or time entries"
      );
    }

    await prisma.project.delete({ where: { id } });

    return noContent();
  });
}
