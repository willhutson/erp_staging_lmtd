# SpokeStack Platform - Consolidated Technical Specification

**Version:** 1.0
**Date:** December 2024
**Purpose:** Whitelabel Production Fork Blueprint
**Status:** Reference Document

---

## Executive Summary

**SpokeStack** is a white-label, multi-tenant ERP platform for professional services agencies. TeamLMTD ERP is the first branded deployment. This document consolidates all 11 development phases into a single technical reference for creating a clean, production-ready whitelabel fork.

### Implementation Status (as of December 2024)

| Phase | Description | Schema | UI/Code | Status |
|-------|-------------|--------|---------|--------|
| **1** | Foundation (Auth, Layout, Config) | ✅ | ✅ | **Complete** |
| **2** | Briefing System (7 types, workflows) | ✅ | ✅ | **Complete** |
| **3** | Resource Planning (Kanban, Timeline) | ✅ | ✅ | **Complete** |
| **4** | Time Tracking (Timer, Entries) | ✅ | ✅ | **Complete** |
| **5** | RFP & CRM (Pipeline, Deals, Clients) | ✅ | ✅ | **Complete** |
| **6** | Notifications (In-app, Email) | ✅ | ✅ | **Complete** |
| **7** | File Management (Upload, Storage) | ✅ | ⚠️ | **Partial** - Schema ready, basic upload exists |
| **8** | Analytics & Reporting | ✅ | ❌ | **Schema Only** - UI not built |
| **9** | Slack Integration | ✅ | ❌ | **Schema Only** - UI not built |
| **10** | Client Portal | ✅ | ✅ | **Complete** |
| **11** | API & Webhooks | ✅ | ❌ | **Schema Only** - Endpoints not built |

**Legend:**
- ✅ Complete and functional
- ⚠️ Partial implementation
- ❌ Not implemented (schema/spec only)

### Platform Vision

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPOKESTACK PLATFORM                                │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Tenant A      │  │   Tenant B      │  │   Tenant C      │              │
│  │   (TeamLMTD)    │  │   (Future)      │  │   (Future)      │              │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │              │
│  │  │ Branding  │  │  │  │ Branding  │  │  │  │ Branding  │  │              │
│  │  │ Config    │  │  │  │ Config    │  │  │  │ Config    │  │              │
│  │  │ Workflows │  │  │  │ Workflows │  │  │  │ Workflows │  │              │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                               │                                              │
│  ┌────────────────────────────┴────────────────────────────────────────┐    │
│  │                     SHARED PLATFORM CORE                             │    │
│  │  • Multi-tenant Database      • Authentication    • Notifications   │    │
│  │  • Form Engine                • Workflow Engine   • File Storage    │    │
│  │  • Analytics Engine           • API Layer         • AI Framework    │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Architecture Principles](#2-architecture-principles)
3. [Phase 1-5: Core Platform](#3-phases-1-5-core-platform)
4. [Phase 6: Notifications](#4-phase-6-notifications)
5. [Phase 7: File Management](#5-phase-7-file-management)
6. [Phase 8: Analytics & Reporting](#6-phase-8-analytics--reporting)
7. [Phase 9: Slack Integration](#7-phase-9-slack-integration)
8. [Phase 10: Client Portal](#8-phase-10-client-portal)
9. [Phase 11: API & Webhooks](#9-phase-11-api--webhooks)
10. [Database Schema Overview](#10-database-schema-overview)
11. [Whitelabel Configuration](#11-whitelabel-configuration)
12. [Deployment Architecture](#12-deployment-architecture)

---

## 1. Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | Framework (App Router) |
| TypeScript | 5.x | Language (strict mode) |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Component library |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Validation |
| Zustand | 4.x | Global state |
| TanStack Query | 5.x | Server state |
| @dnd-kit/core | 6.x | Drag and drop |
| Recharts | 2.x | Charts |

### Backend

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | REST endpoints |
| Server Actions | Form submissions, mutations |
| Prisma | ORM with migrations |
| PostgreSQL | Database (Neon/Supabase) |
| NextAuth.js v5 | Authentication |
| Cloudflare R2 | File storage (S3-compatible) |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting & Edge Functions |
| Neon/Supabase | Managed PostgreSQL |
| Cloudflare R2 | Object storage |
| Resend | Transactional email |

---

## 2. Architecture Principles

### Core Principles

1. **Config-Driven**: All tenant behavior lives in `/config`, never hardcoded
2. **Multi-Tenant from Day 1**: Every table has `organizationId`
3. **Module Isolation**: Features in `/src/modules/[feature]` are self-contained
4. **TypeScript Strict**: No `any` types, full type safety
5. **Server-First**: Server Components and Server Actions by default

### Project Structure

```
spokestack/
├── CLAUDE.md                    # Development instructions
├── package.json
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
│
├── config/
│   ├── tenants/
│   │   └── [tenant].config.ts  # Per-tenant configuration
│   ├── forms/
│   │   └── *.form.ts           # Form definitions
│   └── workflows/
│       └── *.workflow.ts       # Status workflows
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, signup
│   │   ├── (dashboard)/        # Main app (protected)
│   │   ├── portal/             # Client portal
│   │   └── api/                # API routes
│   │
│   ├── modules/                # Feature modules
│   │   ├── briefs/
│   │   ├── resources/
│   │   ├── time-tracking/
│   │   ├── rfp/
│   │   ├── notifications/
│   │   ├── files/
│   │   ├── analytics/
│   │   ├── integrations/
│   │   └── portal/
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── layout/             # Shell, sidebar
│   │   └── forms/              # Form components
│   │
│   └── lib/
│       ├── db.ts               # Prisma client
│       ├── auth.ts             # NextAuth config
│       ├── permissions.ts      # RBAC utilities
│       └── config.ts           # Config loader
│
└── docs/
    └── *.md                    # Documentation
```

### Database Query Pattern

**CRITICAL**: Always filter by `organizationId`:

```typescript
const briefs = await db.brief.findMany({
  where: {
    organizationId: session.user.organizationId,
    // other filters
  },
});
```

### Permission Model

```typescript
enum PermissionLevel {
  ADMIN       // Full access
  LEADERSHIP  // Strategic + operational
  TEAM_LEAD   // Team management
  STAFF       // Own work
  FREELANCER  // Assigned work only
  CLIENT      // Portal access only
}
```

---

## 3. Phases 1-5: Core Platform ✅ COMPLETE

### Phase 1: Foundation

**Scope**: Authentication, layout, database, config system

| Component | Implementation |
|-----------|----------------|
| Auth | NextAuth.js v5 with Google OAuth + credentials |
| Layout | App shell with sidebar, header, navigation |
| Database | PostgreSQL with Prisma ORM |
| Config | TypeScript config files per tenant |
| Multi-tenancy | `organizationId` on all tables |

**Key Models**: Organization, User

### Phase 2: Briefing System

**Scope**: 7 brief types, workflows, assignments

| Brief Type | Naming Convention |
|------------|-------------------|
| VIDEO_SHOOT | `Shoot: [Client] – [Topic]` |
| VIDEO_EDIT | `Edit: [Client] – [Topic]` |
| DESIGN | `Design: [Client] – [Topic]` |
| COPYWRITING_EN | `Copy: [Client] – [Topic]` |
| COPYWRITING_AR | `Copy: [Client] – [Topic]` |
| PAID_MEDIA | `Paid Media: [Client] – [Topic]` |
| REPORT | `Report: [Client] – [Topic]` |

**Brief Workflow**:
```
DRAFT → SUBMITTED → IN_REVIEW → APPROVED → IN_PROGRESS →
INTERNAL_REVIEW → CLIENT_REVIEW → REVISIONS → COMPLETED
```

**Key Models**: Brief, BriefStatusHistory, Comment, Attachment

### Phase 3: Resource Planning

**Scope**: Kanban, Gantt, capacity dashboard

| Feature | Description |
|---------|-------------|
| Kanban Board | Drag-drop brief management by status |
| Timeline View | Gantt-style resource allocation |
| Capacity Dashboard | Team utilization visualization |
| Assignment | Assign briefs to team members |

**Key Models**: User (weeklyCapacity, skills), Brief (assigneeId, startDate, endDate)

### Phase 4: Time Tracking

**Scope**: Timer, entries, approvals

| Feature | Description |
|---------|-------------|
| Live Timer | One-click start/stop |
| Manual Entry | Log hours with date picker |
| Timesheet View | Weekly grid by user |
| Approvals | Team lead approval workflow |
| Reporting | Billable vs non-billable breakdown |

**Key Models**: TimeEntry

### Phase 5: RFP & CRM

**Scope**: Pipeline, deals, client management

**RFP Pipeline**:
```
VETTING → ACTIVE → READY_TO_SUBMIT → SUBMITTED →
AWAITING_RESPONSE → WON/LOST
```

**Deal Pipeline**:
```
LEAD → PITCH → NEGOTIATION → WON/LOST
```

**Conversion Flow**:
- Deal WON → Creates Client + Project
- RFP WON → Creates Client + Project

**Key Models**: RFP, RFPSubitem, Deal, Client, ClientContact, Project

---

## 4. Phase 6: Notifications ✅ COMPLETE

**Purpose**: Multi-channel notification system for keeping teams informed

### Features

| Feature | Description |
|---------|-------------|
| In-App | Bell icon with unread count, dropdown list |
| Email | Instant or digest delivery |
| Slack | Channel and DM notifications |
| Preferences | Per-user, per-type settings |
| Quiet Hours | Timezone-aware do-not-disturb |

### Notification Types

```typescript
type NotificationType =
  | 'brief.assigned'
  | 'brief.status_changed'
  | 'brief.deadline_approaching'
  | 'brief.overdue'
  | 'brief.comment'
  | 'submission.received'
  | 'submission.approved'
  | 'submission.rejected'
  | 'timesheet.reminder'
  | 'rfp.deadline_approaching'
  | 'deal.stage_changed'
  | 'system.announcement'
  | 'mention';
```

### Database Models

```prisma
model Notification {
  id              String   @id
  organizationId  String
  userId          String
  type            String
  title           String
  body            String?
  actionUrl       String?
  entityType      String?
  entityId        String?
  isRead          Boolean  @default(false)
  channels        String[] @default(["in_app"])
  createdAt       DateTime @default(now())
}

model NotificationPreference {
  id              String   @id
  userId          String   @unique
  emailEnabled    Boolean  @default(true)
  slackEnabled    Boolean  @default(true)
  emailDigest     String   @default("instant")
  quietHoursEnabled Boolean @default(false)
  typePreferences Json     @default("{}")
}
```

### Service Architecture

```typescript
class NotificationService {
  async send(payload: NotificationPayload): Promise<Notification>
  async sendBatch(payloads: NotificationPayload[]): Promise<void>
  async markAsRead(id: string, userId: string): Promise<void>
  async markAllAsRead(userId: string): Promise<void>
  async getUnreadCount(userId: string): Promise<number>
}
```

---

## 5. Phase 7: File Management ⚠️ PARTIAL

**Purpose**: Centralized file storage with AI processing

### Features

| Feature | Description |
|---------|-------------|
| Upload | Drag-drop with progress, multi-file |
| Storage | Cloudflare R2 (S3-compatible) |
| Thumbnails | Auto-generated for images/videos |
| Categories | Brief attachment, deliverable, brand asset, etc. |
| AI Processing | OCR, labeling, color extraction |
| Search | Full-text + metadata search |
| Folders | Hierarchical organization |

### File Categories

```typescript
enum FileCategory {
  BRIEF_ATTACHMENT   // Reference materials
  DELIVERABLE        // Completed work
  CONTRACT           // Legal documents
  BRAND_ASSET        // Logos, fonts, guidelines
  REFERENCE          // Inspiration, moodboards
  INVOICE            // Financial documents
  IMAGE, VIDEO, AUDIO, DOCUMENT, DESIGN_FILE
  OTHER
}
```

### Database Models

```prisma
model File {
  id              String   @id
  organizationId  String
  name            String
  originalName    String
  mimeType        String
  size            Int
  storageKey      String
  cdnUrl          String?
  thumbnailUrl    String?
  category        FileCategory
  tags            String[]
  folderId        String?
  aiStatus        AIProcessingStatus
  aiMetadata      Json?
  uploadedById    String
  isArchived      Boolean  @default(false)
}

model Folder {
  id              String   @id
  organizationId  String
  name            String
  parentId        String?
  path            String   // "/clients/CCAD/assets"
}

// Junction tables
model BriefFile { briefId, fileId, role }
model ClientFile { clientId, fileId, role }
model ProjectFile { projectId, fileId, role }
```

### Service Architecture

```typescript
class FileService {
  async upload(options: UploadOptions): Promise<File>
  async getDownloadUrl(fileId: string): Promise<string>
  async search(query: SearchQuery): Promise<File[]>
  async archive(fileId: string): Promise<void>
  async queueAiProcessing(fileId: string): Promise<void>
}
```

---

## 6. Phase 8: Analytics & Reporting ❌ SCHEMA ONLY

**Purpose**: Data-driven insights and scheduled reports

### Features

| Feature | Description |
|---------|-------------|
| Dashboard Widgets | Configurable analytics cards |
| Custom Dashboards | Drag-drop layout builder |
| Scheduled Reports | PDF/Excel generation with email delivery |
| Real-time Metrics | Live utilization and performance |
| Historical Snapshots | Periodic data aggregation |

### Widget Types

```typescript
enum AnalyticsWidgetType {
  METRIC_CARD      // Single number with trend
  COUNTER          // Live counter
  GAUGE            // Progress toward goal
  LINE_CHART, BAR_CHART, PIE_CHART
  DATA_TABLE, LEADERBOARD
  HEATMAP, TIMELINE
}
```

### Dashboard Types

```typescript
enum AnalyticsDashboardType {
  INTERNAL_OVERVIEW    // Agency-wide metrics
  INTERNAL_TEAM        // Team performance
  INTERNAL_RESOURCE    // Resource utilization
  INTERNAL_FINANCIAL   // Time/cost tracking
  EXTERNAL_REALTIME    // Live client metrics
  EXTERNAL_PERIOD      // Historical analytics
  CUSTOM               // User-defined
}
```

### Key Metrics

| Category | Metrics |
|----------|---------|
| Productivity | Briefs completed, turnaround time |
| Utilization | Billable hours, capacity usage |
| Quality | Brief quality scores, revision rates |
| Financial | Revenue per client, profitability |
| Pipeline | Win rate, deal velocity |

### Database Models

```prisma
model AnalyticsDashboard {
  id              String   @id
  organizationId  String
  name            String
  type            AnalyticsDashboardType
  layout          Json
  widgets         AnalyticsWidget[]
}

model AnalyticsSnapshot {
  id              String   @id
  organizationId  String
  period          AnalyticsPeriod // DAILY, WEEKLY, MONTHLY
  periodStart     DateTime
  entityType      String?
  entityId        String?
  metrics         Json
}

model MetricDefinition {
  id              String   @id
  organizationId  String
  code            String
  name            String
  formula         String
  format          String   // number, percent, currency
}
```

---

## 7. Phase 9: Slack Integration ❌ SCHEMA ONLY

**Purpose**: Deep Slack integration for team workflow

### Features

| Feature | Description |
|---------|-------------|
| Slash Commands | `/brief`, `/status`, `/time` |
| Event Posting | Brief updates to channels |
| Interactive Modals | Submit briefs from Slack |
| Approval Buttons | Approve/reject from messages |
| User Mapping | Link Slack users to platform users |

### Slash Commands

```
/brief [type]     - Open brief submission modal
/time [hours]     - Quick time log
/status           - Show my assigned briefs
/search [query]   - Search briefs
```

### Channel Mappings

```typescript
enum SlackMappingType {
  DEFAULT   // Org-wide notifications
  CLIENT    // Client-specific channel
  PROJECT   // Project-specific channel
  TEAM      // Team/department channel
}
```

### Database Models

```prisma
model SlackWorkspace {
  id              String   @id
  organizationId  String   @unique
  teamId          String   @unique
  teamName        String
  accessToken     String
  botUserId       String
  channelMappings SlackChannelMapping[]
}

model SlackChannelMapping {
  id              String   @id
  workspaceId     String
  channelId       String
  channelName     String
  mappingType     SlackMappingType
  entityId        String?
  notifyOnBriefCreated    Boolean
  notifyOnBriefCompleted  Boolean
}

model SlackMessage {
  id              String   @id
  workspaceId     String
  channelId       String
  messageTs       String
  entityType      String?
  entityId        String?
}
```

---

## 8. Phase 10: Client Portal ✅ COMPLETE

**Purpose**: Client self-service for approvals and visibility

### Features

| Feature | Description |
|---------|-------------|
| Magic Link Auth | Passwordless email login |
| Dashboard | Active briefs, pending approvals |
| Brief View | Status timeline, deliverables |
| Approvals | Approve/reject/request revisions |
| Assets | Access brand assets and deliverables |
| Brief Requests | Submit new work requests |
| NPS Surveys | Quarterly satisfaction surveys |

### Portal Routes

```
/portal/auth           - Magic link login
/portal/dashboard      - Client dashboard
/portal/dashboard/briefs        - Brief list
/portal/dashboard/briefs/[id]   - Brief detail
/portal/dashboard/assets        - File library
/portal/dashboard/requests      - Submit requests
```

### Approval Workflow

```
Internal: Complete work → Request Approval
Portal: Client reviews → Approve / Request Revisions / Reject
Internal: If revisions → Make changes → Re-submit
```

### Database Models

```prisma
model ClientPortalUser {
  id              String   @id
  organizationId  String
  clientId        String
  contactId       String?
  email           String
  name            String
  isActive        Boolean  @default(true)
  lastLoginAt     DateTime?
}

model ClientMagicLink {
  id              String   @id
  userId          String
  token           String   @unique
  expiresAt       DateTime
  usedAt          DateTime?
}

model SubmissionApproval {
  id              String   @id
  briefId         String
  status          ApprovalStatus  // PENDING, APPROVED, REJECTED, REVISION_REQUESTED
  approvedById    String?
  feedback        String?
  revisionNotes   String?
  requestedAt     DateTime
  respondedAt     DateTime?
}

model ClientBriefRequest {
  id              String   @id
  clientId        String
  title           String
  description     String
  status          BriefRequestStatus
  submittedById   String
  briefId         String?  // Converted to brief
}
```

---

## 9. Phase 11: API & Webhooks ❌ SCHEMA ONLY

**Purpose**: External integrations and automation

### Features

| Feature | Description |
|---------|-------------|
| REST API | Full CRUD for all entities |
| API Keys | Scoped, rate-limited access |
| Webhooks | Event subscriptions with retry |
| OpenAPI Spec | Auto-generated documentation |
| n8n/Zapier Ready | Automation platform support |

### API Endpoints

```
# Briefs
GET    /api/v1/briefs              - List briefs
POST   /api/v1/briefs              - Create brief
GET    /api/v1/briefs/:id          - Get brief
PATCH  /api/v1/briefs/:id          - Update brief
DELETE /api/v1/briefs/:id          - Delete brief

# Clients
GET    /api/v1/clients             - List clients
POST   /api/v1/clients             - Create client
GET    /api/v1/clients/:id         - Get client

# Time Entries
GET    /api/v1/time-entries        - List entries
POST   /api/v1/time-entries        - Log time

# Webhooks
GET    /api/v1/webhooks            - List subscriptions
POST   /api/v1/webhooks            - Create subscription
DELETE /api/v1/webhooks/:id        - Delete subscription
```

### API Scopes

```typescript
const API_SCOPES = {
  'briefs:read': 'Read briefs',
  'briefs:write': 'Create and update briefs',
  'briefs:delete': 'Delete briefs',
  'clients:read': 'Read clients',
  'clients:write': 'Create and update clients',
  'users:read': 'Read users',
  'time:read': 'Read time entries',
  'time:write': 'Create time entries',
  'files:read': 'Read and download files',
  'files:write': 'Upload files',
  'webhooks:manage': 'Manage webhook subscriptions',
};
```

### Webhook Events

```typescript
type WebhookEvent =
  | 'brief.created'
  | 'brief.updated'
  | 'brief.status_changed'
  | 'brief.completed'
  | 'brief.assigned'
  | 'submission.created'
  | 'submission.approved'
  | 'submission.rejected'
  | 'time.logged'
  | 'client.created'
  | 'file.uploaded';
```

### Database Models

```prisma
model ApiKey {
  id              String   @id
  organizationId  String
  name            String
  keyHash         String   @unique
  keyPrefix       String
  scopes          String[]
  rateLimit       Int      @default(1000)
  isActive        Boolean  @default(true)
  lastUsedAt      DateTime?
  usageCount      Int      @default(0)
  expiresAt       DateTime?
  createdById     String
}

model WebhookSubscription {
  id              String   @id
  organizationId  String
  url             String
  name            String
  events          String[]
  secret          String
  filters         Json?
  isActive        Boolean  @default(true)
  failureCount    Int      @default(0)
}

model WebhookDelivery {
  id              String   @id
  subscriptionId  String
  event           String
  payload         Json
  status          String   // pending, success, failed
  statusCode      Int?
  attemptNumber   Int      @default(1)
  nextRetryAt     DateTime?
}
```

---

## 10. Database Schema Overview

### Entity Relationship Summary

```
Organization (tenant root)
├── Users
│   ├── Briefs (created, assigned)
│   ├── TimeEntries
│   ├── Notifications
│   ├── DashboardLayouts
│   └── ApiKeys
├── Clients
│   ├── ClientContacts
│   ├── Projects
│   │   └── Briefs
│   ├── ClientActivities
│   ├── ClientPortalUsers
│   └── Files
├── Deals (sales pipeline)
├── RFPs (government tenders)
│   └── RFPSubitems
├── FormTemplates
│   └── FormSubmissions
├── Notifications
├── Files & Folders
├── SlackWorkspace
│   ├── SlackChannelMappings
│   └── SlackMessages
├── AnalyticsDashboards
│   └── AnalyticsWidgets
├── WebhookSubscriptions
│   └── WebhookDeliveries
└── Integrations
```

### Key Model Count

| Category | Models |
|----------|--------|
| Core | Organization, User |
| CRM | Client, ClientContact, Deal, ClientActivity |
| Projects | Project, Brief, BriefStatusHistory |
| Time | TimeEntry |
| RFP | RFP, RFPSubitem |
| Forms | FormTemplate, FormSubmission |
| Files | File, Folder, BriefFile, ClientFile, ProjectFile |
| Notifications | Notification, NotificationPreference, NotificationTemplate |
| Analytics | AnalyticsDashboard, AnalyticsWidget, AnalyticsSnapshot |
| Slack | SlackWorkspace, SlackChannelMapping, SlackMessage |
| Portal | ClientPortalUser, ClientMagicLink, SubmissionApproval, ClientBriefRequest |
| API | ApiKey, WebhookSubscription, WebhookDelivery, ApiRequestLog |
| HR | LeaveType, LeaveBalance, LeaveRequest, EmployeeDocument |
| NPS | NPSSurvey, NPSResponse |

**Total: 50+ models**

---

## 11. Whitelabel Configuration

### Tenant Configuration Structure

```typescript
// config/tenants/[tenant].config.ts

export const tenantConfig: TenantConfig = {
  // Identity
  id: 'tenant_slug',
  name: 'Tenant Name',
  domain: 'app.tenant.com',

  // Branding
  branding: {
    logo: '/tenants/[slug]/logo.svg',
    logoMark: '/tenants/[slug]/icon.svg',
    favicon: '/tenants/[slug]/favicon.ico',
    primaryColor: '#52EDC7',
    primaryDark: '#1BA098',
    accentColor: '#...',
    fontFamily: 'Inter',
  },

  // Feature Toggles
  features: {
    briefs: true,
    rfp: true,
    deals: true,
    clientPortal: true,
    timeTracking: true,
    resourcePlanning: true,
    analytics: true,
    slack: true,
    api: true,
  },

  // Business Settings
  business: {
    currency: 'AED',
    timezone: 'Asia/Dubai',
    weekStartsOn: 'sunday',
    departments: [
      'Creative & Design',
      'Video Production',
      'Paid Media',
      'Client Servicing',
      'Copywriting',
      'Management',
    ],
    briefTypes: [
      'VIDEO_SHOOT',
      'VIDEO_EDIT',
      'DESIGN',
      'COPYWRITING_EN',
      'COPYWRITING_AR',
      'PAID_MEDIA',
      'REPORT',
    ],
  },

  // Custom Terminology
  terminology: {
    brief: 'Brief',
    client: 'Client',
    project: 'Campaign',
    timeEntry: 'Time Log',
  },

  // Defaults
  defaults: {
    weeklyCapacity: 40,
    billableTarget: 0.8,
    dateFormat: 'DD MMM YYYY',
  },
};
```

### Whitelabel Checklist for New Tenant

1. **Create config file**: `config/tenants/[tenant].config.ts`
2. **Add branding assets**: `public/tenants/[tenant]/`
3. **Create organization record**: Database seed
4. **Configure auth providers**: Google OAuth, etc.
5. **Set up integrations**: Slack app, email provider
6. **Customize form templates**: Brief types as needed
7. **Configure notifications**: Channel mappings
8. **Set up file storage**: R2 bucket prefix

---

## 12. Deployment Architecture

### Single-Tenant (Current)

```
┌──────────────────┐     ┌──────────────────┐
│  app.tenant.com  │────▶│  Vercel Edge     │
└──────────────────┘     │  + Neon DB       │
                         └──────────────────┘
```

### Multi-Tenant (Future)

```
┌──────────────────┐
│  a.spokestack.io │────┐
└──────────────────┘    │     ┌──────────────────┐
                        ├────▶│  Shared Vercel   │
┌──────────────────┐    │     │  + Shared DB     │
│  b.spokestack.io │────┘     └──────────────────┘
└──────────────────┘
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://app.domain.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Storage
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="..."

# Email
RESEND_API_KEY="..."

# Slack (optional)
SLACK_CLIENT_ID="..."
SLACK_CLIENT_SECRET="..."
SLACK_SIGNING_SECRET="..."
```

### Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm db:push          # Push schema changes
pnpm db:seed          # Run seed data
pnpm db:studio        # Open Prisma Studio

# Production
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm typecheck        # TypeScript check
pnpm test             # Run tests
```

---

## Implementation Priority for Whitelabel Fork

### Critical Path (Must Have)

1. **Core Platform** (Phases 1-5) - Foundation
2. **Notifications** (Phase 6) - Team communication
3. **File Management** (Phase 7) - Brief attachments
4. **API Layer** (Phase 11) - External integrations

### High Value (Should Have)

5. **Client Portal** (Phase 10) - Client self-service
6. **Slack Integration** (Phase 9) - Team workflow

### Nice to Have

7. **Analytics** (Phase 8) - Reporting and insights

---

## AI-Ready Architecture

Every phase is designed for future AI agent deployment:

| Phase | AI Capability |
|-------|---------------|
| Phase 5 | Brief quality scoring, time estimation |
| Phase 6 | Smart notification bundling, priority detection |
| Phase 7 | Document OCR, auto-tagging, duplicate detection |
| Phase 8 | Trend analysis, forecasting, anomaly detection |
| Phase 9 | Natural language commands, smart responses |
| Phase 10 | Client chatbot, brief assistant |
| Phase 11 | Workflow automation triggers |

---

## Next Steps for Whitelabel Fork

1. **Fork repository** to clean production branch
2. **Remove tenant-specific data** (TeamLMTD references)
3. **Create generic seed data** for demo/testing
4. **Document onboarding process** for new tenants
5. **Build admin UI** for tenant configuration
6. **Set up CI/CD** for multi-tenant deployments

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Source: TeamLMTD ERP Staging*
