/**
 * SpokeStack Resource Builder - Type Definitions
 *
 * Config-driven resource definitions for Refine Admin CMS.
 * Follows the same pattern as /config/forms/*.form.ts
 */

// Permission levels - matches Prisma enum
export type PermissionLevel = "ADMIN" | "LEADERSHIP" | "TEAM_LEAD" | "STAFF" | "FREELANCER";

// ============================================
// FIELD TYPES
// ============================================

export type FieldType =
  // Primitives
  | "string"
  | "text"        // Long text / textarea
  | "number"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "time"
  // Rich types
  | "email"
  | "url"
  | "phone"
  | "json"
  | "code"        // Code editor
  | "markdown"
  | "richtext"
  // Selection
  | "select"
  | "multi-select"
  | "radio"
  | "checkbox"
  // Relations
  | "relation"
  | "relation-many"
  // Files
  | "file"
  | "image"
  | "files"       // Multiple files
  // Special
  | "color"
  | "slug"
  | "enum"
  | "tags"
  | "readonly"    // Display only, not editable
  | "computed";   // Computed field, not stored

// ============================================
// FIELD DEFINITION
// ============================================

export interface SelectOption {
  value: string;
  label: string;
  color?: string;  // For status badges
  icon?: string;   // Icon name
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: string;  // Custom validation function name
}

export interface FieldDefinition {
  // Identity
  name: string;           // Field name (matches Prisma)
  label: string;          // Display label
  type: FieldType;

  // Display options
  description?: string;   // Help text
  placeholder?: string;
  defaultValue?: unknown;

  // Visibility
  list?: boolean;         // Show in list view (default: false)
  show?: boolean;         // Show in detail view (default: true)
  create?: boolean;       // Show in create form (default: true)
  edit?: boolean;         // Show in edit form (default: true)
  filter?: boolean;       // Show as filter option (default: false)
  sortable?: boolean;     // Allow sorting (default: false for list=true)

  // Validation
  validation?: FieldValidation;

  // Selection options (for select, multi-select, enum, radio)
  options?: SelectOption[];
  enumName?: string;      // Prisma enum name

  // Relation config (shorthand)
  referenceResource?: string;  // Target resource name
  referenceField?: string;     // Field to display (e.g., "name")

  // Relation config (detailed)
  relation?: {
    resource: string;     // Target resource name
    field: string;        // Foreign key field
    displayField: string; // Field to display (e.g., "name")
    searchFields?: string[];  // Fields to search when filtering
    filter?: Record<string, unknown>;  // Static filter
  };

  // Computed field config
  computed?: {
    fn: string;           // Function name to call
    dependencies?: string[];  // Fields that trigger recalculation
  };

  // UI customization
  width?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  align?: "left" | "center" | "right";
  render?: string;        // Custom render function name
  component?: string;     // Custom component name

  // Conditional visibility
  showWhen?: {
    field: string;
    operator: "eq" | "neq" | "in" | "notIn" | "gt" | "lt";
    value: unknown;
  };
}

// ============================================
// ACTION DEFINITION
// ============================================

export interface ActionDefinition {
  name: string;
  label: string;
  icon?: string;
  color?: "default" | "primary" | "danger" | "warning" | "success";

  // When to show
  position: "row" | "bulk" | "header" | "toolbar";

  // Action type
  type: "link" | "modal" | "api" | "function";

  // Config based on type
  href?: string;          // For link type
  modal?: string;         // Modal component name
  api?: {                 // API call config
    method: "GET" | "POST" | "PUT" | "DELETE";
    endpoint: string;
    confirm?: string;     // Confirmation message
  };
  fn?: string;            // Function name for custom action

  // Permissions
  permissions?: PermissionLevel[];
}

// ============================================
// VIEW CONFIGURATION
// ============================================

export interface ListView {
  // Columns to show (references field names)
  columns: string[];

  // Default sorting
  defaultSort?: {
    field: string;
    order: "asc" | "desc";
  };

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];

  // Search
  searchable?: boolean;
  searchFields?: string[];

  // Filters shown by default
  defaultFilters?: string[];

  // Row actions
  rowActions?: ActionDefinition[];

  // Bulk actions
  bulkActions?: ActionDefinition[];

  // Header actions
  headerActions?: ActionDefinition[];

  // Grouping
  groupBy?: string;

  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ActionDefinition;
}

export interface FormView {
  // Sections for the form
  sections: FormSection[];

  // Layout
  layout?: "single" | "two-column" | "tabs";

  // Actions
  submitLabel?: string;
  cancelLabel?: string;

  // Redirect after save
  redirectOnSuccess?: "list" | "show" | "edit" | string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;

  // Fields in this section (references field names)
  fields: string[];

  // Collapsible
  collapsible?: boolean;
  defaultOpen?: boolean;

  // Conditional
  showWhen?: {
    field: string;
    operator: "eq" | "neq" | "in" | "notIn";
    value: unknown;
  };
}

export interface ShowView {
  // Sections for detail view
  sections: ShowSection[];

  // Layout
  layout?: "single" | "two-column" | "tabs" | "sidebar";

  // Related resources to show
  related?: RelatedResource[];

  // Actions
  actions?: ActionDefinition[];
}

export interface ShowSection {
  id: string;
  title: string;

  // Fields in this section (references field names)
  fields: string[];

  // Layout
  columns?: 1 | 2 | 3 | 4;
}

export interface RelatedResource {
  resource: string;
  title: string;
  field: string;        // Relation field name
  displayMode: "table" | "cards" | "list";
  limit?: number;
}

// ============================================
// ACCESS CONTROL
// ============================================

export interface ResourcePermissions {
  // Permission levels that can access each action
  list?: PermissionLevel[];
  show?: PermissionLevel[];
  create?: PermissionLevel[];
  edit?: PermissionLevel[];
  delete?: PermissionLevel[];

  // Field-level permissions
  fields?: {
    [fieldName: string]: {
      view?: PermissionLevel[];
      edit?: PermissionLevel[];
    };
  };

  // Record-level access (row-level security)
  rowFilter?: {
    // Filter expression using user context
    expression: string;  // e.g., "organizationId = {{user.organizationId}}"
  };
}

// ============================================
// HOOKS & LIFECYCLE
// ============================================

export interface ResourceHooks {
  // Before/after CRUD operations
  beforeCreate?: string;   // Function name
  afterCreate?: string;
  beforeUpdate?: string;
  afterUpdate?: string;
  beforeDelete?: string;
  afterDelete?: string;

  // Transform data
  transformInput?: string;
  transformOutput?: string;

  // Validation
  validate?: string;
}

// ============================================
// MAIN RESOURCE CONFIG
// ============================================

export interface ResourceConfig {
  // Identity
  name: string;           // URL-safe name (e.g., "users")
  label: string;          // Singular display name
  labelPlural: string;    // Plural display name

  // Prisma model
  model: string;          // Prisma model name (e.g., "User")

  // Module categorization
  module: SpokeStackModule;

  // Icon (Lucide icon name)
  icon: string;

  // Description for admin
  description?: string;

  // Fields
  fields: FieldDefinition[];

  // Views
  list: ListView;
  create?: FormView;
  edit?: FormView;
  show?: ShowView;

  // Permissions
  permissions: ResourcePermissions;

  // Hooks
  hooks?: ResourceHooks;

  // API config
  api?: {
    basePath?: string;    // Override default /api/admin/{resource}
    include?: string[];   // Prisma include relations
    select?: string[];    // Prisma select fields
  };

  // Audit logging
  audit?: boolean;

  // Soft delete
  softDelete?: boolean;
  softDeleteField?: string;

  // Timestamps
  timestamps?: {
    created?: string;     // Field name (default: "createdAt")
    updated?: string;     // Field name (default: "updatedAt")
  };

  // Multi-tenancy
  tenantField?: string;   // Field name (default: "organizationId")
}

// ============================================
// MODULE CATEGORIZATION
// ============================================

export type SpokeStackModule =
  | "CORE"
  | "CONTENT_ENGINE"
  | "ANALYTICS"
  | "MESSAGING"
  | "ACCESS_CONTROL"
  | "INTEGRATIONS";

export interface ModuleConfig {
  name: SpokeStackModule;
  label: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export const SPOKESTACK_MODULES: ModuleConfig[] = [
  {
    name: "CORE",
    label: "Core Operations",
    description: "Users, clients, projects, and audit logs",
    icon: "LayoutDashboard",
    color: "blue",
    order: 1,
  },
  {
    name: "CONTENT_ENGINE",
    label: "Content Engine",
    description: "Skills, templates, and AI content generation",
    icon: "Brain",
    color: "purple",
    order: 2,
  },
  {
    name: "ANALYTICS",
    label: "Analytics",
    description: "Events, dashboards, and reports",
    icon: "BarChart3",
    color: "green",
    order: 3,
  },
  {
    name: "MESSAGING",
    label: "Messaging",
    description: "WhatsApp, notifications, and email",
    icon: "MessageSquare",
    color: "yellow",
    order: 4,
  },
  {
    name: "ACCESS_CONTROL",
    label: "Access Control",
    description: "Policies, rules, and assignments",
    icon: "Shield",
    color: "orange",
    order: 5,
  },
  {
    name: "INTEGRATIONS",
    label: "Integrations",
    description: "Google, Slack, Figma, and webhooks",
    icon: "Plug",
    color: "pink",
    order: 6,
  },
];

// ============================================
// REGISTRY
// ============================================

export interface ResourceRegistry {
  resources: ResourceConfig[];
  modules: ModuleConfig[];

  // Helpers
  getResource: (name: string) => ResourceConfig | undefined;
  getResourcesByModule: (module: SpokeStackModule) => ResourceConfig[];
}
