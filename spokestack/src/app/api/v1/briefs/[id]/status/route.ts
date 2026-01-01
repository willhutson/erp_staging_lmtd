/**
 * PATCH /api/v1/briefs/:id/status - Update brief status
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const UpdateStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SUBMITTED",
    "IN_REVIEW",
    "APPROVED",
    "IN_PROGRESS",
    "INTERNAL_REVIEW",
    "CLIENT_REVIEW",
    "REVISIONS",
    "COMPLETED",
    "CANCELLED",
  ]),
  notes: z.string().max(1000).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    const { status, notes } = await validateBody(request, UpdateStatusSchema);

    const existing = await prisma.brief.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Brief");
    }

    // Track status change
    const previousStatus = existing.status;

    // Update brief
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    // Set timestamps based on status
    if (status === "SUBMITTED" && !existing.submittedAt) {
      updateData.submittedAt = new Date();
    }
    if (status === "COMPLETED" && !existing.completedAt) {
      updateData.completedAt = new Date();
    }
    if (status === "REVISIONS") {
      updateData.revisionCount = existing.revisionCount + 1;
    }

    const updated = await prisma.brief.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        briefNumber: true,
        status: true,
        revisionCount: true,
        submittedAt: true,
        completedAt: true,
        updatedAt: true,
      },
    });

    // Record status history
    await prisma.briefStatusHistory.create({
      data: {
        briefId: id,
        fromStatus: previousStatus,
        toStatus: status,
        changedById: context.user.id,
        notes,
      },
    });

    return success(updated);
  });
}
