import { NextRequest } from 'next/server';
import { withApiAuth, apiSuccess, apiError } from '@/lib/api/middleware';
import { db } from '@/lib/db';
import { z } from 'zod';
import { BriefStatus, Priority } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/briefs/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withApiAuth(request, ['briefs:read'], async (ctx) => {
    const brief = await db.brief.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: {
        client: { select: { id: true, name: true, code: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        timeEntries: {
          select: { id: true, hours: true, date: true, description: true },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!brief) {
      return apiError('Brief not found', 404);
    }

    return apiSuccess(brief);
  });
}

// PATCH /api/v1/briefs/:id
const updateBriefSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.nativeEnum(BriefStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assigneeId: z.string().nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
  estimatedHours: z.number().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withApiAuth(request, ['briefs:write'], async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError('Invalid JSON body', 400);
    }

    const parsed = updateBriefSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(`Validation error: ${parsed.error.errors.map(e => e.message).join(', ')}`, 400);
    }

    const brief = await db.brief.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!brief) {
      return apiError('Brief not found', 404);
    }

    const data = parsed.data;

    // Verify assignee belongs to org (if provided)
    if (data.assigneeId) {
      const assignee = await db.user.findFirst({
        where: { id: data.assigneeId, organizationId: ctx.organizationId },
      });
      if (!assignee) {
        return apiError('Assignee not found', 404);
      }
    }

    // Track status change for history
    const statusChanged = data.status && data.status !== brief.status;

    const updated = await db.brief.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.status && { status: data.status }),
        ...(data.priority && { priority: data.priority }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null
        }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null
        }),
        ...(data.formData && { formData: data.formData }),
        ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours }),
        // Update completedAt if status changed to COMPLETED
        ...(data.status === BriefStatus.COMPLETED && { completedAt: new Date() }),
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // Create status history entry
    if (statusChanged && data.status) {
      await db.briefStatusHistory.create({
        data: {
          briefId: id,
          fromStatus: brief.status,
          toStatus: data.status,
          changedById: ctx.apiKeyId,
        },
      });
    }

    // TODO: Emit webhook event for brief.updated

    return apiSuccess(updated);
  });
}

// DELETE /api/v1/briefs/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return withApiAuth(request, ['briefs:delete'], async (ctx) => {
    const brief = await db.brief.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!brief) {
      return apiError('Brief not found', 404);
    }

    await db.brief.delete({ where: { id } });

    // TODO: Emit webhook event for brief.deleted

    return apiSuccess({ deleted: true, id });
  });
}
