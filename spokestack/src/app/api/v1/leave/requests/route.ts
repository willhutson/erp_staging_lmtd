/**
 * GET /api/v1/leave/requests - List leave requests
 * POST /api/v1/leave/requests - Submit a leave request
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  created,
  handleRoute,
  validateBody,
  parsePagination,
  parseFilters,
  paginated,
  ApiError,
} from "@/lib/api";

const CreateLeaveRequestSchema = z.object({
  leaveTypeId: z.string().cuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isHalfDay: z.boolean().default(false),
  halfDayPeriod: z.enum(["MORNING", "AFTERNOON"]).optional().nullable(),
  reason: z.string().max(1000).optional().nullable(),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const { page, limit, skip } = parsePagination(searchParams);

    const filters = parseFilters(searchParams, [
      "userId",
      "status",
      "leaveTypeId",
      "startDate",
      "endDate",
    ]);

    const where: Record<string, unknown> = {};

    // Non-managers can only see their own requests
    if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(context.user.permissionLevel)) {
      where.userId = context.user.id;
    } else if (filters.userId) {
      where.userId = filters.userId;
    }

    // Filter by users in this org
    where.user = { organizationId: context.organizationId };

    if (filters.status) where.status = filters.status;
    if (filters.leaveTypeId) where.leaveTypeId = filters.leaveTypeId;

    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) {
        (where.startDate as Record<string, Date>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.startDate as Record<string, Date>).lte = new Date(filters.endDate);
      }
    }

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
            select: { id: true, name: true, avatarUrl: true, department: true },
          },
          leaveType: {
            select: { id: true, name: true, code: true },
          },
          reviewedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return paginated(requests, { page, limit, total });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const data = await validateBody(request, CreateLeaveRequestSchema);

    // Validate leave type exists
    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id: data.leaveTypeId,
        organizationId: context.organizationId,
      },
    });

    if (!leaveType) {
      throw ApiError.notFound("Leave type");
    }

    // Validate dates
    if (data.endDate < data.startDate) {
      throw ApiError.badRequest("End date must be after start date");
    }

    // Calculate days
    const diffTime = data.endDate.getTime() - data.startDate.getTime();
    let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (data.isHalfDay) {
      days = 0.5;
    }

    // Check balance
    const year = data.startDate.getFullYear();
    const balance = await prisma.leaveBalance.findFirst({
      where: {
        userId: context.user.id,
        leaveTypeId: data.leaveTypeId,
        year,
      },
    });

    const available = balance
      ? balance.entitlement + balance.carriedOver - balance.used - balance.pending
      : 0;

    if (days > available) {
      throw ApiError.badRequest(`Insufficient leave balance. Available: ${available} days`);
    }

    // Check for overlapping requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId: context.user.id,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw ApiError.conflict("You already have a leave request for this period");
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        ...data,
        userId: context.user.id,
        totalDays: days,
        status: leaveType.requiresApproval ? "PENDING" : "APPROVED",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalDays: true,
        isHalfDay: true,
        reason: true,
        status: true,
        createdAt: true,
        leaveType: {
          select: { id: true, name: true },
        },
      },
    });

    // Update pending balance
    if (leaveType.requiresApproval) {
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: context.user.id,
            leaveTypeId: data.leaveTypeId,
            year,
          },
        },
        update: {
          pending: { increment: days },
        },
        create: {
          userId: context.user.id,
          leaveTypeId: data.leaveTypeId,
          year,
          entitlement: leaveType.defaultDays,
          used: 0,
          pending: days,
          carriedOver: 0,
        },
      });
    } else {
      // Auto-approved, update used directly
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: context.user.id,
            leaveTypeId: data.leaveTypeId,
            year,
          },
        },
        update: {
          used: { increment: days },
        },
        create: {
          userId: context.user.id,
          leaveTypeId: data.leaveTypeId,
          year,
          entitlement: leaveType.defaultDays,
          used: days,
          pending: 0,
          carriedOver: 0,
        },
      });
    }

    return created(leaveRequest);
  });
}
