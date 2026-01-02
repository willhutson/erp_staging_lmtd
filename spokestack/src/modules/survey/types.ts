// Survey/Form Builder Module Types
// Based on tech spec - Template versioning system

import type {
  TemplateKind,
  TemplateCategory,
  SurveyChannel,
  QuestionKind,
  FormSurveyStatus,
  SubmissionStatus,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type {
  TemplateKind,
  TemplateCategory,
  SurveyChannel,
  QuestionKind,
  FormSurveyStatus,
  SubmissionStatus,
};

// Alias for convenience in this module
export type SurveyStatus = FormSurveyStatus;

// ============================================
// TEMPLATE SETTINGS
// ============================================

export interface SurveySettings {
  // Behavior
  showProgressBar: boolean;
  allowBackNavigation: boolean;
  shuffleQuestions: boolean;
  oneQuestionPerPage: boolean;

  // Completion
  showThankYouPage: boolean;
  thankYouMessage: string;
  redirectUrl?: string;
  redirectDelay?: number;  // seconds

  // Branding
  showBranding: boolean;
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    backgroundColor?: string;
  };

  // Notifications
  notifyOnSubmit: boolean;
  notifyEmails: string[];

  // Access control
  requireAuthentication: boolean;
  allowMultipleSubmissions: boolean;
  maxSubmissionsPerUser?: number;

  // Time limits
  hasTimeLimit: boolean;
  timeLimitMinutes?: number;
  showTimer: boolean;

  // Partial saves
  allowSaveAndContinue: boolean;
  autoSaveInterval?: number;  // seconds
}

export const DEFAULT_SURVEY_SETTINGS: SurveySettings = {
  showProgressBar: true,
  allowBackNavigation: true,
  shuffleQuestions: false,
  oneQuestionPerPage: false,
  showThankYouPage: true,
  thankYouMessage: "Thank you for your submission!",
  showBranding: true,
  notifyOnSubmit: true,
  notifyEmails: [],
  requireAuthentication: false,
  allowMultipleSubmissions: false,
  hasTimeLimit: false,
  showTimer: false,
  allowSaveAndContinue: true,
};

// ============================================
// DESIGN SYSTEM
// ============================================

export interface SurveyDesign {
  // Layout
  layout: "centered" | "full-width" | "card";
  maxWidth: number;  // px

  // Typography
  fontFamily: string;
  fontSize: "sm" | "base" | "lg";

  // Colors
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;

  // Questions styling
  questionSpacing: "compact" | "normal" | "relaxed";
  inputStyle: "default" | "outlined" | "filled";

  // Custom CSS
  customCss?: string;
}

export const DEFAULT_SURVEY_DESIGN: SurveyDesign = {
  layout: "centered",
  maxWidth: 720,
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "base",
  primaryColor: "#52EDC7",
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  accentColor: "#1BA098",
  questionSpacing: "normal",
  inputStyle: "default",
};

// ============================================
// QUESTION TYPES
// ============================================

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  imageUrl?: string;
  isOther?: boolean;  // "Other" option with text input
}

export interface QuestionValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface QuestionLogicRule {
  id: string;
  condition: LogicCondition;
  action: LogicAction;
}

export type LogicCondition =
  | { type: "equals"; value: string | number }
  | { type: "not_equals"; value: string | number }
  | { type: "contains"; value: string }
  | { type: "greater_than"; value: number }
  | { type: "less_than"; value: number }
  | { type: "is_answered" }
  | { type: "is_not_answered" }
  | { type: "in"; values: string[] };

export type LogicAction =
  | { type: "show"; questionIds: string[] }
  | { type: "hide"; questionIds: string[] }
  | { type: "skip_to"; questionId: string }
  | { type: "end_survey" }
  | { type: "disqualify"; message: string };

export interface SurveyQuestion {
  id: string;
  type: QuestionKind;

  // Content
  title: string;
  description?: string;
  placeholder?: string;
  helpText?: string;

  // Options (for choice questions)
  options?: QuestionOption[];

  // For rating scales
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;

  // For matrix questions
  rows?: { id: string; label: string }[];
  columns?: { id: string; label: string }[];

  // Validation
  validation: QuestionValidation;

  // Logic
  logicRules: QuestionLogicRule[];

  // Appearance
  width?: "full" | "half" | "third";

  // Metadata
  sortOrder: number;
  pageIndex: number;
}

// ============================================
// ANSWER TYPES
// ============================================

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | { [key: string]: string | number }  // For matrix questions
  | File
  | null;

export interface SubmissionAnswers {
  [questionId: string]: AnswerValue;
}

// ============================================
// VIEW TYPES
// ============================================

export interface TemplateListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  kind: TemplateKind;
  category: TemplateCategory;
  isPublished: boolean;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  createdBy: {
    name: string;
    avatarUrl: string | null;
  };
  tags: { id: string; name: string; color: string | null }[];
}

export interface SurveyListItem {
  id: string;
  title: string;
  slug: string;
  status: SurveyStatus;
  responseCount: number;
  maxResponses: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  channels: SurveyChannel[];
  createdAt: Date;
  template: {
    id: string;
    name: string;
    kind: TemplateKind;
  };
  createdBy: {
    name: string;
    avatarUrl: string | null;
  };
  targetClient: {
    id: string;
    name: string;
  } | null;
}

export interface SubmissionListItem {
  id: string;
  status: SubmissionStatus;
  respondentEmail: string | null;
  respondentName: string | null;
  score: number | null;
  maxScore: number | null;
  startedAt: Date;
  submittedAt: Date | null;
  timeSpent: number | null;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
  contact: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface SurveyAnalytics {
  surveyId: string;
  totalSubmissions: number;
  completedSubmissions: number;
  abandonedSubmissions: number;
  completionRate: number;
  avgTimeSpent: number;  // seconds

  // Response breakdown
  responsesByDay: { date: string; count: number }[];
  responsesByChannel: { channel: SurveyChannel; count: number }[];

  // For quizzes
  avgScore?: number;
  passRate?: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  questionType: QuestionKind;
  totalResponses: number;
  skipped: number;

  // Choice breakdown (for choice questions)
  optionBreakdown?: {
    optionId: string;
    label: string;
    count: number;
    percentage: number;
  }[];

  // Rating stats (for rating questions)
  ratingStats?: {
    average: number;
    median: number;
    distribution: { value: number; count: number }[];
  };

  // NPS stats
  npsStats?: {
    score: number;
    promoters: number;
    passives: number;
    detractors: number;
  };

  // Text responses sample (for text questions)
  textSamples?: string[];
}

// ============================================
// FORM INPUT TYPES
// ============================================

export interface CreateTemplateInput {
  name: string;
  description?: string;
  kind: TemplateKind;
  category: TemplateCategory;
  tags?: string[];
}

export interface CreateSurveyInput {
  templateId: string;
  title: string;
  description?: string;
  channels?: SurveyChannel[];
  startsAt?: Date;
  endsAt?: Date;
  maxResponses?: number;
  targetClientId?: string;
  targetUserIds?: string[];
  accessCode?: string;
}

export interface UpdateSurveyStatusInput {
  surveyId: string;
  status: SurveyStatus;
}

export interface SendInvitationsInput {
  surveyId: string;
  recipients: {
    email: string;
    name?: string;
    contactId?: string;
  }[];
}
