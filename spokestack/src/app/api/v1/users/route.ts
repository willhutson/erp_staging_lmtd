/**
 * GET /api/v1/users - List users in organization
 * POST /api/v1/users - Create a new user
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  requireTeamLead,
  success,
  created,
  error,
  handleRoute,
  validateBody,
  parsePagination,
  parseSort,
  parseFilters,
  paginated,
  ApiError,
} from "@/lib/api";

const CreateUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  role: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  permissionLevel: z.enum(["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF", "FREELANCER"]).default("STAFF"),
  isFreelancer: z.boolean().default(false),
  weeklyCapacity: z.number().min(0).max(168).default(40),
  teamLeadId: z.string().cuid().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  skills: z.array(z.string()).optional(),
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
      ["name", "email", "department", "role", "createdAt"],
      "name",
      "asc"
    );

    // Parse filters
    const filters = parseFilters(searchParams, [
      "department",
      "role",
      "permissionLevel",
      "isActive",
      "isFreelancer",
      "search",
    ]);

    // Build where clause
    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
    };

    if (filters.department) {
      where.department = filters.department;
    }
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.permissionLevel) {
      where.permissionLevel = filters.permissionLevel;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === "true";
    }
    if (filters.isFreelancer !== undefined) {
      where.isFreelancer = filters.isFreelancer === "true";
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Get users and count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          permissionLevel: true,
          isFreelancer: true,
          avatarUrl: true,
          isActive: true,
          weeklyCapacity: true,
          skills: true,
          createdAt: true,
          teamLead: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginated(users, { page, limit, total });
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    requireTeamLead(context);

    const data = await validateBody(request, CreateUserSchema);

    // Check if email already exists in organization
    const existing = await prisma.user.findFirst({
      where: {
        email: data.email,
        organizationId: context.organizationId,
      },
    });

    if (existing) {
      throw ApiError.conflict("A user with this email already exists");
    }

    // If teamLeadId provided, verify they exist in same org
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

    const user = await prisma.user.create({
      data: {
        ...data,
        organizationId: context.organizationId,
        isActive: true,
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
        isActive: true,
        weeklyCapacity: true,
        skills: true,
        createdAt: true,
      },
    });

    return created(user);
  });
}
