/**
 * Manual type definitions for Prisma enums and types
 *
 * These are defined manually to avoid @prisma/client import issues
 * when the Prisma client hasn't been generated yet.
 *
 * Keep these in sync with prisma/schema.prisma
 */

// ============================================
// ENUMS
// ============================================

export type PermissionLevel =
  | "ADMIN"
  | "LEADERSHIP"
  | "TEAM_LEAD"
  | "STAFF"
  | "FREELANCER";

export type BriefType =
  | "VIDEO_SHOOT"
  | "VIDEO_EDIT"
  | "DESIGN"
  | "COPYWRITING_EN"
  | "COPYWRITING_AR"
  | "PAID_MEDIA"
  | "REPORT";

export type BriefStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "APPROVED"
  | "DELIVERED"
  | "CANCELLED"
  | "ON_HOLD";

export type Priority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type RFPStatus =
  | "IDENTIFIED"
  | "PURSUING"
  | "SUBMITTED"
  | "SHORTLISTED"
  | "WON"
  | "LOST"
  | "NO_BID";

export type CompanySize =
  | "STARTUP"
  | "SMB"
  | "MID_MARKET"
  | "ENTERPRISE"
  | "GOVERNMENT";

export type RelationshipStatus =
  | "PROSPECT"
  | "ACTIVE"
  | "AT_RISK"
  | "CHURNED"
  | "DORMANT"
  | "PAUSED";

export type LeadSource =
  | "REFERRAL"
  | "WEBSITE"
  | "SOCIAL_MEDIA"
  | "EVENT"
  | "COLD_OUTREACH"
  | "RFP_PORTAL"
  | "PARTNERSHIP"
  | "OTHER";

export type FileCategory =
  | "BRIEF_ATTACHMENT"
  | "DELIVERABLE"
  | "CONTRACT"
  | "BRAND_ASSET"
  | "REFERENCE"
  | "INVOICE"
  | "PROFILE_PHOTO"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "DOCUMENT"
  | "DESIGN_FILE"
  | "LOGO"
  | "OTHER";

export type NotificationType =
  | "BRIEF_ASSIGNED"
  | "BRIEF_UPDATED"
  | "BRIEF_DEADLINE"
  | "COMMENT_ADDED"
  | "STATUS_CHANGED"
  | "APPROVAL_NEEDED"
  | "APPROVAL_RECEIVED"
  | "MENTION"
  | "SYSTEM";

// Content Engine enums
export type SkillCategory =
  | "BRIEF_MANAGEMENT"
  | "RESOURCE_PLANNING"
  | "CLIENT_RELATIONS"
  | "CONTENT_CREATION"
  | "QUALITY_ASSURANCE"
  | "ANALYTICS"
  | "WORKFLOW"
  | "KNOWLEDGE";

export type SkillStatus =
  | "DRAFT"
  | "TESTING"
  | "ACTIVE"
  | "DEPRECATED";

export type KnowledgeDocumentType =
  | "SKILL"
  | "PERSONA"
  | "ORCHESTRATION"
  | "PROCEDURE"
  | "POLICY"
  | "CHECKLIST"
  | "PLAYBOOK"
  | "TEMPLATE"
  | "REFERENCE"
  | "META";

export type KnowledgeDocumentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "DEPRECATED"
  | "ARCHIVED";

export type InvocationStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMEOUT";

export type DeliverableType =
  | "VIDEO"
  | "IMAGE"
  | "DOCUMENT"
  | "PRESENTATION"
  | "DESIGN_FILE"
  | "COPY"
  | "REPORT"
  | "CODE"
  | "AUDIO"
  | "OTHER";

export type DeliverableStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "INTERNAL_REVIEW"
  | "REVISION_NEEDED"
  | "READY_FOR_CLIENT"
  | "CLIENT_REVIEW"
  | "CLIENT_REVISION"
  | "APPROVED"
  | "DELIVERED"
  | "ARCHIVED";

// ============================================
// MODEL INTERFACES
// ============================================

// Base interfaces for commonly used Prisma models
// These are simplified versions - add fields as needed

export interface FileRecord {
  id: string;
  organizationId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: FileCategory;
  folderId: string | null;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderRecord {
  id: string;
  organizationId: string;
  name: string;
  path: string;
  parentId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRecord {
  id: string;
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  isRead: boolean;
  readAt: Date | null;
  isArchived: boolean;
  archivedAt: Date | null;
  createdAt: Date;
}

export interface BriefRecord {
  id: string;
  organizationId: string;
  title: string;
  type: BriefType;
  status: BriefStatus;
  priority: Priority;
  clientId: string;
  assigneeId: string | null;
  deadline: Date | null;
  formData: unknown;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// EVENT SYSTEM (Phase 12.4)
// ============================================

export interface EntityEventRecord {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  metadata: unknown;
  createdAt: Date;
}

export interface EventSubscriptionRecord {
  id: string;
  organizationId: string;
  entityType: string;
  action: string;
  handler: string;
  skillSlug: string | null;
  priority: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventHandlerLogRecord {
  id: string;
  organizationId: string;
  eventId: string;
  subscriptionId: string;
  status: string;
  error: string | null;
  executedAt: Date;
}

export interface StatusTransitionRecord {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  fromStatus: string;
  toStatus: string;
  userId: string;
  createdAt: Date;
}

// Aliases for backwards compatibility
export type File = FileRecord;
export type Folder = FolderRecord;
export type Notification = NotificationRecord;
export type Brief = BriefRecord;
export type EntityEvent = EntityEventRecord;
export type EventSubscription = EventSubscriptionRecord;
export type EventHandlerLog = EventHandlerLogRecord;
export type StatusTransition = StatusTransitionRecord;
