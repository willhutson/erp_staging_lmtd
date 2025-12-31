import type { BuilderTemplateType, TemplateStatus, BuilderPermissionLevel } from "@prisma/client";

// Brief Template Definition
export interface BriefTemplateDefinition {
  sections: BriefSection[];
  stages: string[];
  defaultAssigneeRole: string | null;
  autoAssignment?: {
    enabled: boolean;
    rules: AssignmentRule[];
  };
}

export interface BriefSection {
  id: string;
  title: string;
  description?: string;
  fields: BriefField[];
}

export interface BriefField {
  id: string;
  label: string;
  type: BriefFieldType;
  required: boolean;
  helpText?: string;
  placeholder?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
}

export type BriefFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "select"
  | "multi-select"
  | "checkbox"
  | "radio"
  | "file"
  | "user-select"
  | "client-select"
  | "project-select"
  | "rich-text";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface AssignmentRule {
  condition: {
    field: string;
    operator: "equals" | "contains" | "in";
    value: unknown;
  };
  assignTo: {
    type: "user" | "role" | "department";
    value: string;
  };
}

// Workflow Definition
export interface WorkflowDefinition {
  trigger: WorkflowTrigger;
  tasks: WorkflowTask[];
  nudgeRules: NudgeRule[];
  stageGates: StageGate[];
  aiSkills?: AISkillReference[];
}

export interface WorkflowTrigger {
  type: string | null; // e.g., "rfp.created", "brief.status_changed"
  conditions: TriggerCondition[];
}

export interface TriggerCondition {
  field: string;
  operator: "equals" | "not_equals" | "in" | "not_in" | "gt" | "lt" | "contains";
  value: unknown;
}

export interface WorkflowTask {
  id: string;
  name: string;
  description?: string;
  assigneeRole: string;
  dueOffset: {
    value: number;
    unit: "hours" | "days" | "weeks";
    from: "deadline" | "workflow_start" | "previous_task";
  };
  dependsOn: string[];
  estimatedHours?: number;
  createsBrief?: {
    briefType: string;
    titleTemplate: string;
  };
}

export interface NudgeRule {
  id: string;
  name: string;
  trigger: {
    type: "before_due" | "on_due" | "after_due";
    offset: number;
    unit: "hours" | "days";
  };
  channel: "slack" | "email" | "in_app";
  recipients: ("assignee" | "manager" | "owner")[];
  messageTemplate: string;
}

export interface StageGate {
  id: string;
  taskId: string;
  requirements: GateRequirement[];
}

export interface GateRequirement {
  type: "tasks_complete" | "approval" | "field_value";
  config: Record<string, unknown>;
}

export interface AISkillReference {
  event: string;
  skillId: string;
}

// Dashboard Widget Definition
export interface DashboardWidgetDefinition {
  dataSource: string | null;
  visualization: "card" | "chart" | "table" | "list" | "metric";
  refreshInterval: number; // seconds
  permissions: string[];
  config?: Record<string, unknown>;
}

// Report Template Definition
export interface ReportTemplateDefinition {
  dataSources: DataSourceConfig[];
  sections: ReportSection[];
  filters: ReportFilter[];
  schedule: ScheduleConfig | null;
}

export interface DataSourceConfig {
  id: string;
  type: string;
  query: Record<string, unknown>;
}

export interface ReportSection {
  id: string;
  title: string;
  type: "table" | "chart" | "text" | "metric";
  dataSourceId: string;
  config: Record<string, unknown>;
}

export interface ReportFilter {
  id: string;
  label: string;
  field: string;
  type: "select" | "date" | "text";
  options?: FieldOption[];
}

export interface ScheduleConfig {
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  recipients: string[];
}

// AI Skill Definition
export interface AISkillDefinition {
  model: string;
  systemPrompt: string;
  triggers: AISkillTrigger[];
  outputFormat: "text" | "json" | "structured";
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface AISkillTrigger {
  event: string;
  conditions?: TriggerCondition[];
}

// Form Template Definition
export interface FormTemplateDefinition {
  sections: BriefSection[];
  validationRules: ValidationRule[];
  submitAction: SubmitAction | null;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

export interface SubmitAction {
  type: "create_entity" | "update_entity" | "webhook" | "workflow";
  config: Record<string, unknown>;
}

// Notification Template Definition
export interface NotificationTemplateDefinition {
  channels: ("email" | "slack" | "in_app")[];
  subject: string;
  body: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
}

// Template type map
export type TemplateDefinitionMap = {
  BRIEF_TEMPLATE: BriefTemplateDefinition;
  WORKFLOW: WorkflowDefinition;
  DASHBOARD_WIDGET: DashboardWidgetDefinition;
  REPORT_TEMPLATE: ReportTemplateDefinition;
  AI_SKILL_CONFIG: AISkillDefinition;
  FORM_TEMPLATE: FormTemplateDefinition;
  NOTIFICATION_TEMPLATE: NotificationTemplateDefinition;
};

// Builder context
export interface BuilderContext {
  organizationId: string;
  userId: string;
  permissionLevel: BuilderPermissionLevel;
  canApprove: boolean;
  departmentId?: string;
}
