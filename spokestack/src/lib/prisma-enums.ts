/**
 * Local Prisma enum types for when Prisma client isn't fully generated
 * These match the enum definitions in prisma/schema.prisma
 */

// Brief types
export type BriefType = "VIDEO_SHOOT" | "VIDEO_EDIT" | "DESIGN" | "COPYWRITING_EN" | "COPYWRITING_AR" | "PAID_MEDIA" | "REPORT";

export type BriefStatus = "DRAFT" | "SUBMITTED" | "ASSIGNED" | "IN_PROGRESS" | "IN_REVIEW" | "REVISION" | "APPROVED" | "COMPLETED" | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// User/Permission types
export type PermissionLevel = "ADMIN" | "LEADERSHIP" | "TEAM_LEAD" | "STAFF" | "FREELANCER" | "CLIENT";

// Studio types
export type StudioDocType = "DOCUMENT" | "SCRIPT" | "ARTICLE" | "SOCIAL_COPY" | "AD_COPY" | "BLOG" | "BLOG_POST" | "EMAIL" | "PRESS_RELEASE" | "PROPOSAL" | "SOW" | "OTHER";

export type StudioDocStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export type SyncStatus = "PENDING" | "SYNCED" | "FAILED" | "SKIPPED";

export type SocialContentType = "POST" | "REEL" | "STORY" | "LIVE" | "CAROUSEL" | "VIDEO" | "ARTICLE" | "TWEET" | "THREAD" | "AD" | "OTHER";

export type CalendarEntryStatus = "IDEA" | "PLANNED" | "IN_PROGRESS" | "READY" | "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CANCELLED";

export type VideoProjectType = "SOCIAL_CONTENT" | "BRAND_VIDEO" | "COMMERCIAL" | "DOCUMENTARY" | "TESTIMONIAL" | "EVENT" | "EXPLAINER" | "ANIMATION" | "SHORT_FORM" | "LONG_FORM" | "AD" | "OTHER";

export type VideoProjectStatus = "CONCEPT" | "SCRIPTING" | "PRE_PRODUCTION" | "PRODUCTION" | "POST_PRODUCTION" | "REVIEW" | "COMPLETE" | "CANCELLED";

export type ScriptStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "FINAL";

export type ShotStatus = "PENDING" | "READY" | "SHOT" | "CAPTURED" | "UNUSABLE" | "CANCELLED";

export type DeckType = "PITCH" | "PROPOSAL" | "REPORT" | "CREDENTIALS" | "CASE_STUDY" | "STRATEGY" | "INTERNAL" | "WORKSHOP" | "OTHER";

export type DeckStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PRESENTED" | "WON" | "LOST" | "ARCHIVED";

export type SlideLayoutType = "TITLE" | "CONTENT" | "SECTION" | "TWO_COLUMN" | "IMAGE_LEFT" | "IMAGE_RIGHT" | "IMAGE_FULL" | "STATS" | "QUOTE" | "TEAM" | "TIMELINE" | "COMPARISON" | "PRICING" | "CTA" | "THANK_YOU";

export type MoodboardType = "GENERAL" | "BRAND" | "CAMPAIGN" | "VIDEO" | "PHOTO" | "DESIGN" | "PITCH" | "VISUAL" | "REFERENCE" | "COMPETITOR" | "INSPIRATION" | "OTHER";

export type MoodboardStatus = "ACTIVE" | "ARCHIVED";

export type MoodboardItemType = "IMAGE" | "PDF" | "VIDEO" | "AUDIO" | "COLOR" | "TEXT" | "LINK" | "FILE";

export type MoodboardOutputType = "CAMPAIGN_CONCEPTS" | "COPY" | "VISUAL_DIRECTION" | "SCRIPT" | "DECK_OUTLINE" | "COLOR_PALETTE" | "TAGLINES" | "IMAGE" | "CUSTOM";

export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type IndexStatus = "PENDING" | "INDEXING" | "INDEXED" | "FAILED";

// RFP types
export type RFPStatus = "VETTING" | "CONFIRMED" | "IN_PROGRESS" | "SUBMITTED" | "WON" | "LOST" | "CANCELLED";

export type RFPSubitemStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";

// Workflow types
export type WorkflowMemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
