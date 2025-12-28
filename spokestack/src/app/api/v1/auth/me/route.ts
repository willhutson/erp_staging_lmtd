/**
 * GET /api/v1/auth/me - Get current authenticated user
 * PATCH /api/v1/auth/me - Update current user profile
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

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(50).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  skills: z.array(z.string()).optional(),
});

export async function GET() {
  return handleRoute(async () => {
    const { user, organizationId } = await getAuthContext();

    // Get full user profile
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
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
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        teamLead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notificationPreference: {
          select: {
            emailEnabled: true,
            pushEnabled: true,
            briefUpdates: true,
            timeReminders: true,
            leaveUpdates: true,
          },
        },
      },
    });

    if (!profile) {
      throw ApiError.notFound("Profile");
    }

    return success(profile);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const { user } = await getAuthContext();
    const data = await validateBody(request, UpdateProfileSchema);

    const updated = await prisma.user.update({
      where: { id: user.id },
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
        avatarUrl: true,
        phone: true,
        skills: true,
      },
    });

    return success(updated);
  });
}
