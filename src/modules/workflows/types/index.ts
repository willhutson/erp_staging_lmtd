import type { WorkflowStatus, WorkflowInstanceStatus, WorkflowTaskStatus, NudgeChannel } from "@prisma/client";

// ============================================
// WORKFLOW TEMPLATE TYPES
// ============================================

/**
 * A task template defines a task that will be created when the workflow runs
 */
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;

  // Assignment
  assigneeRole: string;  // Role-based assignment (e.g., "strategist", "designer")
  assigneeUserId?: string;  // Optional specific user

  // Timing - relative to workflow deadline or other tasks
  dueOffset: {
    value: number;
    unit: "hours" | "days" | "weeks";
    from: "deadline" | "workflow_start" | "previous_task";
  };

  // Dependencies
  dependsOn: string[];  // Task IDs that must complete first

  // Estimates
  estimatedHours?: number;

  // Auto-create brief when this task is created?
  createsBrief?: {
    briefType: string;
    titleTemplate: string;  // Supports {{variables}}
    formDefaults?: Record<string, unknown>;
  };

  // Stage gate - does this task require approval?
  requiresApproval?: boolean;
  approverRole?: string;
}

/**
 * Nudge rules define when to send reminders
 */
export interface NudgeRule {
  id: string;
  name: string;

  trigger: {
    type: "before_due" | "on_due" | "after_due" | "task_started" | "task_blocked";
    offset?: number;  // Required for before_due/after_due
    unit?: "hours" | "days";
  };

  // Who to notify
  recipients: ("assignee" | "manager" | "owner" | "creator")[];

  // How to notify
  channel: NudgeChannel;

  // Message template - supports {{task.name}}, {{task.dueDate}}, etc.
  messageTemplate: string;

  // Optional: only apply to specific tasks
  taskIds?: string[];
}

/**
 * Stage gates are checkpoints that must be passed
 */
export interface StageGate {
  id: string;
  name: string;

  // Which task this gate applies to
  taskId: string;

  // Requirements to pass the gate
  requirements: StageGateRequirement[];

  // What happens if gate is blocked
  onBlocked?: {
    notify: string[];  // User roles to notify
    escalateAfterHours?: number;
  };
}

export interface StageGateRequirement {
  type: "tasks_complete" | "approval" | "field_value" | "external_check";
  config: Record<string, unknown>;
}

/**
 * AI skill references for automation
 */
export interface AISkillReference {
  event: "workflow_start" | "task_created" | "task_completed" | "before_deadline";
  skillId: string;
  taskId?: string;  // If event is task-specific
}

/**
 * Trigger condition for workflow activation
 */
export interface TriggerCondition {
  field: string;
  operator: "equals" | "not_equals" | "in" | "not_in" | "gt" | "lt" | "contains";
  value: unknown;
}

/**
 * Complete workflow template definition
 */
export interface WorkflowTemplateDefinition {
  // Trigger
  triggerType: string;
  triggerConditions: TriggerCondition[];

  // Tasks
  taskTemplates: TaskTemplate[];

  // Rules
  nudgeRules: NudgeRule[];
  stageGates: StageGate[];

  // AI Integration
  aiSkills: AISkillReference[];
}

// ============================================
// WORKFLOW INSTANCE TYPES
// ============================================

/**
 * Context for starting a new workflow
 */
export interface WorkflowStartContext {
  templateId: string;
  triggerEntityType: string;
  triggerEntityId: string;
  deadline?: Date;
  ownerId: string;
  variables?: Record<string, unknown>;  // For template interpolation
}

/**
 * Result of calculating task dates
 */
export interface CalculatedTaskDates {
  taskId: string;
  dueDate: Date;
  canStart: boolean;  // Based on dependencies
}

/**
 * Task assignment result
 */
export interface TaskAssignment {
  taskId: string;
  assigneeId: string | null;
  assigneeRole: string;
  reason: string;  // Why this assignment was made
}

// ============================================
// TRIGGER TYPES
// ============================================

export const TRIGGER_TYPES = {
  // RFP/Sales
  "rfp.created": { label: "RFP Created", module: "crm", entityType: "RFP" },
  "rfp.status_changed": { label: "RFP Status Changed", module: "crm", entityType: "RFP" },
  "deal.won": { label: "Deal Won", module: "crm", entityType: "Deal" },
  "deal.created": { label: "Deal Created", module: "crm", entityType: "Deal" },

  // Briefs
  "brief.created": { label: "Brief Created", module: "agency", entityType: "Brief" },
  "brief.submitted": { label: "Brief Submitted", module: "agency", entityType: "Brief" },
  "brief.completed": { label: "Brief Completed", module: "agency", entityType: "Brief" },

  // Content
  "content_plan.created": { label: "Content Plan Created", module: "content", entityType: "ContentPlan" },
  "content_plan.approved": { label: "Content Plan Approved", module: "content", entityType: "ContentPlan" },

  // Projects
  "project.created": { label: "Project Created", module: "agency", entityType: "Project" },
  "project.started": { label: "Project Started", module: "agency", entityType: "Project" },

  // Schedule-based
  "schedule.monthly": { label: "Monthly Schedule", module: "content", entityType: "Schedule" },
  "schedule.weekly": { label: "Weekly Schedule", module: "content", entityType: "Schedule" },

  // Team
  "leave.approved": { label: "Leave Approved", module: "team", entityType: "LeaveRequest" },
} as const;

export type TriggerType = keyof typeof TRIGGER_TYPES;

// ============================================
// ROLE TYPES FOR ASSIGNMENT
// ============================================

export const ASSIGNEE_ROLES = {
  // Creative
  designer: { label: "Designer", department: "CREATIVE" },
  senior_designer: { label: "Senior Designer", department: "CREATIVE" },
  art_director: { label: "Art Director", department: "CREATIVE" },
  copywriter: { label: "Copywriter", department: "CREATIVE" },
  videographer: { label: "Videographer", department: "CREATIVE" },
  editor: { label: "Editor", department: "CREATIVE" },

  // Strategy
  strategist: { label: "Strategist", department: "STRATEGY" },
  senior_strategist: { label: "Senior Strategist", department: "STRATEGY" },
  analyst: { label: "Analyst", department: "STRATEGY" },

  // Client Services
  account_manager: { label: "Account Manager", department: "CLIENT_SERVICES" },
  senior_account_manager: { label: "Senior Account Manager", department: "CLIENT_SERVICES" },
  account_director: { label: "Account Director", department: "CLIENT_SERVICES" },

  // Production
  producer: { label: "Producer", department: "PRODUCTION" },
  project_manager: { label: "Project Manager", department: "PRODUCTION" },

  // Leadership
  creative_director: { label: "Creative Director", department: "LEADERSHIP" },
  managing_director: { label: "Managing Director", department: "LEADERSHIP" },
  bd_lead: { label: "BD Lead", department: "LEADERSHIP" },

  // Finance
  finance: { label: "Finance", department: "FINANCE" },
} as const;

export type AssigneeRole = keyof typeof ASSIGNEE_ROLES;

// ============================================
// WORKFLOW TEMPLATE CONFIG (for config files)
// ============================================

/**
 * Template task with relative timing and stage info
 */
export interface WorkflowTemplateTask {
  id: string;
  name: string;
  description: string;
  assigneeRole: string;
  dependsOn?: string[];
  relativeDueDays: number; // Days relative to workflow deadline (negative = before)
  estimatedHours: number;
  stage: string;
  isStageGate: boolean;
  aiSkillHook?: string;
  requiredOutputs?: string[];
  isRecurring?: boolean;
  createsBrief?: boolean;
}

/**
 * Stage definition for workflow templates
 */
export interface WorkflowTemplateStage {
  id: string;
  name: string;
  order: number;
}

/**
 * Nudge rule for workflow template config
 */
export interface WorkflowTemplateNudgeRule {
  id: string;
  trigger: {
    type: "before_due" | "on_due" | "after_due";
    offset?: number;
    unit?: "hours" | "days";
  };
  recipients: string[];
  channel: "SLACK" | "EMAIL" | "IN_APP";
  messageTemplate: string;
  taskIds?: string[];
}

/**
 * Complete workflow template configuration
 * Used in /config/workflows/*.workflow.ts files
 */
export interface WorkflowTemplateConfig {
  name: string;
  description: string;
  category: string;
  version: string;

  trigger: {
    type: string; // e.g., "entity_status_change"
    entityType: string; // e.g., "Deal", "LeaveRequest"
    conditions: Record<string, unknown>;
  };

  defaultDeadlineDays: number;

  tasks: WorkflowTemplateTask[];
  stages: WorkflowTemplateStage[];
  nudgeRules: WorkflowTemplateNudgeRule[];

  metadata: {
    estimatedDuration: string;
    targetAudience: string;
    createdBy: string;
    lastModified: string;
    tags: string[];
    notes?: string;
  };
}
