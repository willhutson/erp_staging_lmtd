import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/clients/[id] - Get single client
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "STAFF" }, async (ctx) => {
    const { id } = await context.params;

    const client = await db.client.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        accountManager: { select: { id: true, name: true, email: true } },
        projects: {
          where: { status: "ACTIVE" },
          select: { id: true, name: true, code: true },
          take: 10,
        },
        contacts: {
          select: { id: true, name: true, email: true, role: true, isPrimary: true },
          take: 10,
        },
        _count: {
          select: { projects: true, briefs: true },
        },
      },
    });

    if (!client) {
      return apiError("Client not found", 404);
    }

    return apiSuccess(client);
  });
}

// PATCH /api/admin/clients/[id] - Update client
const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(20).toUpperCase().optional(),
  industry: z.string().nullable().optional(),
  isRetainer: z.boolean().optional(),
  retainerHours: z.number().int().positive().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  linkedIn: z.string().url().nullable().optional(),
  accountManagerId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  relationshipStatus: z
    .enum(["PROSPECT", "ACTIVE", "ON_HOLD", "CHURNED", "FORMER"])
    .optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    // Verify client exists and belongs to org
    const existingClient = await db.client.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!existingClient) {
      return apiError("Client not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check code uniqueness if changing
    if (data.code && data.code !== existingClient.code) {
      const codeTaken = await db.client.findFirst({
        where: {
          organizationId: ctx.organizationId,
          code: data.code,
          NOT: { id },
        },
      });
      if (codeTaken) {
        return apiError("A client with this code already exists", 409);
      }
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

    const client = await db.client.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.industry !== undefined && { industry: data.industry }),
        ...(data.isRetainer !== undefined && { isRetainer: data.isRetainer }),
        ...(data.retainerHours !== undefined && {
          retainerHours: data.retainerHours,
        }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.linkedIn !== undefined && { linkedIn: data.linkedIn }),
        ...(data.accountManagerId !== undefined && {
          accountManagerId: data.accountManagerId,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.relationshipStatus && {
          relationshipStatus: data.relationshipStatus,
        }),
      },
    });

    return apiSuccess(client);
  });
}

// DELETE /api/admin/clients/[id] - Deactivate client (soft delete)
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const client = await db.client.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!client) {
      return apiError("Client not found", 404);
    }

    // Soft delete - set isActive to false
    await db.client.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ id, deleted: true });
  });
}
