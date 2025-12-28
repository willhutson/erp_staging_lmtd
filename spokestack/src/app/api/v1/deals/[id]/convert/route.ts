/**
 * POST /api/v1/deals/:id/convert - Convert won deal to client
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireLeadership,
  success,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const ConvertDealSchema = z.object({
  clientCode: z.string().min(1).max(10).optional(),
  industry: z.string().max(100).optional(),
  website: z.string().url().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id } = await params;
    const context = await getAuthContext();
    requireLeadership(context);

    const data = await validateBody(request, ConvertDealSchema);

    const deal = await prisma.deal.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!deal) {
      throw ApiError.notFound("Deal");
    }

    // Only allow conversion of WON deals
    if (deal.stage !== "WON") {
      throw ApiError.badRequest("Can only convert deals with WON status");
    }

    // Check if already converted
    if (deal.clientId) {
      throw ApiError.badRequest("Deal is already associated with a client");
    }

    // Check if already has a converted client
    const existingConversion = await prisma.client.findFirst({
      where: { convertedFromDealId: id },
    });
    if (existingConversion) {
      throw ApiError.badRequest("Deal has already been converted to a client");
    }

    // Generate client code if not provided
    let code = data.clientCode;
    if (!code) {
      const companyName = deal.companyName || deal.name;
      const baseCode = companyName
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 4)
        .toUpperCase();
      const count = await prisma.client.count({
        where: {
          organizationId: context.organizationId,
          code: { startsWith: baseCode },
        },
      });
      code = count > 0 ? `${baseCode}${count + 1}` : baseCode;
    }

    // Create the client from the deal
    const client = await prisma.client.create({
      data: {
        organizationId: context.organizationId,
        name: deal.companyName || deal.name,
        code,
        industry: data.industry,
        website: data.website,
        accountManagerId: deal.ownerId,
        convertedFromDealId: id,
        convertedAt: new Date(),
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        code: true,
        industry: true,
        website: true,
        status: true,
        createdAt: true,
        accountManager: {
          select: { id: true, name: true },
        },
      },
    });

    // Update deal with clientId reference
    await prisma.deal.update({
      where: { id },
      data: { clientId: client.id },
    });

    // Create initial contact if we have contact info
    if (deal.contactName || deal.contactEmail) {
      await prisma.clientContact.create({
        data: {
          clientId: client.id,
          name: deal.contactName || "Primary Contact",
          email: deal.contactEmail,
          isPrimary: true,
        },
      });
    }

    return success({
      message: "Deal successfully converted to client",
      client,
    });
  });
}
