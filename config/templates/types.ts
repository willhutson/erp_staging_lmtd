/**
 * SpokeStack Template System - Type Definitions
 *
 * Templates are reusable business logic patterns extracted from
 * existing deployments (like LMTD) that can be installed in new instances.
 */

// ============================================
// TEMPLATE CATEGORIES
// ============================================

export type TemplateCategory =
  | "workflow"      // Business workflows (brief approval, RFP pipeline)
  | "form"          // Form configurations (brief types, intake forms)
  | "notification"  // Notification rules and templates
  | "dashboard"     // Dashboard widgets and layouts
  | "report"        // Report configurations
  | "integration"   // Integration presets (Slack, Google, etc.)
  | "access"        // Access control policies
  | "ui-widget";    // Reusable UI widgets for WYSIWYG

// ============================================
// BASE TEMPLATE DEFINITION
// ============================================

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  author: string;
  source: string;           // e.g., "lmtd", "community", "custom"
  tags: string[];
  icon?: string;            // Lucide icon name
  preview?: string;         // Preview image URL
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDependencies {
  modules: string[];        // Required SpokeStack modules
  resources: string[];      // Required resource types
  integrations?: string[];  // Required integrations
}

export interface TemplateConfig {
  metadata: TemplateMetadata;
  dependencies: TemplateDependencies;
  data: unknown;            // Template-specific configuration
}

// ============================================
// WORKFLOW TEMPLATES
// ============================================

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  color?: string;
  autoTransitions?: {
    condition: string;      // Expression to evaluate
    targetStage: string;
    notify?: string[];      // Roles to notify
  }[];
  requiredFields?: string[];
  permissions?: {
    canEdit?: string[];
    canApprove?: string[];
    canReject?: string[];
  };
}

export interface WorkflowTemplate extends TemplateConfig {
  category: "workflow";
  data: {
    stages: WorkflowStage[];
    initialStage: string;
    finalStages: string[];   // Completed/archived stages
    hooks?: {
      onStageChange?: string;
      onComplete?: string;
      onReject?: string;
    };
  };
}

// ============================================
// FORM TEMPLATES
// ============================================

export interface FormFieldTemplate {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    field: string;
    operator: "eq" | "neq" | "in";
    value: unknown;
  };
}

export interface FormSectionTemplate {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldTemplate[];
  collapsible?: boolean;
}

export interface FormTemplate extends TemplateConfig {
  category: "form";
  data: {
    name: string;
    titlePattern?: string;   // e.g., "Video Shoot: {client} – {topic}"
    sections: FormSectionTemplate[];
    submitLabel?: string;
    requiresApproval?: boolean;
    defaultAssignee?: string; // Role or specific field
  };
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

export interface NotificationTrigger {
  event: string;            // e.g., "brief.created", "stage.changed"
  conditions?: {
    field: string;
    operator: "eq" | "neq" | "in" | "gt" | "lt";
    value: unknown;
  }[];
}

export interface NotificationTemplate extends TemplateConfig {
  category: "notification";
  data: {
    name: string;
    trigger: NotificationTrigger;
    channels: ("email" | "slack" | "whatsapp" | "in-app")[];
    recipients: {
      type: "role" | "field" | "specific";
      value: string;
    }[];
    template: {
      subject?: string;
      body: string;
      variables: string[];   // Available merge fields
    };
  };
}

// ============================================
// DASHBOARD WIDGET TEMPLATES
// ============================================

export interface DashboardWidgetTemplate extends TemplateConfig {
  category: "dashboard";
  data: {
    name: string;
    type: "metric" | "chart" | "list" | "table" | "calendar" | "kanban";
    size: "small" | "medium" | "large" | "full";
    dataSource: {
      resource: string;
      query?: Record<string, unknown>;
      aggregation?: "count" | "sum" | "avg" | "min" | "max";
      groupBy?: string;
    };
    display: {
      title: string;
      icon?: string;
      color?: string;
      format?: string;
      chart?: {
        type: "bar" | "line" | "pie" | "donut";
        xAxis?: string;
        yAxis?: string;
      };
    };
    refresh?: number;        // Refresh interval in seconds
  };
}

// ============================================
// UI WIDGET TEMPLATES (for WYSIWYG)
// ============================================

export interface UIWidgetTemplate extends TemplateConfig {
  category: "ui-widget";
  data: {
    name: string;
    component: string;       // React component name
    props: {
      name: string;
      type: "string" | "number" | "boolean" | "select" | "color" | "icon";
      label: string;
      defaultValue?: unknown;
      options?: { value: string; label: string }[];
    }[];
    slots?: {                // Named slots for nested content
      name: string;
      label: string;
      accepts: string[];     // Allowed child widget types
    }[];
    preview: string;         // Preview component or image
    category: "layout" | "data" | "form" | "navigation" | "media" | "content";
  };
}

// ============================================
// TEMPLATE REGISTRY
// ============================================

export interface TemplateRegistry {
  templates: TemplateConfig[];
  getByCategory: (category: TemplateCategory) => TemplateConfig[];
  getById: (id: string) => TemplateConfig | undefined;
  install: (templateId: string, targetOrg: string) => Promise<void>;
  export: (templateId: string) => Promise<string>; // JSON export
}

// ============================================
// TEMPLATE INSTALLATION RESULT
// ============================================

export interface TemplateInstallResult {
  success: boolean;
  templateId: string;
  createdResources: {
    type: string;
    id: string;
    name: string;
  }[];
  warnings?: string[];
  errors?: string[];
}
