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

// POST /api/admin/access-policies/[id]/assignments - Assign policy to user
const assignPolicySchema = z.object({
  userId: z.string().min(1),
  expiresAt: z.string().datetime().nullable().optional(),
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

    const parsed = assignPolicySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Verify user exists and belongs to org
    const user = await db.user.findFirst({
      where: { id: data.userId, organizationId: ctx.organizationId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Check if assignment already exists
    const existing = await db.policyAssignment.findFirst({
      where: { policyId, userId: data.userId },
    });

    if (existing) {
      return apiError("User is already assigned to this policy", 409);
    }

    const assignment = await db.policyAssignment.create({
      data: {
        organizationId: ctx.organizationId,
        policyId,
        userId: data.userId,
        assignedById: ctx.userId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      select: {
        id: true,
        assignedAt: true,
        expiresAt: true,
        user: { select: { id: true, name: true, email: true } },
        assignedBy: { select: { id: true, name: true } },
        policy: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(assignment, 201);
  });
}

// DELETE /api/admin/access-policies/[id]/assignments - Remove assignment
const deleteAssignmentSchema = z.object({
  userId: z.string().min(1),
});

export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id: policyId } = await context.params;

    // Verify policy exists and belongs to org
    const policy = await db.accessPolicy.findFirst({
      where: { id: policyId, organizationId: ctx.organizationId },
    });

    if (!policy) {
      return apiError("Access policy not found", 404);
    }

    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return apiError("userId is required", 400);
    }

    const assignment = await db.policyAssignment.findFirst({
      where: { policyId, userId },
    });

    if (!assignment) {
      return apiError("Assignment not found", 404);
    }

    await db.policyAssignment.delete({
      where: { id: assignment.id },
    });

    return apiSuccess({ policyId, userId, deleted: true });
  });
}
