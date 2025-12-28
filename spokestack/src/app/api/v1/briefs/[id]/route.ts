/**
 * GET /api/v1/briefs/:id - Get brief by ID
 * PATCH /api/v1/briefs/:id - Update brief
 * DELETE /api/v1/briefs/:id - Delete brief
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

const UpdateBriefSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  deadline: z.coerce.date().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  formData: z.record(z.string(), z.unknown()).optional(),
  qualityScore: z.number().min(0).max(100).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();

    const brief = await prisma.brief.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
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
        qualityScore: true,
        formData: true,
        aiSuggestions: true,
        createdAt: true,
        updatedAt: true,
        submittedAt: true,
        completedAt: true,
        client: {
          select: { id: true, name: true, code: true, logoUrl: true },
        },
        project: {
          select: { id: true, name: true, code: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true, department: true },
        },
        assignedBy: {
          select: { id: true, name: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!brief) {
      throw ApiError.notFound("Brief");
    }

    return success(brief);
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    const data = await validateBody(request, UpdateBriefSchema);

    const existing = await prisma.brief.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Brief");
    }

    const updateData = {
      ...data,
      formData: data.formData as unknown,
      updatedAt: new Date(),
    };

    const updated = await prisma.brief.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        briefNumber: true,
        type: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        estimatedHours: true,
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

    const existing = await prisma.brief.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Brief");
    }

    // Only allow deletion of draft briefs
    if (existing.status !== "DRAFT") {
      throw ApiError.badRequest("Only draft briefs can be deleted");
    }

    await prisma.brief.delete({ where: { id } });

    return noContent();
  });
}
