# Database Schema Specification: CMS, Document Store, Analytics Suite & CRM

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification
**Depends On:** Phases 1-11 (Core Platform)

---

## Executive Summary

This specification defines the database schema for four integrated systems that extend the SpokeStack platform:

1. **Content Management System (CMS)** - Headless CMS for managing publishable content
2. **Creative Document Store (DAM)** - Digital Asset Management for creative production
3. **Analytics Suite** - Media buying, social listening, and web analytics
4. **Enhanced CRM** - Full-featured customer relationship management

All schemas follow the established multi-tenant architecture with `organizationId` on every table.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        INTEGRATED PLATFORM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐         │
│  │    CMS      │   │  Document   │   │  Analytics  │   │    CRM      │         │
│  │             │   │   Store     │   │   Suite     │   │             │         │
│  │ • Pages     │   │ • Assets    │   │ • Media     │   │ • Contacts  │         │
│  │ • Templates │   │ • Versions  │   │ • Social    │   │ • Pipelines │         │
│  │ • Workflows │   │ • Libraries │   │ • Web       │   │ • Campaigns │         │
│  │ • Publishing│   │ • AI Tags   │   │ • Reports   │   │ • Activities│         │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘         │
│         │                 │                 │                 │                 │
│         └─────────────────┴─────────────────┴─────────────────┘                 │
│                                    │                                             │
│                    ┌───────────────┴───────────────┐                            │
│                    │      CORE PLATFORM            │                            │
│                    │  • Organizations  • Users     │                            │
│                    │  • Clients        • Projects  │                            │
│                    │  • Files          • Briefs    │                            │
│                    └───────────────────────────────┘                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Content Management System (CMS)](#1-content-management-system-cms)
2. [Creative Document Store (DAM)](#2-creative-document-store-dam)
3. [Analytics Suite](#3-analytics-suite)
4. [Enhanced CRM](#4-enhanced-crm)
5. [Cross-System Integrations](#5-cross-system-integrations)
6. [Implementation Priority](#6-implementation-priority)

---

## 1. Content Management System (CMS)

A headless CMS designed for creative agencies to manage content across multiple channels - websites, social media, email campaigns, and client deliverables.

### 1.1 Core CMS Models

```prisma
// ============================================
// CMS: CONTENT TYPES & STRUCTURE
// ============================================

// Content Type definitions (like Strapi/Contentful content types)
model ContentType {
  id              String   @id @default(cuid())
  organizationId  String

  // Identity
  name            String   // "Blog Post", "Case Study", "Social Post"
  slug            String   // "blog-post", "case-study", "social-post"
  description     String?
  icon            String?  // Lucide icon name

  // Schema definition (JSON Schema format)
  schema          Json     // Field definitions
  // Example schema:
  // {
  //   "fields": [
  //     { "name": "title", "type": "text", "required": true },
  //     { "name": "body", "type": "richtext", "required": true },
  //     { "name": "featuredImage", "type": "media", "required": false },
  //     { "name": "author", "type": "relation", "relation": "User" },
  //     { "name": "tags", "type": "tags", "required": false }
  //   ]
  // }

  // Display settings
  titleField      String   @default("title")  // Which field to use as title
  previewUrl      String?  // URL pattern for previews

  // Workflow settings
  workflowId      String?
  workflow        ContentWorkflow? @relation(fields: [workflowId], references: [id])

  // Versioning settings
  enableVersioning Boolean @default(true)
  maxVersions      Int     @default(50)

  // Status
  isActive        Boolean  @default(true)
  isSystem        Boolean  @default(false)  // Built-in types

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  entries         ContentEntry[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@map("content_types")
}

// Individual content entries
model ContentEntry {
  id              String   @id @default(cuid())
  organizationId  String

  // Type reference
  contentTypeId   String
  contentType     ContentType @relation(fields: [contentTypeId], references: [id])

  // Content data
  title           String   // Extracted from titleField
  slug            String   // URL-friendly identifier
  data            Json     // Actual content matching schema

  // Rich text content (extracted for search)
  plainText       String?  @db.Text  // Stripped text for full-text search

  // Metadata
  locale          String   @default("en")

  // Publishing
  status          ContentStatus @default(DRAFT)
  publishedAt     DateTime?
  scheduledFor    DateTime?  // Future publish date
  expiresAt       DateTime?  // Auto-unpublish date

  // SEO
  seoTitle        String?
  seoDescription  String?
  seoKeywords     String[]  @default([])
  canonicalUrl    String?
  noIndex         Boolean   @default(false)

  // Social sharing
  ogTitle         String?
  ogDescription   String?
  ogImageId       String?

  // Ownership
  createdById     String
  lastEditedById  String?
  publishedById   String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  versions        ContentVersion[]
  localizations   ContentLocalization[]
  comments        ContentComment[]
  mediaLinks      ContentMedia[]
  tags            ContentTag[]     @relation("ContentEntryTags")
  categories      ContentCategory[] @relation("ContentEntryCategories")
  revisions       ContentRevision[]

  // Client association (if content is for a specific client)
  clientId        String?
  projectId       String?

  @@unique([organizationId, contentTypeId, slug, locale])
  @@index([organizationId])
  @@index([contentTypeId])
  @@index([status])
  @@index([publishedAt])
  @@index([clientId])
  @@map("content_entries")
}

enum ContentStatus {
  DRAFT           // Not yet submitted
  IN_REVIEW       // Pending approval
  APPROVED        // Approved but not published
  SCHEDULED       // Scheduled for future publish
  PUBLISHED       // Live
  UNPUBLISHED     // Was published, now hidden
  ARCHIVED        // Soft deleted
}

// Version history for content
model ContentVersion {
  id              String   @id @default(cuid())
  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  // Version info
  versionNumber   Int
  data            Json     // Snapshot of content at this version
  title           String

  // Change tracking
  changeNote      String?
  changedFields   String[] @default([])

  // Author
  createdById     String
  createdAt       DateTime @default(now())

  // Restoration tracking
  isRestored      Boolean  @default(false)
  restoredFromId  String?  // If restored from another version

  @@unique([entryId, versionNumber])
  @@index([entryId])
  @@map("content_versions")
}

// Localization for multi-language content
model ContentLocalization {
  id              String   @id @default(cuid())
  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  locale          String   // "ar", "fr", "es"
  data            Json     // Translated content
  title           String
  slug            String

  // Translation status
  status          LocalizationStatus @default(PENDING)
  translatedById  String?
  translatedAt    DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([entryId, locale])
  @@index([entryId])
  @@map("content_localizations")
}

enum LocalizationStatus {
  PENDING         // Needs translation
  IN_PROGRESS     // Being translated
  REVIEW          // Needs review
  APPROVED        // Translation approved
  OUTDATED        // Source changed, needs update
}
```

### 1.2 CMS Taxonomy & Organization

```prisma
// ============================================
// CMS: TAXONOMY
// ============================================

// Tags for content classification
model ContentTag {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  slug            String
  color           String?  @default("#6B7280")
  description     String?

  // Usage tracking
  usageCount      Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  entries         ContentEntry[] @relation("ContentEntryTags")

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@map("content_tags")
}

// Hierarchical categories
model ContentCategory {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  slug            String
  description     String?
  parentId        String?
  parent          ContentCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children        ContentCategory[] @relation("CategoryHierarchy")

  // Display
  icon            String?
  color           String?
  sortOrder       Int      @default(0)
  depth           Int      @default(0)
  path            String   // "/marketing/social" for fast queries

  // SEO
  seoTitle        String?
  seoDescription  String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  entries         ContentEntry[] @relation("ContentEntryCategories")

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([parentId])
  @@map("content_categories")
}

// Media attachments to content
model ContentMedia {
  id              String   @id @default(cuid())
  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  fileId          String   // Reference to File model
  fieldName       String   // Which field this belongs to
  position        Int      @default(0)
  caption         String?
  altText         String?

  createdAt       DateTime @default(now())

  @@index([entryId])
  @@map("content_media")
}
```

### 1.3 CMS Workflows & Publishing

```prisma
// ============================================
// CMS: WORKFLOWS
// ============================================

// Custom approval workflows
model ContentWorkflow {
  id              String   @id @default(cuid())
  organizationId  String

  name            String   // "Standard Review", "Client Approval"
  description     String?
  isDefault       Boolean  @default(false)

  // Workflow stages (JSON array)
  stages          Json
  // Example:
  // [
  //   { "name": "Draft", "status": "DRAFT", "order": 0 },
  //   { "name": "Editorial Review", "status": "IN_REVIEW", "assignTo": "role:TEAM_LEAD", "order": 1 },
  //   { "name": "Client Approval", "status": "IN_REVIEW", "assignTo": "client", "order": 2 },
  //   { "name": "Ready to Publish", "status": "APPROVED", "order": 3 }
  // ]

  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  contentTypes    ContentType[]

  @@index([organizationId])
  @@map("content_workflows")
}

// Content revision/approval requests
model ContentRevision {
  id              String   @id @default(cuid())
  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  // Workflow stage
  stageName       String
  stageOrder      Int

  // Assignment
  assignedToId    String?  // User or role
  assignedToType  String   @default("user")  // "user", "role", "client"

  // Review
  status          RevisionStatus @default(PENDING)
  reviewedById    String?
  feedback        String?  @db.Text
  reviewedAt      DateTime?

  // Timestamps
  createdAt       DateTime @default(now())
  dueDate         DateTime?

  @@index([entryId])
  @@index([status])
  @@map("content_revisions")
}

enum RevisionStatus {
  PENDING
  APPROVED
  REJECTED
  CHANGES_REQUESTED
  SKIPPED
}

// Comments on content (internal discussion)
model ContentComment {
  id              String   @id @default(cuid())
  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  // Thread support
  parentId        String?
  parent          ContentComment? @relation("CommentThread", fields: [parentId], references: [id])
  replies         ContentComment[] @relation("CommentThread")

  // Content
  content         String   @db.Text
  authorId        String

  // Field-specific comments
  fieldName       String?  // If commenting on specific field
  selection       Json?    // Text selection range if applicable

  // Resolution
  isResolved      Boolean  @default(false)
  resolvedById    String?
  resolvedAt      DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([entryId])
  @@index([parentId])
  @@map("content_comments")
}

// Scheduled publishing queue
model PublishSchedule {
  id              String   @id @default(cuid())
  organizationId  String

  entryId         String
  action          PublishAction  // PUBLISH, UNPUBLISH, ARCHIVE
  scheduledFor    DateTime

  // Execution status
  status          ScheduleStatus @default(PENDING)
  executedAt      DateTime?
  error           String?

  createdById     String
  createdAt       DateTime @default(now())

  @@index([organizationId, scheduledFor])
  @@index([status])
  @@map("publish_schedules")
}

enum PublishAction {
  PUBLISH
  UNPUBLISH
  ARCHIVE
  UPDATE
}

enum ScheduleStatus {
  PENDING
  EXECUTED
  FAILED
  CANCELLED
}
```

### 1.4 CMS Templates & Components

```prisma
// ============================================
// CMS: TEMPLATES & REUSABLE COMPONENTS
// ============================================

// Page templates for structured layouts
model PageTemplate {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  slug            String
  description     String?
  thumbnail       String?  // Preview image

  // Template structure
  structure       Json     // Component layout definition
  // Example:
  // {
  //   "sections": [
  //     { "type": "hero", "fields": ["title", "subtitle", "backgroundImage"] },
  //     { "type": "content", "fields": ["body"] },
  //     { "type": "gallery", "fields": ["images"] }
  //   ]
  // }

  // Default values
  defaults        Json     @default("{}")

  // Associated content types
  contentTypeId   String?

  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@map("page_templates")
}

// Reusable content blocks/components
model ContentBlock {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  slug            String
  description     String?

  // Block type
  blockType       String   // "cta", "testimonial", "feature-grid", etc.

  // Content
  data            Json

  // Reusability
  isGlobal        Boolean  @default(false)  // Available across all content
  isLocked        Boolean  @default(false)  // Prevent editing

  // Usage tracking
  usedInEntries   String[] @default([])

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@map("content_blocks")
}
```

---

## 2. Creative Document Store (DAM)

A Digital Asset Management system optimized for creative production workflows - design files, copywriting documents, video assets, and brand materials.

### 2.1 Asset Library Structure

```prisma
// ============================================
// DAM: ASSET LIBRARIES
// ============================================

// Asset collections/libraries
model AssetLibrary {
  id              String   @id @default(cuid())
  organizationId  String

  name            String   // "Brand Assets", "Stock Photos", "Client Deliverables"
  slug            String
  description     String?

  // Type of library
  libraryType     LibraryType @default(GENERAL)

  // Cover/thumbnail
  coverImageId    String?

  // Access control
  visibility      LibraryVisibility @default(INTERNAL)
  allowedUserIds  String[]  @default([])
  allowedRoles    String[]  @default([])

  // Client association (if client-specific)
  clientId        String?

  // Settings
  settings        Json      @default("{}")
  // {
  //   "allowedFileTypes": ["image/*", "video/*", "application/pdf"],
  //   "maxFileSize": 104857600,  // 100MB
  //   "namingConvention": "{client}_{project}_{date}_{name}",
  //   "autoTagging": true,
  //   "requireApproval": false
  // }

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  folders         AssetFolder[]
  assets          Asset[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([clientId])
  @@map("asset_libraries")
}

enum LibraryType {
  GENERAL         // Mixed assets
  BRAND           // Brand guidelines, logos
  STOCK           // Stock photos/videos
  CLIENT          // Client-specific assets
  PROJECT         // Project deliverables
  ARCHIVE         // Archived/historical
}

enum LibraryVisibility {
  INTERNAL        // Team only
  CLIENT          // Shared with client
  PUBLIC          // Publicly accessible
}

// Folder hierarchy within libraries
model AssetFolder {
  id              String   @id @default(cuid())
  libraryId       String
  library         AssetLibrary @relation(fields: [libraryId], references: [id], onDelete: Cascade)

  name            String
  slug            String
  description     String?
  color           String?  // Folder color for visual organization

  // Hierarchy
  parentId        String?
  parent          AssetFolder? @relation("FolderHierarchy", fields: [parentId], references: [id])
  children        AssetFolder[] @relation("FolderHierarchy")
  path            String   // "/campaigns/summer-2024/photos"
  depth           Int      @default(0)

  // Metadata inheritance
  defaultMetadata Json     @default("{}")  // Applied to new uploads

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  assets          Asset[]

  @@unique([libraryId, path])
  @@index([libraryId])
  @@index([parentId])
  @@map("asset_folders")
}
```

### 2.2 Creative Assets

```prisma
// ============================================
// DAM: CREATIVE ASSETS
// ============================================

// Core asset model with rich metadata
model Asset {
  id              String   @id @default(cuid())
  organizationId  String

  // Location
  libraryId       String
  library         AssetLibrary @relation(fields: [libraryId], references: [id])
  folderId        String?
  folder          AssetFolder? @relation(fields: [folderId], references: [id])

  // File reference (links to existing File model)
  fileId          String   @unique

  // Asset identity
  name            String   // Display name
  slug            String
  description     String?  @db.Text

  // Classification
  assetType       AssetType

  // Rich metadata
  metadata        Json     @default("{}")
  // Varies by type:
  // Image: { width, height, dpi, colorSpace, format }
  // Video: { duration, fps, resolution, codec, bitrate }
  // Audio: { duration, sampleRate, channels, bitrate }
  // Document: { pageCount, wordCount }
  // Design: { artboards, layers, fonts, colors }

  // AI-extracted metadata
  aiMetadata      Json?
  // {
  //   "labels": ["outdoor", "summer", "beach"],
  //   "objects": ["person", "umbrella", "ocean"],
  //   "colors": ["#FF6B6B", "#4ECDC4", "#FFE66D"],
  //   "faces": [{ "boundingBox": {...}, "age": 25, "expression": "happy" }],
  //   "text": "SUMMER SALE",
  //   "landmarks": ["Dubai Marina"],
  //   "sentiment": "positive"
  // }

  // Manual tags and categories
  tags            String[] @default([])
  categoryId      String?

  // Approval workflow
  status          AssetStatus @default(PENDING)
  approvedById    String?
  approvedAt      DateTime?

  // Usage tracking
  downloadCount   Int      @default(0)
  lastDownloadedAt DateTime?
  usedInBriefs    String[] @default([])
  usedInContent   String[] @default([])

  // Rights management
  license         LicenseType?
  licenseDetails  Json?    // Expiry, restrictions, attribution
  expiresAt       DateTime?

  // Copyright
  copyrightHolder String?
  copyrightYear   Int?
  usageRights     String?  @db.Text

  // Source tracking
  sourceType      AssetSourceType @default(UPLOAD)
  sourceUrl       String?
  externalId      String?  // ID from stock service, etc.

  // Ownership
  createdById     String
  lastEditedById  String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  versions        AssetVersion[]
  renditions      AssetRendition[]
  collections     AssetCollectionItem[]
  comments        AssetComment[]
  links           AssetLink[]

  @@unique([organizationId, libraryId, slug])
  @@index([organizationId])
  @@index([libraryId])
  @@index([folderId])
  @@index([assetType])
  @@index([status])
  @@index([tags])
  @@map("assets")
}

enum AssetType {
  // Images
  IMAGE_PHOTO     // Photographs
  IMAGE_GRAPHIC   // Graphics, illustrations
  IMAGE_ICON      // Icons, symbols
  IMAGE_LOGO      // Logos, brand marks

  // Video
  VIDEO_RAW       // Unedited footage
  VIDEO_EDITED    // Final cuts
  VIDEO_MOTION    // Motion graphics

  // Audio
  AUDIO_MUSIC     // Music tracks
  AUDIO_VOICEOVER // VO recordings
  AUDIO_SFX       // Sound effects

  // Documents
  DOC_COPY        // Copywriting documents
  DOC_BRIEF       // Creative briefs
  DOC_PRESENTATION // Presentations
  DOC_REPORT      // Reports

  // Design files
  DESIGN_SOURCE   // PSD, AI, Figma, Sketch
  DESIGN_TEMPLATE // Reusable templates

  // 3D/AR
  THREE_D_MODEL   // 3D models
  AR_ASSET        // AR assets

  // Other
  FONT            // Font files
  OTHER
}

enum AssetStatus {
  PENDING         // Awaiting review
  APPROVED        // Ready for use
  REJECTED        // Not approved
  ARCHIVED        // No longer active
  EXPIRED         // License expired
}

enum AssetSourceType {
  UPLOAD          // Direct upload
  IMPORT          // Imported from drive
  STOCK           // Stock service
  GENERATED       // AI generated
  CAPTURE         // Screen/camera capture
  EXTERNAL        // External link
}

enum LicenseType {
  OWNED           // Full ownership
  EXCLUSIVE       // Exclusive license
  ROYALTY_FREE    // RF stock
  RIGHTS_MANAGED  // RM stock
  CREATIVE_COMMONS
  EDITORIAL_ONLY
  INTERNAL_ONLY
  CLIENT_PROVIDED
  UNKNOWN
}
```

### 2.3 Asset Versioning & Renditions

```prisma
// ============================================
// DAM: VERSIONING
// ============================================

// Version history for assets
model AssetVersion {
  id              String   @id @default(cuid())
  assetId         String
  asset           Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  versionNumber   Int
  fileId          String   // Reference to File for this version

  // Change info
  changeNote      String?
  changeType      VersionChangeType @default(UPDATE)

  // Comparison
  diffMetadata    Json?    // Differences from previous version

  // Author
  createdById     String
  createdAt       DateTime @default(now())

  // Restoration
  isCurrentVersion Boolean @default(false)

  @@unique([assetId, versionNumber])
  @@index([assetId])
  @@map("asset_versions")
}

enum VersionChangeType {
  INITIAL         // First version
  UPDATE          // Content update
  REVISION        // Client revision
  RESTORE         // Restored from previous
  AUTO_SAVE       // Auto-saved draft
}

// Pre-generated renditions (thumbnails, previews, variants)
model AssetRendition {
  id              String   @id @default(cuid())
  assetId         String
  asset           Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  // Rendition type
  renditionType   RenditionType

  // File info
  fileId          String
  width           Int?
  height          Int?
  quality         Int?
  format          String?  // "jpg", "webp", "mp4"

  // For video
  duration        Int?     // Seconds (for video previews)
  startTime       Int?     // Start time for clip

  // Status
  status          RenditionStatus @default(PENDING)
  error           String?

  createdAt       DateTime @default(now())

  @@unique([assetId, renditionType])
  @@index([assetId])
  @@map("asset_renditions")
}

enum RenditionType {
  THUMBNAIL_SMALL   // 150px
  THUMBNAIL_MEDIUM  // 300px
  THUMBNAIL_LARGE   // 600px
  PREVIEW           // Full preview
  PREVIEW_VIDEO     // Video preview (first 10s)
  WEB_OPTIMIZED     // Web-ready version
  SOCIAL_SQUARE     // 1:1 crop
  SOCIAL_STORY      // 9:16 crop
  WATERMARKED       // With watermark
  LOW_RES           // Low resolution for proofing
}

enum RenditionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

### 2.4 Asset Collections & Sharing

```prisma
// ============================================
// DAM: COLLECTIONS & SHARING
// ============================================

// Curated asset collections
model AssetCollection {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  slug            String
  description     String?
  coverImageId    String?

  // Type
  collectionType  CollectionType @default(MANUAL)

  // Smart collection rules (for auto-collections)
  smartRules      Json?
  // Example:
  // {
  //   "conditions": [
  //     { "field": "assetType", "operator": "in", "value": ["IMAGE_PHOTO"] },
  //     { "field": "tags", "operator": "contains", "value": "summer" },
  //     { "field": "createdAt", "operator": "after", "value": "2024-01-01" }
  //   ],
  //   "match": "all"  // "all" or "any"
  // }

  // Sharing
  isPublic        Boolean  @default(false)
  shareToken      String?  @unique  // For public sharing links
  shareExpiresAt  DateTime?
  sharePassword   String?  // Optional password protection

  // Permissions
  allowDownload   Boolean  @default(true)
  allowComments   Boolean  @default(true)

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  items           AssetCollectionItem[]
  shares          CollectionShare[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([shareToken])
  @@map("asset_collections")
}

enum CollectionType {
  MANUAL          // Hand-picked
  SMART           // Auto-populated by rules
  LIGHTBOX        // Temporary selection
  DELIVERABLE     // Client delivery package
}

// Many-to-many for collection items
model AssetCollectionItem {
  id              String   @id @default(cuid())
  collectionId    String
  collection      AssetCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  assetId         String
  asset           Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  sortOrder       Int      @default(0)
  note            String?  // Note about why it's in collection
  addedById       String
  addedAt         DateTime @default(now())

  @@unique([collectionId, assetId])
  @@index([collectionId])
  @@index([assetId])
  @@map("asset_collection_items")
}

// Share access for collections
model CollectionShare {
  id              String   @id @default(cuid())
  collectionId    String
  collection      AssetCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  // Recipient
  email           String?
  clientContactId String?

  // Access
  accessLevel     ShareAccessLevel @default(VIEW)
  expiresAt       DateTime?

  // Tracking
  lastAccessedAt  DateTime?
  accessCount     Int      @default(0)

  createdById     String
  createdAt       DateTime @default(now())

  @@index([collectionId])
  @@index([email])
  @@map("collection_shares")
}

enum ShareAccessLevel {
  VIEW            // View only
  DOWNLOAD        // Can download
  COMMENT         // Can comment
  EDIT            // Can edit selection
}

// Asset-level sharing links
model AssetLink {
  id              String   @id @default(cuid())
  assetId         String
  asset           Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  // Link token
  token           String   @unique

  // Settings
  allowDownload   Boolean  @default(true)
  expiresAt       DateTime?
  password        String?
  maxDownloads    Int?
  downloadCount   Int      @default(0)

  createdById     String
  createdAt       DateTime @default(now())

  @@index([assetId])
  @@index([token])
  @@map("asset_links")
}

// Comments on assets (for approval, feedback)
model AssetComment {
  id              String   @id @default(cuid())
  assetId         String
  asset           Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)

  // Thread support
  parentId        String?
  parent          AssetComment? @relation("AssetCommentThread", fields: [parentId], references: [id])
  replies         AssetComment[] @relation("AssetCommentThread")

  content         String   @db.Text
  authorId        String
  authorType      String   @default("user")  // "user" or "client"

  // Annotation (position on image/video)
  annotation      Json?
  // { "type": "point", "x": 0.5, "y": 0.3 }
  // { "type": "rect", "x": 0.2, "y": 0.2, "width": 0.3, "height": 0.2 }
  // { "type": "timestamp", "time": 45.5 }  // For video

  // Resolution
  isResolved      Boolean  @default(false)
  resolvedById    String?
  resolvedAt      DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([assetId])
  @@index([parentId])
  @@map("asset_comments")
}
```

---

## 3. Analytics Suite

Comprehensive analytics for media buying, social listening, web analytics, and performance tracking across digital and social platforms.

### 3.1 Platform Connections

```prisma
// ============================================
// ANALYTICS: PLATFORM INTEGRATIONS
// ============================================

// Connected advertising/analytics platforms
model AnalyticsPlatform {
  id              String   @id @default(cuid())
  organizationId  String

  // Platform identity
  platform        PlatformType
  name            String   // Custom name: "LMTD Meta Ads", "Client X Google"

  // Credentials (encrypted)
  credentials     Json     // Platform-specific auth data
  accessToken     String?
  refreshToken    String?
  tokenExpiresAt  DateTime?

  // Account info
  accountId       String?  // Platform's account ID
  accountName     String?

  // Scope
  clientId        String?  // If specific to a client

  // Sync settings
  isActive        Boolean  @default(true)
  syncEnabled     Boolean  @default(true)
  syncFrequency   Int      @default(60)  // Minutes
  lastSyncAt      DateTime?
  lastSyncStatus  String?
  lastSyncError   String?

  // Data retention
  dataRetentionDays Int    @default(365)

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  campaigns       AdCampaign[]
  metrics         PlatformMetric[]
  syncLogs        PlatformSyncLog[]

  @@unique([organizationId, platform, accountId])
  @@index([organizationId])
  @@index([clientId])
  @@map("analytics_platforms")
}

enum PlatformType {
  // Advertising
  META_ADS        // Facebook/Instagram Ads
  GOOGLE_ADS      // Google Ads
  TIKTOK_ADS      // TikTok Ads
  LINKEDIN_ADS    // LinkedIn Ads
  TWITTER_ADS     // X/Twitter Ads
  SNAPCHAT_ADS    // Snapchat Ads
  PINTEREST_ADS   // Pinterest Ads
  DV360           // Display & Video 360

  // Social Media
  META_INSIGHTS   // FB/IG organic insights
  TWITTER_ANALYTICS
  LINKEDIN_ANALYTICS
  TIKTOK_ANALYTICS
  YOUTUBE_ANALYTICS

  // Web Analytics
  GOOGLE_ANALYTICS_4
  ADOBE_ANALYTICS
  MIXPANEL
  AMPLITUDE
  HOTJAR

  // Social Listening
  BRANDWATCH
  SPROUT_SOCIAL
  HOOTSUITE
  MELTWATER
  MENTION

  // SEO
  GOOGLE_SEARCH_CONSOLE
  SEMRUSH
  AHREFS
  MOZ

  // Email
  MAILCHIMP
  KLAVIYO
  HUBSPOT

  // CRM/Attribution
  SALESFORCE
  HUBSPOT_CRM

  // Custom
  CUSTOM_API
}

// Sync history for platforms
model PlatformSyncLog {
  id              String   @id @default(cuid())
  platformId      String
  platform        AnalyticsPlatform @relation(fields: [platformId], references: [id], onDelete: Cascade)

  syncType        String   // "full", "incremental", "campaigns", "metrics"
  status          String   // "started", "completed", "failed"

  recordsProcessed Int     @default(0)
  recordsFailed   Int      @default(0)

  startedAt       DateTime @default(now())
  completedAt     DateTime?
  duration        Int?     // Milliseconds

  error           String?
  errorDetails    Json?

  @@index([platformId, startedAt])
  @@map("platform_sync_logs")
}
```

### 3.2 Media Buying Analytics

```prisma
// ============================================
// ANALYTICS: MEDIA BUYING / ADVERTISING
// ============================================

// Ad campaigns (aggregated from platforms)
model AdCampaign {
  id              String   @id @default(cuid())
  organizationId  String

  platformId      String
  platform        AnalyticsPlatform @relation(fields: [platformId], references: [id])

  // Platform identifiers
  externalId      String   // Platform's campaign ID
  externalAccountId String?

  // Campaign info
  name            String
  status          CampaignStatus
  objective       String?  // "CONVERSIONS", "REACH", "TRAFFIC", etc.

  // Budget
  budgetType      BudgetType?
  dailyBudget     Decimal? @db.Decimal(12, 2)
  lifetimeBudget  Decimal? @db.Decimal(12, 2)
  currency        String   @default("USD")

  // Schedule
  startDate       DateTime?
  endDate         DateTime?

  // Targeting summary
  targetingSummary Json?   // Age, geo, interests, etc.

  // Attribution
  clientId        String?
  projectId       String?
  briefId         String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastSyncedAt    DateTime?

  // Relations
  adSets          AdSet[]
  metrics         CampaignMetric[]

  @@unique([platformId, externalId])
  @@index([organizationId])
  @@index([clientId])
  @@index([status])
  @@map("ad_campaigns")
}

enum CampaignStatus {
  DRAFT
  PENDING_REVIEW
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
  REJECTED
}

enum BudgetType {
  DAILY
  LIFETIME
}

// Ad sets within campaigns
model AdSet {
  id              String   @id @default(cuid())
  campaignId      String
  campaign        AdCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  externalId      String
  name            String
  status          String

  // Targeting
  targeting       Json?
  // {
  //   "ageMin": 25,
  //   "ageMax": 45,
  //   "genders": ["male", "female"],
  //   "locations": [{ "type": "country", "code": "AE" }],
  //   "interests": ["technology", "business"],
  //   "behaviors": [],
  //   "customAudiences": ["CA_123"],
  //   "excludedAudiences": [],
  //   "placements": ["feed", "stories", "reels"]
  // }

  // Budget
  dailyBudget     Decimal? @db.Decimal(12, 2)
  lifetimeBudget  Decimal? @db.Decimal(12, 2)

  // Bidding
  bidStrategy     String?
  bidAmount       Decimal? @db.Decimal(12, 4)

  // Schedule
  startDate       DateTime?
  endDate         DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  ads             Ad[]
  metrics         AdSetMetric[]

  @@unique([campaignId, externalId])
  @@index([campaignId])
  @@map("ad_sets")
}

// Individual ads
model Ad {
  id              String   @id @default(cuid())
  adSetId         String
  adSet           AdSet    @relation(fields: [adSetId], references: [id], onDelete: Cascade)

  externalId      String
  name            String
  status          String

  // Creative
  format          AdFormat?
  headline        String?
  body            String?
  callToAction    String?
  destinationUrl  String?

  // Media
  mediaType       String?  // "image", "video", "carousel"
  mediaUrls       String[] @default([])
  thumbnailUrl    String?

  // Tracking
  trackingPixels  String[] @default([])
  utmParams       Json?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  metrics         AdMetric[]

  @@unique([adSetId, externalId])
  @@index([adSetId])
  @@map("ads")
}

enum AdFormat {
  SINGLE_IMAGE
  SINGLE_VIDEO
  CAROUSEL
  COLLECTION
  STORIES
  REELS
  DYNAMIC
}

// Daily metrics for campaigns
model CampaignMetric {
  id              String   @id @default(cuid())
  campaignId      String
  campaign        AdCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date

  // Delivery
  impressions     BigInt   @default(0)
  reach           BigInt   @default(0)
  frequency       Decimal? @db.Decimal(8, 2)

  // Engagement
  clicks          Int      @default(0)
  ctr             Decimal? @db.Decimal(8, 4)  // Click-through rate

  // Video
  videoViews      Int      @default(0)
  videoViews25    Int      @default(0)
  videoViews50    Int      @default(0)
  videoViews75    Int      @default(0)
  videoViews100   Int      @default(0)
  videoAvgWatchTime Decimal? @db.Decimal(8, 2)

  // Social
  likes           Int      @default(0)
  comments        Int      @default(0)
  shares          Int      @default(0)
  saves           Int      @default(0)

  // Conversions
  conversions     Int      @default(0)
  conversionValue Decimal? @db.Decimal(14, 2)
  leads           Int      @default(0)
  purchases       Int      @default(0)
  purchaseValue   Decimal? @db.Decimal(14, 2)

  // Cost
  spend           Decimal  @db.Decimal(12, 2) @default(0)
  cpm             Decimal? @db.Decimal(10, 4)  // Cost per 1000 impressions
  cpc             Decimal? @db.Decimal(10, 4)  // Cost per click
  cpa             Decimal? @db.Decimal(10, 4)  // Cost per action
  roas            Decimal? @db.Decimal(10, 4)  // Return on ad spend

  // Platform-specific extras
  customMetrics   Json?

  createdAt       DateTime @default(now())

  @@unique([campaignId, date])
  @@index([campaignId, date])
  @@map("campaign_metrics")
}

// Daily metrics for ad sets
model AdSetMetric {
  id              String   @id @default(cuid())
  adSetId         String
  adSet           AdSet    @relation(fields: [adSetId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date

  impressions     BigInt   @default(0)
  reach           BigInt   @default(0)
  clicks          Int      @default(0)
  conversions     Int      @default(0)
  spend           Decimal  @db.Decimal(12, 2) @default(0)

  customMetrics   Json?

  createdAt       DateTime @default(now())

  @@unique([adSetId, date])
  @@index([adSetId, date])
  @@map("ad_set_metrics")
}

// Daily metrics for individual ads
model AdMetric {
  id              String   @id @default(cuid())
  adId            String
  ad              Ad       @relation(fields: [adId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date

  impressions     BigInt   @default(0)
  reach           BigInt   @default(0)
  clicks          Int      @default(0)
  conversions     Int      @default(0)
  spend           Decimal  @db.Decimal(12, 2) @default(0)

  customMetrics   Json?

  createdAt       DateTime @default(now())

  @@unique([adId, date])
  @@index([adId, date])
  @@map("ad_metrics")
}

// Generic platform metrics (for non-campaign data)
model PlatformMetric {
  id              String   @id @default(cuid())
  platformId      String
  platform        AnalyticsPlatform @relation(fields: [platformId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date
  metricType      String   // "organic_reach", "followers", "engagement_rate"
  dimension       String?  // "post", "story", "profile"
  dimensionValue  String?  // Specific post ID, etc.

  value           Decimal  @db.Decimal(18, 4)
  previousValue   Decimal? @db.Decimal(18, 4)
  changePercent   Decimal? @db.Decimal(8, 2)

  metadata        Json?

  createdAt       DateTime @default(now())

  @@unique([platformId, date, metricType, dimension, dimensionValue])
  @@index([platformId, date])
  @@index([metricType])
  @@map("platform_metrics")
}
```

### 3.3 Social & Web Listening

```prisma
// ============================================
// ANALYTICS: SOCIAL & WEB LISTENING
// ============================================

// Listening queries/topics to track
model ListeningQuery {
  id              String   @id @default(cuid())
  organizationId  String

  name            String   // "Brand Mentions", "Competitor Analysis"
  description     String?

  // Query configuration
  keywords        String[] @default([])
  hashtags        String[] @default([])
  mentions        String[] @default([])  // @handles to track
  excludeKeywords String[] @default([])

  // Language/location filters
  languages       String[] @default([])
  locations       String[] @default([])

  // Sources
  sources         ListeningSource[] @default([])

  // Association
  clientId        String?
  brandId         String?  // If tracking a specific brand

  // Status
  isActive        Boolean  @default(true)

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  mentions        SocialMention[]
  alerts          ListeningAlert[]
  summaries       ListeningSummary[]

  @@index([organizationId])
  @@index([clientId])
  @@map("listening_queries")
}

enum ListeningSource {
  TWITTER
  FACEBOOK
  INSTAGRAM
  LINKEDIN
  TIKTOK
  YOUTUBE
  REDDIT
  NEWS
  BLOGS
  FORUMS
  REVIEWS
}

// Individual mentions/posts captured
model SocialMention {
  id              String   @id @default(cuid())
  queryId         String
  query           ListeningQuery @relation(fields: [queryId], references: [id], onDelete: Cascade)

  // Source info
  source          ListeningSource
  sourceId        String   // Platform's post ID
  sourceUrl       String?

  // Author
  authorHandle    String?
  authorName      String?
  authorFollowers Int?
  authorVerified  Boolean  @default(false)
  authorAvatarUrl String?

  // Content
  content         String   @db.Text
  contentLanguage String?

  // Media
  mediaType       String?  // "image", "video", "link"
  mediaUrls       String[] @default([])

  // Engagement
  likes           Int      @default(0)
  comments        Int      @default(0)
  shares          Int      @default(0)
  reach           Int?

  // Analysis
  sentiment       Sentiment?
  sentimentScore  Decimal? @db.Decimal(5, 4)  // -1 to 1
  emotions        Json?    // { "joy": 0.8, "anger": 0.1, ... }
  topics          String[] @default([])
  entities        Json?    // Named entities extracted

  // Classification
  isInfluencer    Boolean  @default(false)
  isSpam          Boolean  @default(false)
  requiresResponse Boolean @default(false)

  // Response tracking
  respondedAt     DateTime?
  respondedById   String?
  responseUrl     String?

  publishedAt     DateTime
  capturedAt      DateTime @default(now())

  @@unique([source, sourceId])
  @@index([queryId, publishedAt])
  @@index([sentiment])
  @@index([source])
  @@map("social_mentions")
}

enum Sentiment {
  VERY_POSITIVE
  POSITIVE
  NEUTRAL
  NEGATIVE
  VERY_NEGATIVE
}

// Alerts for significant events
model ListeningAlert {
  id              String   @id @default(cuid())
  queryId         String
  query           ListeningQuery @relation(fields: [queryId], references: [id], onDelete: Cascade)

  alertType       AlertType
  severity        AlertSeverity
  title           String
  description     String   @db.Text

  // Trigger data
  triggerData     Json
  // {
  //   "mentionId": "...",
  //   "threshold": 100,
  //   "actualValue": 150,
  //   "windowHours": 24
  // }

  // Status
  status          AlertStatus @default(NEW)
  acknowledgedById String?
  acknowledgedAt  DateTime?
  resolvedById    String?
  resolvedAt      DateTime?
  resolutionNotes String?

  createdAt       DateTime @default(now())

  @@index([queryId, createdAt])
  @@index([status])
  @@map("listening_alerts")
}

enum AlertType {
  VOLUME_SPIKE       // Unusual volume increase
  SENTIMENT_DROP     // Sudden negative sentiment
  VIRAL_MENTION      // High-engagement mention
  INFLUENCER_MENTION // Mention by influencer
  CRISIS_DETECTED    // Potential PR crisis
  COMPETITOR_ACTIVITY // Competitor news
}

enum AlertSeverity {
  INFO
  WARNING
  CRITICAL
}

enum AlertStatus {
  NEW
  ACKNOWLEDGED
  IN_PROGRESS
  RESOLVED
  DISMISSED
}

// Periodic listening summaries
model ListeningSummary {
  id              String   @id @default(cuid())
  queryId         String
  query           ListeningQuery @relation(fields: [queryId], references: [id], onDelete: Cascade)

  period          String   // "daily", "weekly", "monthly"
  periodStart     DateTime
  periodEnd       DateTime

  // Volume metrics
  totalMentions   Int      @default(0)
  uniqueAuthors   Int      @default(0)
  totalReach      BigInt   @default(0)
  totalEngagement Int      @default(0)

  // Sentiment breakdown
  sentimentPositive Int    @default(0)
  sentimentNeutral  Int    @default(0)
  sentimentNegative Int    @default(0)
  avgSentimentScore Decimal? @db.Decimal(5, 4)

  // Top items
  topMentions     Json?    // Top mentions by engagement
  topAuthors      Json?    // Top authors by reach
  topTopics       Json?    // Trending topics
  topHashtags     Json?    // Trending hashtags

  // Comparison
  volumeChange    Decimal? @db.Decimal(8, 2)  // % change from previous
  sentimentChange Decimal? @db.Decimal(8, 2)

  // Source breakdown
  bySource        Json?    // { "twitter": 150, "instagram": 80 }

  generatedAt     DateTime @default(now())

  @@unique([queryId, period, periodStart])
  @@index([queryId, periodStart])
  @@map("listening_summaries")
}
```

### 3.4 Web Analytics

```prisma
// ============================================
// ANALYTICS: WEB ANALYTICS
// ============================================

// Tracked websites/properties
model WebProperty {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  domain          String

  // Integration
  platformId      String?  // Link to AnalyticsPlatform (GA4, etc.)
  propertyId      String?  // GA4 property ID, etc.

  // Client association
  clientId        String?

  // Tracking settings
  trackingEnabled Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  pageMetrics     WebPageMetric[]
  eventMetrics    WebEventMetric[]
  conversions     WebConversion[]
  sessions        WebSessionAggregate[]

  @@unique([organizationId, domain])
  @@index([organizationId])
  @@index([clientId])
  @@map("web_properties")
}

// Page-level metrics (daily aggregates)
model WebPageMetric {
  id              String   @id @default(cuid())
  propertyId      String
  property        WebProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date
  pagePath        String   // "/blog/article-title"
  pageTitle       String?

  // Traffic
  pageviews       Int      @default(0)
  uniquePageviews Int      @default(0)

  // Engagement
  avgTimeOnPage   Decimal? @db.Decimal(10, 2)  // Seconds
  bounceRate      Decimal? @db.Decimal(5, 2)   // Percentage
  exitRate        Decimal? @db.Decimal(5, 2)   // Percentage

  // Scroll depth
  scrollDepth25   Int      @default(0)
  scrollDepth50   Int      @default(0)
  scrollDepth75   Int      @default(0)
  scrollDepth100  Int      @default(0)

  createdAt       DateTime @default(now())

  @@unique([propertyId, date, pagePath])
  @@index([propertyId, date])
  @@map("web_page_metrics")
}

// Event tracking (daily aggregates)
model WebEventMetric {
  id              String   @id @default(cuid())
  propertyId      String
  property        WebProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date
  eventName       String   // "button_click", "form_submit", "video_play"
  eventCategory   String?
  eventAction     String?
  eventLabel      String?

  // Counts
  eventCount      Int      @default(0)
  uniqueEvents    Int      @default(0)

  // Value
  totalValue      Decimal? @db.Decimal(14, 2)

  createdAt       DateTime @default(now())

  @@unique([propertyId, date, eventName, eventCategory, eventAction, eventLabel])
  @@index([propertyId, date])
  @@map("web_event_metrics")
}

// Conversion tracking
model WebConversion {
  id              String   @id @default(cuid())
  propertyId      String
  property        WebProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date
  goalName        String
  goalId          String?

  completions     Int      @default(0)
  value           Decimal? @db.Decimal(14, 2)
  conversionRate  Decimal? @db.Decimal(5, 4)

  // Attribution
  sourceMedium    String?
  campaign        String?

  createdAt       DateTime @default(now())

  @@unique([propertyId, date, goalName, sourceMedium, campaign])
  @@index([propertyId, date])
  @@map("web_conversions")
}

// Session aggregates (daily by dimension)
model WebSessionAggregate {
  id              String   @id @default(cuid())
  propertyId      String
  property        WebProperty @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date

  // Dimension (one of these will be populated)
  dimensionType   String   // "source", "medium", "device", "country", "browser"
  dimensionValue  String

  // Metrics
  sessions        Int      @default(0)
  users           Int      @default(0)
  newUsers        Int      @default(0)
  pageviews       Int      @default(0)

  avgSessionDuration Decimal? @db.Decimal(10, 2)
  bounceRate      Decimal? @db.Decimal(5, 2)
  pagesPerSession Decimal? @db.Decimal(6, 2)

  createdAt       DateTime @default(now())

  @@unique([propertyId, date, dimensionType, dimensionValue])
  @@index([propertyId, date])
  @@map("web_session_aggregates")
}
```

### 3.5 Analytics Reports & Dashboards

```prisma
// ============================================
// ANALYTICS: CUSTOM REPORTS & DASHBOARDS
// ============================================

// Saved analytics reports
model AnalyticsReport {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?
  reportType      AnalyticsReportType

  // Configuration
  config          Json
  // {
  //   "dataSources": ["campaigns", "social", "web"],
  //   "dateRange": { "type": "last_30_days" },
  //   "metrics": ["impressions", "clicks", "spend", "conversions"],
  //   "dimensions": ["campaign", "platform", "date"],
  //   "filters": [{ "field": "clientId", "value": "xxx" }],
  //   "compareWith": "previous_period",
  //   "visualizations": [
  //     { "type": "line", "metrics": ["impressions", "clicks"], "dimension": "date" },
  //     { "type": "pie", "metric": "spend", "dimension": "platform" }
  //   ]
  // }

  // Scheduling
  schedule        String?  // Cron expression
  recipients      String[] @default([])
  format          String   @default("pdf")
  lastGeneratedAt DateTime?
  nextGeneratedAt DateTime?

  // Sharing
  isPublic        Boolean  @default(false)
  shareToken      String?  @unique

  // Client association
  clientId        String?

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  snapshots       ReportSnapshot[]

  @@index([organizationId])
  @@index([clientId])
  @@map("analytics_reports")
}

enum AnalyticsReportType {
  // Media
  MEDIA_PERFORMANCE    // Cross-platform ad performance
  CAMPAIGN_ANALYSIS    // Deep dive into campaigns
  MEDIA_MIX            // Channel comparison
  BUDGET_PACING        // Spend vs budget

  // Social
  SOCIAL_PERFORMANCE   // Organic social metrics
  SOCIAL_LISTENING     // Listening report
  COMPETITOR_ANALYSIS  // Competitor benchmarking
  INFLUENCER_REPORT    // Influencer performance

  // Web
  WEB_TRAFFIC          // Traffic overview
  CONVERSION_FUNNEL    // Funnel analysis
  CONTENT_PERFORMANCE  // Content analytics
  SEO_REPORT           // SEO metrics

  // Combined
  INTEGRATED_DASHBOARD // Multi-source dashboard
  CLIENT_REPORT        // Client-facing summary
  EXECUTIVE_SUMMARY    // High-level overview

  // Custom
  CUSTOM
}

// Generated report snapshots
model ReportSnapshot {
  id              String   @id @default(cuid())
  reportId        String
  report          AnalyticsReport @relation(fields: [reportId], references: [id], onDelete: Cascade)

  // Snapshot data
  data            Json     // Cached report data

  // File outputs
  pdfUrl          String?
  excelUrl        String?

  // Period
  periodStart     DateTime
  periodEnd       DateTime

  generatedAt     DateTime @default(now())

  @@index([reportId, generatedAt])
  @@map("report_snapshots")
}

// Attribution models
model AttributionModel {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  modelType       AttributionType

  // Custom model config
  customWeights   Json?    // For custom models
  lookbackDays    Int      @default(30)

  isDefault       Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId])
  @@map("attribution_models")
}

enum AttributionType {
  LAST_CLICK
  FIRST_CLICK
  LINEAR
  TIME_DECAY
  POSITION_BASED
  DATA_DRIVEN
  CUSTOM
}

// Attribution results
model AttributionResult {
  id              String   @id @default(cuid())
  organizationId  String

  modelId         String
  clientId        String?

  periodStart     DateTime
  periodEnd       DateTime

  // Results
  channelResults  Json
  // [
  //   { "channel": "meta_ads", "conversions": 150, "revenue": 25000, "credit": 0.35 },
  //   { "channel": "google_ads", "conversions": 100, "revenue": 18000, "credit": 0.28 }
  // ]

  pathAnalysis    Json?    // Common conversion paths

  generatedAt     DateTime @default(now())

  @@index([organizationId, periodStart])
  @@map("attribution_results")
}
```

---

## 4. Enhanced CRM

Building on the existing CRM foundation, this section adds comprehensive contact management, sales pipelines, marketing campaigns, and interaction tracking.

### 4.1 Contact Management

```prisma
// ============================================
// CRM: CONTACT MANAGEMENT
// ============================================

// Extended contact model (beyond ClientContact)
model Contact {
  id              String   @id @default(cuid())
  organizationId  String

  // Identity
  firstName       String
  lastName        String
  email           String?
  phone           String?
  mobile          String?

  // Professional
  jobTitle        String?
  department      String?
  companyName     String?
  companyId       String?  // Link to Client if applicable

  // Social
  linkedIn        String?
  twitter         String?
  instagram       String?

  // Avatar
  avatarUrl       String?

  // Address
  addressLine1    String?
  addressLine2    String?
  city            String?
  state           String?
  postalCode      String?
  country         String?

  // Classification
  contactType     ContactType @default(PROSPECT)
  status          ContactStatus @default(ACTIVE)
  source          LeadSource?

  // Scoring
  leadScore       Int      @default(0)
  engagementScore Int      @default(0)
  lastScoreUpdate DateTime?

  // Tags
  tags            String[] @default([])

  // Custom fields (schema-less)
  customFields    Json     @default("{}")

  // Ownership
  ownerId         String?  // Sales rep owner

  // GDPR
  marketingConsent    Boolean @default(false)
  marketingConsentDate DateTime?
  dataProcessingConsent Boolean @default(false)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastContactedAt DateTime?

  // Relations
  company         Client?  @relation("ContactCompany", fields: [companyId], references: [id])
  activities      ContactActivity[]
  deals           DealContact[]
  campaignMembers CampaignMember[]
  emailInteractions EmailInteraction[]
  tasks           CRMTask[]
  notes           ContactNote[]
  formSubmissions ContactFormSubmission[]

  @@unique([organizationId, email])
  @@index([organizationId])
  @@index([companyId])
  @@index([ownerId])
  @@index([status])
  @@index([tags])
  @@map("contacts")
}

enum ContactType {
  PROSPECT        // Potential lead
  LEAD            // Qualified lead
  CUSTOMER        // Active customer
  PARTNER         // Business partner
  VENDOR          // Supplier/vendor
  INFLUENCER      // Industry influencer
  PRESS           // Media contact
  INVESTOR        // Investor contact
  OTHER
}

enum ContactStatus {
  ACTIVE
  INACTIVE
  UNSUBSCRIBED
  BOUNCED
  DO_NOT_CONTACT
  ARCHIVED
}

// Contact activity log
model ContactActivity {
  id              String   @id @default(cuid())
  contactId       String
  contact         Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  activityType    ContactActivityType
  subject         String
  description     String?  @db.Text

  // Related entities
  dealId          String?
  campaignId      String?

  // Meeting/call details
  scheduledAt     DateTime?
  duration        Int?     // Minutes
  outcome         String?

  // Email details
  emailId         String?

  // Ownership
  performedById   String?

  createdAt       DateTime @default(now())

  @@index([contactId, createdAt])
  @@index([activityType])
  @@map("contact_activities")
}

enum ContactActivityType {
  EMAIL_SENT
  EMAIL_RECEIVED
  EMAIL_OPENED
  EMAIL_CLICKED
  CALL_OUTBOUND
  CALL_INBOUND
  MEETING
  NOTE
  TASK_COMPLETED
  DEAL_CREATED
  DEAL_WON
  DEAL_LOST
  FORM_SUBMISSION
  WEBSITE_VISIT
  DOCUMENT_VIEWED
  CAMPAIGN_ADDED
  STATUS_CHANGED
}

// Contact notes
model ContactNote {
  id              String   @id @default(cuid())
  contactId       String
  contact         Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  content         String   @db.Text
  isPinned        Boolean  @default(false)

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([contactId])
  @@map("contact_notes")
}

// Form submissions linked to contacts
model ContactFormSubmission {
  id              String   @id @default(cuid())
  contactId       String
  contact         Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  formId          String
  formName        String
  data            Json

  sourceUrl       String?
  utmSource       String?
  utmMedium       String?
  utmCampaign     String?

  submittedAt     DateTime @default(now())

  @@index([contactId])
  @@map("contact_form_submissions")
}
```

### 4.2 Sales Pipelines & Deals

```prisma
// ============================================
// CRM: SALES PIPELINES
// ============================================

// Custom sales pipelines
model SalesPipeline {
  id              String   @id @default(cuid())
  organizationId  String

  name            String   // "New Business", "Upsell", "Partnerships"
  description     String?

  // Pipeline stages
  stages          Json
  // [
  //   { "id": "lead", "name": "Lead", "order": 0, "probability": 10, "color": "#6B7280" },
  //   { "id": "qualified", "name": "Qualified", "order": 1, "probability": 25, "color": "#3B82F6" },
  //   { "id": "proposal", "name": "Proposal", "order": 2, "probability": 50, "color": "#F59E0B" },
  //   { "id": "negotiation", "name": "Negotiation", "order": 3, "probability": 75, "color": "#8B5CF6" },
  //   { "id": "won", "name": "Won", "order": 4, "probability": 100, "color": "#10B981", "isClosed": true, "isWon": true },
  //   { "id": "lost", "name": "Lost", "order": 5, "probability": 0, "color": "#EF4444", "isClosed": true }
  // ]

  isDefault       Boolean  @default(false)
  isActive        Boolean  @default(true)

  // Defaults
  defaultCurrency String   @default("USD")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  deals           CRMDeal[]

  @@index([organizationId])
  @@map("sales_pipelines")
}

// Enhanced deal model
model CRMDeal {
  id              String   @id @default(cuid())
  organizationId  String

  pipelineId      String
  pipeline        SalesPipeline @relation(fields: [pipelineId], references: [id])

  // Deal info
  name            String
  description     String?  @db.Text

  // Stage
  stageId         String   // References pipeline stages JSON
  probability     Int?     // Override or use stage default

  // Value
  amount          Decimal? @db.Decimal(14, 2)
  currency        String   @default("USD")

  // Recurring revenue
  isRecurring     Boolean  @default(false)
  recurringPeriod String?  // "monthly", "quarterly", "annually"
  mrr             Decimal? @db.Decimal(12, 2)

  // Timeline
  expectedCloseDate DateTime?
  actualCloseDate   DateTime?

  // Association
  clientId        String?
  primaryContactId String?

  // Ownership
  ownerId         String

  // Outcome
  lostReason      String?
  lostReasonDetails String? @db.Text
  competitorId    String?

  // Source
  source          LeadSource?
  sourceDetails   String?
  campaignId      String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastActivityAt  DateTime?

  // Relations
  contacts        DealContact[]
  activities      DealActivity[]
  products        DealProduct[]
  competitors     DealCompetitor[]
  history         DealStageHistory[]
  tasks           CRMTask[]

  @@index([organizationId])
  @@index([pipelineId, stageId])
  @@index([ownerId])
  @@index([clientId])
  @@map("crm_deals")
}

// Many-to-many deal-contact relationship
model DealContact {
  id              String   @id @default(cuid())
  dealId          String
  deal            CRMDeal  @relation(fields: [dealId], references: [id], onDelete: Cascade)
  contactId       String
  contact         Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  role            DealContactRole @default(INFLUENCER)
  isPrimary       Boolean  @default(false)

  addedAt         DateTime @default(now())

  @@unique([dealId, contactId])
  @@index([dealId])
  @@index([contactId])
  @@map("deal_contacts")
}

enum DealContactRole {
  DECISION_MAKER
  INFLUENCER
  CHAMPION
  BLOCKER
  END_USER
  PROCUREMENT
  FINANCE
  LEGAL
  TECHNICAL
}

// Deal activity log
model DealActivity {
  id              String   @id @default(cuid())
  dealId          String
  deal            CRMDeal  @relation(fields: [dealId], references: [id], onDelete: Cascade)

  activityType    DealActivityType
  subject         String
  description     String?  @db.Text

  // Additional context
  oldValue        String?
  newValue        String?

  performedById   String
  createdAt       DateTime @default(now())

  @@index([dealId, createdAt])
  @@map("deal_activities")
}

enum DealActivityType {
  CREATED
  STAGE_CHANGED
  AMOUNT_CHANGED
  OWNER_CHANGED
  CONTACT_ADDED
  CONTACT_REMOVED
  NOTE_ADDED
  MEETING_SCHEDULED
  PROPOSAL_SENT
  WON
  LOST
  REOPENED
}

// Deal stage history
model DealStageHistory {
  id              String   @id @default(cuid())
  dealId          String
  deal            CRMDeal  @relation(fields: [dealId], references: [id], onDelete: Cascade)

  fromStageId     String?
  toStageId       String

  daysInStage     Int?     // Days spent in previous stage

  changedById     String
  changedAt       DateTime @default(now())

  @@index([dealId, changedAt])
  @@map("deal_stage_history")
}

// Products/line items on deals
model DealProduct {
  id              String   @id @default(cuid())
  dealId          String
  deal            CRMDeal  @relation(fields: [dealId], references: [id], onDelete: Cascade)

  productId       String?
  name            String
  description     String?

  quantity        Decimal  @db.Decimal(10, 2) @default(1)
  unitPrice       Decimal  @db.Decimal(12, 2)
  discount        Decimal  @db.Decimal(5, 2) @default(0)  // Percentage
  total           Decimal  @db.Decimal(14, 2)

  // Recurring
  isRecurring     Boolean  @default(false)
  billingPeriod   String?

  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  @@index([dealId])
  @@map("deal_products")
}

// Competitor tracking on deals
model DealCompetitor {
  id              String   @id @default(cuid())
  dealId          String
  deal            CRMDeal  @relation(fields: [dealId], references: [id], onDelete: Cascade)

  competitorId    String
  name            String

  strengthsWeaknesses String? @db.Text
  pricing         String?
  status          String?  // "active", "eliminated", "unknown"

  createdAt       DateTime @default(now())

  @@index([dealId])
  @@map("deal_competitors")
}

// Product catalog
model Product {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  code            String
  description     String?  @db.Text

  // Pricing
  unitPrice       Decimal  @db.Decimal(12, 2)
  currency        String   @default("USD")

  // Type
  productType     ProductType @default(SERVICE)

  // Recurring
  isRecurring     Boolean  @default(false)
  billingPeriod   String?

  // Status
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, code])
  @@index([organizationId])
  @@map("products")
}

enum ProductType {
  SERVICE
  RETAINER
  PROJECT
  HOURLY
  LICENSE
  PHYSICAL
}

// Competitor database
model Competitor {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  website         String?
  description     String?  @db.Text

  // Positioning
  strengths       String[] @default([])
  weaknesses      String[] @default([])

  // Market
  marketPosition  String?
  pricePosition   String?  // "premium", "mid-market", "budget"

  // Notes
  notes           String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, name])
  @@index([organizationId])
  @@map("competitors")
}
```

### 4.3 Marketing Campaigns

```prisma
// ============================================
// CRM: MARKETING CAMPAIGNS
// ============================================

// Marketing campaigns
model Campaign {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?  @db.Text

  // Type & channel
  campaignType    CampaignType
  channels        String[] @default([])  // ["email", "social", "paid"]

  // Status
  status          CampaignStatus @default(DRAFT)

  // Timeline
  startDate       DateTime?
  endDate         DateTime?

  // Budget
  budgetAmount    Decimal? @db.Decimal(12, 2)
  budgetCurrency  String   @default("USD")
  actualSpend     Decimal? @db.Decimal(12, 2)

  // Goals
  goals           Json?
  // {
  //   "type": "leads",
  //   "target": 500,
  //   "actual": 350
  // }

  // Attribution
  clientId        String?

  // Ownership
  ownerId         String

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  launchedAt      DateTime?

  // Relations
  members         CampaignMember[]
  activities      CampaignActivity[]
  assets          CampaignAsset[]
  emailCampaigns  EmailCampaign[]

  @@index([organizationId])
  @@index([status])
  @@index([clientId])
  @@map("campaigns")
}

enum CampaignType {
  BRAND_AWARENESS
  LEAD_GENERATION
  PRODUCT_LAUNCH
  EVENT_PROMOTION
  CONTENT_MARKETING
  EMAIL_NURTURE
  RETARGETING
  SEASONAL
  REFERRAL
  OTHER
}

enum CampaignStatus {
  DRAFT
  PLANNED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

// Campaign members (contacts in campaign)
model CampaignMember {
  id              String   @id @default(cuid())
  campaignId      String
  campaign        Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  contactId       String
  contact         Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  memberStatus    CampaignMemberStatus @default(SENT)

  // Response tracking
  respondedAt     DateTime?
  responseType    String?

  // Conversion
  convertedAt     DateTime?
  convertedDealId String?

  addedAt         DateTime @default(now())
  addedById       String?

  @@unique([campaignId, contactId])
  @@index([campaignId])
  @@index([contactId])
  @@map("campaign_members")
}

enum CampaignMemberStatus {
  PENDING
  SENT
  OPENED
  CLICKED
  RESPONDED
  CONVERTED
  UNSUBSCRIBED
  BOUNCED
}

// Campaign activity log
model CampaignActivity {
  id              String   @id @default(cuid())
  campaignId      String
  campaign        Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  activityType    String
  description     String

  performedById   String?
  createdAt       DateTime @default(now())

  @@index([campaignId, createdAt])
  @@map("campaign_activities")
}

// Campaign assets (linked files)
model CampaignAsset {
  id              String   @id @default(cuid())
  campaignId      String
  campaign        Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  assetId         String
  assetType       String   // "email_template", "landing_page", "ad_creative"
  name            String

  addedAt         DateTime @default(now())

  @@index([campaignId])
  @@map("campaign_assets")
}
```

### 4.4 Email Marketing

```prisma
// ============================================
// CRM: EMAIL MARKETING
// ============================================

// Email campaigns (distinct from marketing campaigns)
model EmailCampaign {
  id              String   @id @default(cuid())
  organizationId  String

  // Parent campaign (optional)
  campaignId      String?
  campaign        Campaign? @relation(fields: [campaignId], references: [id])

  name            String
  subject         String
  previewText     String?

  // Content
  htmlContent     String?  @db.Text
  plainTextContent String? @db.Text
  templateId      String?

  // Sender
  fromName        String
  fromEmail       String
  replyTo         String?

  // Recipients
  listId          String?  // Contact list
  segmentRules    Json?    // Dynamic segment
  recipientCount  Int      @default(0)

  // Status
  status          EmailCampaignStatus @default(DRAFT)

  // Schedule
  scheduledAt     DateTime?
  sentAt          DateTime?

  // Stats
  delivered       Int      @default(0)
  bounced         Int      @default(0)
  opened          Int      @default(0)
  uniqueOpens     Int      @default(0)
  clicked         Int      @default(0)
  uniqueClicks    Int      @default(0)
  unsubscribed    Int      @default(0)
  complained      Int      @default(0)

  // A/B testing
  isABTest        Boolean  @default(false)
  abTestConfig    Json?

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  recipients      EmailRecipient[]
  links           EmailLink[]

  @@index([organizationId])
  @@index([status])
  @@map("email_campaigns")
}

enum EmailCampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  PAUSED
  CANCELLED
  FAILED
}

// Individual email recipients
model EmailRecipient {
  id              String   @id @default(cuid())
  emailCampaignId String
  emailCampaign   EmailCampaign @relation(fields: [emailCampaignId], references: [id], onDelete: Cascade)
  contactId       String?

  email           String

  // Personalization
  mergeData       Json?    // { "firstName": "John", "company": "Acme" }

  // Status
  status          EmailRecipientStatus @default(PENDING)

  // Tracking
  sentAt          DateTime?
  deliveredAt     DateTime?
  bouncedAt       DateTime?
  bounceType      String?
  openedAt        DateTime?
  openCount       Int      @default(0)
  clickedAt       DateTime?
  clickCount      Int      @default(0)
  unsubscribedAt  DateTime?
  complainedAt    DateTime?

  @@unique([emailCampaignId, email])
  @@index([emailCampaignId])
  @@index([contactId])
  @@map("email_recipients")
}

enum EmailRecipientStatus {
  PENDING
  SENT
  DELIVERED
  BOUNCED
  OPENED
  CLICKED
  UNSUBSCRIBED
  COMPLAINED
}

// Tracked links in emails
model EmailLink {
  id              String   @id @default(cuid())
  emailCampaignId String
  emailCampaign   EmailCampaign @relation(fields: [emailCampaignId], references: [id], onDelete: Cascade)

  originalUrl     String
  trackingUrl     String   @unique

  clickCount      Int      @default(0)
  uniqueClicks    Int      @default(0)

  @@index([emailCampaignId])
  @@map("email_links")
}

// Email interactions (for contact timeline)
model EmailInteraction {
  id              String   @id @default(cuid())
  contactId       String
  contact         Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  emailCampaignId String?
  subject         String

  interactionType EmailInteractionType
  occurredAt      DateTime @default(now())

  // Additional context
  linkUrl         String?
  userAgent       String?
  ipAddress       String?

  @@index([contactId, occurredAt])
  @@map("email_interactions")
}

enum EmailInteractionType {
  SENT
  DELIVERED
  OPENED
  CLICKED
  UNSUBSCRIBED
  BOUNCED
  COMPLAINED
}

// Email templates
model EmailTemplate {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?

  // Content
  htmlContent     String   @db.Text
  plainTextContent String? @db.Text

  // Categorization
  category        String?
  tags            String[] @default([])

  // Thumbnail
  thumbnailUrl    String?

  isActive        Boolean  @default(true)

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId])
  @@map("email_templates")
}

// Contact lists for email marketing
model ContactList {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?

  // Type
  listType        ContactListType @default(STATIC)

  // For dynamic lists
  segmentRules    Json?
  // {
  //   "conditions": [
  //     { "field": "tags", "operator": "contains", "value": "customer" },
  //     { "field": "leadScore", "operator": "gte", "value": 50 }
  //   ],
  //   "match": "all"
  // }

  // Stats
  memberCount     Int      @default(0)
  lastUpdatedAt   DateTime?

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  members         ContactListMember[]

  @@index([organizationId])
  @@map("contact_lists")
}

enum ContactListType {
  STATIC          // Manual membership
  DYNAMIC         // Rule-based, auto-updated
  SUPPRESSION     // Do not contact
}

model ContactListMember {
  id              String   @id @default(cuid())
  listId          String
  list            ContactList @relation(fields: [listId], references: [id], onDelete: Cascade)
  contactId       String

  addedAt         DateTime @default(now())
  addedById       String?
  source          String?  // "manual", "import", "form", "api"

  @@unique([listId, contactId])
  @@index([listId])
  @@index([contactId])
  @@map("contact_list_members")
}
```

### 4.5 Tasks & Automation

```prisma
// ============================================
// CRM: TASKS & AUTOMATION
// ============================================

// CRM tasks
model CRMTask {
  id              String   @id @default(cuid())
  organizationId  String

  title           String
  description     String?  @db.Text

  // Type & priority
  taskType        CRMTaskType @default(TODO)
  priority        Priority @default(MEDIUM)

  // Status
  status          CRMTaskStatus @default(PENDING)

  // Due date
  dueDate         DateTime?
  reminderAt      DateTime?

  // Relations
  contactId       String?
  contact         Contact? @relation(fields: [contactId], references: [id])
  dealId          String?
  deal            CRMDeal? @relation(fields: [dealId], references: [id])

  // Assignment
  assignedToId    String

  // Completion
  completedAt     DateTime?
  completedById   String?

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId])
  @@index([contactId])
  @@index([dealId])
  @@index([assignedToId, status])
  @@index([dueDate])
  @@map("crm_tasks")
}

enum CRMTaskType {
  TODO
  CALL
  EMAIL
  MEETING
  FOLLOW_UP
  DEMO
  PROPOSAL
  CONTRACT
  OTHER
}

enum CRMTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
  DEFERRED
}

// Workflow automation rules
model CRMWorkflow {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?

  // Trigger
  triggerType     WorkflowTrigger
  triggerConfig   Json
  // Examples:
  // { "entity": "contact", "event": "created" }
  // { "entity": "deal", "event": "stage_changed", "toStage": "won" }
  // { "schedule": "0 9 * * 1" }  // Every Monday 9am

  // Conditions
  conditions      Json?
  // [
  //   { "field": "contact.leadScore", "operator": "gte", "value": 80 }
  // ]

  // Actions
  actions         Json
  // [
  //   { "type": "create_task", "config": { "title": "Follow up", "dueIn": "2d" } },
  //   { "type": "send_email", "config": { "templateId": "xxx" } },
  //   { "type": "update_field", "config": { "field": "status", "value": "qualified" } }
  // ]

  // Status
  isActive        Boolean  @default(true)

  // Stats
  runCount        Int      @default(0)
  lastRunAt       DateTime?
  lastError       String?

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  executions      WorkflowExecution[]

  @@index([organizationId])
  @@index([isActive])
  @@map("crm_workflows")
}

enum WorkflowTrigger {
  // Record events
  RECORD_CREATED
  RECORD_UPDATED
  RECORD_DELETED
  FIELD_CHANGED

  // Stage events
  DEAL_STAGE_CHANGED
  DEAL_WON
  DEAL_LOST

  // Time-based
  SCHEDULED
  DATE_BASED        // e.g., 3 days before close date
  INACTIVITY        // No activity for X days

  // Email events
  EMAIL_OPENED
  EMAIL_CLICKED
  EMAIL_REPLIED

  // Manual
  MANUAL
}

// Workflow execution log
model WorkflowExecution {
  id              String   @id @default(cuid())
  workflowId      String
  workflow        CRMWorkflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  // Trigger context
  triggeredBy     String   // Entity ID that triggered
  triggerType     String

  // Execution
  status          WorkflowExecutionStatus @default(PENDING)
  startedAt       DateTime @default(now())
  completedAt     DateTime?

  // Results
  actionsExecuted Int      @default(0)
  actionsFailed   Int      @default(0)
  logs            Json?    // Detailed action logs
  error           String?

  @@index([workflowId, startedAt])
  @@index([status])
  @@map("workflow_executions")
}

enum WorkflowExecutionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

// Lead scoring rules
model LeadScoringRule {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?

  // Condition
  condition       Json
  // {
  //   "field": "jobTitle",
  //   "operator": "contains",
  //   "value": "Director"
  // }

  // Score adjustment
  scoreChange     Int      // Can be positive or negative

  // Category
  category        String?  // "demographic", "behavioral", "engagement"

  isActive        Boolean  @default(true)
  priority        Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId, isActive])
  @@map("lead_scoring_rules")
}
```

---

## 5. Cross-System Integrations

### 5.1 Entity Relationships

```prisma
// ============================================
// CROSS-SYSTEM: LINKING TABLES
// ============================================

// Link briefs to CMS content
model BriefContentLink {
  id              String   @id @default(cuid())
  briefId         String
  contentEntryId  String

  linkType        String   // "deliverable", "source", "reference"

  createdAt       DateTime @default(now())

  @@unique([briefId, contentEntryId])
  @@map("brief_content_links")
}

// Link briefs to assets
model BriefAssetLink {
  id              String   @id @default(cuid())
  briefId         String
  assetId         String

  linkType        String   // "deliverable", "reference", "source"

  createdAt       DateTime @default(now())

  @@unique([briefId, assetId])
  @@map("brief_asset_links")
}

// Link campaigns to briefs
model CampaignBriefLink {
  id              String   @id @default(cuid())
  campaignId      String
  briefId         String

  createdAt       DateTime @default(now())

  @@unique([campaignId, briefId])
  @@map("campaign_brief_links")
}

// Link ad campaigns to CRM campaigns
model AdCampaignCRMLink {
  id              String   @id @default(cuid())
  adCampaignId    String
  crmCampaignId   String

  createdAt       DateTime @default(now())

  @@unique([adCampaignId, crmCampaignId])
  @@map("ad_campaign_crm_links")
}

// Client relationship with Contact model
model Client {
  // ... existing fields ...

  contacts        Contact[] @relation("ContactCompany")
  // ... rest of relations
}
```

### 5.2 Unified Activity Stream

```prisma
// ============================================
// CROSS-SYSTEM: UNIFIED ACTIVITY STREAM
// ============================================

// Universal activity feed across all systems
model UnifiedActivity {
  id              String   @id @default(cuid())
  organizationId  String

  // Actor
  actorType       String   // "user", "system", "integration"
  actorId         String?
  actorName       String

  // Action
  action          String   // "created", "updated", "commented", "published"

  // Target
  entityType      String   // "brief", "content", "asset", "deal", "campaign"
  entityId        String
  entityTitle     String

  // Context
  description     String?
  metadata        Json?

  // Relations
  clientId        String?
  projectId       String?

  occurredAt      DateTime @default(now())

  @@index([organizationId, occurredAt])
  @@index([entityType, entityId])
  @@index([clientId, occurredAt])
  @@map("unified_activities")
}
```

---

## 6. Implementation Priority

### Phase 1: Foundation (High Priority)
1. **CMS Core** - ContentType, ContentEntry, ContentVersion
2. **Asset Core** - Asset, AssetLibrary, AssetFolder, AssetVersion
3. **Contact Management** - Contact, ContactActivity, ContactNote

### Phase 2: Workflows (High Priority)
1. **CMS Workflows** - ContentWorkflow, ContentRevision, PublishSchedule
2. **Asset Management** - AssetCollection, AssetComment, sharing
3. **Sales Pipeline** - SalesPipeline, CRMDeal, DealContact

### Phase 3: Analytics (Medium Priority)
1. **Platform Connections** - AnalyticsPlatform, PlatformSyncLog
2. **Media Buying** - AdCampaign, AdSet, Ad, metrics tables
3. **Social Listening** - ListeningQuery, SocialMention, ListeningAlert

### Phase 4: Marketing (Medium Priority)
1. **Campaigns** - Campaign, CampaignMember
2. **Email Marketing** - EmailCampaign, EmailTemplate, ContactList
3. **Web Analytics** - WebProperty, WebPageMetric, WebConversion

### Phase 5: Automation (Lower Priority)
1. **Workflows** - CRMWorkflow, WorkflowExecution
2. **Lead Scoring** - LeadScoringRule
3. **Advanced Analytics** - AttributionModel, custom reports

---

## Appendix: Migration Notes

### Compatibility with Existing Schema

All new models follow established patterns:
- `organizationId` on every model
- `cuid()` for primary keys
- Standard timestamps (`createdAt`, `updatedAt`)
- Consistent enum naming
- Index on `organizationId`

### Integration Points

| New System | Integrates With |
|------------|-----------------|
| CMS | Brief (deliverables), File (media), Client (per-client content) |
| DAM | File (extends), Brief (assets), Client (brand libraries) |
| Analytics | Client (per-client metrics), Project (attribution), Campaign (performance) |
| CRM | Client (extends), User (sales team), Campaign (marketing) |

### Estimated Model Count

| System | New Models | Junction Tables |
|--------|------------|-----------------|
| CMS | 12 | 3 |
| DAM | 11 | 2 |
| Analytics | 18 | 2 |
| CRM | 25 | 4 |
| **Total** | **66** | **11** |

---

*Document Version: 1.0*
*Created: December 2024*
*Author: AI Assistant*
*Status: Technical Specification - Pending Review*
