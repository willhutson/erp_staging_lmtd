# TeamLMTD ERP Platform

## Technical Architecture

**Version:** 2.0 | **Development:** Claude Code

---

## 1. Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 | Framework (App Router) |
| TypeScript | 5.x | Language (strict mode) |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Component library |
| Zustand | 4.x | Global state |
| TanStack Query | 5.x | Server state |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Validation |
| @dnd-kit/core | 6.x | Drag and drop |
| Recharts | 2.x | Charts |

### Backend

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | API endpoints |
| Prisma | ORM with migrations |
| PostgreSQL | Database |
| NextAuth.js v5 | Authentication |
| Cloudflare R2 | File storage |
| Inngest | Background jobs |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting (Dubai region) |
| Supabase | Managed PostgreSQL + Realtime |
| Sentry | Error monitoring |

---

## 2. Project Structure

```
teamlmtd-erp/
├── CLAUDE.md                    # Root development instructions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # LMTD seed data
│
├── config/
│   ├── tenants/
│   │   └── lmtd.config.ts      # LMTD configuration
│   ├── forms/
│   │   ├── video-shoot.form.ts
│   │   ├── video-edit.form.ts
│   │   ├── design.form.ts
│   │   ├── copywriting-en.form.ts
│   │   ├── copywriting-ar.form.ts
│   │   ├── paid-media.form.ts
│   │   └── rfp.form.ts
│   ├── workflows/
│   │   ├── brief.workflow.ts
│   │   └── rfp.workflow.ts
│   └── permissions.config.ts
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── briefs/
│   │   │   ├── resources/
│   │   │   ├── time/
│   │   │   ├── clients/
│   │   │   ├── rfp/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── portal/             # Client portal
│   │   │   └── [clientSlug]/
│   │   └── api/
│   │       ├── auth/
│   │       ├── briefs/
│   │       ├── resources/
│   │       └── webhooks/
│   │
│   ├── modules/                # Feature modules
│   │   ├── briefs/
│   │   │   ├── CLAUDE.md
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── actions/
│   │   │   └── types.ts
│   │   ├── resources/
│   │   ├── time-tracking/
│   │   ├── rfp/
│   │   └── integrations/
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── layout/
│   │   └── forms/
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   ├── config.ts
│   │   ├── permissions.ts
│   │   └── utils.ts
│   │
│   └── types/
│       ├── index.ts
│       ├── forms.ts
│       └── workflows.ts
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 3. Database Schema

### Core Entities

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════
// MULTI-TENANCY
// ═══════════════════════════════════════════════════════════

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique  // "lmtd"
  domain      String?  // "teamlmtd.com"
  configKey   String   @default("default")
  logo        String?
  settings    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
  clients     Client[]
  briefs      Brief[]
  projects    Project[]
  timeEntries TimeEntry[]
  rfps        RFP[]

  @@map("organizations")
}

// ═══════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════

model User {
  id              String          @id @default(cuid())
  organizationId  String
  email           String
  name            String
  role            String          // "Graphic Designer"
  department      String          // "Creative & Design"
  permissionLevel PermissionLevel @default(STAFF)
  isFreelancer    Boolean         @default(false)
  avatarUrl       String?
  weeklyCapacity  Int             @default(40)
  hourlyRate      Decimal?        @db.Decimal(10, 2)
  skills          String[]        @default([])
  teamLeadId      String?
  isActive        Boolean         @default(true)
  contractEnd     DateTime?
  notes           String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  teamLead       User?        @relation("TeamMembers", fields: [teamLeadId], references: [id])
  teamMembers    User[]       @relation("TeamMembers")
  briefsCreated  Brief[]      @relation("BriefCreator")
  briefsAssigned Brief[]      @relation("BriefAssignee")
  timeEntries    TimeEntry[]
  comments       Comment[]

  @@unique([organizationId, email])
  @@index([organizationId])
  @@index([department])
  @@map("users")
}

enum PermissionLevel {
  ADMIN
  LEADERSHIP
  TEAM_LEAD
  STAFF
  FREELANCER
  CLIENT
}

// ═══════════════════════════════════════════════════════════
// CLIENTS & PROJECTS
// ═══════════════════════════════════════════════════════════

model Client {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  code           String   // "CCAD", "DET"
  industry       String?
  isRetainer     Boolean  @default(false)
  retainerHours  Int?
  contactName    String?
  contactEmail   String?
  logoUrl        String?
  color          String?  // For UI coding
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  projects     Project[]
  briefs       Brief[]

  @@unique([organizationId, code])
  @@index([organizationId])
  @@map("clients")
}

model Project {
  id             String        @id @default(cuid())
  organizationId String
  clientId       String
  name           String
  code           String?
  type           ProjectType   @default(PROJECT)
  status         ProjectStatus @default(ACTIVE)
  startDate      DateTime?
  endDate        DateTime?
  budgetHours    Int?
  budgetAmount   Decimal?      @db.Decimal(12, 2)
  description    String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  client       Client       @relation(fields: [clientId], references: [id])
  briefs       Brief[]
  timeEntries  TimeEntry[]

  @@index([organizationId])
  @@index([clientId])
  @@map("projects")
}

enum ProjectType {
  RETAINER
  PROJECT
  PITCH
  INTERNAL
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

// ═══════════════════════════════════════════════════════════
// BRIEFS
// ═══════════════════════════════════════════════════════════

model Brief {
  id             String      @id @default(cuid())
  organizationId String
  clientId       String
  projectId      String?
  briefNumber    String      // "LMTD-2024-001"
  type           BriefType
  title          String      // "Shoot: CCAD - Talking Heads"
  status         BriefStatus @default(DRAFT)
  priority       Priority    @default(MEDIUM)
  createdById    String
  assigneeId     String?
  deadline       DateTime?
  startDate      DateTime?
  endDate        DateTime?
  formData       Json        @default("{}")
  qualityScore   Int?        // 0-100
  aiSuggestions  Json?
  estimatedHours Decimal?    @db.Decimal(6, 2)
  actualHours    Decimal?    @db.Decimal(6, 2)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  submittedAt    DateTime?
  completedAt    DateTime?

  organization  Organization         @relation(fields: [organizationId], references: [id])
  client        Client               @relation(fields: [clientId], references: [id])
  project       Project?             @relation(fields: [projectId], references: [id])
  createdBy     User                 @relation("BriefCreator", fields: [createdById], references: [id])
  assignee      User?                @relation("BriefAssignee", fields: [assigneeId], references: [id])
  timeEntries   TimeEntry[]
  comments      Comment[]
  attachments   Attachment[]
  statusHistory BriefStatusHistory[]

  @@index([organizationId])
  @@index([clientId])
  @@index([assigneeId])
  @@index([status])
  @@index([type])
  @@map("briefs")
}

enum BriefType {
  VIDEO_SHOOT
  VIDEO_EDIT
  DESIGN
  COPYWRITING_EN
  COPYWRITING_AR
  PAID_MEDIA
  REPORT
}

enum BriefStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  IN_PROGRESS
  INTERNAL_REVIEW
  CLIENT_REVIEW
  REVISIONS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model BriefStatusHistory {
  id          String       @id @default(cuid())
  briefId     String
  fromStatus  BriefStatus?
  toStatus    BriefStatus
  changedById String
  notes       String?
  createdAt   DateTime     @default(now())

  brief Brief @relation(fields: [briefId], references: [id], onDelete: Cascade)

  @@index([briefId])
  @@map("brief_status_history")
}

// ═══════════════════════════════════════════════════════════
// TIME TRACKING
// ═══════════════════════════════════════════════════════════

model TimeEntry {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  briefId        String?
  projectId      String?
  description    String?
  date           DateTime @db.Date
  hours          Decimal  @db.Decimal(5, 2)
  startTime      DateTime?
  endTime        DateTime?
  isRunning      Boolean  @default(false)
  isBillable     Boolean  @default(true)
  isApproved     Boolean  @default(false)
  approvedById   String?
  approvedAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])
  brief        Brief?       @relation(fields: [briefId], references: [id])
  project      Project?     @relation(fields: [projectId], references: [id])

  @@index([organizationId])
  @@index([userId])
  @@index([briefId])
  @@index([date])
  @@map("time_entries")
}

// ═══════════════════════════════════════════════════════════
// RFP MANAGEMENT
// ═══════════════════════════════════════════════════════════

model RFP {
  id              String          @id @default(cuid())
  organizationId  String
  name            String          // "RFP – Dubai South"
  clientName      String
  rfpCode         String?
  portal          String?
  status          RFPStatus       @default(VETTING)
  winProbability  WinProbability?
  dateReceived    DateTime?
  deadline        DateTime
  estimatedValue  Decimal?        @db.Decimal(12, 2)
  scopeOfWork     String?         @db.Text
  requirements    String?         @db.Text
  bidBondRequired Boolean         @default(false)
  notes           String?         @db.Text
  outcome         RFPOutcome?
  outcomeNotes    String?
  createdById     String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  submittedAt     DateTime?

  organization Organization @relation(fields: [organizationId], references: [id])
  subitems     RFPSubitem[]
  attachments  Attachment[]

  @@index([organizationId])
  @@index([status])
  @@map("rfps")
}

enum RFPStatus {
  VETTING
  ACTIVE
  AWAITING_REVIEW
  READY_TO_SUBMIT
  SUBMITTED
  AWAITING_RESPONSE
  WON
  LOST
  ABANDONED
}

enum WinProbability {
  LOW
  MEDIUM
  HIGH
}

enum RFPOutcome {
  WON
  LOST
  WITHDRAWN
  CANCELLED
}

model RFPSubitem {
  id          String        @id @default(cuid())
  rfpId       String
  name        String
  description String?
  assigneeId  String?
  dueDate     DateTime?
  status      SubitemStatus @default(PENDING)
  sortOrder   Int           @default(0)
  completedAt DateTime?

  rfp RFP @relation(fields: [rfpId], references: [id], onDelete: Cascade)

  @@index([rfpId])
  @@map("rfp_subitems")
}

enum SubitemStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  BLOCKED
}

// ═══════════════════════════════════════════════════════════
// SUPPORTING TABLES
// ═══════════════════════════════════════════════════════════

model Comment {
  id        String   @id @default(cuid())
  briefId   String
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  brief Brief @relation(fields: [briefId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@index([briefId])
  @@map("comments")
}

model Attachment {
  id           String   @id @default(cuid())
  briefId      String?
  rfpId        String?
  fileName     String
  fileSize     Int
  mimeType     String
  storageKey   String
  uploadedById String
  createdAt    DateTime @default(now())

  brief Brief? @relation(fields: [briefId], references: [id], onDelete: Cascade)
  rfp   RFP?   @relation(fields: [rfpId], references: [id], onDelete: Cascade)

  @@index([briefId])
  @@index([rfpId])
  @@map("attachments")
}

model Integration {
  id             String   @id @default(cuid())
  organizationId String
  provider       String   // "slack", "google", "meta"
  isEnabled      Boolean  @default(false)
  credentials    Json?
  settings       Json     @default("{}")
  lastSyncAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([organizationId, provider])
  @@map("integrations")
}

model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?
  action         String   // "brief.created"
  entityType     String   // "brief"
  entityId       String
  changes        Json?
  ipAddress      String?
  createdAt      DateTime @default(now())

  @@index([organizationId])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

---

## 4. Configuration System

### Tenant Configuration

```typescript
// config/tenants/lmtd.config.ts

import { TenantConfig } from '@/types/config';

export const lmtdConfig: TenantConfig = {
  id: 'lmtd',
  name: 'TeamLMTD',
  domain: 'teamlmtd.com',
  
  branding: {
    primaryColor: '#52EDC7',
    primaryDark: '#1BA098',
    logo: '/logos/teamlmtd.svg',
    favicon: '/favicons/teamlmtd.ico',
  },
  
  features: {
    briefing: true,
    resourcePlanning: true,
    timeTracking: true,
    clientPortal: true,
    rfpManagement: true,
    analytics: true,
    integrations: {
      slack: true,
      google: true,
      meta: true,
    },
  },
  
  briefTypes: [
    'VIDEO_SHOOT',
    'VIDEO_EDIT', 
    'DESIGN',
    'COPYWRITING_EN',
    'COPYWRITING_AR',
    'PAID_MEDIA',
    'REPORT',
  ],
  
  departments: [
    'Creative & Design',
    'Video Production',
    'Client Servicing',
    'HR & Operations',
    'OCM',
    'Paid Media',
    'Copywriting',
    'Management',
  ],
  
  defaults: {
    weeklyCapacity: 40,
    billableTarget: 0.8,
    currency: 'AED',
    timezone: 'Asia/Dubai',
    dateFormat: 'DD MMM YYYY',
  },
};
```

### Type Definitions

```typescript
// src/types/config.ts

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  branding: BrandingConfig;
  features: FeatureFlags;
  briefTypes: BriefType[];
  departments: string[];
  defaults: DefaultsConfig;
}

export interface FormConfig {
  id: string;
  name: string;
  namingConvention: string;
  example: string;
  slackCommand?: string;
  sections: FormSection[];
  qualityRules: QualityRule[];
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
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
  filter?: Record<string, any>;
  validation?: ValidationRule;
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'date-range'
  | 'user-select'
  | 'client-select'
  | 'file-upload'
  | 'url'
  | 'number';
```

---

## 5. CLAUDE.md Instructions

### Root CLAUDE.md

```markdown
# CLAUDE.md - TeamLMTD ERP Platform

## Project Overview
Multi-tenant ERP for professional services agencies.
LMTD is the primary (and currently only) tenant.
Built with Next.js 14, TypeScript, Prisma, PostgreSQL.

## Core Principles
1. **Config-driven**: Tenant behavior in /config, never hardcoded
2. **Type-safe**: TypeScript strict mode, no `any` types
3. **Module isolation**: Each feature in /src/modules with own CLAUDE.md
4. **Server-first**: Server Components and Server Actions by default
5. **Multi-tenant**: Always include organizationId in queries

## Before Starting Any Task
1. Read this file
2. Read the module's CLAUDE.md (if exists)
3. Check /config for tenant-specific settings
4. Review Prisma schema for data models
5. Look at existing patterns in similar code

## File Conventions
- Pages: /src/app/(dashboard)/[feature]/page.tsx
- Components: /src/modules/[feature]/components/
- Server Actions: /src/modules/[feature]/actions/
- Types: /src/modules/[feature]/types.ts
- Shared UI: /src/components/ui/ (shadcn)

## Database Query Pattern
ALWAYS filter by organizationId:
```typescript
const briefs = await db.brief.findMany({
  where: { 
    organizationId: session.user.organizationId,
    // other filters
  },
});
```

## Permission Check Pattern
```typescript
import { can } from '@/lib/permissions';

if (!can(user, 'brief:create')) {
  throw new Error('Unauthorized');
}
```

## Form Handling Pattern
```typescript
// Use Zod schema generated from form config
const schema = generateZodSchema(formConfig);

// Use react-hook-form with zodResolver
const form = useForm({ 
  resolver: zodResolver(schema) 
});
```

## Don't
- Hardcode tenant-specific values
- Skip TypeScript types
- Use client components unnecessarily
- Forget organizationId in database queries
- Bypass permission checks
```

---

## 6. Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm db:push               # Push schema changes
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed LMTD data
pnpm db:studio             # Open Prisma Studio

# Testing
pnpm test                  # Run unit tests
pnpm test:integration      # Run integration tests
pnpm test:e2e              # Run E2E tests

# Production
pnpm build                 # Build for production
pnpm start                 # Start production server

# Code Quality
pnpm lint                  # Run ESLint
pnpm format                # Run Prettier
pnpm typecheck             # Run TypeScript check
```

---

## 7. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://app.teamlmtd.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Storage
S3_BUCKET="teamlmtd-uploads"
S3_REGION="me-south-1"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."

# Integrations
SLACK_BOT_TOKEN="xoxb-..."
SLACK_SIGNING_SECRET="..."

# Optional
SENTRY_DSN="..."
```

---

*Next: 03_Briefing_System.md*
