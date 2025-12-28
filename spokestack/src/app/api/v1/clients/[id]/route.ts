/**
 * GET /api/v1/clients/:id - Get client by ID
 * PATCH /api/v1/clients/:id - Update client
 * DELETE /api/v1/clients/:id - Archive client
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

const UpdateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  industry: z.string().max(100).optional().nullable(),
  isRetainer: z.boolean().optional(),
  retainerHours: z.number().min(0).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  companySize: z.enum(["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional().nullable(),
  accountManagerId: z.string().cuid().optional().nullable(),
  relationshipStatus: z.enum(["ACTIVE", "AT_RISK", "CHURNED", "DORMANT", "PAUSED"]).optional(),
  leadSource: z.enum([
    "REFERRAL", "WEBSITE", "SOCIAL_MEDIA", "EVENT",
    "COLD_OUTREACH", "RFP_PORTAL", "PARTNERSHIP", "OTHER"
  ]).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();

    const client = await prisma.client.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        industry: true,
        isRetainer: true,
        retainerHours: true,
        logoUrl: true,
        website: true,
        linkedIn: true,
        companySize: true,
        relationshipStatus: true,
        lifetimeValue: true,
        leadSource: true,
        notes: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        accountManager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        contacts: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            jobTitle: true,
            isPrimary: true,
            isDecisionMaker: true,
          },
          orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
        },
        _count: {
          select: {
            projects: true,
            briefs: true,
            contacts: true,
            activities: true,
          },
        },
      },
    });

    if (!client) {
      throw ApiError.notFound("Client");
    }

    return success(client);
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireTeamLead(context);

    const data = await validateBody(request, UpdateClientSchema);

    // Verify client exists in org
    const existing = await prisma.client.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Client");
    }

    // Validate account manager if provided
    if (data.accountManagerId) {
      const accountManager = await prisma.user.findFirst({
        where: {
          id: data.accountManagerId,
          organizationId: context.organizationId,
          isActive: true,
        },
      });

      if (!accountManager) {
        throw ApiError.badRequest("Invalid account manager");
      }
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        code: true,
        industry: true,
        isRetainer: true,
        retainerHours: true,
        logoUrl: true,
        website: true,
        linkedIn: true,
        companySize: true,
        relationshipStatus: true,
        isActive: true,
        updatedAt: true,
        accountManager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return success(updated);
  });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireTeamLead(context);

    // Verify client exists in org
    const existing = await prisma.client.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Client");
    }

    // Soft delete - archive instead of hard delete
    await prisma.client.update({
      where: { id },
      data: {
        isActive: false,
        relationshipStatus: "CHURNED",
        updatedAt: new Date(),
      },
    });

    return noContent();
  });
}
