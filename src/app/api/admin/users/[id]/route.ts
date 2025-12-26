import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] - Get single user
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { id } = await context.params;

    const user = await db.user.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        teamLead: { select: { id: true, name: true, email: true } },
        teamMembers: { select: { id: true, name: true, email: true } },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess(user);
  });
}

// PATCH /api/admin/users/[id] - Update user
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(100).optional(),
  department: z.string().min(1).optional(),
  permissionLevel: z
    .enum(["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF", "FREELANCER"])
    .optional(),
  isFreelancer: z.boolean().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  teamLeadId: z.string().nullable().optional(),
  weeklyCapacity: z.number().int().min(0).max(80).optional(),
  hourlyRate: z.number().positive().nullable().optional(),
  skills: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    // Verify user exists and belongs to org
    const existingUser = await db.user.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!existingUser) {
      return apiError("User not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check email uniqueness if changing
    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await db.user.findFirst({
        where: {
          organizationId: ctx.organizationId,
          email: data.email,
          NOT: { id },
        },
      });
      if (emailTaken) {
        return apiError("A user with this email already exists", 409);
      }
    }

    // Verify team lead belongs to org
    if (data.teamLeadId) {
      const teamLead = await db.user.findFirst({
        where: { id: data.teamLeadId, organizationId: ctx.organizationId },
      });
      if (!teamLead) {
        return apiError("Team lead not found", 404);
      }
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.department && { department: data.department }),
        ...(data.permissionLevel && { permissionLevel: data.permissionLevel }),
        ...(data.isFreelancer !== undefined && {
          isFreelancer: data.isFreelancer,
        }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.teamLeadId !== undefined && { teamLeadId: data.teamLeadId }),
        ...(data.weeklyCapacity !== undefined && {
          weeklyCapacity: data.weeklyCapacity,
        }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.skills && { skills: data.skills }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        permissionLevel: true,
        isFreelancer: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess(user);
  });
}

// DELETE /api/admin/users/[id] - Deactivate user (soft delete)
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    // Prevent self-deletion
    if (id === ctx.userId) {
      return apiError("You cannot deactivate your own account", 400);
    }

    const user = await db.user.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Soft delete - set isActive to false
    await db.user.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ id, deleted: true });
  });
}
