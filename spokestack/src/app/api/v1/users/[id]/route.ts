/**
 * GET /api/v1/users/:id - Get user by ID
 * PATCH /api/v1/users/:id - Update user
 * DELETE /api/v1/users/:id - Deactivate user
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  requireAdmin,
  canAccessResource,
  success,
  noContent,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: z.string().min(1).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  permissionLevel: z.enum(["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF", "FREELANCER"]).optional(),
  isFreelancer: z.boolean().optional(),
  weeklyCapacity: z.number().min(0).max(168).optional(),
  teamLeadId: z.string().cuid().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  skills: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  hourlyRate: z.number().min(0).optional().nullable(),
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

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        permissionLevel: true,
        isFreelancer: true,
        avatarUrl: true,
        phone: true,
        skills: true,
        weeklyCapacity: true,
        hourlyRate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        startDate: true,
        teamLead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teamMembers: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            briefsAssigned: true,
            timeEntries: true,
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound("User");
    }

    return success(user);
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();

    // Users can update their own basic profile, team leads can update their team
    const isSelf = id === context.user.id;

    if (!isSelf) {
      requireTeamLead(context);
    }

    const data = await validateBody(request, UpdateUserSchema);

    // Verify user exists in org
    const existing = await prisma.user.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("User");
    }

    // Only admins can change permission levels
    if (data.permissionLevel && context.user.permissionLevel !== "ADMIN") {
      throw ApiError.forbidden("Only admins can change permission levels");
    }

    // Only admins can deactivate users
    if (data.isActive === false && context.user.permissionLevel !== "ADMIN") {
      throw ApiError.forbidden("Only admins can deactivate users");
    }

    // Self-update restrictions
    if (isSelf) {
      // Can't change own permission level or active status
      delete data.permissionLevel;
      delete data.isActive;
      delete data.teamLeadId;
    }

    // Validate teamLeadId if provided
    if (data.teamLeadId) {
      const teamLead = await prisma.user.findFirst({
        where: {
          id: data.teamLeadId,
          organizationId: context.organizationId,
          permissionLevel: { in: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"] },
        },
      });

      if (!teamLead) {
        throw ApiError.badRequest("Invalid team lead");
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        permissionLevel: true,
        isFreelancer: true,
        avatarUrl: true,
        phone: true,
        skills: true,
        weeklyCapacity: true,
        isActive: true,
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
    requireAdmin(context);

    // Can't delete yourself
    if (id === context.user.id) {
      throw ApiError.badRequest("Cannot deactivate your own account");
    }

    // Verify user exists in org
    const existing = await prisma.user.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("User");
    }

    // Soft delete - deactivate instead of hard delete
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return noContent();
  });
}
