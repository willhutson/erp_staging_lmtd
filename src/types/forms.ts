import type { BriefType } from "@prisma/client";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multi-select"
  | "date"
  | "date-range"
  | "user-select"
  | "client-select"
  | "file-upload"
  | "url"
  | "number";

export interface SelectOption {
  value: string;
  label: string;
}

export interface ValidationRule {
  pattern?: string;
  message?: string;
  min?: number;
  max?: number;
}

export interface FieldFilter {
  departments?: string[];
  roles?: string[];
  permissionLevels?: string[];
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  options?: SelectOption[];
  filter?: FieldFilter;
  validation?: ValidationRule;
  multiple?: boolean;
  accept?: string[];
  defaultValue?: string | string[] | number | boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface QualityRule {
  field: string;
  weight: number;
  check: "notEmpty" | "minLength" | "minItems" | "hasFiles";
  value?: number;
}

export interface FormConfig {
  id: BriefType;
  name: string;
  description: string;
  namingConvention: string;
  namingPrefix: string;
  example: string;
  icon?: string;
  sections: FormSection[];
  qualityRules: QualityRule[];
}
