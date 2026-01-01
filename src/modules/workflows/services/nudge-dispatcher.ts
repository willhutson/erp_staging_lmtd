import { db } from "@/lib/db";
import type { NudgeChannel, WorkflowTask, WorkflowNudge } from "@prisma/client";
import type { NudgeRule } from "../types";
import { logWorkflowActivity } from "./activity-logger";
import { notificationService } from "@/lib/notifications/notification-service";

/**
 * Schedule nudges for a task based on rules
 */
export async function scheduleTaskNudges(
  instanceId: string,
  task: WorkflowTask,
  rules: NudgeRule[]
): Promise<void> {
  const applicableRules = rules.filter(
    (rule) => !rule.taskIds || rule.taskIds.includes(task.templateTaskId)
  );

  for (const rule of applicableRules) {
    const scheduledAt = calculateNudgeTime(task.dueDate, rule.trigger);
    if (!scheduledAt) continue;

    // Skip if scheduled time is in the past
    if (scheduledAt < new Date()) continue;

    // Get recipients
    const recipients = await resolveRecipients(instanceId, task.id, rule.recipients);

    for (const recipientId of recipients) {
      // Generate message from template
      const message = interpolateMessage(rule.messageTemplate, {
        taskName: task.name,
        dueDate: task.dueDate.toLocaleDateString("en-GB"),
        dueDateRelative: getRelativeDate(task.dueDate),
      });

      await db.workflowNudge.create({
        data: {
          instanceId,
          taskId: task.id,
          ruleId: rule.id,
          recipientId,
          channel: rule.channel,
          message,
          scheduledAt,
        },
      });
    }
  }
}

/**
 * Process due nudges (called by cron job)
 */
export async function processDueNudges(): Promise<number> {
  const dueNudges = await db.workflowNudge.findMany({
    where: {
      scheduledAt: { lte: new Date() },
      sentAt: null,
      failed: false,
    },
    include: {
      task: true,
      instance: {
        include: {
          template: { select: { name: true } },
        },
      },
    },
    take: 100, // Process in batches
  });

  let sentCount = 0;

  for (const nudge of dueNudges) {
    try {
      await sendNudge(nudge);
      sentCount++;

      await db.workflowNudge.update({
        where: { id: nudge.id },
        data: { sentAt: new Date() },
      });

      await logWorkflowActivity(nudge.instanceId, "NUDGE_SENT", {
        taskId: nudge.taskId,
        description: `Nudge sent via ${nudge.channel}`,
        metadata: {
          recipientId: nudge.recipientId,
          channel: nudge.channel,
          ruleId: nudge.ruleId,
        },
      });
    } catch (error) {
      await db.workflowNudge.update({
        where: { id: nudge.id },
        data: {
          failed: true,
          failureReason: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return sentCount;
}

/**
 * Send a nudge through the appropriate channel
 */
async function sendNudge(
  nudge: WorkflowNudge & {
    task: WorkflowTask;
    instance: { template: { name: string } };
  }
): Promise<void> {
  const recipient = await db.user.findUnique({
    where: { id: nudge.recipientId },
    select: { email: true, name: true },
  });

  if (!recipient) {
    throw new Error("Recipient not found");
  }

  switch (nudge.channel) {
    case "SLACK":
      await sendSlackNudge(nudge, recipient);
      break;
    case "EMAIL":
      await sendEmailNudge(nudge, recipient);
      break;
    case "IN_APP":
      await sendInAppNudge(nudge, recipient);
      break;
    case "SMS":
      // SMS not implemented
      throw new Error("SMS not implemented");
    default:
      throw new Error(`Unknown channel: ${nudge.channel}`);
  }
}

/**
 * Send Slack nudge via notification service
 */
async function sendSlackNudge(
  nudge: WorkflowNudge & { task: WorkflowTask; instance: { template: { name: string } } },
  recipient: { email: string; name: string }
): Promise<void> {
  // Determine notification type based on nudge timing
  const isOverdue = nudge.task.dueDate < new Date();
  const notificationType = isOverdue ? 'workflow.task_overdue' : 'workflow.task_due_soon';

  await notificationService.send({
    type: notificationType,
    recipientId: nudge.recipientId,
    title: `${nudge.instance.template.name}: ${nudge.task.name}`,
    body: nudge.message,
    actionUrl: `/workflows/${nudge.instanceId}`,
    actionLabel: 'View Task',
    entityType: 'workflow_task',
    entityId: nudge.taskId,
    channels: ['slack'],
    metadata: {
      workflowName: nudge.instance.template.name,
      taskName: nudge.task.name,
      dueDate: nudge.task.dueDate.toISOString(),
    },
  });
}

/**
 * Send email nudge via notification service
 */
async function sendEmailNudge(
  nudge: WorkflowNudge & { task: WorkflowTask; instance: { template: { name: string } } },
  recipient: { email: string; name: string }
): Promise<void> {
  const isOverdue = nudge.task.dueDate < new Date();
  const notificationType = isOverdue ? 'workflow.task_overdue' : 'workflow.task_due_soon';

  await notificationService.send({
    type: notificationType,
    recipientId: nudge.recipientId,
    title: `Reminder: ${nudge.task.name}`,
    body: nudge.message,
    actionUrl: `/workflows/${nudge.instanceId}`,
    actionLabel: 'View Task',
    entityType: 'workflow_task',
    entityId: nudge.taskId,
    channels: ['email'],
    metadata: {
      workflowName: nudge.instance.template.name,
      taskName: nudge.task.name,
      dueDate: nudge.task.dueDate.toISOString(),
    },
  });
}

/**
 * Send in-app notification via notification service
 */
async function sendInAppNudge(
  nudge: WorkflowNudge & { task: WorkflowTask; instance: { template: { name: string } } },
  recipient: { email: string; name: string }
): Promise<void> {
  const isOverdue = nudge.task.dueDate < new Date();
  const notificationType = isOverdue ? 'workflow.task_overdue' : 'workflow.task_due_soon';

  await notificationService.send({
    type: notificationType,
    recipientId: nudge.recipientId,
    title: `${nudge.instance.template.name}: ${nudge.task.name}`,
    body: nudge.message,
    actionUrl: `/workflows/${nudge.instanceId}`,
    actionLabel: 'View Task',
    entityType: 'workflow_task',
    entityId: nudge.taskId,
    channels: ['in_app'],
    metadata: {
      workflowName: nudge.instance.template.name,
      taskName: nudge.task.name,
      dueDate: nudge.task.dueDate.toISOString(),
    },
  });
}

/**
 * Calculate when a nudge should be sent
 */
function calculateNudgeTime(
  dueDate: Date,
  trigger: NudgeRule["trigger"]
): Date | null {
  const result = new Date(dueDate);

  switch (trigger.type) {
    case "before_due":
      if (!trigger.offset || !trigger.unit) return null;
      if (trigger.unit === "hours") {
        result.setHours(result.getHours() - trigger.offset);
      } else {
        result.setDate(result.getDate() - trigger.offset);
      }
      return result;

    case "on_due":
      return result;

    case "after_due":
      if (!trigger.offset || !trigger.unit) return null;
      if (trigger.unit === "hours") {
        result.setHours(result.getHours() + trigger.offset);
      } else {
        result.setDate(result.getDate() + trigger.offset);
      }
      return result;

    case "task_started":
    case "task_blocked":
      // These are event-based, not time-based
      return null;

    default:
      return null;
  }
}

/**
 * Resolve recipient roles to user IDs
 */
async function resolveRecipients(
  instanceId: string,
  taskId: string,
  recipients: NudgeRule["recipients"]
): Promise<string[]> {
  const userIds: string[] = [];

  const task = await db.workflowTask.findUnique({
    where: { id: taskId },
    include: {
      instance: {
        select: { ownerId: true },
      },
    },
  });

  if (!task) return [];

  for (const recipient of recipients) {
    switch (recipient) {
      case "assignee":
        if (task.assigneeId) {
          userIds.push(task.assigneeId);
        }
        break;

      case "owner":
        userIds.push(task.instance.ownerId);
        break;

      case "manager":
        // Get the assignee's manager
        if (task.assigneeId) {
          const user = await db.user.findUnique({
            where: { id: task.assigneeId },
            select: { teamLeadId: true },
          });
          if (user?.teamLeadId) {
            userIds.push(user.teamLeadId);
          }
        }
        break;

      case "creator":
        // Creator would be tracked separately
        break;
    }
  }

  return [...new Set(userIds)]; // Remove duplicates
}

/**
 * Interpolate variables in message template
 */
function interpolateMessage(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  return result;
}

/**
 * Get relative date string
 */
function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} overdue`;
  } else if (diffDays === 0) {
    return "today";
  } else if (diffDays === 1) {
    return "tomorrow";
  } else {
    return `in ${diffDays} days`;
  }
}

/**
 * Acknowledge a nudge (user has seen/responded)
 */
export async function acknowledgeNudge(nudgeId: string): Promise<void> {
  const nudge = await db.workflowNudge.update({
    where: { id: nudgeId },
    data: { acknowledgedAt: new Date() },
  });

  await logWorkflowActivity(nudge.instanceId, "NUDGE_ACKNOWLEDGED", {
    taskId: nudge.taskId,
    description: "Nudge acknowledged",
    metadata: { nudgeId },
  });
}

/**
 * Get pending nudges for a user
 */
export async function getPendingNudgesForUser(
  userId: string
): Promise<
  Array<{
    id: string;
    taskId: string;
    taskName: string;
    workflowName: string;
    message: string;
    scheduledAt: Date;
  }>
> {
  const nudges = await db.workflowNudge.findMany({
    where: {
      recipientId: userId,
      sentAt: { not: null },
      acknowledgedAt: null,
    },
    include: {
      task: { select: { name: true } },
      instance: {
        include: { template: { select: { name: true } } },
      },
    },
    orderBy: { scheduledAt: "desc" },
  });

  return nudges.map((n) => ({
    id: n.id,
    taskId: n.taskId,
    taskName: n.task.name,
    workflowName: n.instance.template.name,
    message: n.message,
    scheduledAt: n.scheduledAt,
  }));
}
