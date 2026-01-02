"use server";

import { getStudioUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
  WorkflowDefinitionWithRelations,
  WorkflowRunWithRelations,
  WorkflowTaskWithRelations,
  CreateWorkflowDefinitionInput,
  UpdateWorkflowDefinitionInput,
  CreateWorkflowStepInput,
  StartWorkflowInput,
  CompleteTaskInput,
} from "./types";

// ============================================
// Workflow Definition Actions
// ============================================

export async function getWorkflowDefinitions(): Promise<WorkflowDefinitionWithRelations[]> {
  const user = await getStudioUser();

  const definitions = await prisma.workflowDefinition.findMany({
    where: {
      organizationId: user.organizationId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { steps: true, runs: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return definitions as WorkflowDefinitionWithRelations[];
}

export async function getWorkflowDefinition(id: string): Promise<WorkflowDefinitionWithRelations | null> {
  const user = await getStudioUser();

  const definition = await prisma.workflowDefinition.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      steps: {
        orderBy: { position: "asc" },
      },
      _count: {
        select: { steps: true, runs: true },
      },
    },
  });

  return definition as WorkflowDefinitionWithRelations | null;
}

export async function createWorkflowDefinition(
  input: CreateWorkflowDefinitionInput
): Promise<WorkflowDefinitionWithRelations> {
  const user = await getStudioUser();

  const definition = await prisma.workflowDefinition.create({
    data: {
      organizationId: user.organizationId,
      name: input.name,
      description: input.description,
      icon: input.icon,
      color: input.color,
      category: input.category,
      triggerType: input.triggerType || "MANUAL",
      triggerEntity: input.triggerEntity,
      triggerConfig: input.triggerConfig,
      defaultSlaHours: input.defaultSlaHours,
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { steps: true, runs: true },
      },
    },
  });

  revalidatePath("/workflows");

  return definition as WorkflowDefinitionWithRelations;
}

export async function updateWorkflowDefinition(
  id: string,
  input: UpdateWorkflowDefinitionInput
): Promise<WorkflowDefinitionWithRelations> {
  const user = await getStudioUser();

  // Verify ownership
  const existing = await prisma.workflowDefinition.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!existing) {
    throw new Error("Workflow definition not found");
  }

  const definition = await prisma.workflowDefinition.update({
    where: { id },
    data: {
      ...input,
      version: { increment: 1 },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { steps: true, runs: true },
      },
    },
  });

  revalidatePath("/workflows");
  revalidatePath(`/workflows/${id}`);

  return definition as WorkflowDefinitionWithRelations;
}

// ============================================
// Workflow Step Actions
// ============================================

export async function createWorkflowStep(input: CreateWorkflowStepInput) {
  const user = await getStudioUser();

  // Verify definition belongs to user's org
  const definition = await prisma.workflowDefinition.findFirst({
    where: {
      id: input.definitionId,
      organizationId: user.organizationId,
    },
  });

  if (!definition) {
    throw new Error("Workflow definition not found");
  }

  // Get max position
  const maxPosition = await prisma.workflowStep.aggregate({
    where: { definitionId: input.definitionId },
    _max: { position: true },
  });

  const step = await prisma.workflowStep.create({
    data: {
      definitionId: input.definitionId,
      name: input.name,
      description: input.description,
      stepType: input.stepType || "TASK",
      position: input.position ?? (maxPosition._max.position ?? -1) + 1,
      assigneeType: input.assigneeType || "SPECIFIC_USER",
      assigneeId: input.assigneeId,
      assigneeRole: input.assigneeRole,
      assigneeField: input.assigneeField,
      formConfig: input.formConfig,
      conditions: input.conditions,
      actions: input.actions,
      slaHours: input.slaHours,
      parallelGroup: input.parallelGroup,
      nextStepId: input.nextStepId,
      onRejectStepId: input.onRejectStepId,
    },
  });

  revalidatePath(`/workflows/${input.definitionId}`);

  return step;
}

// ============================================
// Workflow Run Actions
// ============================================

export async function getWorkflowRuns(): Promise<WorkflowRunWithRelations[]> {
  const user = await getStudioUser();

  const runs = await prisma.workflowRun.findMany({
    where: {
      organizationId: user.organizationId,
    },
    include: {
      definition: {
        select: { id: true, name: true, icon: true, color: true },
      },
      startedBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return runs as WorkflowRunWithRelations[];
}

export async function getWorkflowRun(id: string): Promise<WorkflowRunWithRelations | null> {
  const user = await getStudioUser();

  const run = await prisma.workflowRun.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      definition: {
        select: { id: true, name: true, icon: true, color: true },
      },
      startedBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      tasks: {
        include: {
          step: {
            select: { id: true, name: true, stepType: true },
          },
          assignee: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      history: {
        orderBy: { performedAt: "desc" },
      },
    },
  });

  return run as WorkflowRunWithRelations | null;
}

export async function startWorkflow(input: StartWorkflowInput): Promise<WorkflowRunWithRelations> {
  const user = await getStudioUser();

  // Get definition with steps
  const definition = await prisma.workflowDefinition.findFirst({
    where: {
      id: input.definitionId,
      organizationId: user.organizationId,
      isActive: true,
    },
    include: {
      steps: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!definition) {
    throw new Error("Workflow definition not found or inactive");
  }

  if (definition.steps.length === 0) {
    throw new Error("Workflow has no steps defined");
  }

  const firstStep = definition.steps[0];

  // Create the run
  const run = await prisma.workflowRun.create({
    data: {
      organizationId: user.organizationId,
      definitionId: input.definitionId,
      status: "IN_PROGRESS",
      currentStepId: firstStep.id,
      triggerEntityType: input.triggerEntityType,
      triggerEntityId: input.triggerEntityId,
      formData: input.formData,
      startedAt: new Date(),
      startedById: user.id,
    },
    include: {
      definition: {
        select: { id: true, name: true, icon: true, color: true },
      },
      startedBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  // Create the first task
  await prisma.workflowTask.create({
    data: {
      runId: run.id,
      stepId: firstStep.id,
      status: "PENDING",
      assigneeId: firstStep.assigneeId,
      dueDate: firstStep.slaHours
        ? new Date(Date.now() + firstStep.slaHours * 60 * 60 * 1000)
        : null,
    },
  });

  // Log history
  await prisma.workflowHistory.create({
    data: {
      runId: run.id,
      action: "STARTED",
      performedById: user.id,
      newStatus: "IN_PROGRESS",
    },
  });

  revalidatePath("/workflows");

  return run as WorkflowRunWithRelations;
}

// ============================================
// Workflow Task Actions
// ============================================

export async function getMyWorkflowTasks(): Promise<WorkflowTaskWithRelations[]> {
  const user = await getStudioUser();

  const tasks = await prisma.workflowTask.findMany({
    where: {
      assigneeId: user.id,
      status: { in: ["PENDING", "IN_PROGRESS"] },
      run: {
        organizationId: user.organizationId,
        status: "IN_PROGRESS",
      },
    },
    include: {
      run: {
        select: { id: true, definitionId: true },
      },
      step: {
        select: { id: true, name: true, stepType: true },
      },
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
  });

  return tasks as WorkflowTaskWithRelations[];
}

export async function completeTask(input: CompleteTaskInput) {
  const user = await getStudioUser();

  // Get task with run and step info
  const task = await prisma.workflowTask.findFirst({
    where: {
      id: input.taskId,
      run: {
        organizationId: user.organizationId,
      },
    },
    include: {
      run: {
        include: {
          definition: {
            include: {
              steps: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
      step: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Update the task
  await prisma.workflowTask.update({
    where: { id: input.taskId },
    data: {
      status: "COMPLETED",
      decision: input.decision,
      decisionNote: input.decisionNote,
      formData: input.formData,
      completedAt: new Date(),
    },
  });

  // Log history
  await prisma.workflowHistory.create({
    data: {
      runId: task.runId,
      action: input.decision || "TASK_COMPLETED",
      stepId: task.stepId,
      taskId: task.id,
      performedById: user.id,
      previousStatus: task.status,
      newStatus: "COMPLETED",
    },
  });

  // Determine next step
  const steps = task.run.definition.steps;
  const currentStepIndex = steps.findIndex((s) => s.id === task.stepId);
  const currentStep = steps[currentStepIndex];

  let nextStepId: string | null = null;

  // If rejected and there's a reject step, go there
  if (input.decision === "REJECTED" && currentStep.onRejectStepId) {
    nextStepId = currentStep.onRejectStepId;
  }
  // Otherwise use configured next step or next in sequence
  else if (currentStep.nextStepId) {
    nextStepId = currentStep.nextStepId;
  } else if (currentStepIndex < steps.length - 1) {
    nextStepId = steps[currentStepIndex + 1].id;
  }

  if (nextStepId) {
    const nextStep = steps.find((s) => s.id === nextStepId);

    if (nextStep) {
      // Create next task
      await prisma.workflowTask.create({
        data: {
          runId: task.runId,
          stepId: nextStep.id,
          status: "PENDING",
          assigneeId: nextStep.assigneeId,
          dueDate: nextStep.slaHours
            ? new Date(Date.now() + nextStep.slaHours * 60 * 60 * 1000)
            : null,
        },
      });

      // Update run's current step
      await prisma.workflowRun.update({
        where: { id: task.runId },
        data: { currentStepId: nextStep.id },
      });
    }
  } else {
    // No next step, workflow is complete
    await prisma.workflowRun.update({
      where: { id: task.runId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        currentStepId: null,
      },
    });

    await prisma.workflowHistory.create({
      data: {
        runId: task.runId,
        action: "WORKFLOW_COMPLETED",
        performedById: user.id,
        previousStatus: "IN_PROGRESS",
        newStatus: "COMPLETED",
      },
    });
  }

  revalidatePath("/workflows");
  revalidatePath(`/workflows/runs/${task.runId}`);
}

// ============================================
// Template Actions
// ============================================

export async function getWorkflowTemplates(): Promise<WorkflowDefinitionWithRelations[]> {
  const user = await getStudioUser();

  const templates = await prisma.workflowDefinition.findMany({
    where: {
      isTemplate: true,
      isActive: true,
      OR: [
        { organizationId: user.organizationId },
        // Add global templates here if needed
      ],
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { steps: true, runs: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return templates as WorkflowDefinitionWithRelations[];
}
