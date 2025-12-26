import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { createAuditLogger } from "@/lib/audit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/admin/access-policies/[id]/assignments - Assign policy to user
// Requires documentation (paper trail) for the override
const assignPolicySchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(10, "Reason must be at least 10 characters"), // Required documentation
  businessCase: z.string().optional(), // Optional additional justification
  expiresAt: z.string().datetime().nullable().optional(),
  notifyUser: z.boolean().optional().default(true), // Whether to notify the user
  notifyTeamLead: z.boolean().optional().default(true), // Notify user's team lead
});

export async function POST(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id: policyId } = await context.params;

    // Verify policy exists, belongs to org, and is approved
    const policy = await db.accessPolicy.findFirst({
      where: { id: policyId, organizationId: ctx.organizationId },
    });

    if (!policy) {
      return apiError("Access policy not found", 404);
    }

    if (policy.status !== "APPROVED") {
      return apiError("Can only assign users to approved policies", 400);
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
      include: {
        teamLead: { select: { id: true, name: true, email: true } },
      },
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

    // Build list of users to notify
    const usersToNotify: string[] = [];
    if (data.notifyUser) {
      usersToNotify.push(data.userId);
    }
    if (data.notifyTeamLead && user.teamLeadId) {
      usersToNotify.push(user.teamLeadId);
    }

    const assignment = await db.policyAssignment.create({
      data: {
        organizationId: ctx.organizationId,
        policyId,
        userId: data.userId,
        reason: data.reason,
        businessCase: data.businessCase,
        assignedById: ctx.userId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        notifiedAt: usersToNotify.length > 0 ? new Date() : null,
        notifiedUsers: usersToNotify,
      },
      select: {
        id: true,
        reason: true,
        businessCase: true,
        assignedAt: true,
        expiresAt: true,
        notifiedAt: true,
        notifiedUsers: true,
        user: { select: { id: true, name: true, email: true } },
        assignedBy: { select: { id: true, name: true } },
        policy: { select: { id: true, name: true } },
      },
    });

    // Audit log
    const audit = createAuditLogger({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      email: ctx.email,
      name: ctx.name,
      role: ctx.role,
    });
    await audit.setRequestContext();
    await audit.log({
      action: "ASSIGNMENT_CREATED",
      resource: "policy_assignment",
      resourceId: assignment.id,
      resourceName: `${user.name} → ${policy.name}`,
      newState: assignment as unknown as Record<string, unknown>,
      changesSummary: `Assigned policy "${policy.name}" to ${user.name}. Reason: ${data.reason}`,
    });

    // TODO: Send notifications
    // if (usersToNotify.length > 0) {
    //   await sendPolicyAssignmentNotifications(assignment, usersToNotify);
    // }

    return apiSuccess(assignment, 201);
  });
}

// DELETE /api/admin/access-policies/[id]/assignments - Remove assignment
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
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!assignment) {
      return apiError("Assignment not found", 404);
    }

    await db.policyAssignment.delete({
      where: { id: assignment.id },
    });

    // Audit log
    const audit = createAuditLogger({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      email: ctx.email,
      name: ctx.name,
      role: ctx.role,
    });
    await audit.setRequestContext();
    await audit.log({
      action: "ASSIGNMENT_REMOVED",
      resource: "policy_assignment",
      resourceId: assignment.id,
      resourceName: `${assignment.user?.name} → ${policy.name}`,
      previousState: assignment as unknown as Record<string, unknown>,
      changesSummary: `Removed policy "${policy.name}" from ${assignment.user?.name}`,
    });

    // TODO: Send notification to user that their access changed

    return apiSuccess({ policyId, userId, deleted: true });
  });
}
