// Content Engine Types

export type SkillCategory =
  | "BRIEF_MANAGEMENT"
  | "RESOURCE_PLANNING"
  | "CLIENT_RELATIONS"
  | "CONTENT_CREATION"
  | "QUALITY_ASSURANCE"
  | "ANALYTICS"
  | "WORKFLOW"
  | "KNOWLEDGE";

export type SkillStatus = "ACTIVE" | "DRAFT" | "DEPRECATED" | "TESTING";

export type TriggerType =
  | "MANUAL"           // User explicitly invokes
  | "EVENT"            // System event triggers
  | "SCHEDULE"         // Time-based
  | "THRESHOLD"        // Metric crosses threshold
  | "DEPENDENCY";      // Another skill completes

export interface SkillTrigger {
  type: TriggerType;
  eventType?: string;      // For EVENT triggers
  schedule?: string;       // Cron expression for SCHEDULE
  threshold?: {
    metric: string;
    operator: "gt" | "lt" | "eq" | "gte" | "lte";
    value: number;
  };
  dependsOnSkill?: string; // For DEPENDENCY triggers
}

export interface SkillInput {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "object" | "array";
  required: boolean;
  description: string;
  default?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface SkillOutput {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "object" | "array";
  description: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  status: SkillStatus;
  triggers: SkillTrigger[];
  inputs: SkillInput[];
  outputs: SkillOutput[];
  dependsOn: string[];
  systemPrompt?: string;
  founderKnowledge?: string;
  validationQuestions?: string[];
  invocationCount: number;
  successRate: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillTestCase {
  id: string;
  skillSlug: string;
  name: string;
  description: string;
  input: Record<string, unknown>;
  expectedOutput?: Record<string, unknown>;
  founderApproved: boolean;
  createdAt: Date;
}

export interface SkillInvocation {
  id: string;
  skillSlug: string;
  triggeredBy: "MANUAL" | "EVENT" | "SCHEDULE" | "API";
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  error?: string;
  durationMs: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: Date;
  completedAt: Date | null;
}

// Knowledge Document Types
export type DocumentType =
  | "PROCEDURE"
  | "PLAYBOOK"
  | "TEMPLATE"
  | "REFERENCE"
  | "SKILL_DEFINITION"
  | "PERSONA"
  | "CASE_STUDY"
  | "LESSON_LEARNED";

export type DocumentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface KnowledgeDocument {
  id: string;
  path: string;
  slug: string;
  title: string;
  documentType: DocumentType;
  content: string;
  frontmatter: Record<string, unknown>;
  agentMetadata?: {
    usableBySkills?: string[];
    contextWeight?: number;
    lastUsed?: Date;
    usageCount?: number;
  };
  status: DocumentStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Sandbox Types
export interface SandboxTestResult {
  success: boolean;
  output: Record<string, unknown> | null;
  error?: string;
  durationMs: number;
  tokensUsed: {
    input: number;
    output: number;
  };
  founderValidation?: {
    approved: boolean;
    notes: string;
  };
}

export interface KnowledgeCaptureSession {
  id: string;
  skillSlug: string;
  scenario: string;
  responses: {
    question: string;
    answer: string;
    capturedAs: "trigger" | "input" | "output" | "edge_case" | "validation";
  }[];
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  createdAt: Date;
}
