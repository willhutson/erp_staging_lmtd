/**
 * DOA Notification Service
 *
 * Integrates Delegation of Authority events with the core notification system.
 * Sends notifications for delegation activation, handoffs, conflicts, etc.
 */

import { db } from "@/lib/db";
import { notificationService } from "@/lib/notifications/notification-service";

interface DelegationEventContext {
  delegationId: string;
  delegatorId: string;
  delegatorName: string;
  delegateId: string;
  delegateName: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
}

/**
 * Notify delegate that delegation has been activated
 */
export async function notifyDelegationActivated(
  context: DelegationEventContext
): Promise<void> {
  // Notify the delegate
  await notificationService.send({
    type: "delegation.activated",
    recipientId: context.delegateId,
    title: `You are now covering for ${context.delegatorName}`,
    body: `Delegation is active from ${formatDate(context.startDate)} to ${formatDate(context.endDate)}. Tasks will be routed to you during this period.`,
    actionUrl: "/settings/delegation",
    actionLabel: "View Coverage",
    entityType: "active_delegation",
    entityId: context.delegationId,
    metadata: {
      delegatorId: context.delegatorId,
      delegatorName: context.delegatorName,
      startDate: context.startDate.toISOString(),
      endDate: context.endDate.toISOString(),
    },
  });

  // Notify the delegator that coverage is active
  await notificationService.send({
    type: "delegation.activated",
    recipientId: context.delegatorId,
    title: `${context.delegateName} is now covering for you`,
    body: `Your delegation is active. Tasks will be routed to ${context.delegateName} until ${formatDate(context.endDate)}.`,
    actionUrl: "/settings/delegation",
    actionLabel: "View Delegation",
    entityType: "active_delegation",
    entityId: context.delegationId,
    channels: ["in_app", "email"],
    metadata: {
      delegateId: context.delegateId,
      delegateName: context.delegateName,
      startDate: context.startDate.toISOString(),
      endDate: context.endDate.toISOString(),
    },
  });
}

/**
 * Notify when a task is delegated to someone
 */
export async function notifyTaskDelegated(options: {
  delegateId: string;
  delegatorName: string;
  taskType: "brief" | "workflow_task" | "approval";
  taskId: string;
  taskTitle: string;
  delegationId: string;
}): Promise<void> {
  await notificationService.send({
    type: "delegation.task_assigned",
    recipientId: options.delegateId,
    title: `Task delegated: ${options.taskTitle}`,
    body: `You've been assigned this task while covering for ${options.delegatorName}`,
    actionUrl: getTaskUrl(options.taskType, options.taskId),
    actionLabel: "View Task",
    entityType: options.taskType,
    entityId: options.taskId,
    metadata: {
      delegatorName: options.delegatorName,
      delegationId: options.delegationId,
      taskType: options.taskType,
    },
  });
}

/**
 * Send return reminder to delegate (day before delegator returns)
 */
export async function notifyReturnReminder(
  context: DelegationEventContext
): Promise<void> {
  await notificationService.send({
    type: "delegation.return_reminder",
    recipientId: context.delegateId,
    title: `${context.delegatorName} returns tomorrow`,
    body: `Please prepare for handoff. Review any pending tasks and document important updates.`,
    actionUrl: "/settings/delegation",
    actionLabel: "Prepare Handoff",
    entityType: "active_delegation",
    entityId: context.delegationId,
    metadata: {
      delegatorId: context.delegatorId,
      delegatorName: context.delegatorName,
      returnDate: context.endDate.toISOString(),
    },
  });
}

/**
 * Notify delegator that handoff briefing is ready
 */
export async function notifyHandoffReady(
  context: DelegationEventContext
): Promise<void> {
  await notificationService.send({
    type: "delegation.handoff_ready",
    recipientId: context.delegatorId,
    title: "Your handoff briefing is ready",
    body: `${context.delegateName} has prepared a summary of activities during your absence.`,
    actionUrl: "/settings/delegation",
    actionLabel: "View Briefing",
    entityType: "active_delegation",
    entityId: context.delegationId,
    priority: "high",
    metadata: {
      delegateId: context.delegateId,
      delegateName: context.delegateName,
      coveragePeriod: {
        start: context.startDate.toISOString(),
        end: context.endDate.toISOString(),
      },
    },
  });

  // Also notify the delegate that handoff is ready for review
  await notificationService.send({
    type: "delegation.handoff_ready",
    recipientId: context.delegateId,
    title: `Handoff ready for ${context.delegatorName}`,
    body: "The handoff briefing has been generated. Please review and complete the handoff.",
    actionUrl: "/settings/delegation",
    actionLabel: "Complete Handoff",
    entityType: "active_delegation",
    entityId: context.delegationId,
    channels: ["in_app"],
    metadata: {
      delegatorId: context.delegatorId,
      delegatorName: context.delegatorName,
    },
  });
}

/**
 * Notify about delegation conflict during leave request
 */
export async function notifyDelegationConflict(options: {
  userId: string;
  conflictType: "mutual_delegation" | "chain_unavailable" | "coverage_gap";
  description: string;
  affectedUsers: Array<{ id: string; name: string }>;
  suggestedAction?: string;
}): Promise<void> {
  const conflictMessages = {
    mutual_delegation:
      "You and your delegate are both requesting overlapping leave",
    chain_unavailable:
      "Your delegate is also on leave during this period",
    coverage_gap: "No delegate is configured for your leave period",
  };

  await notificationService.send({
    type: "delegation.conflict_detected",
    recipientId: options.userId,
    title: "Leave delegation conflict",
    body:
      conflictMessages[options.conflictType] ||
      options.description,
    actionUrl: "/settings/delegation",
    actionLabel: "Resolve Conflict",
    entityType: "delegation_conflict",
    entityId: options.userId,
    priority: "high",
    metadata: {
      conflictType: options.conflictType,
      affectedUsers: options.affectedUsers,
      suggestedAction: options.suggestedAction,
    },
  });
}

/**
 * Send bulk notifications for upcoming delegations (for cron job)
 */
export async function processReturnReminders(
  organizationId: string
): Promise<number> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  // Find delegations ending tomorrow
  const delegations = await db.activeDelegation.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      endDate: {
        gte: tomorrow,
        lt: dayAfterTomorrow,
      },
    },
    include: {
      delegator: { select: { id: true, name: true } },
      delegate: { select: { id: true, name: true } },
    },
  });

  let sent = 0;

  for (const delegation of delegations) {
    await notifyReturnReminder({
      delegationId: delegation.id,
      delegatorId: delegation.delegatorId,
      delegatorName: delegation.delegator.name,
      delegateId: delegation.delegateId,
      delegateName: delegation.delegate.name,
      startDate: delegation.startDate,
      endDate: delegation.endDate,
      organizationId: delegation.organizationId,
    });
    sent++;
  }

  return sent;
}

// Helper functions

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getTaskUrl(
  taskType: "brief" | "workflow_task" | "approval",
  taskId: string
): string {
  switch (taskType) {
    case "brief":
      return `/briefs/${taskId}`;
    case "workflow_task":
      return `/workflows?task=${taskId}`;
    case "approval":
      return `/approvals/${taskId}`;
    default:
      return "/";
  }
}
