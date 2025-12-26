import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { PermissionLevel, AccessAction, AccessCondition, AccessEffect } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/access-policies/[id] - Get single policy with rules
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    const policy = await db.accessPolicy.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        rules: {
          select: {
            id: true,
            resource: true,
            action: true,
            effect: true,
            conditionType: true,
            conditionParams: true,
            allowedFields: true,
            deniedFields: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            assignedBy: { select: { id: true, name: true } },
          },
          orderBy: { assignedAt: "desc" },
        },
      },
    });

    if (!policy) {
      return apiError("Access policy not found", 404);
    }

    return apiSuccess(policy);
  });
}

// PATCH /api/admin/access-policies/[id] - Update policy
const updatePolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  defaultLevel: z.nativeEnum(PermissionLevel).nullable().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).max(1000).optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const existing = await db.accessPolicy.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!existing) {
      return apiError("Access policy not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updatePolicySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check name uniqueness if changing
    if (data.name && data.name !== existing.name) {
      const nameTaken = await db.accessPolicy.findFirst({
        where: {
          organizationId: ctx.organizationId,
          name: data.name,
          NOT: { id },
        },
      });
      if (nameTaken) {
        return apiError("A policy with this name already exists", 409);
      }
    }

    const policy = await db.accessPolicy.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.defaultLevel !== undefined && { defaultLevel: data.defaultLevel }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        defaultLevel: true,
        isActive: true,
        priority: true,
        updatedAt: true,
      },
    });

    return apiSuccess(policy);
  });
}

// DELETE /api/admin/access-policies/[id] - Delete policy
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const policy = await db.accessPolicy.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!policy) {
      return apiError("Access policy not found", 404);
    }

    // Delete the policy (cascades to rules and assignments)
    await db.accessPolicy.delete({
      where: { id },
    });

    return apiSuccess({ id, deleted: true });
  });
}
