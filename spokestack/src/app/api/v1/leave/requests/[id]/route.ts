/**
 * GET /api/v1/leave/requests/:id - Get leave request details
 * PATCH /api/v1/leave/requests/:id - Update request (cancel)
 * POST /api/v1/leave/requests/:id/approve - Approve request
 * POST /api/v1/leave/requests/:id/reject - Reject request
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

const ReviewRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id,
        user: { organizationId: context.organizationId },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalDays: true,
        isHalfDay: true,
        halfDayPeriod: true,
        reason: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        reviewNotes: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            department: true,
            role: true,
          },
        },
        leaveType: {
          select: { id: true, name: true, code: true, isPaid: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!leaveRequest) {
      throw ApiError.notFound("Leave request");
    }

    // Non-managers can only see their own requests
    if (
      leaveRequest.user.id !== context.user.id &&
      !["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(context.user.permissionLevel)
    ) {
      throw ApiError.forbidden();
    }

    return success(leaveRequest);
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id,
        user: { organizationId: context.organizationId },
      },
      include: {
        leaveType: true,
      },
    });

    if (!leaveRequest) {
      throw ApiError.notFound("Leave request");
    }

    // Only owner can cancel, and only if pending
    if (leaveRequest.userId !== context.user.id) {
      throw ApiError.forbidden("Only the requester can cancel");
    }

    if (leaveRequest.status !== "PENDING") {
      throw ApiError.badRequest("Only pending requests can be cancelled");
    }

    // Cancel the request
    await prisma.leaveRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Note: No balance adjustment needed - pending requests don't affect balance
    // Balance is only updated when a request is approved

    return noContent();
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireTeamLead(context);

    const { action, notes } = await validateBody(request, ReviewRequestSchema);

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id,
        user: { organizationId: context.organizationId },
      },
      include: {
        leaveType: true,
      },
    });

    if (!leaveRequest) {
      throw ApiError.notFound("Leave request");
    }

    if (leaveRequest.status !== "PENDING") {
      throw ApiError.badRequest("Only pending requests can be reviewed");
    }

    const year = leaveRequest.startDate.getFullYear();

    if (action === "approve") {
      // Approve the request
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedById: context.user.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
      });

      // Update used balance when approved
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: leaveRequest.userId,
            leaveTypeId: leaveRequest.leaveTypeId,
            year,
          },
        },
        update: {
          used: { increment: Number(leaveRequest.totalDays) },
        },
        create: {
          userId: leaveRequest.userId,
          leaveTypeId: leaveRequest.leaveTypeId,
          year,
          entitlement: leaveRequest.leaveType.defaultDays,
          used: Number(leaveRequest.totalDays),
          carriedOver: 0,
        },
      });

      return success({ status: "APPROVED", message: "Leave request approved" });
    } else {
      // Reject the request
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          reviewedById: context.user.id,
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
      });

      // No balance adjustment needed for rejected requests

      return success({ status: "REJECTED", message: "Leave request rejected" });
    }
  });
}
