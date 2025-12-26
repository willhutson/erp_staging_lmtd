import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { AccessAction, AccessCondition, AccessEffect } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/admin/access-policies/[id]/rules - Add rule to policy
const createRuleSchema = z.object({
  resource: z.string().min(1),
  action: z.nativeEnum(AccessAction),
  effect: z.nativeEnum(AccessEffect).optional().default("ALLOW"),
  conditionType: z.nativeEnum(AccessCondition).optional().default("ALL"),
  conditionParams: z.record(z.unknown()).optional().default({}),
  allowedFields: z.array(z.string()).optional().default([]),
  deniedFields: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id: policyId } = await context.params;

    // Verify policy exists and belongs to org
    const policy = await db.accessPolicy.findFirst({
      where: { id: policyId, organizationId: ctx.organizationId },
    });

    if (!policy) {
      return apiError("Access policy not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createRuleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    const rule = await db.accessRule.create({
      data: {
        policyId,
        resource: data.resource,
        action: data.action,
        effect: data.effect,
        conditionType: data.conditionType,
        conditionParams: data.conditionParams,
        allowedFields: data.allowedFields,
        deniedFields: data.deniedFields,
        isActive: data.isActive,
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
        createdAt: true,
      },
    });

    return apiSuccess(rule, 201);
  });
}
