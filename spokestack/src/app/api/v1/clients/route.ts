/**
 * GET /api/v1/clients - List clients
 * POST /api/v1/clients - Create a new client
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  success,
  created,
  handleRoute,
  validateBody,
  parsePagination,
  parseSort,
  parseFilters,
  paginated,
  ApiError,
} from "@/lib/api";

const CreateClientSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9_-]+$/i, "Code must be alphanumeric"),
  industry: z.string().max(100).optional().nullable(),
  isRetainer: z.boolean().default(false),
  retainerHours: z.number().min(0).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  linkedIn: z.string().url().optional().nullable(),
  companySize: z.enum(["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"]).optional().nullable(),
  accountManagerId: z.string().cuid().optional().nullable(),
  leadSource: z.enum([
    "REFERRAL", "WEBSITE", "SOCIAL_MEDIA", "EVENT",
    "COLD_OUTREACH", "RFP_PORTAL", "PARTNERSHIP", "OTHER"
  ]).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    // Parse pagination
    const { page, limit, skip } = parsePagination(searchParams);

    // Parse sorting
    const { field: sortField, order: sortOrder } = parseSort(
      searchParams,
      ["name", "code", "industry", "createdAt", "lifetimeValue"],
      "name",
      "asc"
    );

    // Parse filters
    const filters = parseFilters(searchParams, [
      "industry",
      "isRetainer",
      "isActive",
      "relationshipStatus",
      "accountManagerId",
      "search",
    ]);

    // Build where clause
    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
    };

    if (filters.industry) {
      where.industry = filters.industry;
    }
    if (filters.isRetainer !== undefined) {
      where.isRetainer = filters.isRetainer === "true";
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === "true";
    }
    if (filters.relationshipStatus) {
      where.relationshipStatus = filters.relationshipStatus;
    }
    if (filters.accountManagerId) {
      where.accountManagerId = filters.accountManagerId;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get clients and count
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          code: true,
          industry: true,
          isRetainer: true,
          retainerHours: true,
          logoUrl: true,
          relationshipStatus: true,
          lifetimeValue: true,
          isActive: true,
          createdAt: true,
          accountManager: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              projects: true,
              briefs: true,
              contacts: true,
            },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return paginated(clients, { page, limit, total });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireTeamLead(context);

    const data = await validateBody(request, CreateClientSchema);

    // Check if code already exists in organization
    const existing = await prisma.client.findFirst({
      where: {
        code: data.code.toUpperCase(),
        organizationId: context.organizationId,
      },
    });

    if (existing) {
      throw ApiError.conflict("A client with this code already exists");
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

    const client = await prisma.client.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        organizationId: context.organizationId,
        isActive: true,
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
        createdAt: true,
        accountManager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return created(client);
  });
}
