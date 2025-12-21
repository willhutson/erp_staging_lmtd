# Phase 12: Content Management System (CMS) Architecture

## Overview

A robust, multi-tenant CMS that integrates seamlessly with the existing ERP platform. Designed for professional services agencies to manage:
- Website content (pages, blog posts, case studies)
- Marketing assets (landing pages, campaigns)
- Client-facing content (proposals, deliverables)
- Internal knowledge base (SOPs, templates, guides)

### Design Principles

1. **Config-Driven Content Types** - Define content structures in `/config/content/`, not code
2. **Multi-Tenant by Default** - All content scoped to `organizationId`
3. **Workflow-First** - Draft → Review → Published workflow with approvals
4. **Headless Architecture** - API-first for any frontend (website, app, portal)
5. **Leverage Existing Infrastructure** - Reuse forms, files, permissions, notifications

---

## Content Architecture

### Content Type Hierarchy

```
ContentType (config-driven schema)
    ↓
ContentEntry (instance of content type)
    ↓
ContentVersion (versioned snapshots)
    ↓
ContentBlock (modular content blocks)
```

### Core Content Types

| Type | Purpose | Example |
|------|---------|---------|
| `page` | Static website pages | About, Services, Contact |
| `post` | Blog/news articles | Industry insights, news |
| `case_study` | Client work showcases | Project portfolios |
| `landing_page` | Campaign pages | Service promos, events |
| `knowledge_base` | Internal docs | SOPs, guides, FAQs |
| `proposal` | Client proposals | RFP responses, pitches |
| `template` | Reusable content | Email templates, snippets |

---

## Database Schema

```prisma
// ============================================
// CONTENT MANAGEMENT SYSTEM
// ============================================

// Content type definitions (synced from config)
model ContentType {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  slug            String              // e.g., "blog_post", "case_study"
  name            String              // e.g., "Blog Post", "Case Study"
  description     String?
  icon            String?             // Lucide icon name

  // Schema definition
  schema          Json                // Field definitions (from config)

  // Settings
  isPublishable   Boolean  @default(true)  // Can be published externally
  isVersioned     Boolean  @default(true)  // Track version history
  hasWorkflow     Boolean  @default(true)  // Requires approval workflow

  // SEO defaults
  seoEnabled      Boolean  @default(true)
  slugPattern     String?             // e.g., "blog/{slug}"

  // Permissions
  createPermission   String  @default("content:create")
  editPermission     String  @default("content:edit")
  publishPermission  String  @default("content:publish")
  deletePermission   String  @default("content:delete")

  // Relations
  entries         ContentEntry[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, slug])
  @@index([organizationId])
}

// Individual content entries
model ContentEntry {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  contentTypeId   String
  contentType     ContentType @relation(fields: [contentTypeId], references: [id])

  // Identity
  title           String
  slug            String              // URL-friendly identifier

  // Content storage
  content         Json                // Structured content data
  blocks          Json?               // Block-based content (optional)
  excerpt         String?             // Summary/preview text

  // Status & workflow
  status          ContentStatus @default(DRAFT)
  publishedAt     DateTime?
  scheduledAt     DateTime?           // Schedule for future publish
  expiresAt       DateTime?           // Auto-unpublish date

  // Version tracking
  version         Int      @default(1)

  // SEO & Meta
  seoTitle        String?
  seoDescription  String?
  seoKeywords     String[]
  ogImage         String?
  canonicalUrl    String?
  noIndex         Boolean  @default(false)

  // Categorization
  categories      ContentCategory[] @relation("ContentEntryCategories")
  tags            ContentTag[]      @relation("ContentEntryTags")

  // Relations
  authorId        String
  author          User     @relation("ContentAuthor", fields: [authorId], references: [id])

  clientId        String?             // For client-specific content
  client          Client?  @relation(fields: [clientId], references: [id])

  projectId       String?
  project         Project? @relation(fields: [projectId], references: [id])

  // Media
  featuredImageId String?
  featuredImage   File?    @relation("ContentFeaturedImage", fields: [featuredImageId], references: [id])

  // Tracking
  viewCount       Int      @default(0)

  // Audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdById     String
  createdBy       User     @relation("ContentCreator", fields: [createdById], references: [id])
  lastEditedById  String?
  lastEditedBy    User?    @relation("ContentEditor", fields: [lastEditedById], references: [id])

  // Relations
  versions        ContentVersion[]
  comments        ContentComment[]
  approvals       ContentApproval[]
  media           ContentMedia[]

  @@unique([organizationId, contentTypeId, slug])
  @@index([organizationId, status])
  @@index([organizationId, contentTypeId])
  @@index([authorId])
  @@index([clientId])
  @@index([publishedAt])
}

enum ContentStatus {
  DRAFT           // Being written
  IN_REVIEW       // Submitted for approval
  APPROVED        // Ready to publish
  PUBLISHED       // Live/visible
  SCHEDULED       // Will publish at scheduledAt
  UNPUBLISHED     // Was published, now hidden
  ARCHIVED        // Soft deleted
}

// Version history
model ContentVersion {
  id              String   @id @default(cuid())

  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  version         Int
  title           String
  content         Json
  blocks          Json?

  // Snapshot of all fields at this version
  snapshot        Json                // Complete entry state

  // Change tracking
  changeLog       String?             // Description of changes
  changedFields   String[]            // Which fields changed

  // Audit
  createdAt       DateTime @default(now())
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])

  @@unique([entryId, version])
  @@index([entryId])
}

// Block-based content (for page builders)
model ContentBlock {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Block definition
  name            String              // e.g., "Hero Section", "Feature Grid"
  slug            String
  type            ContentBlockType

  // Block content
  content         Json                // Block data
  settings        Json?               // Display settings

  // Reusability
  isReusable      Boolean  @default(false)  // Can be used across entries
  isGlobal        Boolean  @default(false)  // Org-wide (header/footer)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, slug])
  @@index([organizationId, type])
}

enum ContentBlockType {
  // Layout
  HERO
  SECTION
  COLUMNS
  GRID

  // Content
  TEXT
  HEADING
  IMAGE
  VIDEO
  GALLERY

  // Interactive
  CTA
  FORM
  ACCORDION
  TABS

  // Data
  TEAM
  TESTIMONIALS
  CASE_STUDIES
  POSTS

  // Custom
  EMBED
  CODE
  CUSTOM
}

// Taxonomy: Categories
model ContentCategory {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  name            String
  slug            String
  description     String?

  parentId        String?
  parent          ContentCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children        ContentCategory[] @relation("CategoryHierarchy")

  entries         ContentEntry[]    @relation("ContentEntryCategories")

  @@unique([organizationId, slug])
  @@index([organizationId, parentId])
}

// Taxonomy: Tags
model ContentTag {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  name            String
  slug            String

  entries         ContentEntry[] @relation("ContentEntryTags")

  @@unique([organizationId, slug])
  @@index([organizationId])
}

// Content media attachments
model ContentMedia {
  id              String   @id @default(cuid())

  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  fileId          String
  file            File     @relation(fields: [fileId], references: [id])

  // Placement
  placement       String?             // e.g., "hero", "gallery", "inline"
  order           Int      @default(0)
  caption         String?
  altText         String?

  @@index([entryId])
}

// Content comments/feedback
model ContentComment {
  id              String   @id @default(cuid())

  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  // Comment content
  content         String

  // For inline comments
  blockId         String?             // Which block this refers to
  selection       Json?               // Text selection range

  // Resolution
  isResolved      Boolean  @default(false)
  resolvedAt      DateTime?
  resolvedById    String?

  // Author
  authorId        String
  author          User     @relation(fields: [authorId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([entryId])
}

// Content approval workflow
model ContentApproval {
  id              String   @id @default(cuid())

  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  // Approval details
  status          ApprovalStatus @default(PENDING)
  decision        ApprovalDecision?

  feedback        String?

  // Actors
  requestedById   String
  requestedBy     User     @relation("ApprovalRequester", fields: [requestedById], references: [id])

  reviewerId      String?
  reviewer        User?    @relation("ApprovalReviewer", fields: [reviewerId], references: [id])

  // Timing
  requestedAt     DateTime @default(now())
  reviewedAt      DateTime?

  @@index([entryId])
  @@index([reviewerId, status])
}

enum ApprovalStatus {
  PENDING
  IN_REVIEW
  COMPLETED
}

enum ApprovalDecision {
  APPROVED
  REJECTED
  CHANGES_REQUESTED
}

// Content analytics
model ContentAnalytics {
  id              String   @id @default(cuid())

  entryId         String
  entry           ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)

  date            DateTime @db.Date

  // Metrics
  views           Int      @default(0)
  uniqueViews     Int      @default(0)
  avgTimeOnPage   Int?                // seconds
  bounceRate      Float?

  // Sources
  sources         Json?               // { organic: 50, direct: 30, ... }

  @@unique([entryId, date])
  @@index([entryId])
}

// Published content cache (for fast delivery)
model ContentCache {
  id              String   @id @default(cuid())
  organizationId  String

  entryId         String   @unique

  // Cached output
  html            String?  @db.Text    // Pre-rendered HTML
  json            Json                 // API response cache

  // Invalidation
  version         Int
  cachedAt        DateTime @default(now())
  expiresAt       DateTime?

  @@index([organizationId])
}
```

---

## Configuration System

### Content Type Configuration

Location: `/config/content/`

```typescript
// /config/content/blog-post.content.ts
import { ContentTypeConfig } from "@/types/content";

export const blogPostContent: ContentTypeConfig = {
  slug: "blog_post",
  name: "Blog Post",
  description: "Articles for the company blog",
  icon: "FileText",

  // Content schema
  schema: {
    sections: [
      {
        id: "main",
        title: "Content",
        fields: [
          {
            id: "title",
            label: "Title",
            type: "text",
            required: true,
            maxLength: 100,
            helpText: "Keep under 60 characters for SEO"
          },
          {
            id: "excerpt",
            label: "Excerpt",
            type: "textarea",
            required: true,
            maxLength: 300,
            helpText: "Brief summary for listings"
          },
          {
            id: "body",
            label: "Body",
            type: "rich-text",
            required: true,
            features: ["headings", "lists", "links", "images", "code"]
          },
          {
            id: "featuredImage",
            label: "Featured Image",
            type: "media-select",
            accept: ["image/*"],
            required: true
          }
        ]
      },
      {
        id: "meta",
        title: "Metadata",
        fields: [
          {
            id: "author",
            label: "Author",
            type: "user-select",
            filter: { permissionLevels: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"] }
          },
          {
            id: "categories",
            label: "Categories",
            type: "category-select",
            multiple: true
          },
          {
            id: "tags",
            label: "Tags",
            type: "tag-select",
            multiple: true
          },
          {
            id: "publishedAt",
            label: "Publish Date",
            type: "datetime"
          }
        ]
      }
    ]
  },

  // Workflow settings
  workflow: {
    requireApproval: true,
    approvers: ["LEADERSHIP", "ADMIN"],
    autoPublish: false
  },

  // SEO settings
  seo: {
    enabled: true,
    slugPattern: "blog/{slug}",
    titlePattern: "{title} | TeamLMTD Blog",
    generateSitemap: true
  },

  // Permissions
  permissions: {
    create: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"],
    edit: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"],
    publish: ["ADMIN", "LEADERSHIP"],
    delete: ["ADMIN"]
  },

  // Listing settings
  listing: {
    defaultSort: "publishedAt:desc",
    perPage: 12,
    showExcerpt: true,
    showAuthor: true,
    showDate: true
  }
};
```

### Case Study Configuration

```typescript
// /config/content/case-study.content.ts
export const caseStudyContent: ContentTypeConfig = {
  slug: "case_study",
  name: "Case Study",
  description: "Showcase client work and results",
  icon: "Briefcase",

  schema: {
    sections: [
      {
        id: "overview",
        title: "Overview",
        fields: [
          { id: "title", label: "Project Title", type: "text", required: true },
          { id: "client", label: "Client", type: "client-select", required: true },
          { id: "services", label: "Services Provided", type: "multi-select",
            options: [
              { value: "video_production", label: "Video Production" },
              { value: "design", label: "Design" },
              { value: "paid_media", label: "Paid Media" },
              { value: "content", label: "Content" },
              { value: "strategy", label: "Strategy" }
            ]
          },
          { id: "duration", label: "Project Duration", type: "text" },
          { id: "year", label: "Year", type: "number" }
        ]
      },
      {
        id: "challenge",
        title: "The Challenge",
        fields: [
          { id: "challenge", label: "Challenge Description", type: "rich-text", required: true }
        ]
      },
      {
        id: "solution",
        title: "Our Solution",
        fields: [
          { id: "solution", label: "Solution Description", type: "rich-text", required: true }
        ]
      },
      {
        id: "results",
        title: "Results",
        fields: [
          {
            id: "metrics",
            label: "Key Metrics",
            type: "repeater",
            fields: [
              { id: "value", label: "Value", type: "text" },
              { id: "label", label: "Label", type: "text" }
            ]
          },
          { id: "testimonial", label: "Client Testimonial", type: "textarea" },
          { id: "testimonialAuthor", label: "Testimonial Author", type: "text" }
        ]
      },
      {
        id: "gallery",
        title: "Project Gallery",
        fields: [
          { id: "gallery", label: "Images & Videos", type: "media-gallery" },
          { id: "videoEmbed", label: "Video Embed URL", type: "url" }
        ]
      }
    ]
  },

  workflow: {
    requireApproval: true,
    requireClientApproval: true,  // Client must approve before publish
    approvers: ["LEADERSHIP", "ADMIN"]
  },

  seo: {
    enabled: true,
    slugPattern: "work/{client-slug}/{slug}",
    titlePattern: "{title} | Our Work | TeamLMTD"
  }
};
```

### Knowledge Base Configuration

```typescript
// /config/content/knowledge-base.content.ts
export const knowledgeBaseContent: ContentTypeConfig = {
  slug: "knowledge_base",
  name: "Knowledge Base Article",
  description: "Internal documentation and guides",
  icon: "BookOpen",

  schema: {
    sections: [
      {
        id: "content",
        title: "Article Content",
        fields: [
          { id: "title", label: "Title", type: "text", required: true },
          { id: "category", label: "Category", type: "category-select", required: true },
          { id: "body", label: "Content", type: "rich-text", required: true },
          { id: "attachments", label: "Attachments", type: "file-upload", multiple: true }
        ]
      },
      {
        id: "access",
        title: "Access Control",
        fields: [
          {
            id: "visibility",
            label: "Who can view this?",
            type: "select",
            options: [
              { value: "all", label: "All team members" },
              { value: "leadership", label: "Leadership only" },
              { value: "department", label: "Specific departments" }
            ]
          },
          {
            id: "departments",
            label: "Departments",
            type: "multi-select",
            dependsOn: { field: "visibility", value: "department" }
          }
        ]
      }
    ]
  },

  workflow: {
    requireApproval: false,  // Internal docs don't need approval
    autoPublish: true
  },

  seo: {
    enabled: false  // Internal only
  },

  permissions: {
    create: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    edit: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    view: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"],
    delete: ["ADMIN", "LEADERSHIP"]
  }
};
```

---

## Module Structure

```
/src/modules/cms/
├── CLAUDE.md                   # Module documentation
├── types.ts                    # CMS-specific types
│
├── actions/
│   ├── content-types.ts        # CRUD for content types
│   ├── entries.ts              # CRUD for content entries
│   ├── versions.ts             # Version management
│   ├── blocks.ts               # Block management
│   ├── taxonomy.ts             # Categories & tags
│   ├── workflow.ts             # Approval workflows
│   ├── publishing.ts           # Publish/unpublish actions
│   └── analytics.ts            # Content analytics
│
├── components/
│   ├── content-list/
│   │   ├── ContentTable.tsx
│   │   ├── ContentFilters.tsx
│   │   └── ContentActions.tsx
│   │
│   ├── content-editor/
│   │   ├── ContentEditor.tsx   # Main editor container
│   │   ├── EditorToolbar.tsx
│   │   ├── EditorSidebar.tsx
│   │   ├── FieldRenderer.tsx   # Dynamic field rendering
│   │   └── AutoSave.tsx
│   │
│   ├── rich-text/
│   │   ├── RichTextEditor.tsx  # WYSIWYG editor
│   │   ├── Toolbar.tsx
│   │   └── extensions/         # Editor extensions
│   │
│   ├── blocks/
│   │   ├── BlockEditor.tsx     # Block-based page builder
│   │   ├── BlockPalette.tsx
│   │   ├── BlockWrapper.tsx
│   │   └── block-types/        # Individual block components
│   │
│   ├── media/
│   │   ├── MediaLibrary.tsx
│   │   ├── MediaPicker.tsx
│   │   ├── ImageEditor.tsx
│   │   └── GalleryEditor.tsx
│   │
│   ├── seo/
│   │   ├── SEOPanel.tsx
│   │   ├── SEOPreview.tsx
│   │   └── SlugEditor.tsx
│   │
│   ├── workflow/
│   │   ├── WorkflowStatus.tsx
│   │   ├── ApprovalRequest.tsx
│   │   ├── ApprovalPanel.tsx
│   │   └── VersionHistory.tsx
│   │
│   └── preview/
│       ├── ContentPreview.tsx
│       └── PreviewFrame.tsx
│
├── hooks/
│   ├── useContentEditor.ts
│   ├── useAutoSave.ts
│   ├── useMediaLibrary.ts
│   └── useContentPreview.ts
│
└── lib/
    ├── schema-to-zod.ts        # Convert config to Zod
    ├── slug-generator.ts
    ├── version-diff.ts
    └── seo-analyzer.ts
```

---

## App Routes

```
/src/app/(dashboard)/content/
├── page.tsx                    # Content dashboard
├── layout.tsx                  # Content section layout
│
├── [type]/
│   ├── page.tsx               # List entries by type
│   └── new/
│       └── page.tsx           # Create new entry
│
├── edit/
│   └── [id]/
│       └── page.tsx           # Edit entry
│
├── preview/
│   └── [id]/
│       └── page.tsx           # Preview entry
│
├── media/
│   └── page.tsx               # Media library
│
├── taxonomy/
│   ├── categories/
│   │   └── page.tsx
│   └── tags/
│       └── page.tsx
│
└── settings/
    ├── page.tsx               # CMS settings
    └── content-types/
        └── page.tsx           # Manage content types
```

---

## API Routes

```
/src/app/api/v1/content/

├── types/
│   ├── route.ts               # GET: List types, POST: Create type
│   └── [slug]/
│       └── route.ts           # GET/PUT/DELETE type
│
├── entries/
│   ├── route.ts               # GET: List, POST: Create
│   └── [id]/
│       ├── route.ts           # GET/PUT/DELETE entry
│       ├── publish/
│       │   └── route.ts       # POST: Publish
│       ├── unpublish/
│       │   └── route.ts       # POST: Unpublish
│       └── versions/
│           └── route.ts       # GET: Version history
│
├── blocks/
│   ├── route.ts               # CRUD for reusable blocks
│   └── [id]/
│       └── route.ts
│
├── media/
│   ├── route.ts               # Upload, list media
│   └── [id]/
│       └── route.ts           # GET/DELETE media
│
├── categories/
│   └── route.ts               # CRUD categories
│
├── tags/
│   └── route.ts               # CRUD tags
│
└── search/
    └── route.ts               # Full-text search
```

### Public API (for frontend consumption)

```
/src/app/api/public/content/

├── [type]/
│   ├── route.ts               # GET: Published entries by type
│   └── [slug]/
│       └── route.ts           # GET: Single published entry
│
└── sitemap/
    └── route.ts               # GET: Sitemap data
```

---

## Content Editor Architecture

### Rich Text Editor (Tiptap-based)

```typescript
// /src/modules/cms/components/rich-text/RichTextEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  features?: string[];
}

export function RichTextEditor({ content, onChange, features }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-lg">
      <Toolbar editor={editor} features={features} />
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  );
}
```

### Block Editor (Page Builder)

```typescript
// Drag-and-drop page builder using @dnd-kit
interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  // Uses existing @dnd-kit/core from the project
  // Similar pattern to resource planning Kanban
}
```

---

## Workflow System

### Status Transitions

```
DRAFT ──────────────────────────────────────────────────┐
  │                                                      │
  ▼ (submit for review)                                  │
IN_REVIEW ──────────────────────────────────────────────┤
  │         │                                            │
  │         ▼ (changes requested)                        │
  │       DRAFT                                          │
  │                                                      │
  ▼ (approve)                                            │
APPROVED ───────────────────────────────────────────────┤
  │                                                      │
  ▼ (publish)                                            │
PUBLISHED ◄─────────────────────────────────────────────┤
  │                                                      │
  ▼ (unpublish)                                          │
UNPUBLISHED ────────────────────────────────────────────┤
  │                                                      │
  ▼ (archive)                                            │
ARCHIVED ───────────────────────────────────────────────┘
```

### Scheduled Publishing

```typescript
// Cron job or server action for scheduled content
export async function processScheduledContent() {
  const now = new Date();

  // Publish scheduled entries
  await db.contentEntry.updateMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now }
    },
    data: {
      status: "PUBLISHED",
      publishedAt: now
    }
  });

  // Unpublish expired entries
  await db.contentEntry.updateMany({
    where: {
      status: "PUBLISHED",
      expiresAt: { lte: now }
    },
    data: {
      status: "UNPUBLISHED"
    }
  });
}
```

---

## Integration Points

### 1. Client Portal Integration

```typescript
// Clients can view published case studies about their work
// Clients can request content via ClientBriefRequest
// Clients can approve content via SubmissionApproval

// Enable content approval in client portal
export async function requestClientApproval(entryId: string, clientId: string) {
  const entry = await db.contentEntry.findUnique({
    where: { id: entryId },
    include: { contentType: true }
  });

  if (entry?.contentType?.slug === "case_study") {
    await db.submissionApproval.create({
      data: {
        contentEntryId: entryId,
        clientId,
        status: "PENDING",
        // ... other fields
      }
    });

    // Send notification to client
    await NotificationService.send({
      type: "content.approval_requested",
      recipientId: clientId,
      data: { entryId, title: entry.title }
    });
  }
}
```

### 2. Brief System Integration

```typescript
// Link content to briefs/projects
// Case studies can reference completed briefs
// Proposals can be generated from RFPs

interface ContentBriefLink {
  contentEntryId: string;
  briefId: string;
  projectId?: string;
}
```

### 3. Notification Integration

```typescript
// Leverage existing notification system
const contentNotifications = [
  "content.created",
  "content.submitted_for_review",
  "content.approved",
  "content.changes_requested",
  "content.published",
  "content.comment_added",
  "content.mentioned",
];
```

### 4. File Management Integration

```typescript
// Use existing File system for media
// ContentMedia links to File model
// Reuse FileService for uploads

import { FileService } from "@/lib/storage";

export async function uploadContentMedia(
  entryId: string,
  file: File
): Promise<string> {
  const result = await FileService.createFile({
    file,
    category: "CONTENT_MEDIA",
    organizationId: session.user.organizationId,
  });

  await db.contentMedia.create({
    data: {
      entryId,
      fileId: result.id,
    }
  });

  return result.url;
}
```

---

## SEO & Publishing

### Sitemap Generation

```typescript
// /src/app/api/public/content/sitemap/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  const entries = await db.contentEntry.findMany({
    where: {
      status: "PUBLISHED",
      organization: { domain }
    },
    select: {
      slug: true,
      contentType: { select: { slugPattern: true } },
      updatedAt: true
    }
  });

  return Response.json({
    entries: entries.map(entry => ({
      url: generateUrl(entry),
      lastModified: entry.updatedAt
    }))
  });
}
```

### Meta Tags Generation

```typescript
// Generate meta tags for frontend
export function generateMetaTags(entry: ContentEntry) {
  return {
    title: entry.seoTitle || entry.title,
    description: entry.seoDescription || entry.excerpt,
    openGraph: {
      title: entry.seoTitle || entry.title,
      description: entry.seoDescription || entry.excerpt,
      image: entry.ogImage || entry.featuredImage?.url,
    },
    robots: entry.noIndex ? "noindex,nofollow" : "index,follow",
    canonical: entry.canonicalUrl,
  };
}
```

---

## Implementation Phases

### Phase 12.1: Foundation (Week 1-2)
- [ ] Database schema additions
- [ ] Content type configuration system
- [ ] Basic CRUD for content entries
- [ ] Simple text/rich-text fields

### Phase 12.2: Editor (Week 3-4)
- [ ] Rich text editor (Tiptap)
- [ ] Media picker integration
- [ ] Auto-save functionality
- [ ] Version history

### Phase 12.3: Workflow (Week 5)
- [ ] Approval workflow
- [ ] Status transitions
- [ ] Scheduled publishing
- [ ] Notifications integration

### Phase 12.4: Advanced Features (Week 6-7)
- [ ] Block-based page builder
- [ ] SEO panel
- [ ] Content preview
- [ ] Full-text search

### Phase 12.5: API & Integration (Week 8)
- [ ] Public API for frontend
- [ ] Client portal integration
- [ ] Analytics tracking
- [ ] Cache layer

---

## Recommended Dependencies

```json
{
  "dependencies": {
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "@tiptap/extension-image": "^2.1.0",
    "@tiptap/extension-link": "^2.1.0",
    "@tiptap/extension-placeholder": "^2.1.0",
    "@tiptap/extension-code-block-lowlight": "^2.1.0"
  }
}
```

Note: The project already has `@dnd-kit/core` for drag-and-drop functionality.

---

## Type Definitions

```typescript
// /src/types/content.ts

export interface ContentTypeConfig {
  slug: string;
  name: string;
  description: string;
  icon: string;

  schema: {
    sections: ContentSection[];
  };

  workflow: {
    requireApproval: boolean;
    requireClientApproval?: boolean;
    approvers: PermissionLevel[];
    autoPublish?: boolean;
  };

  seo: {
    enabled: boolean;
    slugPattern?: string;
    titlePattern?: string;
    generateSitemap?: boolean;
  };

  permissions: {
    create: PermissionLevel[];
    edit: PermissionLevel[];
    publish: PermissionLevel[];
    delete: PermissionLevel[];
    view?: PermissionLevel[];
  };

  listing?: {
    defaultSort: string;
    perPage: number;
    showExcerpt?: boolean;
    showAuthor?: boolean;
    showDate?: boolean;
  };
}

export interface ContentSection {
  id: string;
  title: string;
  description?: string;
  fields: ContentField[];
}

export interface ContentField {
  id: string;
  label: string;
  type: ContentFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  options?: SelectOption[];
  filter?: FieldFilter;
  multiple?: boolean;
  accept?: string[];
  defaultValue?: any;
  dependsOn?: { field: string; value: any };
  fields?: ContentField[];  // For repeater fields
  features?: string[];      // For rich-text
}

export type ContentFieldType =
  | "text"
  | "textarea"
  | "rich-text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "datetime"
  | "user-select"
  | "client-select"
  | "category-select"
  | "tag-select"
  | "media-select"
  | "media-gallery"
  | "file-upload"
  | "url"
  | "code"
  | "repeater";
```

---

## Security Considerations

1. **Multi-Tenant Isolation**: All queries filter by `organizationId`
2. **Permission Checks**: Every action validates user permissions
3. **Content Sanitization**: Rich text is sanitized before storage
4. **Rate Limiting**: API endpoints use existing rate limiting
5. **Audit Trail**: All changes tracked with user attribution

---

## Summary

This CMS architecture:

1. **Follows existing patterns** - Config-driven, multi-tenant, server-first
2. **Reuses infrastructure** - Forms, files, permissions, notifications
3. **Supports multiple use cases** - Website, marketing, internal docs
4. **Provides robust workflow** - Approvals, versioning, scheduling
5. **Enables headless delivery** - API-first for any frontend
6. **Integrates with existing modules** - Briefs, clients, portal

The design allows for incremental implementation while maintaining consistency with the rest of the ERP platform.
