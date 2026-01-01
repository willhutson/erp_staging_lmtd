/**
 * GET /api/v1/deals/:id - Get deal by ID
 * PATCH /api/v1/deals/:id - Update deal
 * DELETE /api/v1/deals/:id - Delete deal
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

const UpdateDealSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  clientId: z.string().cuid().optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  stage: z.enum(["LEAD", "PITCH", "NEGOTIATION", "WON", "LOST"]).optional(),
  value: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  probability: z.number().min(0).max(100).optional().nullable(),
  source: z
    .enum([
      "WEBSITE",
      "REFERRAL",
      "SOCIAL_MEDIA",
      "EVENT",
      "COLD_OUTREACH",
      "RFP_PORTAL",
      "PARTNERSHIP",
      "OTHER",
    ])
    .optional()
    .nullable(),
  expectedCloseDate: z.coerce.date().optional().nullable(),
  lostReason: z.string().max(500).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  ownerId: z.string().cuid().optional(),
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

    const deal = await prisma.deal.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        contactName: true,
        contactEmail: true,
        stage: true,
        value: true,
        currency: true,
        probability: true,
        source: true,
        expectedCloseDate: true,
        actualCloseDate: true,
        lostReason: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: { id: true, name: true, code: true, logoUrl: true },
        },
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        convertedToClient: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!deal) {
      throw ApiError.notFound("Deal");
    }

    return success(deal);
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    const data = await validateBody(request, UpdateDealSchema);

    const existing = await prisma.deal.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Deal");
    }

    // If changing clientId, verify client belongs to org
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: data.clientId,
          organizationId: context.organizationId,
        },
      });
      if (!client) {
        throw ApiError.notFound("Client");
      }
    }

    // If changing ownerId, verify user belongs to org
    if (data.ownerId) {
      const owner = await prisma.user.findFirst({
        where: {
          id: data.ownerId,
          organizationId: context.organizationId,
        },
      });
      if (!owner) {
        throw ApiError.notFound("Owner");
      }
    }

    // Set actualCloseDate when stage changes to WON or LOST
    const updateData: Record<string, unknown> = { ...data };
    if (
      (data.stage === "WON" || data.stage === "LOST") &&
      existing.stage !== "WON" &&
      existing.stage !== "LOST"
    ) {
      updateData.actualCloseDate = new Date();
    }

    const updated = await prisma.deal.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        companyName: true,
        stage: true,
        value: true,
        currency: true,
        probability: true,
        expectedCloseDate: true,
        actualCloseDate: true,
        lostReason: true,
        updatedAt: true,
        client: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true },
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
    requireLeadership(context);

    const existing = await prisma.deal.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw ApiError.notFound("Deal");
    }

    // Only allow deletion if deal is in LEAD stage
    if (existing.stage !== "LEAD") {
      throw ApiError.badRequest(
        "Can only delete deals in LEAD stage. Update stage to LOST instead."
      );
    }

    await prisma.deal.delete({ where: { id } });

    return noContent();
  });
}
