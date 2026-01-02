// Workflow Builder Module Types
// Process automation and approval workflows

import type {
  WorkflowTriggerType,
  WorkflowStepType,
  WorkflowAssigneeType,
  WorkflowRunStatus,
  WorkflowTaskStatus,
  WorkflowDecision,
} from "@/lib/prisma-enums";

// Re-export enums
export type {
  WorkflowTriggerType,
  WorkflowStepType,
  WorkflowAssigneeType,
  WorkflowRunStatus,
  WorkflowTaskStatus,
  WorkflowDecision,
};

// ============================================
// Core Models
// ============================================

export interface WorkflowDefinition {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  category?: string | null;
  triggerType: WorkflowTriggerType;
  triggerEntity?: string | null;
  triggerConfig?: unknown | null;
  isActive: boolean;
  isTemplate: boolean;
  version: number;
  defaultSlaHours?: number | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  definitionId: string;
  name: string;
  description?: string | null;
  stepType: WorkflowStepType;
  position: number;
  assigneeType: WorkflowAssigneeType;
  assigneeId?: string | null;
  assigneeRole?: string | null;
  assigneeField?: string | null;
  formConfig?: unknown | null;
  conditions?: unknown | null;
  actions?: unknown | null;
  slaHours?: number | null;
  parallelGroup?: string | null;
  nextStepId?: string | null;
  onRejectStepId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowRun {
  id: string;
  organizationId: string;
  definitionId: string;
  status: WorkflowRunStatus;
  currentStepId?: string | null;
  triggerEntityType?: string | null;
  triggerEntityId?: string | null;
  formData?: unknown | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  dueDate?: Date | null;
  startedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTask {
  id: string;
  runId: string;
  stepId: string;
  status: WorkflowTaskStatus;
  assigneeId?: string | null;
  formData?: unknown | null;
  comments?: string | null;
  decision?: WorkflowDecision | null;
  decisionNote?: string | null;
  dueDate?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowHistory {
  id: string;
  runId: string;
  action: string;
  stepId?: string | null;
  taskId?: string | null;
  performedById?: string | null;
  performedAt: Date;
  details?: unknown | null;
  previousStatus?: string | null;
  newStatus?: string | null;
}

// ============================================
// Relations Types
// ============================================

export interface WorkflowDefinitionWithRelations extends WorkflowDefinition {
  createdBy: { id: string; name: string; avatarUrl?: string | null };
  steps?: WorkflowStepWithRelations[];
  runs?: WorkflowRun[];
  _count?: {
    steps: number;
    runs: number;
  };
}

export interface WorkflowStepWithRelations extends WorkflowStep {
  definition?: WorkflowDefinition;
  tasks?: WorkflowTask[];
}

export interface WorkflowRunWithRelations extends WorkflowRun {
  definition: { id: string; name: string; icon?: string | null; color?: string | null };
  startedBy?: { id: string; name: string; avatarUrl?: string | null } | null;
  tasks?: WorkflowTaskWithRelations[];
  history?: WorkflowHistory[];
  _count?: {
    tasks: number;
  };
}

export interface WorkflowTaskWithRelations extends WorkflowTask {
  run?: { id: string; definitionId: string };
  step: { id: string; name: string; stepType: WorkflowStepType };
  assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
}

// ============================================
// Input Types
// ============================================

export interface CreateWorkflowDefinitionInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  triggerType?: WorkflowTriggerType;
  triggerEntity?: string;
  triggerConfig?: unknown;
  defaultSlaHours?: number;
}

export interface UpdateWorkflowDefinitionInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  triggerType?: WorkflowTriggerType;
  triggerEntity?: string;
  triggerConfig?: unknown;
  isActive?: boolean;
  defaultSlaHours?: number;
}

export interface CreateWorkflowStepInput {
  definitionId: string;
  name: string;
  description?: string;
  stepType?: WorkflowStepType;
  position?: number;
  assigneeType?: WorkflowAssigneeType;
  assigneeId?: string;
  assigneeRole?: string;
  assigneeField?: string;
  formConfig?: unknown;
  conditions?: unknown;
  actions?: unknown;
  slaHours?: number;
  parallelGroup?: string;
  nextStepId?: string;
  onRejectStepId?: string;
}

export interface StartWorkflowInput {
  definitionId: string;
  triggerEntityType?: string;
  triggerEntityId?: string;
  formData?: unknown;
}

export interface CompleteTaskInput {
  taskId: string;
  decision?: WorkflowDecision;
  decisionNote?: string;
  formData?: unknown;
}

// ============================================
// Filter Types
// ============================================

export interface WorkflowDefinitionFilters {
  category?: string;
  triggerType?: WorkflowTriggerType;
  isActive?: boolean;
  isTemplate?: boolean;
  search?: string;
}

export interface WorkflowRunFilters {
  definitionId?: string;
  status?: WorkflowRunStatus;
  triggerEntityType?: string;
  triggerEntityId?: string;
}

export interface WorkflowTaskFilters {
  status?: WorkflowTaskStatus;
  assigneeId?: string;
  runId?: string;
}
