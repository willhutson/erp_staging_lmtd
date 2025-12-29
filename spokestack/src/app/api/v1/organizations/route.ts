/**
 * GET /api/v1/organizations - Get current user's organization
 * PATCH /api/v1/organizations - Update organization settings (admin only)
 */

import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireAdmin,
  success,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  logo: z.string().url().optional().nullable(),
  logoMark: z.string().url().optional().nullable(),
  favicon: z.string().url().optional().nullable(),
  domain: z.string().max(255).optional().nullable(),
  settings: z.record(z.string(), z.unknown()).optional(),
  themeSettings: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
  }).optional(),
});

export async function GET() {
  return handleRoute(async () => {
    const context = await getAuthContext();

    const organization = await prisma.organization.findUnique({
      where: { id: context.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        logo: true,
        logoMark: true,
        favicon: true,
        settings: true,
        themeSettings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: { where: { isActive: true } },
            clients: { where: { isActive: true } },
            briefs: true,
            projects: true,
          },
        },
      },
    });

    if (!organization) {
      throw ApiError.notFound("Organization");
    }

    return success(organization);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireAdmin(context);

    const data = await validateBody(request, UpdateOrganizationSchema);

    // If domain is being updated, check uniqueness
    if (data.domain) {
      const existingDomain = await prisma.organization.findFirst({
        where: {
          domain: data.domain,
          id: { not: context.organizationId },
        },
      });

      if (existingDomain) {
        throw ApiError.conflict("Domain is already in use");
      }
    }

    const updated = await prisma.organization.update({
      where: { id: context.organizationId },
      data: {
        ...data,
        settings: data.settings as Prisma.InputJsonValue | undefined,
        themeSettings: data.themeSettings as Prisma.InputJsonValue | undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        logo: true,
        logoMark: true,
        favicon: true,
        settings: true,
        themeSettings: true,
        updatedAt: true,
      },
    });

    return success(updated);
  });
}
