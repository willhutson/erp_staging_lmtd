# SpokeStudio - Technical Specification

**Version:** 1.0
**Date:** December 2024
**Module Route:** `/studio`
**Status:** Ready for Development

---

## Executive Summary

SpokeStudio is the AI-assisted creative workspace within SpokeStack. It bridges the gap between brief intake (Agency module) and content publishing (Marketing module) by providing tools for content creation, iteration, and approval.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SPOKESTACK CONTENT FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   AGENCY MODULE          SPOKESTUDIO              MARKETING MODULE          │
│   ─────────────          ───────────              ────────────────          │
│                                                                              │
│   Brief Created ───────► Create Draft ──────────► Schedule Post             │
│   Client Context ──────► AI Assistance ─────────► Publish                   │
│   Brand Guidelines ────► Iterate/Revise ────────► Analytics                 │
│   Approval Workflow ───► Export/Handoff ────────► Reporting                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Structure

```
/src/app/(studio)/
├── layout.tsx                    # Studio shell with sidebar
├── page.tsx                      # Studio dashboard/home
├── docs/
│   ├── page.tsx                 # Google Docs workspace
│   ├── [id]/page.tsx            # Single doc editor
│   └── sync/page.tsx            # Sync status & settings
├── decks/
│   ├── page.tsx                 # Pitch deck library
│   ├── new/page.tsx             # New deck wizard
│   ├── [id]/page.tsx            # Deck editor
│   └── templates/page.tsx       # Deck templates
├── video/
│   ├── page.tsx                 # Video project list
│   ├── [id]/page.tsx            # Video workspace
│   ├── storyboard/page.tsx      # Storyboard tool
│   └── scripts/page.tsx         # Script library
├── moodboard/
│   ├── page.tsx                 # Moodboard gallery
│   ├── new/page.tsx             # New moodboard
│   └── [id]/page.tsx            # Moodboard canvas
├── calendar/
│   └── page.tsx                 # Social content calendar
└── skills/
    └── page.tsx                 # AI skill configuration

/src/modules/studio/
├── actions/                      # Server actions
├── components/                   # Studio-specific components
├── hooks/                        # Custom hooks
├── lib/                          # Utilities
└── types/                        # TypeScript types
```

---

## 1. Google Docs Sync

### Purpose
Two-way sync between SpokeStack and Google Docs. Create docs in Studio, edit in Google, changes reflect both ways. Essential for collaborative copy work with clients who live in Google Workspace.

### Database Schema

```prisma
model StudioDocument {
  id              String   @id @default(cuid())
  organizationId  String

  // Document info
  title           String
  type            StudioDocType @default(DOCUMENT)
  status          StudioDocStatus @default(DRAFT)

  // Google sync
  googleDocId     String?  @unique
  googleDriveId   String?
  lastSyncedAt    DateTime?
  syncStatus      SyncStatus @default(PENDING)
  syncError       String?

  // Content (local cache)
  content         Json?    // Portable format for offline/preview
  contentHtml     String?  // Rendered HTML
  wordCount       Int      @default(0)

  // Relations
  projectId       String?
  briefId         String?
  clientId        String?

  // Ownership
  createdById     String
  lastEditedById  String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  organization    Organization @relation(fields: [organizationId], references: [id])
  project         Project?     @relation(fields: [projectId], references: [id])
  brief           Brief?       @relation(fields: [briefId], references: [id])
  client          Client?      @relation(fields: [clientId], references: [id])
  createdBy       User         @relation("DocCreator", fields: [createdById], references: [id])
  lastEditedBy    User?        @relation("DocEditor", fields: [lastEditedById], references: [id])

  versions        StudioDocVersion[]

  @@index([organizationId])
  @@index([googleDocId])
  @@index([clientId])
  @@index([briefId])
  @@map("studio_documents")
}

model StudioDocVersion {
  id              String   @id @default(cuid())
  documentId      String
  version         Int
  content         Json
  contentHtml     String?
  wordCount       Int
  changeNote      String?
  createdById     String
  createdAt       DateTime @default(now())

  document        StudioDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)
  createdBy       User           @relation(fields: [createdById], references: [id])

  @@unique([documentId, version])
  @@map("studio_doc_versions")
}

enum StudioDocType {
  DOCUMENT        // General doc
  SCRIPT          // Video script
  SOCIAL_COPY     // Social media copy
  AD_COPY         // Advertising copy
  BLOG_POST       // Blog article
  EMAIL           // Email template
  PROPOSAL        // Client proposal
  SOW             // Scope of work
}

enum StudioDocStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  PUBLISHED
  ARCHIVED
}

enum SyncStatus {
  PENDING
  SYNCED
  SYNCING
  ERROR
  DISABLED
}
```

### Server Actions

```typescript
// src/modules/studio/actions/docs-actions.ts

// Create new document (optionally in Google)
export async function createStudioDocument(data: {
  title: string;
  type: StudioDocType;
  clientId?: string;
  briefId?: string;
  projectId?: string;
  createInGoogle?: boolean;
  templateId?: string;
}): Promise<StudioDocument>

// Sync document to Google Docs
export async function syncToGoogle(documentId: string): Promise<{
  googleDocId: string;
  googleUrl: string;
}>

// Pull changes from Google
export async function pullFromGoogle(documentId: string): Promise<StudioDocument>

// Push changes to Google
export async function pushToGoogle(documentId: string): Promise<void>

// Import existing Google Doc
export async function importGoogleDoc(googleDocId: string, options: {
  clientId?: string;
  briefId?: string;
}): Promise<StudioDocument>

// List documents with filters
export async function listStudioDocuments(filters: {
  clientId?: string;
  briefId?: string;
  type?: StudioDocType;
  status?: StudioDocStatus;
  search?: string;
}): Promise<StudioDocument[]>
```

### Google Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE DOCS SYNC FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CREATE IN STUDIO                 IMPORT FROM GOOGLE             │
│  ────────────────                 ──────────────────             │
│                                                                  │
│  1. User creates doc              1. User pastes Google URL      │
│  2. Save to Postgres              2. Fetch doc via API           │
│  3. Create Google Doc             3. Convert to portable format  │
│  4. Store googleDocId             4. Save to Postgres            │
│  5. Open in embedded editor       5. Link googleDocId            │
│         or redirect to Google                                    │
│                                                                  │
│  SYNC STRATEGY                                                   │
│  ─────────────                                                   │
│                                                                  │
│  • Pull on open: Fetch latest from Google when doc opened        │
│  • Push on save: Update Google when saved in Studio              │
│  • Webhook (optional): Google Drive push notifications           │
│  • Conflict: Last-write-wins with version history                │
│                                                                  │
│  PERMISSIONS                                                     │
│  ───────────                                                     │
│                                                                  │
│  • Studio creates docs in org's shared Drive folder              │
│  • Service account has editor access                             │
│  • Users access via their own Google credentials                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### UI Components

| Component | Description |
|-----------|-------------|
| `DocsList` | Filterable list of documents with sync status indicators |
| `DocEditor` | Rich text editor with Google sync controls |
| `SyncStatusBadge` | Shows sync state (synced, pending, error) |
| `GoogleDocEmbed` | Embedded Google Doc viewer/editor |
| `ImportGoogleModal` | Modal to import existing Google Docs |
| `DocVersionHistory` | Sidebar showing version history |

---

## 2. Social Calendar

### Purpose
Visual calendar for planning, scheduling, and tracking social content. Integrates with Marketing module for publishing, but creation/planning happens here.

### Database Schema

```prisma
model StudioCalendarEntry {
  id              String   @id @default(cuid())
  organizationId  String

  // Content
  title           String
  description     String?
  contentType     SocialContentType

  // Scheduling
  scheduledDate   DateTime
  scheduledTime   String?  // "14:30" - time of day
  timezone        String   @default("Asia/Dubai")

  // Platform targeting
  platforms       String[] // ["instagram", "linkedin", "tiktok"]

  // Status
  status          CalendarEntryStatus @default(PLANNED)

  // Relations
  clientId        String?
  projectId       String?
  briefId         String?
  documentId      String?  // Link to StudioDocument

  // Publishing (links to Marketing module)
  publishedPostId String?  // Reference to Marketing module's post

  // Visual
  color           String?  // Hex color for calendar display

  // Ownership
  createdById     String
  assigneeId      String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization    @relation(fields: [organizationId], references: [id])
  client          Client?         @relation(fields: [clientId], references: [id])
  project         Project?        @relation(fields: [projectId], references: [id])
  brief           Brief?          @relation(fields: [briefId], references: [id])
  document        StudioDocument? @relation(fields: [documentId], references: [id])
  createdBy       User            @relation("EntryCreator", fields: [createdById], references: [id])
  assignee        User?           @relation("EntryAssignee", fields: [assigneeId], references: [id])

  @@index([organizationId, scheduledDate])
  @@index([clientId])
  @@map("studio_calendar_entries")
}

enum SocialContentType {
  POST            // Static image/text post
  CAROUSEL        // Multi-image carousel
  REEL            // Short-form video
  STORY           // Ephemeral story
  LIVE            // Live stream
  ARTICLE         // LinkedIn article / blog
  THREAD          // Twitter/X thread
  AD              // Paid advertisement
}

enum CalendarEntryStatus {
  IDEA            // Just an idea, not committed
  PLANNED         // Scheduled but not created
  IN_PROGRESS     // Being created
  READY           // Content ready, awaiting publish
  SCHEDULED       // Scheduled in Marketing module
  PUBLISHED       // Live
  CANCELLED       // Cancelled
}
```

---

## 3. Video Studio

### Purpose
Pre-production toolkit for video content. Handles scripts, storyboards, shot lists, and production briefs. Not a video editor - that stays in Premiere/DaVinci. This is the planning layer.

### Database Schema

```prisma
model VideoProject {
  id              String   @id @default(cuid())
  organizationId  String

  // Project info
  title           String
  description     String?
  type            VideoProjectType
  status          VideoProjectStatus @default(CONCEPT)

  // Specs
  duration        Int?     // Target duration in seconds
  aspectRatio     String?  // "16:9", "9:16", "1:1"
  platform        String?  // Primary platform target

  // Relations
  clientId        String?
  projectId       String?
  briefId         String?

  // Ownership
  createdById     String
  directorId      String?  // Assigned director/editor

  // Dates
  shootDate       DateTime?
  dueDate         DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  client          Client?      @relation(fields: [clientId], references: [id])
  project         Project?     @relation(fields: [projectId], references: [id])
  brief           Brief?       @relation(fields: [briefId], references: [id])
  createdBy       User         @relation("VideoCreator", fields: [createdById], references: [id])
  director        User?        @relation("VideoDirector", fields: [directorId], references: [id])

  script          VideoScript?
  storyboard      Storyboard?
  shotList        ShotListItem[]

  @@index([organizationId])
  @@index([clientId])
  @@map("video_projects")
}

model VideoScript {
  id              String   @id @default(cuid())
  videoProjectId  String   @unique

  // Script content
  content         Json     // Structured script format
  contentText     String?  // Plain text version

  // Metadata
  version         Int      @default(1)
  wordCount       Int      @default(0)
  estimatedDuration Int?   // Estimated seconds based on word count

  // Status
  status          ScriptStatus @default(DRAFT)

  // AI assistance
  aiGenerated     Boolean  @default(false)
  aiPrompt        String?  // Prompt used to generate

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  videoProject    VideoProject @relation(fields: [videoProjectId], references: [id], onDelete: Cascade)

  @@map("video_scripts")
}

model Storyboard {
  id              String   @id @default(cuid())
  videoProjectId  String   @unique

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  videoProject    VideoProject   @relation(fields: [videoProjectId], references: [id], onDelete: Cascade)
  frames          StoryboardFrame[]

  @@map("storyboards")
}

model StoryboardFrame {
  id              String   @id @default(cuid())
  storyboardId    String

  // Frame info
  orderIndex      Int
  imageUrl        String?  // Generated or uploaded image
  description     String?  // Scene description
  dialogue        String?  // Character dialogue
  action          String?  // Action notes
  duration        Int?     // Frame duration in seconds

  // Camera/technical
  shotType        String?  // "wide", "medium", "close-up", etc.
  cameraMovement  String?  // "static", "pan", "dolly", etc.
  notes           String?  // Director notes

  // AI generation
  aiGenerated     Boolean  @default(false)
  aiPrompt        String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  storyboard      Storyboard @relation(fields: [storyboardId], references: [id], onDelete: Cascade)

  @@index([storyboardId, orderIndex])
  @@map("storyboard_frames")
}

model ShotListItem {
  id              String   @id @default(cuid())
  videoProjectId  String

  // Shot info
  orderIndex      Int
  shotNumber      String   // "1A", "1B", "2", etc.
  description     String
  shotType        String?
  location        String?
  talent          String?  // Who's in the shot
  equipment       String?  // Special equipment needed
  duration        Int?     // Estimated seconds
  notes           String?

  // Status
  status          ShotStatus @default(PLANNED)

  createdAt       DateTime @default(now())

  videoProject    VideoProject @relation(fields: [videoProjectId], references: [id], onDelete: Cascade)

  @@index([videoProjectId, orderIndex])
  @@map("shot_list_items")
}

enum VideoProjectType {
  BRAND_VIDEO     // Brand/corporate video
  SOCIAL_CONTENT  // Short-form social
  COMMERCIAL      // Advertisement
  TESTIMONIAL     // Client testimonial
  EXPLAINER       // Explainer/how-to
  EVENT           // Event coverage
  DOCUMENTARY     // Mini-doc
  ANIMATION       // Motion graphics
}

enum VideoProjectStatus {
  CONCEPT         // Initial concept
  SCRIPTING       // Writing script
  PRE_PRODUCTION  // Storyboard, planning
  PRODUCTION      // Filming
  POST_PRODUCTION // Editing
  REVIEW          // Client review
  COMPLETE        // Delivered
  CANCELLED
}

enum ScriptStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  REVISION_REQUESTED
}

enum ShotStatus {
  PLANNED
  READY
  SHOT
  UNUSABLE
}
```

---

## 4. Pitch Deck Builder

### Purpose
Create client pitch decks and presentations with AI assistance. Exports to Google Slides. Uses brand templates and client context for personalized decks.

### Database Schema

```prisma
model PitchDeck {
  id              String   @id @default(cuid())
  organizationId  String

  // Deck info
  title           String
  description     String?
  type            DeckType @default(PITCH)
  status          DeckStatus @default(DRAFT)

  // Template
  templateId      String?

  // Google Slides sync
  googleSlidesId  String?  @unique
  googleDriveId   String?
  lastSyncedAt    DateTime?

  // Relations
  clientId        String?
  dealId          String?
  projectId       String?

  // Ownership
  createdById     String

  // Presentation date
  presentationDate DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  template        DeckTemplate? @relation(fields: [templateId], references: [id])
  client          Client?      @relation(fields: [clientId], references: [id])
  deal            Deal?        @relation(fields: [dealId], references: [id])
  project         Project?     @relation(fields: [projectId], references: [id])
  createdBy       User         @relation(fields: [createdById], references: [id])

  slides          DeckSlide[]

  @@index([organizationId])
  @@index([clientId])
  @@map("pitch_decks")
}

model DeckSlide {
  id              String   @id @default(cuid())
  deckId          String

  // Slide info
  orderIndex      Int
  layoutType      SlideLayoutType
  title           String?
  subtitle        String?
  content         Json     // Structured slide content

  // Visual
  backgroundUrl   String?
  backgroundColor String?

  // Notes
  speakerNotes    String?

  // AI
  aiGenerated     Boolean  @default(false)
  aiPrompt        String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  deck            PitchDeck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  @@index([deckId, orderIndex])
  @@map("deck_slides")
}

model DeckTemplate {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?
  type            DeckType

  // Template structure
  slideTemplates  Json     // Default slides for this template type

  // Styling
  colorScheme     Json?
  fonts           Json?
  logoUrl         String?

  // Google Slides master
  googleTemplateId String?

  isDefault       Boolean  @default(false)
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  decks           PitchDeck[]

  @@index([organizationId])
  @@map("deck_templates")
}

enum DeckType {
  PITCH           // New client pitch
  PROPOSAL        // Project proposal
  REPORT          // Monthly/quarterly report
  CASE_STUDY      // Case study presentation
  CREDENTIALS     // Agency credentials
  WORKSHOP        // Workshop/training
  INTERNAL        // Internal presentation
}

enum DeckStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  PRESENTED
  WON
  LOST
  ARCHIVED
}

enum SlideLayoutType {
  TITLE           // Title slide
  SECTION         // Section divider
  CONTENT         // Standard content
  TWO_COLUMN      // Two columns
  IMAGE_FULL      // Full-bleed image
  IMAGE_LEFT      // Image left, text right
  IMAGE_RIGHT     // Image right, text left
  STATS           // Statistics/numbers
  QUOTE           // Quote slide
  TEAM            // Team members
  TIMELINE        // Timeline/process
  COMPARISON      // Before/after, vs
  PRICING         // Pricing table
  CTA             // Call to action
  THANK_YOU       // Closing slide
}
```

---

## 5. Creative Skills (AI Agents)

### Purpose
Pre-built AI skills specific to creative work. Extends the existing AgentSkill infrastructure.

### Studio-Specific Skills

| Skill | Category | Purpose |
|-------|----------|---------|
| `social-copy-writer` | copy | Platform-specific social media copy |
| `ad-copy-writer` | copy | Advertising copy for paid campaigns |
| `arabic-localizer` | copy | English to Arabic localization |
| `script-writer` | video | Video scripts with timing |
| `storyboard-describer` | video | Scene descriptions for frames |
| `deck-outliner` | presentation | Deck structure and outlines |
| `slide-content-writer` | presentation | Individual slide content |
| `image-prompt-generator` | visual | AI image generation prompts |
| `moodboard-curator` | visual | Visual direction suggestions |

---

## 6. Moodboard Lab

### Purpose
**The creative input layer.** Users build a moodboard by dragging in references (images, PDFs, videos, colors, links, text notes), and the system indexes everything to become the context for AI-generated creative outputs.

### Database Schema

```prisma
model Moodboard {
  id              String   @id @default(cuid())
  organizationId  String

  // Board info
  title           String
  description     String?
  type            MoodboardType @default(GENERAL)
  status          MoodboardStatus @default(ACTIVE)

  // Visual settings
  backgroundColor String?
  gridLayout      String   @default("masonry")

  // Relations
  clientId        String?
  projectId       String?
  briefId         String?

  // AI Context
  contextSummary  String?
  contextEmbedding Json?
  lastIndexedAt   DateTime?
  indexStatus     IndexStatus @default(PENDING)

  // Ownership
  createdById     String

  // Sharing
  isPublic        Boolean  @default(false)
  shareToken      String?  @unique

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  client          Client?      @relation(fields: [clientId], references: [id])
  project         Project?     @relation(fields: [projectId], references: [id])
  brief           Brief?       @relation(fields: [briefId], references: [id])
  createdBy       User         @relation(fields: [createdById], references: [id])

  items           MoodboardItem[]
  conversations   MoodboardConversation[]
  outputs         MoodboardOutput[]

  @@index([organizationId])
  @@index([clientId])
  @@map("moodboards")
}

model MoodboardItem {
  id              String   @id @default(cuid())
  moodboardId     String

  type            MoodboardItemType

  // Position
  positionX       Float?
  positionY       Float?
  width           Float?
  height          Float?
  rotation        Float?   @default(0)
  zIndex          Int      @default(0)

  // Content
  fileUrl         String?
  thumbnailUrl    String?
  sourceUrl       String?
  title           String?
  description     String?
  color           String?
  text            String?

  // Extracted content
  extractedText   String?
  extractedColors String[] @default([])
  aiDescription   String?
  embedding       Json?

  // Processing
  processingStatus ProcessingStatus @default(PENDING)
  processingError String?

  // Metadata
  tags            String[] @default([])
  mimeType        String?
  fileSize        Int?
  duration        Int?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  moodboard       Moodboard @relation(fields: [moodboardId], references: [id], onDelete: Cascade)

  @@index([moodboardId])
  @@map("moodboard_items")
}

model MoodboardConversation {
  id              String   @id @default(cuid())
  moodboardId     String

  messages        Json
  contextSnapshot Json?

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  moodboard       Moodboard @relation(fields: [moodboardId], references: [id], onDelete: Cascade)
  createdBy       User      @relation(fields: [createdById], references: [id])

  @@index([moodboardId])
  @@map("moodboard_conversations")
}

model MoodboardOutput {
  id              String   @id @default(cuid())
  moodboardId     String

  type            MoodboardOutputType
  title           String
  content         Json
  contentText     String?

  prompt          String

  exportedToDoc   String?
  exportedToDeck  String?
  exportedToVideo String?

  createdById     String
  createdAt       DateTime @default(now())

  moodboard       Moodboard @relation(fields: [moodboardId], references: [id], onDelete: Cascade)
  createdBy       User      @relation(fields: [createdById], references: [id])

  @@index([moodboardId])
  @@map("moodboard_outputs")
}

enum MoodboardType {
  GENERAL
  BRAND
  CAMPAIGN
  VIDEO
  PHOTO
  DESIGN
  PITCH
}

enum MoodboardStatus {
  ACTIVE
  ARCHIVED
}

enum MoodboardItemType {
  IMAGE
  PDF
  VIDEO
  AUDIO
  COLOR
  TEXT
  LINK
  FILE
}

enum MoodboardOutputType {
  CAMPAIGN_CONCEPTS
  COPY
  VISUAL_DIRECTION
  SCRIPT
  DECK_OUTLINE
  COLOR_PALETTE
  TAGLINES
  IMAGE
  CUSTOM
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum IndexStatus {
  PENDING
  INDEXING
  INDEXED
  FAILED
}
```

---

## 7. Implementation Phases

### Phase S1: Foundation (Week 1-2)
- Create (studio) route group and layout
- Add Studio to main navigation
- Create Prisma schema for all Studio models
- Run migrations
- Create basic page shells
- Set up module folder structure

### Phase S2: Google Docs Sync (Week 2-3)
- Set up Google OAuth
- Create Google API service layer
- Implement document creation and sync
- Build document list and editor UI
- Add version history

### Phase S3: Social Calendar (Week 3-4)
- Build calendar component
- Create calendar entry CRUD
- Implement drag-drop rescheduling
- Add filters and entry detail panel
- Connect to Marketing module

### Phase S4: Pitch Deck Builder (Week 4-5)
- Create deck templates system
- Build deck editor workspace
- Implement slide layouts
- Add Google Slides export
- Add AI slide content generation

### Phase S5: Video Studio (Week 5-6)
- Build video project workspace
- Create script editor
- Build storyboard canvas
- Implement frame image generation
- Create shot list table

### Phase S6: Moodboard Lab (Week 6-8)
- Build moodboard workspace
- Create drag-drop canvas
- Implement processing pipeline
- Build chat interface
- Implement AI context building
- Add quick generate buttons

### Phase S7: Creative Skills & Polish (Week 8-9)
- Register all Studio-specific AI skills
- Build skill configuration UI
- Connect to brief context
- Add cross-module integration
- Performance optimization

---

*Document ready for Claude Code implementation.*
