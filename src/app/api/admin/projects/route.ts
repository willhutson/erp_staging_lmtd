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
import { Prisma, ProjectStatus, ProjectType } from "@prisma/client";

// GET /api/admin/projects - List projects
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "STAFF" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause
    const where: Prisma.ProjectWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.clientId && { clientId: filters.clientId }),
      ...(filters.status && { status: filters.status as ProjectStatus }),
      ...(filters.type && { type: filters.type as ProjectType }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { code: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          status: true,
          startDate: true,
          endDate: true,
          budgetHours: true,
          budgetAmount: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          client: { select: { id: true, name: true, code: true } },
          _count: {
            select: { briefs: true, timeEntries: true },
          },
        },
        orderBy: buildOrderBy(sort),
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.project.count({ where }),
    ]);

    return apiPaginated(projects, total, pagination);
  });
}

// POST /api/admin/projects - Create project
const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  clientId: z.string(),
  code: z.string().min(1).max(20).toUpperCase().optional(),
  type: z.nativeEnum(ProjectType).optional().default("PROJECT"),
  status: z.nativeEnum(ProjectStatus).optional().default("ACTIVE"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budgetHours: z.number().int().positive().optional(),
  budgetAmount: z.number().positive().optional(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Verify client belongs to org
    const client = await db.client.findFirst({
      where: { id: data.clientId, organizationId: ctx.organizationId },
    });

    if (!client) {
      return apiError("Client not found", 404);
    }

    // Generate code if not provided
    const code = data.code || await generateProjectCode(ctx.organizationId, client.code);

    const project = await db.project.create({
      data: {
        organizationId: ctx.organizationId,
        clientId: data.clientId,
        name: data.name,
        code,
        type: data.type,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        budgetHours: data.budgetHours,
        budgetAmount: data.budgetAmount,
        description: data.description,
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        status: true,
        createdAt: true,
        client: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(project, 201);
  });
}

/**
 * Generate a unique project code
 */
async function generateProjectCode(
  organizationId: string,
  clientCode: string
): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);

  // Count existing projects for this client this year
  const count = await db.project.count({
    where: {
      organizationId,
      code: { startsWith: `${clientCode}-${year}` },
    },
  });

  const sequence = (count + 1).toString().padStart(2, "0");
  return `${clientCode}-${year}${sequence}`;
}
