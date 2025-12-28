/**
 * PATCH /api/v1/rfp/:id/subitems/:subitemId - Update sub-item
 * DELETE /api/v1/rfp/:id/subitems/:subitemId - Delete sub-item
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireLeadership,
  success,
  noContent,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const UpdateSubitemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

interface RouteParams {
  params: Promise<{ id: string; subitemId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: rfpId, subitemId } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    const data = await validateBody(request, UpdateSubitemSchema);

    // Verify RFP belongs to org
    const rfp = await prisma.rFP.findFirst({
      where: {
        id: rfpId,
        organizationId: context.organizationId,
      },
    });

    if (!rfp) {
      throw ApiError.notFound("RFP");
    }

    // Verify subitem exists
    const existing = await prisma.rFPSubitem.findFirst({
      where: {
        id: subitemId,
        rfpId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Sub-item");
    }

    // If assigneeId provided, verify user exists in org
    if (data.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: data.assigneeId,
          organizationId: context.organizationId,
        },
      });
      if (!assignee) {
        throw ApiError.notFound("Assignee");
      }
    }

    // Set completedAt when status changes to COMPLETED
    const updateData: Record<string, unknown> = { ...data };
    if (data.status === "COMPLETED" && existing.status !== "COMPLETED") {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== "COMPLETED") {
      updateData.completedAt = null;
    }

    const updated = await prisma.rFPSubitem.update({
      where: { id: subitemId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        assigneeId: true,
        dueDate: true,
        sortOrder: true,
        completedAt: true,
      },
    });

    return success(updated);
  });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: rfpId, subitemId } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    // Verify RFP belongs to org
    const rfp = await prisma.rFP.findFirst({
      where: {
        id: rfpId,
        organizationId: context.organizationId,
      },
    });

    if (!rfp) {
      throw ApiError.notFound("RFP");
    }

    // Verify subitem exists
    const existing = await prisma.rFPSubitem.findFirst({
      where: {
        id: subitemId,
        rfpId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Sub-item");
    }

    await prisma.rFPSubitem.delete({ where: { id: subitemId } });

    return noContent();
  });
}
