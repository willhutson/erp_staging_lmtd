// Form Builder Types
// These extend the existing form types from @/types/forms

import type { FormConfig, FormSection, FormField, QualityRule, FieldType } from "@/types/forms";

export type { FormConfig, FormSection, FormField, QualityRule, FieldType };

// Database template representation
export interface FormTemplateData {
  id: string;
  organizationId: string;
  type: string;
  name: string;
  description: string | null;
  namingConvention: string | null;
  namingPrefix: string | null;
  icon: string | null;
  config: FormTemplateConfig;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// The config stored as JSON in the database
export interface FormTemplateConfig {
  sections: FormSection[];
  qualityRules: QualityRule[];
}

// Field type options for the editor
export const FIELD_TYPES: { value: FieldType; label: string; description: string }[] = [
  { value: "text", label: "Text", description: "Single line text input" },
  { value: "textarea", label: "Text Area", description: "Multi-line text input" },
  { value: "number", label: "Number", description: "Numeric input" },
  { value: "select", label: "Dropdown", description: "Single selection from options" },
  { value: "multi-select", label: "Multi-Select", description: "Multiple selections from options" },
  { value: "date", label: "Date", description: "Single date picker" },
  { value: "date-range", label: "Date Range", description: "Start and end date pickers" },
  { value: "user-select", label: "User Select", description: "Select a team member" },
  { value: "client-select", label: "Client Select", description: "Select a client" },
  { value: "file-upload", label: "File Upload", description: "Upload files" },
  { value: "url", label: "URL", description: "Website link input" },
];

// Icon options for forms
export const FORM_ICONS = [
  "FileText",
  "Video",
  "Image",
  "PenTool",
  "Languages",
  "Target",
  "BarChart",
  "Briefcase",
  "Camera",
  "Film",
  "Palette",
  "MessageSquare",
  "TrendingUp",
  "FileStack",
];
