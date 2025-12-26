import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { PolicyStatus } from "@prisma/client";
import { createAuditLogger } from "@/lib/audit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/admin/access-policies/[id]/actions - Perform workflow action
const actionSchema = z.object({
  action: z.enum(["submit", "approve", "reject", "archive", "restore"]),
  reason: z.string().optional(), // Required for reject
});

export async function POST(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    const policy = await db.accessPolicy.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: {
        rules: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
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

    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const { action, reason } = parsed.data;

    // Setup audit logger
    const audit = createAuditLogger({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      email: ctx.email,
      name: ctx.name,
      role: ctx.role,
    });
    await audit.setRequestContext();

    const previousState = { ...policy, rules: policy.rules };

    switch (action) {
      case "submit": {
        // LEADERSHIP submits draft for approval
        if (policy.status !== "DRAFT" && policy.status !== "REJECTED") {
          return apiError(
            "Only draft or rejected policies can be submitted",
            400
          );
        }

        const updated = await db.accessPolicy.update({
          where: { id },
          data: {
            status: "SUBMITTED",
            submittedAt: new Date(),
            rejectedAt: null,
            rejectionReason: null,
          },
          select: selectFields,
        });

        await audit.logPolicyChange(
          "POLICY_SUBMITTED",
          policy.id,
          policy.name,
          previousState as unknown as Record<string, unknown>,
          updated as unknown as Record<string, unknown>,
          `Policy submitted for approval by ${ctx.name}`
        );

        // TODO: Send notification to admins
        // await notifyAdmins(ctx.organizationId, policy);

        return apiSuccess(updated);
      }

      case "approve": {
        // Only ADMIN can approve
        if (ctx.permissionLevel !== "ADMIN") {
          return apiError("Only admins can approve policies", 403);
        }

        if (policy.status !== "SUBMITTED") {
          return apiError("Only submitted policies can be approved", 400);
        }

        const updated = await db.accessPolicy.update({
          where: { id },
          data: {
            status: "APPROVED",
            isActive: true,
            approvedAt: new Date(),
            approvedById: ctx.userId,
            version: { increment: 1 },
          },
          select: selectFields,
        });

        // Create version snapshot
        await db.policyVersion.create({
          data: {
            policyId: policy.id,
            version: policy.version + 1,
            name: policy.name,
            description: policy.description,
            defaultLevel: policy.defaultLevel,
            priority: policy.priority,
            rulesSnapshot: policy.rules,
            changeType: "APPROVED",
            changeSummary: `Policy approved by ${ctx.name}`,
            changedById: ctx.userId,
          },
        });

        await audit.logPolicyChange(
          "POLICY_APPROVED",
          policy.id,
          policy.name,
          previousState as unknown as Record<string, unknown>,
          updated as unknown as Record<string, unknown>,
          `Policy approved by ${ctx.name}`
        );

        // TODO: Send notification to creator
        // await notifyUser(policy.createdById, { type: "policy_approved", ... });

        return apiSuccess(updated);
      }

      case "reject": {
        // Only ADMIN can reject
        if (ctx.permissionLevel !== "ADMIN") {
          return apiError("Only admins can reject policies", 403);
        }

        if (policy.status !== "SUBMITTED") {
          return apiError("Only submitted policies can be rejected", 400);
        }

        if (!reason) {
          return apiError("Rejection reason is required", 400);
        }

        const updated = await db.accessPolicy.update({
          where: { id },
          data: {
            status: "REJECTED",
            rejectedAt: new Date(),
            rejectionReason: reason,
          },
          select: selectFields,
        });

        await audit.logPolicyChange(
          "POLICY_REJECTED",
          policy.id,
          policy.name,
          previousState as unknown as Record<string, unknown>,
          updated as unknown as Record<string, unknown>,
          `Policy rejected by ${ctx.name}: ${reason}`
        );

        // TODO: Send notification to creator with reason
        // await notifyUser(policy.createdById, { type: "policy_rejected", reason, ... });

        return apiSuccess(updated);
      }

      case "archive": {
        // Only ADMIN can archive
        if (ctx.permissionLevel !== "ADMIN") {
          return apiError("Only admins can archive policies", 403);
        }

        if (policy.status === "ARCHIVED") {
          return apiError("Policy is already archived", 400);
        }

        const updated = await db.accessPolicy.update({
          where: { id },
          data: {
            status: "ARCHIVED",
            isActive: false,
          },
          select: selectFields,
        });

        await audit.logPolicyChange(
          "POLICY_ARCHIVED",
          policy.id,
          policy.name,
          previousState as unknown as Record<string, unknown>,
          updated as unknown as Record<string, unknown>,
          `Policy archived by ${ctx.name}`
        );

        return apiSuccess(updated);
      }

      case "restore": {
        // Only ADMIN can restore
        if (ctx.permissionLevel !== "ADMIN") {
          return apiError("Only admins can restore policies", 403);
        }

        if (policy.status !== "ARCHIVED") {
          return apiError("Only archived policies can be restored", 400);
        }

        const updated = await db.accessPolicy.update({
          where: { id },
          data: {
            status: "APPROVED", // Restore to approved state
            isActive: true,
          },
          select: selectFields,
        });

        // Create version for restore
        await db.policyVersion.create({
          data: {
            policyId: policy.id,
            version: policy.version + 1,
            name: policy.name,
            description: policy.description,
            defaultLevel: policy.defaultLevel,
            priority: policy.priority,
            rulesSnapshot: policy.rules,
            changeType: "RESTORED",
            changeSummary: `Policy restored by ${ctx.name}`,
            changedById: ctx.userId,
          },
        });

        await db.accessPolicy.update({
          where: { id },
          data: { version: { increment: 1 } },
        });

        await audit.logPolicyChange(
          "POLICY_UPDATED",
          policy.id,
          policy.name,
          previousState as unknown as Record<string, unknown>,
          updated as unknown as Record<string, unknown>,
          `Policy restored by ${ctx.name}`
        );

        return apiSuccess(updated);
      }

      default:
        return apiError("Invalid action", 400);
    }
  });
}

const selectFields = {
  id: true,
  name: true,
  description: true,
  defaultLevel: true,
  status: true,
  isActive: true,
  priority: true,
  version: true,
  submittedAt: true,
  approvedAt: true,
  rejectedAt: true,
  rejectionReason: true,
  updatedAt: true,
  createdBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};
