/**
 * POST /api/v1/briefs/:id/assign - Assign brief to user
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  success,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const AssignBriefSchema = z.object({
  assigneeId: z.string().cuid(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireTeamLead(context);

    const { assigneeId } = await validateBody(request, AssignBriefSchema);

    const existing = await prisma.brief.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Brief");
    }

    // Verify assignee exists in org
    const assignee = await prisma.user.findFirst({
      where: {
        id: assigneeId,
        organizationId: context.organizationId,
        isActive: true,
      },
    });

    if (!assignee) {
      throw ApiError.badRequest("Invalid assignee");
    }

    const updated = await prisma.brief.update({
      where: { id },
      data: {
        assigneeId,
        assignedById: context.user.id,
        assignedAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        briefNumber: true,
        title: true,
        status: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        assignedBy: {
          select: { id: true, name: true },
        },
        assignedAt: true,
      },
    });

    return success(updated);
  });
}
