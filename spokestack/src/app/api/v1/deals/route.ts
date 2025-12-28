/**
 * GET /api/v1/deals - List deals/pipeline
 * POST /api/v1/deals - Create a new deal
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireLeadership,
  success,
  created,
  handleRoute,
  validateBody,
  parsePagination,
  parseSort,
  parseFilters,
  paginated,
} from "@/lib/api";

const CreateDealSchema = z.object({
  name: z.string().min(1).max(200),
  clientId: z.string().cuid().optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  value: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).default("AED"),
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
  notes: z.string().max(5000).optional().nullable(),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireLeadership(context);

    const { searchParams } = new URL(request.url);

    const { page, limit, skip } = parsePagination(searchParams);

    const { field: sortField, order: sortOrder } = parseSort(
      searchParams,
      ["name", "value", "expectedCloseDate", "stage", "createdAt"],
      "createdAt",
      "desc"
    );

    const filters = parseFilters(searchParams, [
      "stage",
      "source",
      "ownerId",
      "search",
    ]);

    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
    };

    if (filters.stage) where.stage = filters.stage;
    if (filters.source) where.source = filters.source;
    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { companyName: { contains: filters.search, mode: "insensitive" } },
        { contactName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
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
          createdAt: true,
          updatedAt: true,
          client: {
            select: { id: true, name: true, code: true, logoUrl: true },
          },
          owner: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    // Calculate pipeline summary
    type Deal = (typeof deals)[number];
    const byStage: Record<string, { count: number; value: number }> = {};
    deals.forEach((d: Deal) => {
      if (!byStage[d.stage]) {
        byStage[d.stage] = { count: 0, value: 0 };
      }
      byStage[d.stage].count++;
      byStage[d.stage].value += Number(d.value || 0);
    });

    const totalValue = deals.reduce(
      (sum: number, d: Deal) => sum + Number(d.value || 0),
      0
    );
    const weightedValue = deals.reduce(
      (sum: number, d: Deal) =>
        sum + Number(d.value || 0) * (Number(d.probability || 0) / 100),
      0
    );

    return paginated(deals, { page, limit, total }, {
      summary: {
        totalValue,
        weightedValue: Math.round(weightedValue),
        byStage,
      },
    });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireLeadership(context);

    const data = await validateBody(request, CreateDealSchema);

    // If clientId provided, verify client belongs to org
    if (data.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: data.clientId,
          organizationId: context.organizationId,
        },
      });
      if (!client) {
        throw new Error("Client not found");
      }
    }

    const deal = await prisma.deal.create({
      data: {
        ...data,
        organizationId: context.organizationId,
        ownerId: context.userId,
        stage: "LEAD",
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
        createdAt: true,
        client: {
          select: { id: true, name: true, code: true },
        },
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    return created(deal);
  });
}
