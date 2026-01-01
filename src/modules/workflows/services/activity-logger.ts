import { db } from "@/lib/db";
import type { WorkflowActivityType } from "@prisma/client";

interface LogActivityOptions {
  taskId?: string;
  description: string;
  performedById?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a workflow activity event
 */
export async function logWorkflowActivity(
  instanceId: string,
  activityType: WorkflowActivityType,
  options: LogActivityOptions
): Promise<void> {
  await db.workflowActivity.create({
    data: {
      instanceId,
      activityType,
      taskId: options.taskId,
      description: options.description,
      performedById: options.performedById,
      metadata: options.metadata,
    },
  });
}

/**
 * Get activity log for a workflow instance
 */
export async function getWorkflowActivityLog(
  instanceId: string,
  options?: {
    limit?: number;
    offset?: number;
    activityTypes?: WorkflowActivityType[];
    taskId?: string;
  }
): Promise<
  Array<{
    id: string;
    activityType: WorkflowActivityType;
    taskId: string | null;
    description: string;
    performedById: string | null;
    performedByName: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
  }>
> {
  const activities = await db.workflowActivity.findMany({
    where: {
      instanceId,
      ...(options?.activityTypes && { activityType: { in: options.activityTypes } }),
      ...(options?.taskId && { taskId: options.taskId }),
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });

  // Get user names for activities
  const userIds = activities
    .filter((a) => a.performedById)
    .map((a) => a.performedById as string);

  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u.name]));

  return activities.map((activity) => ({
    id: activity.id,
    activityType: activity.activityType,
    taskId: activity.taskId,
    description: activity.description,
    performedById: activity.performedById,
    performedByName: activity.performedById
      ? userMap.get(activity.performedById) || null
      : null,
    metadata: activity.metadata as Record<string, unknown> | null,
    createdAt: activity.createdAt,
  }));
}

/**
 * Get summary statistics for a workflow
 */
export async function getWorkflowStats(instanceId: string): Promise<{
  totalActivities: number;
  taskCompletions: number;
  reassignments: number;
  nudgesSent: number;
  blockedEvents: number;
}> {
  const [total, completions, reassignments, nudges, blocked] = await Promise.all([
    db.workflowActivity.count({ where: { instanceId } }),
    db.workflowActivity.count({ where: { instanceId, activityType: "TASK_COMPLETED" } }),
    db.workflowActivity.count({ where: { instanceId, activityType: "TASK_REASSIGNED" } }),
    db.workflowActivity.count({ where: { instanceId, activityType: "NUDGE_SENT" } }),
    db.workflowActivity.count({ where: { instanceId, activityType: "TASK_BLOCKED" } }),
  ]);

  return {
    totalActivities: total,
    taskCompletions: completions,
    reassignments: reassignments,
    nudgesSent: nudges,
    blockedEvents: blocked,
  };
}

/**
 * Get recent activity across all workflows for an organization
 */
export async function getRecentOrgActivity(
  organizationId: string,
  limit: number = 20
): Promise<
  Array<{
    id: string;
    instanceId: string;
    workflowName: string;
    activityType: WorkflowActivityType;
    description: string;
    createdAt: Date;
  }>
> {
  const activities = await db.workflowActivity.findMany({
    where: {
      instance: {
        organizationId,
      },
    },
    include: {
      instance: {
        include: {
          template: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities.map((a) => ({
    id: a.id,
    instanceId: a.instanceId,
    workflowName: a.instance.template.name,
    activityType: a.activityType,
    description: a.description,
    createdAt: a.createdAt,
  }));
}
