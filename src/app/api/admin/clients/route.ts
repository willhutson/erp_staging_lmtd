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

// GET /api/admin/clients - List clients
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "STAFF" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause
    const where: Prisma.ClientWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.isRetainer !== undefined && {
        isRetainer: filters.isRetainer === "true",
      }),
      ...(filters.isActive !== undefined && {
        isActive: filters.isActive === "true",
      }),
      ...(filters.accountManagerId && {
        accountManagerId: filters.accountManagerId,
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { code: { contains: filters.q, mode: "insensitive" } },
          { industry: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          industry: true,
          isRetainer: true,
          retainerHours: true,
          logoUrl: true,
          isActive: true,
          website: true,
          relationshipStatus: true,
          createdAt: true,
          updatedAt: true,
          accountManager: { select: { id: true, name: true } },
          _count: {
            select: { projects: true, briefs: true },
          },
        },
        orderBy: buildOrderBy(sort),
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.client.count({ where }),
    ]);

    return apiPaginated(clients, total, pagination);
  });
}

// POST /api/admin/clients - Create client
const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20).toUpperCase(),
  industry: z.string().optional(),
  isRetainer: z.boolean().optional().default(false),
  retainerHours: z.number().int().positive().optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  linkedIn: z.string().url().optional(),
  accountManagerId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check code uniqueness within organization
    const existingClient = await db.client.findFirst({
      where: {
        organizationId: ctx.organizationId,
        code: data.code,
      },
    });

    if (existingClient) {
      return apiError("A client with this code already exists", 409);
    }

    // Verify account manager belongs to org
    if (data.accountManagerId) {
      const manager = await db.user.findFirst({
        where: { id: data.accountManagerId, organizationId: ctx.organizationId },
      });
      if (!manager) {
        return apiError("Account manager not found", 404);
      }
    }

    const client = await db.client.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        code: data.code,
        industry: data.industry,
        isRetainer: data.isRetainer,
        retainerHours: data.retainerHours,
        logoUrl: data.logoUrl,
        website: data.website,
        linkedIn: data.linkedIn,
        accountManagerId: data.accountManagerId,
        notes: data.notes,
      },
      select: {
        id: true,
        name: true,
        code: true,
        industry: true,
        isRetainer: true,
        retainerHours: true,
        logoUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return apiSuccess(client, 201);
  });
}
