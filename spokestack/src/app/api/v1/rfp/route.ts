/**
 * GET /api/v1/rfp - List RFPs
 * POST /api/v1/rfp - Create a new RFP
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

const CreateRFPSchema = z.object({
  name: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  portal: z.string().max(100).optional().nullable(),
  deadline: z.coerce.date(),
  dateReceived: z.coerce.date().optional().nullable(),
  estimatedValue: z.number().min(0).optional().nullable(),
  requirements: z.string().max(10000).optional().nullable(),
  bidBondRequired: z.boolean().default(false),
  notes: z.string().max(5000).optional().nullable(),
  winProbability: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().nullable(),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireLeadership(context);

    const { searchParams } = new URL(request.url);

    const { page, limit, skip } = parsePagination(searchParams);

    const { field: sortField, order: sortOrder } = parseSort(
      searchParams,
      ["name", "deadline", "dateReceived", "status", "createdAt"],
      "deadline",
      "asc"
    );

    const filters = parseFilters(searchParams, [
      "status",
      "winProbability",
      "search",
    ]);

    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.winProbability) where.winProbability = filters.winProbability;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { clientName: { contains: filters.search, mode: "insensitive" } },
        { rfpCode: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [rfps, total] = await Promise.all([
      prisma.rFP.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          clientName: true,
          rfpCode: true,
          portal: true,
          status: true,
          winProbability: true,
          dateReceived: true,
          deadline: true,
          estimatedValue: true,
          bidBondRequired: true,
          outcome: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { subitems: true, attachments: true },
          },
        },
      }),
      prisma.rFP.count({ where }),
    ]);

    // Calculate summary stats
    type RFP = (typeof rfps)[number];
    const summary = {
      total,
      byStatus: rfps.reduce((acc: Record<string, number>, r: RFP) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}),
      totalValue: rfps.reduce(
        (sum: number, r: RFP) => sum + Number(r.estimatedValue || 0),
        0
      ),
    };

    return paginated(rfps, { page, limit, total }, { summary });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireLeadership(context);

    const data = await validateBody(request, CreateRFPSchema);

    // Generate RFP code
    const count = await prisma.rFP.count({
      where: { organizationId: context.organizationId },
    });
    const year = new Date().getFullYear();
    const rfpCode = `RFP-${year}-${String(count + 1).padStart(4, "0")}`;

    const rfp = await prisma.rFP.create({
      data: {
        ...data,
        rfpCode,
        organizationId: context.organizationId,
        createdById: context.userId,
        status: "VETTING",
      },
      select: {
        id: true,
        name: true,
        clientName: true,
        rfpCode: true,
        portal: true,
        status: true,
        winProbability: true,
        dateReceived: true,
        deadline: true,
        estimatedValue: true,
        bidBondRequired: true,
        createdAt: true,
      },
    });

    return created(rfp);
  });
}
