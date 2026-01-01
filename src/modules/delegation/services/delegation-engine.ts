/**
 * Delegation Engine
 *
 * Core service that coordinates the delegation system.
 * Activates delegations when leave starts, handles task routing,
 * and manages the delegation lifecycle.
 */

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type {
  StartDelegationContext,
  DelegationScope,
  DelegationSummary,
} from "../types";
import { getDelegationProfile } from "./profile-service";
import { resolveDelegation } from "./chain-resolver";
import { scheduleReturnReminders } from "./handoff-service";
import { logDelegationActivity } from "./handoff-service";
import {
  notifyDelegationActivated,
  notifyTaskDelegated,
} from "./notification-service";

/**
 * Start a new active delegation (typically triggered by leave approval)
 */
export async function startDelegation(
  context: StartDelegationContext
): Promise<{ delegationId: string }> {
  // Get or build scope
  let scope: DelegationScope;

  if (context.scope) {
    scope = context.scope;
  } else {
    // Get from profile
    const profile = await getDelegationProfile(context.delegatorId);
    if (!profile) {
      throw new Error("No delegation profile configured for this user");
    }
    scope = profile.scope;
  }

  // Create the active delegation
  const delegation = await db.activeDelegation.create({
    data: {
      organizationId: context.organizationId,
      delegatorId: context.delegatorId,
      delegateId: context.delegateId,
      leaveRequestId: context.leaveRequestId,
      startDate: context.startDate,
      endDate: context.endDate,
      scopeSnapshot: scope as unknown as Prisma.InputJsonValue,
      status: context.startDate <= new Date() ? "ACTIVE" : "PENDING",
      activatedAt: context.startDate <= new Date() ? new Date() : null,
    },
  });

  // Schedule return reminders
  await scheduleReturnReminders(delegation.id);

  return { delegationId: delegation.id };
}

/**
 * Activate pending delegations (called by cron job daily)
 */
export async function activatePendingDelegations(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingDelegations = await db.activeDelegation.findMany({
    where: {
      status: "PENDING",
      startDate: { lte: today },
    },
  });

  let activated = 0;

  for (const delegation of pendingDelegations) {
    // Get user names for notifications
    const [delegator, delegate] = await Promise.all([
      db.user.findUnique({
        where: { id: delegation.delegatorId },
        select: { name: true },
      }),
      db.user.findUnique({
        where: { id: delegation.delegateId },
        select: { name: true },
      }),
    ]);

    await db.activeDelegation.update({
      where: { id: delegation.id },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
      },
    });

    // Reassign tasks from delegator to delegate
    await reassignTasksForDelegation(delegation.id);

    // Send activation notifications
    if (delegator && delegate) {
      await notifyDelegationActivated({
        delegationId: delegation.id,
        delegatorId: delegation.delegatorId,
        delegatorName: delegator.name,
        delegateId: delegation.delegateId,
        delegateName: delegate.name,
        startDate: delegation.startDate,
        endDate: delegation.endDate,
        organizationId: delegation.organizationId,
      });
    }

    activated++;
  }

  return activated;
}

/**
 * Reassign tasks from delegator to delegate
 */
async function reassignTasksForDelegation(delegationId: string): Promise<void> {
  const delegation = await db.activeDelegation.findUnique({
    where: { id: delegationId },
    include: {
      delegator: { select: { name: true } },
      delegate: { select: { name: true } },
    },
  });

  if (!delegation || delegation.status !== "ACTIVE") return;

  const scope = delegation.scopeSnapshot as unknown as DelegationScope;

  // Find active briefs assigned to delegator
  const briefsToReassign = await db.brief.findMany({
    where: {
      assigneeId: delegation.delegatorId,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      ...(scope.clients !== "all" && { clientId: { in: scope.clients } }),
      ...(scope.briefTypes !== "all" && { type: { in: scope.briefTypes } }),
    },
    select: {
      id: true,
      title: true,
      clientId: true,
    },
  });

  for (const brief of briefsToReassign) {
    // Store original assignee as backup
    await db.brief.update({
      where: { id: brief.id },
      data: {
        assigneeId: delegation.delegateId,
        backupAssigneeId: delegation.delegatorId,
      },
    });

    // Log the activity
    await logDelegationActivity({
      activeDelegationId: delegation.id,
      activityType: "TASK_ASSIGNED",
      entityType: "brief",
      entityId: brief.id,
      description: `Brief "${brief.title}" assigned to ${delegation.delegate.name} (covering for ${delegation.delegator.name})`,
      performedById: delegation.delegateId,
      metadata: { briefTitle: brief.title, clientId: brief.clientId },
    });

    // Notify delegate about the task
    await notifyTaskDelegated({
      delegateId: delegation.delegateId,
      delegatorName: delegation.delegator.name,
      taskType: "brief",
      taskId: brief.id,
      taskTitle: brief.title,
      delegationId: delegation.id,
    });
  }
}

/**
 * Route a new task through delegation
 * Returns the actual assignee after delegation resolution
 */
export async function routeTaskWithDelegation(
  organizationId: string,
  intendedAssigneeId: string,
  task?: {
    clientId?: string;
    briefType?: string;
    estimatedValue?: number;
  }
): Promise<{
  assigneeId: string;
  wasDelegated: boolean;
  activeDelegationId?: string;
}> {
  const resolution = await resolveDelegation(
    organizationId,
    intendedAssigneeId
  );

  // If delegated and there's an active delegation, log it
  if (resolution.wasDelegated && resolution.activeDelegationId) {
    // Activity will be logged when task is actually created
  }

  return {
    assigneeId: resolution.assigneeId,
    wasDelegated: resolution.wasDelegated,
    activeDelegationId: resolution.activeDelegationId,
  };
}

/**
 * Cancel an active delegation
 */
export async function cancelDelegation(
  delegationId: string,
  cancelledById: string,
  reason?: string
): Promise<void> {
  const delegation = await db.activeDelegation.findUnique({
    where: { id: delegationId },
  });

  if (!delegation) {
    throw new Error("Delegation not found");
  }

  if (delegation.status === "COMPLETED" || delegation.status === "CANCELLED") {
    throw new Error("Delegation is already ended");
  }

  await db.activeDelegation.update({
    where: { id: delegationId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  // Reassign tasks back
  await reassignTasksBack(delegation.delegatorId, delegation.delegateId);
}

/**
 * Reassign tasks from delegate back to original owner (internal)
 */
async function reassignTasksBack(
  originalOwnerId: string,
  delegateId: string
): Promise<void> {
  const briefsToReassign = await db.brief.findMany({
    where: {
      assigneeId: delegateId,
      backupAssigneeId: originalOwnerId,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
    select: { id: true },
  });

  for (const brief of briefsToReassign) {
    await db.brief.update({
      where: { id: brief.id },
      data: {
        assigneeId: originalOwnerId,
        backupAssigneeId: delegateId,
      },
    });
  }
}

/**
 * Get summary of a delegation period
 */
export async function getDelegationSummary(
  delegationId: string
): Promise<DelegationSummary | null> {
  const delegation = await db.activeDelegation.findUnique({
    where: { id: delegationId },
    include: {
      delegator: { select: { name: true } },
      delegate: { select: { name: true } },
      activities: true,
    },
  });

  if (!delegation) return null;

  // Count activities by type
  const counts = {
    tasksAssigned: 0,
    tasksCompleted: 0,
    tasksEscalated: 0,
    clientCommunications: 0,
    approvalsGiven: 0,
    decisionsMMade: 0,
  };

  for (const activity of delegation.activities) {
    switch (activity.activityType) {
      case "TASK_ASSIGNED":
        counts.tasksAssigned++;
        break;
      case "TASK_COMPLETED":
        counts.tasksCompleted++;
        break;
      case "TASK_ESCALATED":
        counts.tasksEscalated++;
        break;
      case "CLIENT_COMMUNICATION":
        counts.clientCommunications++;
        break;
      case "APPROVAL_GIVEN":
        counts.approvalsGiven++;
        break;
      case "DECISION_MADE":
        counts.decisionsMMade++;
        break;
    }
  }

  return {
    delegationId: delegation.id,
    delegatorName: delegation.delegator.name,
    delegateName: delegation.delegate.name,
    startDate: delegation.startDate,
    endDate: delegation.endDate,
    status: delegation.status,
    activities: counts,
  };
}

/**
 * Get active delegations for a user (either as delegator or delegate)
 */
export async function getUserDelegations(userId: string): Promise<{
  asDelegator: Array<{
    id: string;
    delegateName: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
  asDelegate: Array<{
    id: string;
    delegatorName: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
}> {
  const asDelegator = await db.activeDelegation.findMany({
    where: {
      delegatorId: userId,
      status: { in: ["PENDING", "ACTIVE"] },
    },
    include: { delegate: { select: { name: true } } },
    orderBy: { startDate: "asc" },
  });

  const asDelegate = await db.activeDelegation.findMany({
    where: {
      delegateId: userId,
      status: { in: ["PENDING", "ACTIVE"] },
    },
    include: { delegator: { select: { name: true } } },
    orderBy: { startDate: "asc" },
  });

  return {
    asDelegator: asDelegator.map((d) => ({
      id: d.id,
      delegateName: d.delegate.name,
      startDate: d.startDate,
      endDate: d.endDate,
      status: d.status,
    })),
    asDelegate: asDelegate.map((d) => ({
      id: d.id,
      delegatorName: d.delegator.name,
      startDate: d.startDate,
      endDate: d.endDate,
      status: d.status,
    })),
  };
}
