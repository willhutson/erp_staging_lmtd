import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiPaginated,
  apiError,
  parseRefineParams,
  buildOrderBy,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// GET /api/admin/users - List users
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause
    const where: Prisma.UserWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.department && { department: filters.department }),
      ...(filters.permissionLevel && {
        permissionLevel: filters.permissionLevel as Prisma.EnumPermissionLevelFilter,
      }),
      ...(filters.isActive !== undefined && {
        isActive: filters.isActive === "true",
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { email: { contains: filters.q, mode: "insensitive" } },
          { role: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
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
          teamLead: { select: { id: true, name: true } },
        },
        orderBy: buildOrderBy(sort),
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.user.count({ where }),
    ]);

    return apiPaginated(users, total, pagination);
  });
}

// POST /api/admin/users - Create user
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  department: z.string().min(1),
  permissionLevel: z.enum([
    "ADMIN",
    "LEADERSHIP",
    "TEAM_LEAD",
    "STAFF",
    "FREELANCER",
  ]),
  isFreelancer: z.boolean().optional().default(false),
  avatarUrl: z.string().url().optional(),
  teamLeadId: z.string().optional(),
  weeklyCapacity: z.number().int().min(0).max(80).optional(),
  hourlyRate: z.number().positive().optional(),
  skills: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check email uniqueness within organization
    const existingUser = await db.user.findFirst({
      where: {
        organizationId: ctx.organizationId,
        email: data.email,
      },
    });

    if (existingUser) {
      return apiError("A user with this email already exists", 409);
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

    const user = await db.user.create({
      data: {
        organizationId: ctx.organizationId,
        email: data.email,
        name: data.name,
        role: data.role,
        department: data.department,
        permissionLevel: data.permissionLevel,
        isFreelancer: data.isFreelancer,
        avatarUrl: data.avatarUrl,
        teamLeadId: data.teamLeadId,
        weeklyCapacity: data.weeklyCapacity ?? 40,
        hourlyRate: data.hourlyRate,
        skills: data.skills ?? [],
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
      },
    });

    return apiSuccess(user, 201);
  });
}
