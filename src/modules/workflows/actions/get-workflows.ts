"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { WorkflowInstanceStatus, WorkflowTaskStatus } from "@prisma/client";

export interface WorkflowListItem {
  id: string;
  name: string;
  templateName: string;
  triggerEntityType: string;
  triggerEntityId: string;
  triggerData: {
    name?: string;
    clientName?: string;
    [key: string]: unknown;
  } | null;
  deadline: Date | null;
  startedAt: Date;
  completedAt: Date | null;
  status: WorkflowInstanceStatus;
  progress: number;
  owner: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  taskCounts: {
    total: number;
    completed: number;
    overdue: number;
    blocked: number;
  };
  nextTask: {
    id: string;
    name: string;
    dueDate: Date;
    status: WorkflowTaskStatus;
    assignee: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export async function getWorkflowInstances(
  filters?: {
    status?: WorkflowInstanceStatus;
    templateId?: string;
  }
): Promise<WorkflowListItem[]> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  const where: Parameters<typeof db.workflowInstance.findMany>[0]["where"] = {
    organizationId: session.user.organizationId,
  };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.templateId) {
    where.templateId = filters.templateId;
  }

  const instances = await db.workflowInstance.findMany({
    where,
    include: {
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      tasks: {
        select: {
          id: true,
          name: true,
          status: true,
          dueDate: true,
          assigneeId: true,
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Fetch owner info
  const ownerIds = [...new Set(instances.map((i) => i.ownerId))];
  const owners = await db.user.findMany({
    where: { id: { in: ownerIds } },
    select: { id: true, name: true, avatarUrl: true },
  });
  const ownerMap = new Map(owners.map((o) => [o.id, o]));

  // Fetch assignee info for next tasks
  const assigneeIds = instances
    .flatMap((i) => i.tasks.map((t) => t.assigneeId))
    .filter((id): id is string => id !== null);
  const assignees = await db.user.findMany({
    where: { id: { in: [...new Set(assigneeIds)] } },
    select: { id: true, name: true },
  });
  const assigneeMap = new Map(assignees.map((a) => [a.id, a]));

  const now = new Date();

  return instances.map((instance) => {
    const completedTasks = instance.tasks.filter((t) => t.status === "COMPLETED");
    const blockedTasks = instance.tasks.filter((t) => t.status === "BLOCKED");
    const overdueTasks = instance.tasks.filter(
      (t) => t.status !== "COMPLETED" && t.dueDate < now
    );

    // Find next incomplete task
    const nextTask = instance.tasks.find(
      (t) => t.status !== "COMPLETED" && t.status !== "BLOCKED"
    );

    const owner = ownerMap.get(instance.ownerId) || {
      id: instance.ownerId,
      name: "Unknown",
      avatarUrl: null,
    };

    return {
      id: instance.id,
      name: instance.template.name,
      templateName: instance.template.name,
      triggerEntityType: instance.triggerEntityType,
      triggerEntityId: instance.triggerEntityId,
      triggerData: instance.triggerData as WorkflowListItem["triggerData"],
      deadline: instance.deadline,
      startedAt: instance.startedAt,
      completedAt: instance.completedAt,
      status: instance.status,
      progress: instance.progress,
      owner,
      taskCounts: {
        total: instance.tasks.length,
        completed: completedTasks.length,
        overdue: overdueTasks.length,
        blocked: blockedTasks.length,
      },
      nextTask: nextTask
        ? {
            id: nextTask.id,
            name: nextTask.name,
            dueDate: nextTask.dueDate,
            status: nextTask.status,
            assignee: nextTask.assigneeId
              ? assigneeMap.get(nextTask.assigneeId) || null
              : null,
          }
        : null,
    };
  });
}

export interface WorkflowDetail {
  id: string;
  templateId: string;
  templateName: string;
  triggerEntityType: string;
  triggerEntityId: string;
  triggerData: Record<string, unknown> | null;
  deadline: Date | null;
  startedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  status: WorkflowInstanceStatus;
  progress: number;
  owner: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
  tasks: Array<{
    id: string;
    templateTaskId: string;
    name: string;
    description: string | null;
    assignee: {
      id: string;
      name: string;
      avatarUrl: string | null;
    } | null;
    assigneeRole: string;
    dueDate: Date;
    startedAt: Date | null;
    completedAt: Date | null;
    status: WorkflowTaskStatus;
    blockedReason: string | null;
    dependsOnIds: string[];
    linkedBriefId: string | null;
  }>;
  activityLog: Array<{
    id: string;
    activityType: string;
    description: string | null;
    actor: {
      id: string;
      name: string;
    } | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
  }>;
}

export async function getWorkflowDetail(
  instanceId: string
): Promise<WorkflowDetail | null> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return null;
  }

  const instance = await db.workflowInstance.findFirst({
    where: {
      id: instanceId,
      organizationId: session.user.organizationId,
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      tasks: {
        orderBy: {
          dueDate: "asc",
        },
      },
      activityLog: {
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      },
    },
  });

  if (!instance) return null;

  // Fetch owner
  const owner = await db.user.findUnique({
    where: { id: instance.ownerId },
    select: { id: true, name: true, avatarUrl: true, role: true },
  });

  // Fetch task assignees
  const assigneeIds = instance.tasks
    .map((t) => t.assigneeId)
    .filter((id): id is string => id !== null);
  const assignees = await db.user.findMany({
    where: { id: { in: [...new Set(assigneeIds)] } },
    select: { id: true, name: true, avatarUrl: true },
  });
  const assigneeMap = new Map(assignees.map((a) => [a.id, a]));

  // Fetch activity actors
  const actorIds = instance.activityLog
    .map((a) => a.actorId)
    .filter((id): id is string => id !== null);
  const actors = await db.user.findMany({
    where: { id: { in: [...new Set(actorIds)] } },
    select: { id: true, name: true },
  });
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  return {
    id: instance.id,
    templateId: instance.templateId,
    templateName: instance.template.name,
    triggerEntityType: instance.triggerEntityType,
    triggerEntityId: instance.triggerEntityId,
    triggerData: instance.triggerData as Record<string, unknown> | null,
    deadline: instance.deadline,
    startedAt: instance.startedAt,
    completedAt: instance.completedAt,
    cancelledAt: instance.cancelledAt,
    status: instance.status,
    progress: instance.progress,
    owner: owner || {
      id: instance.ownerId,
      name: "Unknown",
      avatarUrl: null,
      role: "Unknown",
    },
    tasks: instance.tasks.map((task) => ({
      id: task.id,
      templateTaskId: task.templateTaskId,
      name: task.name,
      description: task.description,
      assignee: task.assigneeId ? assigneeMap.get(task.assigneeId) || null : null,
      assigneeRole: task.assigneeRole,
      dueDate: task.dueDate,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      status: task.status,
      blockedReason: task.blockedReason,
      dependsOnIds: task.dependsOnIds,
      linkedBriefId: task.linkedBriefId,
    })),
    activityLog: instance.activityLog.map((activity) => ({
      id: activity.id,
      activityType: activity.activityType,
      description: activity.description,
      actor: activity.actorId ? actorMap.get(activity.actorId) || null : null,
      metadata: activity.metadata as Record<string, unknown> | null,
      createdAt: activity.createdAt,
    })),
  };
}

export async function getWorkflowTemplates() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  const templates = await db.workflowTemplate.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: "PUBLISHED",
      isLatest: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      module: true,
      triggerType: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return templates;
}
