import { db } from "@/lib/db";
import type { WorkflowInstance, WorkflowTask, WorkflowTemplate } from "@prisma/client";
import type {
  WorkflowTemplateDefinition,
  TaskTemplate,
  WorkflowStartContext,
  CalculatedTaskDates,
  TriggerCondition,
} from "../types";
import { calculateTaskDates } from "./deadline-calculator";
import { findBestAssignee } from "./auto-assigner";
import { logWorkflowActivity } from "./activity-logger";

/**
 * Start a new workflow instance from a template
 */
export async function startWorkflow(
  context: WorkflowStartContext
): Promise<WorkflowInstance> {
  const template = await db.workflowTemplate.findFirst({
    where: {
      id: context.templateId,
      status: "PUBLISHED",
    },
  });

  if (!template) {
    throw new Error("Workflow template not found or not published");
  }

  const definition = parseTemplateDefinition(template);

  // Calculate all task dates based on deadline
  const taskDates = calculateTaskDates(
    definition.taskTemplates,
    context.deadline || null
  );

  // Create the workflow instance
  const instance = await db.workflowInstance.create({
    data: {
      organizationId: template.organizationId,
      templateId: template.id,
      triggerEntityType: context.triggerEntityType,
      triggerEntityId: context.triggerEntityId,
      triggerData: context.variables || {},
      deadline: context.deadline,
      ownerId: context.ownerId,
      status: "ACTIVE",
      progress: 0,
    },
  });

  // Create all tasks
  const tasks = await createWorkflowTasks(
    instance,
    definition.taskTemplates,
    taskDates,
    template.organizationId
  );

  // Log workflow started
  await logWorkflowActivity(instance.id, "WORKFLOW_STARTED", {
    description: `Workflow "${template.name}" started`,
    metadata: {
      templateId: template.id,
      templateName: template.name,
      triggerEntityType: context.triggerEntityType,
      triggerEntityId: context.triggerEntityId,
      taskCount: tasks.length,
    },
  });

  // Schedule initial nudges
  await scheduleNudges(instance.id, definition.nudgeRules, tasks);

  return instance;
}

/**
 * Create workflow tasks from templates
 */
async function createWorkflowTasks(
  instance: WorkflowInstance,
  taskTemplates: TaskTemplate[],
  taskDates: Map<string, CalculatedTaskDates>,
  organizationId: string
): Promise<WorkflowTask[]> {
  const tasks: WorkflowTask[] = [];

  for (const template of taskTemplates) {
    const dates = taskDates.get(template.id);
    if (!dates) continue;

    // Find best assignee for this task
    const assignment = await findBestAssignee(
      organizationId,
      template.assigneeRole,
      template.assigneeUserId,
      dates.dueDate
    );

    // Determine initial status based on dependencies
    const status = dates.canStart ? "READY" : "PENDING";

    const task = await db.workflowTask.create({
      data: {
        instanceId: instance.id,
        templateTaskId: template.id,
        name: template.name,
        description: template.description,
        assigneeId: assignment.assigneeId,
        assigneeRole: template.assigneeRole,
        dueDate: dates.dueDate,
        estimatedHours: template.estimatedHours,
        status,
        dependsOnIds: template.dependsOn,
      },
    });

    tasks.push(task);

    // Log task created
    await logWorkflowActivity(instance.id, "TASK_CREATED", {
      taskId: task.id,
      description: `Task "${template.name}" created`,
      metadata: {
        assigneeId: assignment.assigneeId,
        dueDate: dates.dueDate,
        dependencies: template.dependsOn,
      },
    });

    // If this task should create a brief, do it
    if (template.createsBrief) {
      await createLinkedBrief(task, template.createsBrief, instance, organizationId);
    }
  }

  return tasks;
}

/**
 * Complete a workflow task
 */
export async function completeTask(
  taskId: string,
  userId: string,
  notes?: string
): Promise<WorkflowTask> {
  const task = await db.workflowTask.findUnique({
    where: { id: taskId },
    include: { instance: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status === "COMPLETED") {
    throw new Error("Task already completed");
  }

  // Update task status
  const updatedTask = await db.workflowTask.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      notes,
    },
  });

  // Log task completed
  await logWorkflowActivity(task.instanceId, "TASK_COMPLETED", {
    taskId: task.id,
    description: `Task "${task.name}" completed`,
    performedById: userId,
  });

  // Check if dependent tasks can now start
  await updateDependentTasks(task.instanceId, task.templateTaskId);

  // Update workflow progress
  await updateWorkflowProgress(task.instanceId);

  return updatedTask;
}

/**
 * Update tasks that depend on a completed task
 */
async function updateDependentTasks(instanceId: string, completedTaskId: string): Promise<void> {
  // Find tasks that depend on this one
  const dependentTasks = await db.workflowTask.findMany({
    where: {
      instanceId,
      status: "PENDING",
      dependsOnIds: { has: completedTaskId },
    },
  });

  for (const task of dependentTasks) {
    // Check if all dependencies are now complete
    const pendingDeps = await db.workflowTask.count({
      where: {
        instanceId,
        templateTaskId: { in: task.dependsOnIds },
        status: { not: "COMPLETED" },
      },
    });

    if (pendingDeps === 0) {
      await db.workflowTask.update({
        where: { id: task.id },
        data: { status: "READY" },
      });
    }
  }
}

/**
 * Update workflow progress percentage
 */
async function updateWorkflowProgress(instanceId: string): Promise<void> {
  const [total, completed] = await Promise.all([
    db.workflowTask.count({ where: { instanceId, status: { not: "SKIPPED" } } }),
    db.workflowTask.count({ where: { instanceId, status: "COMPLETED" } }),
  ]);

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Check if workflow is complete
  const isComplete = progress === 100;

  await db.workflowInstance.update({
    where: { id: instanceId },
    data: {
      progress,
      status: isComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isComplete ? new Date() : null,
    },
  });

  if (isComplete) {
    await logWorkflowActivity(instanceId, "WORKFLOW_COMPLETED", {
      description: "Workflow completed",
    });
  }
}

/**
 * Start a task (mark as in progress)
 */
export async function startTask(taskId: string, userId: string): Promise<WorkflowTask> {
  const task = await db.workflowTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (!["READY", "PENDING"].includes(task.status)) {
    throw new Error("Task cannot be started in current status");
  }

  const updatedTask = await db.workflowTask.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });

  await logWorkflowActivity(task.instanceId, "TASK_STARTED", {
    taskId: task.id,
    description: `Task "${task.name}" started`,
    performedById: userId,
  });

  return updatedTask;
}

/**
 * Block a task with a reason
 */
export async function blockTask(
  taskId: string,
  userId: string,
  reason: string
): Promise<WorkflowTask> {
  const task = await db.workflowTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const updatedTask = await db.workflowTask.update({
    where: { id: taskId },
    data: {
      status: "BLOCKED",
      blockedReason: reason,
    },
  });

  await logWorkflowActivity(task.instanceId, "TASK_BLOCKED", {
    taskId: task.id,
    description: `Task "${task.name}" blocked: ${reason}`,
    performedById: userId,
    metadata: { reason },
  });

  return updatedTask;
}

/**
 * Reassign a task to a different user
 */
export async function reassignTask(
  taskId: string,
  newAssigneeId: string,
  userId: string,
  reason?: string
): Promise<WorkflowTask> {
  const task = await db.workflowTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const previousAssigneeId = task.assigneeId;

  const updatedTask = await db.workflowTask.update({
    where: { id: taskId },
    data: {
      assigneeId: newAssigneeId,
    },
  });

  await logWorkflowActivity(task.instanceId, "TASK_REASSIGNED", {
    taskId: task.id,
    description: `Task "${task.name}" reassigned`,
    performedById: userId,
    metadata: {
      previousAssigneeId,
      newAssigneeId,
      reason,
    },
  });

  return updatedTask;
}

/**
 * Cancel a workflow instance
 */
export async function cancelWorkflow(
  instanceId: string,
  userId: string,
  reason?: string
): Promise<WorkflowInstance> {
  const instance = await db.workflowInstance.findUnique({
    where: { id: instanceId },
  });

  if (!instance) {
    throw new Error("Workflow instance not found");
  }

  // Cancel all pending/in-progress tasks
  await db.workflowTask.updateMany({
    where: {
      instanceId,
      status: { in: ["PENDING", "READY", "IN_PROGRESS"] },
    },
    data: { status: "CANCELLED" },
  });

  const updatedInstance = await db.workflowInstance.update({
    where: { id: instanceId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  await logWorkflowActivity(instanceId, "WORKFLOW_CANCELLED", {
    description: `Workflow cancelled${reason ? `: ${reason}` : ""}`,
    performedById: userId,
    metadata: { reason },
  });

  return updatedInstance;
}

/**
 * Create a linked brief from a task
 */
async function createLinkedBrief(
  task: WorkflowTask,
  briefConfig: NonNullable<TaskTemplate["createsBrief"]>,
  instance: WorkflowInstance,
  organizationId: string
): Promise<void> {
  // TODO: Implement brief creation with template interpolation
  // This would create a brief using the briefConfig settings
  // and link it back to the task via linkedBriefId

  await logWorkflowActivity(instance.id, "BRIEF_CREATED", {
    taskId: task.id,
    description: `Brief created for task "${task.name}"`,
    metadata: {
      briefType: briefConfig.briefType,
    },
  });
}

/**
 * Schedule nudges for workflow tasks
 */
async function scheduleNudges(
  instanceId: string,
  nudgeRules: WorkflowTemplateDefinition["nudgeRules"],
  tasks: WorkflowTask[]
): Promise<void> {
  // TODO: Implement nudge scheduling based on rules
  // This would create WorkflowNudge records with scheduledAt times
}

/**
 * Parse template definition from JSON
 */
function parseTemplateDefinition(template: WorkflowTemplate): WorkflowTemplateDefinition {
  return {
    triggerType: template.triggerType,
    triggerConditions: (template.triggerConditions as TriggerCondition[]) || [],
    taskTemplates: (template.taskTemplates as TaskTemplate[]) || [],
    nudgeRules: (template.nudgeRules as WorkflowTemplateDefinition["nudgeRules"]) || [],
    stageGates: (template.stageGates as WorkflowTemplateDefinition["stageGates"]) || [],
    aiSkills: (template.aiSkills as WorkflowTemplateDefinition["aiSkills"]) || [],
  };
}

/**
 * Check if trigger conditions are met
 */
export function checkTriggerConditions(
  conditions: TriggerCondition[],
  entity: Record<string, unknown>
): boolean {
  if (conditions.length === 0) return true;

  return conditions.every((condition) => {
    const value = entity[condition.field];

    switch (condition.operator) {
      case "equals":
        return value === condition.value;
      case "not_equals":
        return value !== condition.value;
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(value);
      case "not_in":
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case "gt":
        return typeof value === "number" && typeof condition.value === "number" && value > condition.value;
      case "lt":
        return typeof value === "number" && typeof condition.value === "number" && value < condition.value;
      case "contains":
        return typeof value === "string" && typeof condition.value === "string" && value.includes(condition.value);
      default:
        return false;
    }
  });
}
