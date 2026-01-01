import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { AccessAction, AccessCondition, AccessEffect, Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/access-rules/[id] - Get single rule
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    const rule = await db.accessRule.findFirst({
      where: { id },
      include: {
        policy: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    if (!rule || rule.policy.organizationId !== ctx.organizationId) {
      return apiError("Access rule not found", 404);
    }

    return apiSuccess(rule);
  });
}

// PATCH /api/admin/access-rules/[id] - Update rule
const updateRuleSchema = z.object({
  resource: z.string().min(1).optional(),
  action: z.nativeEnum(AccessAction).optional(),
  effect: z.nativeEnum(AccessEffect).optional(),
  conditionType: z.nativeEnum(AccessCondition).optional(),
  conditionParams: z.record(z.unknown()).optional(),
  allowedFields: z.array(z.string()).optional(),
  deniedFields: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const existing = await db.accessRule.findFirst({
      where: { id },
      include: {
        policy: {
          select: { organizationId: true },
        },
      },
    });

    if (!existing || existing.policy.organizationId !== ctx.organizationId) {
      return apiError("Access rule not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    const rule = await db.accessRule.update({
      where: { id },
      data: {
        ...(data.resource && { resource: data.resource }),
        ...(data.action && { action: data.action }),
        ...(data.effect && { effect: data.effect }),
        ...(data.conditionType && { conditionType: data.conditionType }),
        ...(data.conditionParams !== undefined && {
          conditionParams: data.conditionParams as Prisma.InputJsonValue,
        }),
        ...(data.allowedFields !== undefined && {
          allowedFields: data.allowedFields,
        }),
        ...(data.deniedFields !== undefined && {
          deniedFields: data.deniedFields,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
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
        updatedAt: true,
      },
    });

    return apiSuccess(rule);
  });
}

// DELETE /api/admin/access-rules/[id] - Delete rule
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const rule = await db.accessRule.findFirst({
      where: { id },
      include: {
        policy: {
          select: { organizationId: true },
        },
      },
    });

    if (!rule || rule.policy.organizationId !== ctx.organizationId) {
      return apiError("Access rule not found", 404);
    }

    await db.accessRule.delete({
      where: { id },
    });

    return apiSuccess({ id, deleted: true });
  });
}
