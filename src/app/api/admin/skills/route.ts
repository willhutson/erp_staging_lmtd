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
import { Prisma, SkillCategory } from "@prisma/client";

// GET /api/admin/skills - List skills
export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause
    const where: Prisma.AgentSkillWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.category && { category: filters.category as SkillCategory }),
      ...(filters.isEnabled !== undefined && {
        isEnabled: filters.isEnabled === "true",
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { slug: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [skills, total] = await Promise.all([
      db.agentSkill.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          isEnabled: true,
          version: true,
          invocationCount: true,
          successRate: true,
          avgLatencyMs: true,
          lastInvokedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: sort.length > 0 ? buildOrderBy(sort) : { name: "asc" },
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.agentSkill.count({ where }),
    ]);

    return apiPaginated(skills, total, pagination);
  });
}

// POST /api/admin/skills - Create skill
const createSkillSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().min(1),
  category: z.nativeEnum(SkillCategory),
  isEnabled: z.boolean().optional().default(true),
  version: z.string().optional().default("1.0.0"),
  triggers: z.array(z.unknown()).optional().default([]),
  inputs: z.array(z.unknown()).optional().default([]),
  outputs: z.array(z.unknown()).optional().default([]),
  config: z.unknown().optional(),
  dependsOn: z.array(z.string()).optional().default([]),
  requiredPermissions: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createSkillSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check slug uniqueness within organization
    const existingSkill = await db.agentSkill.findFirst({
      where: {
        organizationId: ctx.organizationId,
        slug: data.slug,
      },
    });

    if (existingSkill) {
      return apiError("A skill with this slug already exists", 409);
    }

    const skill = await db.agentSkill.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        isEnabled: data.isEnabled,
        version: data.version,
        triggers: data.triggers as Prisma.InputJsonValue,
        inputs: data.inputs as Prisma.InputJsonValue,
        outputs: data.outputs as Prisma.InputJsonValue,
        config: (data.config ?? Prisma.DbNull) as Prisma.InputJsonValue,
        dependsOn: data.dependsOn,
        requiredPermissions: data.requiredPermissions,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        isEnabled: true,
        createdAt: true,
      },
    });

    return apiSuccess(skill, 201);
  });
}
