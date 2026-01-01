/**
 * Handoff Service
 *
 * Manages the return handoff process when someone comes back from leave.
 * Generates briefings, schedules sync meetings, and reassigns tasks.
 */

import { db } from "@/lib/db";
import type { HandoffBriefing, LogDelegationActivityOptions } from "../types";
import { notifyHandoffReady, notifyReturnReminder } from "./notification-service";

/**
 * Generate a handoff briefing for someone returning from leave
 */
export async function generateHandoffBriefing(
  activeDelegationId: string
): Promise<HandoffBriefing> {
  const delegation = await db.activeDelegation.findUnique({
    where: { id: activeDelegationId },
    include: {
      delegator: { select: { name: true } },
      delegate: { select: { name: true } },
      activities: {
        orderBy: { createdAt: "asc" },
        include: {
          performedBy: { select: { name: true } },
        },
      },
    },
  });

  if (!delegation) {
    throw new Error("Active delegation not found");
  }

  // Group activities by type and status
  const completed: HandoffBriefing["summary"]["completed"] = [];
  const inProgress: HandoffBriefing["summary"]["inProgress"] = [];
  const escalated: HandoffBriefing["summary"]["escalated"] = [];
  const newAssignments: HandoffBriefing["summary"]["newAssignments"] = [];

  for (const activity of delegation.activities) {
    const metadata = activity.metadata as Record<string, unknown> | null;

    switch (activity.activityType) {
      case "TASK_COMPLETED":
        completed.push({
          entityType: activity.entityType,
          entityId: activity.entityId,
          title: metadata?.title as string || activity.description,
          completedAt: activity.createdAt,
          notes: metadata?.notes as string | undefined,
        });
        break;

      case "TASK_ASSIGNED":
        newAssignments.push({
          entityType: activity.entityType,
          entityId: activity.entityId,
          title: metadata?.title as string || activity.description,
          assignedAt: activity.createdAt,
          dueDate: new Date(metadata?.dueDate as string || activity.createdAt),
        });
        break;

      case "TASK_ESCALATED":
        escalated.push({
          entityType: activity.entityType,
          entityId: activity.entityId,
          title: metadata?.title as string || activity.description,
          reason: metadata?.reason as string || "Escalated during coverage",
          escalatedTo: metadata?.escalatedTo as string || "Manager",
        });
        break;
    }
  }

  // Get tasks that are still in progress
  const pendingBriefs = await db.brief.findMany({
    where: {
      assigneeId: delegation.delegatorId,
      status: { in: ["IN_PROGRESS", "IN_REVIEW", "INTERNAL_REVIEW", "CLIENT_REVIEW"] },
    },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  for (const brief of pendingBriefs) {
    inProgress.push({
      entityType: "brief",
      entityId: brief.id,
      title: brief.title,
      progress: ["IN_REVIEW", "INTERNAL_REVIEW", "CLIENT_REVIEW"].includes(brief.status) ? "In review" : "In progress",
    });
  }

  // Generate recommended actions
  const recommendedActions: string[] = [];

  if (escalated.length > 0) {
    recommendedActions.push(
      `Review ${escalated.length} escalated item(s) that need your attention`
    );
  }

  if (newAssignments.length > 0) {
    recommendedActions.push(
      `Check ${newAssignments.length} new assignment(s) that came in during your leave`
    );
  }

  if (inProgress.length > 0) {
    recommendedActions.push(
      `Follow up on ${inProgress.length} in-progress task(s)`
    );
  }

  recommendedActions.push(`Thank ${delegation.delegate.name} for covering`);

  // Generate meeting agenda
  const suggestedMeetingAgenda = [
    "Quick overview of coverage period",
    "Walk through completed items",
    "Discuss any issues or blockers encountered",
    "Review escalated items and next steps",
    "Hand back in-progress tasks",
    "Any context or notes for continuing work",
  ];

  return {
    generatedAt: new Date(),
    coveragePeriod: {
      start: delegation.startDate,
      end: delegation.endDate,
    },
    delegateName: delegation.delegate.name,
    summary: {
      completed,
      inProgress,
      escalated,
      newAssignments,
    },
    recommendedActions,
    suggestedMeetingAgenda,
  };
}

/**
 * Start the handoff process
 */
export async function startHandoff(activeDelegationId: string): Promise<void> {
  const delegation = await db.activeDelegation.findUnique({
    where: { id: activeDelegationId },
    include: {
      delegator: { select: { id: true, name: true } },
      delegate: { select: { id: true, name: true } },
    },
  });

  if (!delegation) {
    throw new Error("Active delegation not found");
  }

  // Generate and store the briefing
  const briefing = await generateHandoffBriefing(activeDelegationId);

  await db.activeDelegation.update({
    where: { id: activeDelegationId },
    data: {
      handoffScheduled: true,
      handoffBriefing: briefing as unknown as object,
    },
  });

  // Log the handoff started activity
  await logDelegationActivity({
    activeDelegationId,
    activityType: "HANDOFF_STARTED",
    entityType: "delegation",
    entityId: activeDelegationId,
    description: "Handoff process initiated",
    performedById: delegation.delegatorId,
    metadata: { briefingGenerated: true },
  });

  // Notify both parties that handoff is ready
  await notifyHandoffReady({
    delegationId: delegation.id,
    delegatorId: delegation.delegatorId,
    delegatorName: delegation.delegator.name,
    delegateId: delegation.delegateId,
    delegateName: delegation.delegate.name,
    startDate: delegation.startDate,
    endDate: delegation.endDate,
    organizationId: delegation.organizationId,
  });
}

/**
 * Complete the handoff process
 */
export async function completeHandoff(
  activeDelegationId: string,
  notes?: string
): Promise<void> {
  const delegation = await db.activeDelegation.findUnique({
    where: { id: activeDelegationId },
  });

  if (!delegation) {
    throw new Error("Active delegation not found");
  }

  // Update delegation status
  await db.activeDelegation.update({
    where: { id: activeDelegationId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      handoffCompletedAt: new Date(),
      handoffNotes: notes,
    },
  });

  // Log the handoff completed
  await logDelegationActivity({
    activeDelegationId,
    activityType: "HANDOFF_COMPLETED",
    entityType: "delegation",
    entityId: activeDelegationId,
    description: "Handoff completed",
    performedById: delegation.delegatorId,
    metadata: { notes },
  });

  // Reassign any tasks back to the original owner
  await reassignTasksBack(delegation.delegatorId, delegation.delegateId);
}

/**
 * Reassign tasks from delegate back to original owner
 */
async function reassignTasksBack(
  originalOwnerId: string,
  delegateId: string
): Promise<void> {
  // Find briefs that were temporarily with the delegate
  // (that have the original owner in backup)
  const briefsToReassign = await db.brief.findMany({
    where: {
      assigneeId: delegateId,
      backupAssigneeId: originalOwnerId,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
    select: { id: true },
  });

  // Swap assignee and backup assignee
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
 * Log a delegation activity
 */
export async function logDelegationActivity(
  options: LogDelegationActivityOptions
): Promise<void> {
  await db.delegationActivity.create({
    data: {
      activeDelegationId: options.activeDelegationId,
      activityType: options.activityType,
      entityType: options.entityType,
      entityId: options.entityId,
      description: options.description,
      performedById: options.performedById,
      metadata: options.metadata,
    },
  });
}

/**
 * Schedule return reminders
 */
export async function scheduleReturnReminders(
  activeDelegationId: string
): Promise<void> {
  const delegation = await db.activeDelegation.findUnique({
    where: { id: activeDelegationId },
    include: {
      delegator: { select: { email: true, name: true } },
      delegate: { select: { email: true, name: true } },
    },
  });

  if (!delegation) return;

  const returnDate = delegation.endDate;
  const dayBefore = new Date(returnDate);
  dayBefore.setDate(dayBefore.getDate() - 1);

  // In a real implementation, this would schedule notifications
  // For now, we'll just log that reminders should be sent
  console.log(
    `[DOA] Scheduled return reminder for ${delegation.delegator.name} on ${dayBefore.toISOString()}`
  );
  console.log(
    `[DOA] Will notify ${delegation.delegate.name} to prepare handoff`
  );
}

/**
 * Get delegations that need handoff (return is today or past)
 */
export async function getDelegationsNeedingHandoff(
  organizationId: string
): Promise<
  Array<{
    id: string;
    delegatorId: string;
    delegatorName: string;
    delegateId: string;
    delegateName: string;
    endDate: Date;
    handoffScheduled: boolean;
  }>
> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delegations = await db.activeDelegation.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      endDate: { lte: today },
      handoffCompletedAt: null,
    },
    include: {
      delegator: { select: { name: true } },
      delegate: { select: { name: true } },
    },
  });

  return delegations.map((d) => ({
    id: d.id,
    delegatorId: d.delegatorId,
    delegatorName: d.delegator.name,
    delegateId: d.delegateId,
    delegateName: d.delegate.name,
    endDate: d.endDate,
    handoffScheduled: d.handoffScheduled,
  }));
}

/**
 * Get upcoming returns (for dashboard widget)
 */
export async function getUpcomingReturns(
  organizationId: string,
  daysAhead: number = 7
): Promise<
  Array<{
    delegatorId: string;
    delegatorName: string;
    returnDate: Date;
    delegateName: string;
  }>
> {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const delegations = await db.activeDelegation.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      endDate: { gte: now, lte: futureDate },
    },
    include: {
      delegator: { select: { name: true } },
      delegate: { select: { name: true } },
    },
    orderBy: { endDate: "asc" },
  });

  return delegations.map((d) => ({
    delegatorId: d.delegatorId,
    delegatorName: d.delegator.name,
    returnDate: d.endDate,
    delegateName: d.delegate.name,
  }));
}
