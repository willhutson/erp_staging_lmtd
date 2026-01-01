import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, RelationshipStatus } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/clients/[id] - Get single client
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

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
          select: { id: true, name: true, email: true, jobTitle: true, isPrimary: true },
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
  relationshipStatus: z.nativeEnum(RelationshipStatus).optional(),
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

    const updateData: Prisma.ClientUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.code) updateData.code = data.code;
    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.isRetainer !== undefined) updateData.isRetainer = data.isRetainer;
    if (data.retainerHours !== undefined) updateData.retainerHours = data.retainerHours;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.linkedIn !== undefined) updateData.linkedIn = data.linkedIn;
    if (data.accountManagerId !== undefined) {
      updateData.accountManager = data.accountManagerId
        ? { connect: { id: data.accountManagerId } }
        : { disconnect: true };
    }
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.relationshipStatus) updateData.relationshipStatus = data.relationshipStatus;

    const client = await db.client.update({
      where: { id },
      data: updateData,
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
