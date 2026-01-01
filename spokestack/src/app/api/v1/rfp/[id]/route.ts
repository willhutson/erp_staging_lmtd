/**
 * GET /api/v1/rfp/:id - Get RFP by ID
 * PATCH /api/v1/rfp/:id - Update RFP
 * DELETE /api/v1/rfp/:id - Delete RFP
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

const UpdateRFPSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  clientName: z.string().min(1).max(200).optional(),
  portal: z.string().max(100).optional().nullable(),
  status: z
    .enum(["VETTING", "ACTIVE", "AWAITING_REVIEW", "SUBMITTED", "CLOSED"])
    .optional(),
  winProbability: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().nullable(),
  dateReceived: z.coerce.date().optional().nullable(),
  deadline: z.coerce.date().optional(),
  estimatedValue: z.number().min(0).optional().nullable(),
  requirements: z.string().max(10000).optional().nullable(),
  bidBondRequired: z.boolean().optional(),
  notes: z.string().max(5000).optional().nullable(),
  outcome: z.enum(["WON", "LOST", "WITHDRAWN", "CANCELLED"]).optional().nullable(),
  outcomeNotes: z.string().max(2000).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    const rfp = await prisma.rFP.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      select: {
        id: true,
        name: true,
        clientName: true,
        rfpCode: true,
        portal: true,
        status: true,
        winProbability: true,
        dateReceived: true,
        deadline: true,
        estimatedValue: true,
        requirements: true,
        bidBondRequired: true,
        notes: true,
        outcome: true,
        outcomeNotes: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        submittedAt: true,
        subitems: {
          orderBy: { sortOrder: "asc" },
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
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            storageKey: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!rfp) {
      throw ApiError.notFound("RFP");
    }

    // Calculate progress
    const totalSubitems = rfp.subitems.length;
    const completedSubitems = rfp.subitems.filter(
      (s) => s.status === "COMPLETED"
    ).length;

    return success({
      ...rfp,
      progress: {
        total: totalSubitems,
        completed: completedSubitems,
        percentage: totalSubitems > 0
          ? Math.round((completedSubitems / totalSubitems) * 100)
          : 0,
      },
    });
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    const data = await validateBody(request, UpdateRFPSchema);

    const existing = await prisma.rFP.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("RFP");
    }

    // Set submittedAt when status changes to SUBMITTED
    const updateData: Record<string, unknown> = { ...data };
    if (data.status === "SUBMITTED" && existing.status !== "SUBMITTED") {
      updateData.submittedAt = new Date();
    }

    const updated = await prisma.rFP.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        clientName: true,
        rfpCode: true,
        portal: true,
        status: true,
        winProbability: true,
        dateReceived: true,
        deadline: true,
        estimatedValue: true,
        bidBondRequired: true,
        outcome: true,
        outcomeNotes: true,
        submittedAt: true,
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
    requireLeadership(context);

    const existing = await prisma.rFP.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("RFP");
    }

    // Only allow deletion if RFP is still in VETTING status
    if (existing.status !== "VETTING") {
      throw ApiError.badRequest(
        "Can only delete RFPs in VETTING status. Update status to CLOSED instead."
      );
    }

    await prisma.rFP.delete({ where: { id } });

    return noContent();
  });
}
