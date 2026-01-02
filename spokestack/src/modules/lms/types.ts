// LMS (Learning Management System) Module Types

import type {
  CourseStatus,
  CourseVisibility,
  EnrollmentStatus,
  LessonType,
  LMSQuestionType,
} from "@prisma/client";

// Re-export Prisma types
export type {
  CourseStatus,
  CourseVisibility,
  EnrollmentStatus,
  LessonType,
  LMSQuestionType,
};

// ============================================
// COURSE TYPES
// ============================================

export interface CourseSettings {
  // Enrollment
  allowSelfEnrollment: boolean;
  requireApproval: boolean;
  autoEnrollDepartments: string[];
  maxEnrollments?: number;

  // Progress
  enforceSequentialProgress: boolean;
  showProgressToOthers: boolean;

  // Completion
  certificateEnabled: boolean;
  certificateExpiryDays?: number;

  // Gamification
  enablePoints: boolean;
  enableBadges: boolean;

  // Notifications
  enrollmentNotification: boolean;
  completionNotification: boolean;
  reminderFrequency?: "daily" | "weekly" | "none";
}

export const DEFAULT_COURSE_SETTINGS: CourseSettings = {
  allowSelfEnrollment: true,
  requireApproval: false,
  autoEnrollDepartments: [],
  enforceSequentialProgress: false,
  showProgressToOthers: true,
  certificateEnabled: false,
  enablePoints: false,
  enableBadges: false,
  enrollmentNotification: true,
  completionNotification: true,
  reminderFrequency: "weekly",
};

// ============================================
// LESSON CONTENT TYPES
// ============================================

export interface VideoContent {
  type: "VIDEO";
  url: string;
  provider: "youtube" | "vimeo" | "internal" | "url";
  videoId?: string;
  transcript?: string;
  chapters?: { title: string; timestamp: number }[];
}

export interface DocumentContent {
  type: "DOCUMENT";
  url: string;
  fileType: "pdf" | "doc" | "docx" | "ppt" | "pptx";
  pageCount?: number;
}

export interface ArticleContent {
  type: "ARTICLE";
  body: string;  // Rich text HTML
}

export interface PresentationContent {
  type: "PRESENTATION";
  slides: {
    id: string;
    content: string;
    notes?: string;
  }[];
}

export interface ExternalLinkContent {
  type: "EXTERNAL_LINK";
  url: string;
  openInNewTab: boolean;
  requireConfirmation: boolean;
}

export interface LiveSessionContent {
  type: "LIVE_SESSION";
  platform: "zoom" | "teams" | "meet" | "other";
  scheduledAt: Date;
  duration: number;  // minutes
  meetingUrl?: string;
  meetingId?: string;
  passcode?: string;
  hostId: string;
}

export type LessonContent =
  | VideoContent
  | DocumentContent
  | ArticleContent
  | PresentationContent
  | ExternalLinkContent
  | LiveSessionContent
  | { type: "QUIZ" | "ASSIGNMENT" | "SCORM"; [key: string]: unknown };

// ============================================
// RESOURCE TYPES
// ============================================

export interface LessonResource {
  id: string;
  name: string;
  type: "file" | "link";
  url: string;
  fileType?: string;
  fileSize?: number;
}

// ============================================
// ASSESSMENT TYPES
// ============================================

export interface QuizQuestion {
  id: string;
  type: LMSQuestionType;
  question: string;
  explanation?: string;
  options: QuizOption[];
  correctAnswer: string | string[];  // Option ID(s)
  points: number;
  sortOrder: number;
}

export interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface AssessmentSettings {
  passingScore: number;
  maxAttempts?: number;
  timeLimit?: number;  // minutes
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  allowReview: boolean;
}

export const DEFAULT_ASSESSMENT_SETTINGS: AssessmentSettings = {
  passingScore: 70,
  randomizeQuestions: false,
  randomizeOptions: false,
  showCorrectAnswers: true,
  showExplanations: true,
  allowReview: true,
};

// ============================================
// VIEW TYPES
// ============================================

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  skillLevel: string | null;
  status: CourseStatus;
  visibility: CourseVisibility;
  estimatedDuration: number | null;
  enrollmentCount: number;
  completionCount: number;
  avgRating: number | null;
  moduleCount: number;
  lessonCount: number;
  createdAt: Date;
  createdBy: {
    name: string;
    avatarUrl: string | null;
  };
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  category: string | null;
  tags: string[];
  skillLevel: string | null;
  status: CourseStatus;
  visibility: CourseVisibility;
  estimatedDuration: number | null;
  timeLimit: number | null;
  hasCertificate: boolean;
  passingScore: number | null;
  requiredCompletionPercent: number;
  allowSkipLessons: boolean;
  enrollmentCount: number;
  completionCount: number;
  avgRating: number | null;
  publishedAt: Date | null;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  modules: ModuleWithLessons[];
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isRequired: boolean;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
  duration: number | null;
  sortOrder: number;
  isRequired: boolean;
  hasAssessment: boolean;
}

export interface EnrollmentListItem {
  id: string;
  status: EnrollmentStatus;
  progressPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
  totalTimeSpent: number;
  enrolledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
  finalScore: number | null;
  hasPassed: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    department: string;
  };
  course: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
  };
}

export interface LearnerProgress {
  enrollmentId: string;
  courseId: string;
  progressPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
  currentModule: string | null;
  currentLesson: string | null;
  completedLessons: string[];
  assessmentScores: { assessmentId: string; score: number; passed: boolean }[];
  totalTimeSpent: number;
  lastAccessedAt: Date | null;
  estimatedTimeRemaining: number;
}

// ============================================
// CERTIFICATE TYPES
// ============================================

export interface CertificateData {
  id: string;
  certificateNumber: string;
  courseTitle: string;
  userName: string;
  completionDate: Date;
  expiresAt: Date | null;
  pdfUrl: string | null;
  verificationUrl: string | null;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface CourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completions: number;
  completionRate: number;
  avgTimeToComplete: number;  // seconds
  avgScore: number | null;
  passRate: number | null;

  // Trends
  enrollmentsByDay: { date: string; count: number }[];
  completionsByDay: { date: string; count: number }[];

  // Breakdown
  enrollmentsByDepartment: { department: string; count: number }[];
  completionsByModule: { moduleId: string; title: string; completionRate: number }[];

  // Drop-off analysis
  dropOffPoints: { lessonId: string; title: string; dropCount: number }[];
}

// ============================================
// FORM INPUT TYPES
// ============================================

export interface CreateCourseInput {
  title: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  tags?: string[];
  skillLevel?: string;
  visibility?: CourseVisibility;
  estimatedDuration?: number;
  hasCertificate?: boolean;
}

export interface CreateModuleInput {
  courseId: string;
  title: string;
  description?: string;
  sortOrder?: number;
  isRequired?: boolean;
}

export interface CreateLessonInput {
  moduleId: string;
  title: string;
  description?: string;
  type: LessonType;
  content: LessonContent;
  duration?: number;
  sortOrder?: number;
  isRequired?: boolean;
  minimumTimeSpent?: number;
  resources?: LessonResource[];
}

export interface EnrollUsersInput {
  courseId: string;
  userIds: string[];
  expiresAt?: Date;
}

export interface UpdateProgressInput {
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  timeSpent?: number;
  progressData?: Record<string, unknown>;
}
