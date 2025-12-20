# SpokeStack Platform Roadmap - Phases 5-10

**Version:** 1.0
**Date:** December 2024
**Author:** Will Hutson / Claude
**Status:** Draft - Pending Approval
**Target Client:** Fast-growing digital/social agency consolidating workflows

---

## Executive Summary

This document outlines the next six development phases to mature SpokeStack from a functional ERP into an AI-ready, enterprise-grade platform. These phases focus on:

1. **Workflow Automation** - Connecting forms to business processes
2. **Communication** - Keeping teams and clients informed
3. **Asset Management** - Centralizing files and documents
4. **Intelligence** - Turning data into insights
5. **Integration** - Connecting to external tools
6. **Client Experience** - Empowering client self-service

### Strategic Vision: AI-Ready Architecture

Every phase is designed with AI agent deployment in mind:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI AGENT READINESS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 5: Form Submission    → Structured data for AI brief analysis        │
│  PHASE 6: Notifications      → AI can trigger/respond to notifications      │
│  PHASE 7: File Management    → AI can index/search/categorize documents     │
│  PHASE 8: Analytics          → AI can generate insights, predict trends     │
│  PHASE 9: Slack Integration  → AI can interact via natural language         │
│  PHASE 10: Client Portal     → AI can handle client queries, approvals      │
│                                                                              │
│  FUTURE: AI Agents for:                                                      │
│  • Brief quality review & suggestions                                        │
│  • Resource allocation recommendations                                       │
│  • Client communication drafting                                             │
│  • Time estimation from brief content                                        │
│  • RFP response generation                                                   │
│  • Invoice preparation & follow-up                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 5: Form Submission Flow

### Business Context

The visual form builder (Phase 4) created the infrastructure to define forms. Phase 5 connects these forms to actual business processes - creating briefs, tracking standalone submissions, and enabling workflow automation.

**Why This Matters for a Digital Agency:**
- Account managers can quickly submit briefs without training
- Operations can create intake forms for new processes (vendor onboarding, equipment requests)
- Forms validate data before submission, reducing back-and-forth
- Every submission creates an auditable record

### User Stories

| Role | Story |
|------|-------|
| Account Manager | I can submit a video shoot brief using the form created by admin |
| Operations | I can create a "Equipment Request" form that doesn't create a brief |
| Team Lead | I can see all submissions awaiting my review |
| Admin | I can see submission analytics per form type |

### Technical Specification

#### Database Schema

```prisma
model FormSubmission {
  id              String   @id @default(cuid())
  organizationId  String
  templateId      String

  // Submission data
  data            Json     // Form field values
  title           String?  // Auto-generated or user-provided

  // Status workflow
  status          FormSubmissionStatus @default(SUBMITTED)

  // People
  submittedById   String
  assigneeId      String?
  reviewedById    String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  reviewedAt      DateTime?
  completedAt     DateTime?

  // Relations
  template        FormTemplate @relation(fields: [templateId], references: [id])
  submittedBy     User         @relation("SubmissionCreator", fields: [submittedById], references: [id])
  assignee        User?        @relation("SubmissionAssignee", fields: [assigneeId], references: [id])
  reviewedBy      User?        @relation("SubmissionReviewer", fields: [reviewedById], references: [id])

  // Optional brief connection (if submissionModel = "brief")
  briefId         String?  @unique
  brief           Brief?   @relation(fields: [briefId], references: [id])

  @@index([organizationId])
  @@index([templateId])
  @@index([status])
  @@map("form_submissions")
}

enum FormSubmissionStatus {
  DRAFT           // Started but not submitted
  SUBMITTED       // Awaiting review
  IN_REVIEW       // Being reviewed
  APPROVED        // Approved, processing
  REJECTED        // Rejected with reason
  COMPLETED       // Finished
  CANCELLED       // Cancelled by submitter
}

// Extend FormTemplate with workflow settings
model FormTemplate {
  // ... existing fields

  // Workflow settings
  workflowSettings Json @default("{}")
  // Structure:
  // {
  //   requiresApproval: boolean,
  //   approverRoles: string[],      // ["TEAM_LEAD", "ADMIN"]
  //   autoAssignTo: string | null,  // User ID or role
  //   notifyOnSubmit: string[],     // Email/Slack targets
  //   createBriefOnApproval: boolean,
  //   briefDefaults: {
  //     priority: string,
  //     assigneeField: string,      // Which form field contains assignee
  //     clientField: string,        // Which form field contains client
  //   }
  // }
}
```

#### API Endpoints / Server Actions

```typescript
// src/modules/forms/actions/form-submission-actions.ts

// Create a new submission (or save draft)
export async function createFormSubmission(data: {
  templateId: string;
  formData: Record<string, unknown>;
  isDraft?: boolean;
}): Promise<FormSubmission>

// Update submission (draft or add info)
export async function updateFormSubmission(
  id: string,
  data: Partial<FormSubmission>
): Promise<FormSubmission>

// Submit for review
export async function submitForReview(id: string): Promise<FormSubmission>

// Approve submission (optionally creates brief)
export async function approveSubmission(
  id: string,
  notes?: string
): Promise<{ submission: FormSubmission; brief?: Brief }>

// Reject submission
export async function rejectSubmission(
  id: string,
  reason: string
): Promise<FormSubmission>

// Get submissions (filtered)
export async function getFormSubmissions(filters: {
  templateId?: string;
  status?: FormSubmissionStatus[];
  submittedById?: string;
  assigneeId?: string;
  dateRange?: { start: Date; end: Date };
}): Promise<FormSubmission[]>
```

#### UI Components

| Component | Path | Description |
|-----------|------|-------------|
| DynamicFormPage | `/forms/[type]/page.tsx` | Renders form from template |
| FormRenderer | `modules/forms/components/FormRenderer.tsx` | Dynamic field rendering |
| SubmissionList | `modules/forms/components/SubmissionList.tsx` | List/filter submissions |
| SubmissionDetail | `/forms/submissions/[id]/page.tsx` | View/review submission |
| ReviewQueue | `/submissions/page.tsx` | All pending reviews |

#### Brief Creation Flow

```typescript
// When form has submissionModel = "brief" and is approved
async function createBriefFromSubmission(submission: FormSubmission) {
  const template = await getFormTemplate(submission.templateId);
  const config = template.workflowSettings;

  // Extract values from form data using field mappings
  const clientId = submission.data[config.briefDefaults.clientField];
  const assigneeId = submission.data[config.briefDefaults.assigneeField];

  // Generate brief title using naming convention
  const title = generateBriefTitle(template.namingConvention, submission.data);

  // Create the brief
  const brief = await db.brief.create({
    data: {
      organizationId: submission.organizationId,
      type: template.type as BriefType,
      title,
      clientId,
      assigneeId,
      status: 'APPROVED',
      priority: config.briefDefaults.priority || 'MEDIUM',
      formData: submission.data,
      createdById: submission.submittedById,
    },
  });

  // Link submission to brief
  await db.formSubmission.update({
    where: { id: submission.id },
    data: { briefId: brief.id },
  });

  return brief;
}
```

### AI Agent Integration Points

| Integration | Description |
|-------------|-------------|
| Quality Scoring | AI reviews submission completeness, suggests improvements |
| Auto-categorization | AI suggests appropriate template based on free-text input |
| Data Extraction | AI extracts structured data from uploaded documents |
| Time Estimation | AI estimates hours based on brief scope |
| Similar Work Finder | AI finds similar past briefs for reference |

---

## Phase 6: Notifications System

### Business Context

A growing agency needs proactive communication to prevent bottlenecks. Notifications ensure the right people know about important events at the right time.

**Why This Matters:**
- Deadlines aren't missed due to lack of awareness
- Approvals don't sit in queues
- Team members know when work is assigned
- Clients feel informed about progress

### User Stories

| Role | Story |
|------|-------|
| Team Member | I get notified when a brief is assigned to me |
| Team Lead | I get notified when briefs in my team are overdue |
| Account Manager | I get notified when client feedback is received |
| Admin | I can configure which events trigger notifications |
| Everyone | I can set my notification preferences (email, in-app, Slack) |

### Technical Specification

#### Database Schema

```prisma
model Notification {
  id              String   @id @default(cuid())
  organizationId  String
  userId          String   // Recipient

  // Content
  type            NotificationType
  title           String
  body            String?
  actionUrl       String?  // Where to go when clicked

  // Related entities
  entityType      String?  // "brief", "submission", "rfp", etc.
  entityId        String?

  // Status
  isRead          Boolean  @default(false)
  readAt          DateTime?

  // Delivery tracking
  channels        String[] @default(["in_app"]) // ["in_app", "email", "slack"]
  emailSentAt     DateTime?
  slackSentAt     DateTime?

  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
  @@index([organizationId])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType {
  // Briefs
  BRIEF_ASSIGNED
  BRIEF_STATUS_CHANGED
  BRIEF_DEADLINE_APPROACHING
  BRIEF_OVERDUE
  BRIEF_COMMENT
  BRIEF_FEEDBACK

  // Submissions
  SUBMISSION_RECEIVED
  SUBMISSION_APPROVED
  SUBMISSION_REJECTED
  SUBMISSION_NEEDS_REVIEW

  // Time
  TIMESHEET_REMINDER
  TIMESHEET_APPROVED
  TIMESHEET_REJECTED

  // RFP
  RFP_DEADLINE_APPROACHING
  RFP_STATUS_CHANGED
  RFP_WON
  RFP_LOST

  // Pipeline
  DEAL_STAGE_CHANGED
  DEAL_WON
  DEAL_LOST

  // System
  SYSTEM_ANNOUNCEMENT
  MENTION
}

model NotificationPreference {
  id              String   @id @default(cuid())
  userId          String   @unique

  // Per-type preferences
  preferences     Json     @default("{}")
  // Structure:
  // {
  //   "BRIEF_ASSIGNED": { inApp: true, email: true, slack: true },
  //   "BRIEF_DEADLINE_APPROACHING": { inApp: true, email: false, slack: true },
  //   ...
  // }

  // Global settings
  emailDigestFrequency String @default("instant") // instant, daily, weekly, none
  quietHoursStart      String? // "22:00"
  quietHoursEnd        String? // "08:00"
  timezone             String  @default("Asia/Dubai")

  user            User     @relation(fields: [userId], references: [id])

  @@map("notification_preferences")
}
```

#### Notification Service Architecture

```typescript
// src/lib/notifications/notification-service.ts

interface NotificationPayload {
  type: NotificationType;
  recipientId: string;
  title: string;
  body?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  // Create and dispatch notification
  async send(payload: NotificationPayload): Promise<Notification> {
    // 1. Get user preferences
    const prefs = await this.getUserPreferences(payload.recipientId);

    // 2. Determine channels based on preferences
    const channels = this.getChannels(payload.type, prefs);

    // 3. Create notification record
    const notification = await db.notification.create({
      data: {
        ...payload,
        channels,
      },
    });

    // 4. Dispatch to each channel
    await Promise.all([
      channels.includes('email') && this.sendEmail(notification),
      channels.includes('slack') && this.sendSlack(notification),
    ]);

    return notification;
  }

  // Batch send (e.g., deadline reminders)
  async sendBatch(payloads: NotificationPayload[]): Promise<void>

  // Mark as read
  async markAsRead(notificationId: string, userId: string): Promise<void>

  // Mark all as read
  async markAllAsRead(userId: string): Promise<void>

  // Get unread count
  async getUnreadCount(userId: string): Promise<number>

  // Get notifications (paginated)
  async getNotifications(userId: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<Notification[]>
}
```

#### Scheduled Notification Jobs

```typescript
// src/jobs/notification-jobs.ts

// Run daily at 8 AM local time
async function sendDeadlineReminders() {
  const tomorrow = addDays(new Date(), 1);

  const briefs = await db.brief.findMany({
    where: {
      deadline: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      assigneeId: { not: null },
    },
  });

  for (const brief of briefs) {
    await notificationService.send({
      type: 'BRIEF_DEADLINE_APPROACHING',
      recipientId: brief.assigneeId!,
      title: 'Brief due tomorrow',
      body: brief.title,
      actionUrl: `/briefs/${brief.id}`,
      entityType: 'brief',
      entityId: brief.id,
    });
  }
}

// Run every Friday at 4 PM
async function sendTimesheetReminders() {
  // Find users who haven't logged 40 hours this week
  // Send reminder notifications
}
```

#### UI Components

| Component | Description |
|-----------|-------------|
| NotificationBell | Header icon with unread count badge |
| NotificationDropdown | Recent notifications list |
| NotificationList | Full page list with filters |
| PreferencesForm | User preference settings |
| AdminNotificationSettings | Organization-wide defaults |

### AI Agent Integration Points

| Integration | Description |
|-------------|-------------|
| Smart Bundling | AI groups related notifications to reduce noise |
| Priority Detection | AI escalates urgent notifications |
| Content Generation | AI writes notification copy |
| Timing Optimization | AI learns best times to notify each user |

---

## Phase 7: File & Document Management

### Business Context

Creative agencies produce and consume thousands of files - briefs, assets, deliverables, contracts. A centralized system prevents lost work and enables AI indexing.

**Why This Matters:**
- No more "I can't find the file" - everything searchable
- Version control prevents confusion
- Clients can access their assets
- AI can analyze document content

### User Stories

| Role | Story |
|------|-------|
| Designer | I can upload deliverables and link them to briefs |
| Account Manager | I can find all assets for a client quickly |
| Team Lead | I can see who uploaded what and when |
| Client | I can access approved deliverables in the portal |
| Admin | I can set storage quotas and retention policies |

### Technical Specification

#### Database Schema

```prisma
model File {
  id              String   @id @default(cuid())
  organizationId  String

  // File metadata
  name            String
  originalName    String
  mimeType        String
  size            Int      // bytes
  extension       String?

  // Storage
  storageKey      String   // S3/R2 key
  storageProvider String   @default("r2") // "r2", "s3"
  publicUrl       String?  // CDN URL if public

  // Thumbnails
  thumbnailKey    String?
  thumbnailUrl    String?

  // Classification
  category        FileCategory @default(OTHER)
  tags            String[]     @default([])

  // AI processing
  aiProcessed     Boolean  @default(false)
  aiMetadata      Json?    // Extracted text, labels, etc.

  // Ownership
  uploadedById    String

  // Soft delete
  isArchived      Boolean  @default(false)
  archivedAt      DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  uploadedBy      User     @relation(fields: [uploadedById], references: [id])

  // Polymorphic relations
  briefFiles      BriefFile[]
  clientFiles     ClientFile[]
  projectFiles    ProjectFile[]

  @@index([organizationId])
  @@index([category])
  @@index([uploadedById])
  @@map("files")
}

enum FileCategory {
  BRIEF_ATTACHMENT   // Reference materials for briefs
  DELIVERABLE        // Completed work
  CONTRACT           // Legal documents
  BRAND_ASSET        // Logos, fonts, brand guides
  REFERENCE          // Inspiration, moodboards
  INVOICE            // Financial documents
  OTHER
}

// Junction tables for relationships
model BriefFile {
  briefId   String
  fileId    String
  role      String   @default("attachment") // "attachment", "deliverable", "reference"
  addedAt   DateTime @default(now())

  brief     Brief    @relation(fields: [briefId], references: [id], onDelete: Cascade)
  file      File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@id([briefId, fileId])
  @@map("brief_files")
}

model ClientFile {
  clientId  String
  fileId    String
  role      String   @default("asset") // "asset", "contract", "brand"
  addedAt   DateTime @default(now())

  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  file      File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@id([clientId, fileId])
  @@map("client_files")
}

// Folder structure (optional organization)
model Folder {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  parentId        String?
  path            String   // "/clients/CCAD/brand-assets"

  parent          Folder?  @relation("FolderHierarchy", fields: [parentId], references: [id])
  children        Folder[] @relation("FolderHierarchy")

  @@unique([organizationId, path])
  @@map("folders")
}
```

#### File Service Architecture

```typescript
// src/lib/files/file-service.ts

interface UploadOptions {
  file: File | Buffer;
  name: string;
  category: FileCategory;
  tags?: string[];
  folder?: string;

  // Link to entity
  linkTo?: {
    briefId?: string;
    clientId?: string;
    projectId?: string;
    role?: string;
  };
}

class FileService {
  // Upload file to storage
  async upload(options: UploadOptions): Promise<FileRecord> {
    // 1. Generate storage key
    const key = this.generateKey(options);

    // 2. Upload to R2/S3
    const url = await this.storage.upload(key, options.file);

    // 3. Generate thumbnail (if image/video)
    const thumbnail = await this.generateThumbnail(options.file);

    // 4. Create database record
    const fileRecord = await db.file.create({
      data: {
        name: options.name,
        storageKey: key,
        publicUrl: url,
        thumbnailUrl: thumbnail?.url,
        category: options.category,
        tags: options.tags,
        // ... other fields
      },
    });

    // 5. Create link if specified
    if (options.linkTo?.briefId) {
      await db.briefFile.create({
        data: {
          briefId: options.linkTo.briefId,
          fileId: fileRecord.id,
          role: options.linkTo.role || 'attachment',
        },
      });
    }

    // 6. Queue AI processing
    await this.queueAiProcessing(fileRecord.id);

    return fileRecord;
  }

  // Get signed download URL
  async getDownloadUrl(fileId: string): Promise<string>

  // Search files
  async search(query: {
    text?: string;
    category?: FileCategory;
    clientId?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
  }): Promise<FileRecord[]>

  // Archive file
  async archive(fileId: string): Promise<void>

  // Bulk operations
  async bulkTag(fileIds: string[], tags: string[]): Promise<void>
  async bulkMove(fileIds: string[], folderId: string): Promise<void>
}
```

#### AI Processing Pipeline

```typescript
// src/jobs/file-ai-processing.ts

async function processFileWithAI(fileId: string) {
  const file = await db.file.findUnique({ where: { id: fileId } });

  const aiMetadata: Record<string, unknown> = {};

  // Text extraction for documents
  if (file.mimeType.includes('pdf') || file.mimeType.includes('document')) {
    aiMetadata.extractedText = await extractText(file.storageKey);
    aiMetadata.summary = await generateSummary(aiMetadata.extractedText);
  }

  // Image analysis
  if (file.mimeType.includes('image')) {
    aiMetadata.labels = await detectLabels(file.storageKey);
    aiMetadata.colors = await extractColors(file.storageKey);
    aiMetadata.description = await describeImage(file.storageKey);
  }

  // Video analysis
  if (file.mimeType.includes('video')) {
    aiMetadata.duration = await getVideoDuration(file.storageKey);
    aiMetadata.keyFrames = await extractKeyFrames(file.storageKey);
  }

  await db.file.update({
    where: { id: fileId },
    data: {
      aiProcessed: true,
      aiMetadata,
    },
  });
}
```

#### UI Components

| Component | Description |
|-----------|-------------|
| FileUploader | Drag-drop upload with progress |
| FileGallery | Grid/list view of files |
| FilePreview | Modal preview for images/PDFs |
| FolderTree | Hierarchical navigation |
| FileSearch | Full-text and metadata search |
| BulkActions | Multi-select operations |

### AI Agent Integration Points

| Integration | Description |
|-------------|-------------|
| Content Extraction | OCR, speech-to-text for searchability |
| Auto-tagging | AI suggests tags based on content |
| Duplicate Detection | Find similar/duplicate files |
| Brand Compliance | Check assets against brand guidelines |
| Asset Recommendations | Suggest relevant assets for briefs |

---

## Phase 8: Reporting & Analytics

### Business Context

Data-driven decisions require visibility into operations. Analytics help identify bottlenecks, track performance, and demonstrate value to clients.

**Why This Matters:**
- Leadership can spot issues before they escalate
- Team leads can balance workloads
- Account managers can show clients their investment value
- Finance can track profitability

### User Stories

| Role | Story |
|------|-------|
| Leadership | I can see agency-wide utilization and revenue metrics |
| Team Lead | I can see my team's performance and workload balance |
| Account Manager | I can generate client reports showing work delivered |
| Finance | I can see billable vs non-billable time breakdown |
| Admin | I can schedule automated report delivery |

### Technical Specification

#### Dashboard Widgets (Real Data)

```typescript
// src/modules/analytics/widgets/index.ts

interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  dataFetcher: () => Promise<unknown>;
  refreshInterval?: number; // minutes
  sizes: ('1x1' | '2x1' | '2x2' | '3x1')[];
  requiredPermissions: PermissionLevel[];
}

const widgets: WidgetConfig[] = [
  {
    id: 'team-utilization',
    name: 'Team Utilization',
    description: 'Billable hours vs capacity',
    component: TeamUtilizationWidget,
    dataFetcher: fetchTeamUtilization,
    refreshInterval: 60,
    sizes: ['2x1', '2x2'],
    requiredPermissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD'],
  },
  {
    id: 'brief-turnaround',
    name: 'Brief Turnaround',
    description: 'Average time from submission to completion',
    component: BriefTurnaroundWidget,
    dataFetcher: fetchBriefTurnaround,
    sizes: ['2x1'],
    requiredPermissions: ['ADMIN', 'LEADERSHIP'],
  },
  {
    id: 'client-hours',
    name: 'Client Hours',
    description: 'Hours logged per client',
    component: ClientHoursWidget,
    dataFetcher: fetchClientHours,
    sizes: ['2x2', '3x1'],
    requiredPermissions: ['ADMIN', 'LEADERSHIP', 'TEAM_LEAD'],
  },
  // ... more widgets
];
```

#### Report Types

```prisma
model Report {
  id              String   @id @default(cuid())
  organizationId  String

  // Report definition
  name            String
  type            ReportType
  config          Json     // Filters, groupings, columns

  // Scheduling
  schedule        String?  // Cron expression
  recipients      String[] // Email addresses
  lastRunAt       DateTime?
  nextRunAt       DateTime?

  // Output
  format          String   @default("pdf") // pdf, excel, csv

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  createdBy       User     @relation(fields: [createdById], references: [id])

  @@map("reports")
}

enum ReportType {
  // Time reports
  TIMESHEET_SUMMARY
  BILLABLE_HOURS
  UTILIZATION

  // Brief reports
  BRIEF_STATUS
  BRIEF_TURNAROUND
  BRIEF_BY_TYPE

  // Client reports
  CLIENT_ACTIVITY
  CLIENT_HOURS
  CLIENT_PROFITABILITY

  // Pipeline reports
  PIPELINE_SUMMARY
  WIN_LOSS_ANALYSIS
  FORECAST

  // Custom
  CUSTOM
}
```

#### Analytics Queries

```typescript
// src/modules/analytics/queries/index.ts

// Team utilization
async function getTeamUtilization(options: {
  dateRange: { start: Date; end: Date };
  departmentId?: string;
}): Promise<{
  userId: string;
  name: string;
  capacity: number;
  logged: number;
  billable: number;
  utilization: number;
}[]>

// Brief metrics
async function getBriefMetrics(options: {
  dateRange: { start: Date; end: Date };
  clientId?: string;
  type?: BriefType;
}): Promise<{
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  avgTurnaround: number; // days
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}>

// Client profitability
async function getClientProfitability(options: {
  dateRange: { start: Date; end: Date };
  clientId?: string;
}): Promise<{
  clientId: string;
  clientName: string;
  revenue: number;
  hours: number;
  cost: number;
  margin: number;
  marginPercent: number;
}[]>

// Pipeline forecast
async function getPipelineForecast(options: {
  monthsAhead: number;
}): Promise<{
  month: string;
  deals: number;
  weightedValue: number; // Value * probability
  expectedWins: number;
}>
```

#### Scheduled Report Generation

```typescript
// src/jobs/report-generation.ts

async function generateScheduledReports() {
  const dueReports = await db.report.findMany({
    where: {
      nextRunAt: { lte: new Date() },
      schedule: { not: null },
    },
  });

  for (const report of dueReports) {
    // 1. Fetch data based on report type and config
    const data = await fetchReportData(report.type, report.config);

    // 2. Generate output file
    const file = await generateReportFile(data, report.format);

    // 3. Send to recipients
    await sendReportEmail({
      to: report.recipients,
      subject: `${report.name} - ${format(new Date(), 'MMM d, yyyy')}`,
      attachment: file,
    });

    // 4. Update next run time
    await db.report.update({
      where: { id: report.id },
      data: {
        lastRunAt: new Date(),
        nextRunAt: getNextCronDate(report.schedule!),
      },
    });
  }
}
```

### AI Agent Integration Points

| Integration | Description |
|-------------|-------------|
| Trend Analysis | AI identifies patterns and anomalies |
| Forecasting | AI predicts future metrics |
| Natural Language | Ask questions in plain English |
| Insight Generation | AI highlights key takeaways |
| Anomaly Alerts | AI flags unusual patterns |

---

## Phase 9: Slack Integration

### Business Context

Teams live in Slack. Deep integration reduces context-switching and brings SpokeStack into the daily workflow.

**Why This Matters:**
- Submit briefs without leaving Slack
- Get real-time updates in channels
- Quick status checks via commands
- Approvals can happen in Slack

### User Stories

| Role | Story |
|------|-------|
| Account Manager | I can submit a brief using `/brief` in Slack |
| Team Member | I see a notification in #briefs when assigned work |
| Team Lead | I can approve submissions from Slack |
| Admin | I can configure which events post to which channels |

### Technical Specification

#### Slack App Features

```typescript
// Slash Commands
/brief [type]          // Open brief submission modal
/time [hours] [brief]  // Quick time log
/status                // My assigned briefs
/search [query]        // Search briefs

// Event Subscriptions
brief.created          // Post to #briefs
brief.assigned         // DM assignee
brief.completed        // Post to #briefs
brief.overdue          // Post to #briefs, DM assignee
submission.pending     // DM approvers

// Interactive Components
- Brief submission modal
- Approval buttons (Approve/Reject)
- Quick actions menu
```

#### Database Schema

```prisma
model SlackIntegration {
  id              String   @id @default(cuid())
  organizationId  String   @unique

  // OAuth tokens
  accessToken     String   // Encrypted
  botUserId       String
  teamId          String
  teamName        String

  // Configuration
  defaultChannel  String?  // #general
  channelMappings Json     @default("{}")
  // Structure:
  // {
  //   "briefs": "C1234567890",      // Channel for brief updates
  //   "rfp": "C0987654321",          // Channel for RFP updates
  //   "time": "C1111111111",         // Channel for time reminders
  // }

  // Event settings
  enabledEvents   String[] @default([])

  isActive        Boolean  @default(true)
  installedAt     DateTime @default(now())

  @@map("slack_integrations")
}

model SlackUserMapping {
  id              String   @id @default(cuid())
  organizationId  String
  userId          String   // SpokeStack user ID
  slackUserId     String   // Slack user ID

  user            User     @relation(fields: [userId], references: [id])

  @@unique([organizationId, userId])
  @@unique([organizationId, slackUserId])
  @@map("slack_user_mappings")
}
```

#### Slack Service

```typescript
// src/lib/integrations/slack/slack-service.ts

class SlackService {
  // Post message to channel
  async postMessage(options: {
    channel: string;
    text: string;
    blocks?: SlackBlock[];
    attachments?: SlackAttachment[];
  }): Promise<void>

  // Send DM to user
  async sendDirectMessage(options: {
    userId: string; // SpokeStack user ID
    text: string;
    blocks?: SlackBlock[];
  }): Promise<void>

  // Open modal
  async openModal(options: {
    triggerId: string;
    view: SlackModal;
  }): Promise<void>

  // Handle slash command
  async handleSlashCommand(command: SlackCommand): Promise<SlackResponse>

  // Handle interactive component
  async handleInteraction(interaction: SlackInteraction): Promise<void>
}
```

#### Brief Submission Modal

```typescript
// src/lib/integrations/slack/modals/brief-modal.ts

function buildBriefModal(briefType: string): SlackModal {
  const template = await getFormTemplateByType(briefType);

  return {
    type: 'modal',
    title: { type: 'plain_text', text: template.name },
    submit: { type: 'plain_text', text: 'Submit' },
    blocks: template.config.sections.flatMap(section => [
      {
        type: 'header',
        text: { type: 'plain_text', text: section.title },
      },
      ...section.fields.map(field => fieldToSlackBlock(field)),
    ]),
  };
}

function fieldToSlackBlock(field: FormField): SlackBlock {
  switch (field.type) {
    case 'text':
      return {
        type: 'input',
        block_id: field.id,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'plain_text_input',
          action_id: field.id,
          placeholder: { type: 'plain_text', text: field.placeholder || '' },
        },
        optional: !field.required,
      };
    case 'select':
      return {
        type: 'input',
        block_id: field.id,
        label: { type: 'plain_text', text: field.label },
        element: {
          type: 'static_select',
          action_id: field.id,
          options: field.options.map(opt => ({
            text: { type: 'plain_text', text: opt.label },
            value: opt.value,
          })),
        },
        optional: !field.required,
      };
    // ... other field types
  }
}
```

### AI Agent Integration Points

| Integration | Description |
|-------------|-------------|
| Natural Language Commands | "Create a video shoot brief for CCAD" |
| Smart Responses | AI answers questions about briefs |
| Summarization | AI summarizes long threads |
| Translation | Auto-translate for Arabic copy briefs |

---

## Phase 10: Client Portal Enhancement

### Business Context

Clients want visibility without constant status meetings. A self-service portal empowers them while reducing agency overhead.

**Why This Matters:**
- Clients feel in control and informed
- Fewer "what's the status?" emails
- Faster approvals = faster delivery
- Builds trust and transparency

### User Stories

| Role | Story |
|------|-------|
| Client | I can see all my active briefs and their status |
| Client | I can approve deliverables or request revisions |
| Client | I can submit new brief requests |
| Client | I can access my brand assets |
| Client | I can see reports on work delivered |
| Account Manager | I can see when clients last logged in |

### Technical Specification

#### Portal Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT PORTAL FEATURES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DASHBOARD                                                                   │
│  ├── Active briefs summary                                                   │
│  ├── Pending approvals (action required)                                     │
│  ├── Recent activity feed                                                    │
│  └── Quick stats (briefs completed this month, etc.)                         │
│                                                                              │
│  BRIEFS                                                                      │
│  ├── List all briefs (filterable by status, type, date)                      │
│  ├── Brief detail view                                                       │
│  │   ├── Status timeline                                                     │
│  │   ├── Deliverables (download, preview)                                    │
│  │   ├── Comments thread                                                     │
│  │   └── Approval actions                                                    │
│  └── Request new brief (simplified form)                                     │
│                                                                              │
│  ASSETS                                                                      │
│  ├── Brand assets (logos, fonts, guidelines)                                 │
│  ├── Delivered work archive                                                  │
│  └── Search and filter                                                       │
│                                                                              │
│  REPORTS                                                                     │
│  ├── Work summary (by month/quarter)                                         │
│  ├── Hours breakdown                                                         │
│  └── Export to PDF                                                           │
│                                                                              │
│  FEEDBACK                                                                    │
│  ├── NPS survey submissions                                                  │
│  └── General feedback form                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Database Schema

```prisma
model ClientPortalUser {
  id              String   @id @default(cuid())
  clientId        String

  // Auth
  email           String
  passwordHash    String?  // Null if magic link only

  // Profile
  name            String
  title           String?
  phone           String?
  avatarUrl       String?

  // Permissions
  canSubmitBriefs Boolean  @default(true)
  canApprove      Boolean  @default(true)
  canViewReports  Boolean  @default(false)
  canDownloadAssets Boolean @default(true)

  // Status
  isActive        Boolean  @default(true)
  lastLoginAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  client          Client   @relation(fields: [clientId], references: [id])

  @@unique([clientId, email])
  @@map("client_portal_users")
}

model ClientPortalSession {
  id              String   @id @default(cuid())
  userId          String
  token           String   @unique
  expiresAt       DateTime
  createdAt       DateTime @default(now())

  user            ClientPortalUser @relation(fields: [userId], references: [id])

  @@map("client_portal_sessions")
}

model BriefApproval {
  id              String   @id @default(cuid())
  briefId         String

  // Approval request
  requestedAt     DateTime @default(now())
  requestedById   String   // Internal user who requested

  // Response
  status          ApprovalStatus @default(PENDING)
  respondedAt     DateTime?
  respondedById   String?  // ClientPortalUser ID

  // Feedback
  feedback        String?
  revisionNotes   String?

  brief           Brief    @relation(fields: [briefId], references: [id])

  @@map("brief_approvals")
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REVISIONS_REQUESTED
  REJECTED
}
```

#### Portal Authentication

```typescript
// src/lib/portal-auth.ts

// Magic link authentication (preferred)
async function sendMagicLink(email: string): Promise<void> {
  const user = await db.clientPortalUser.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const token = generateSecureToken();
  const expiry = addHours(new Date(), 24);

  await db.clientPortalSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt: expiry,
    },
  });

  await sendEmail({
    to: email,
    subject: 'Sign in to SpokeStack Portal',
    template: 'magic-link',
    data: {
      name: user.name,
      link: `${portalUrl}/auth/verify?token=${token}`,
    },
  });
}

// Verify magic link
async function verifyMagicLink(token: string): Promise<ClientPortalUser> {
  const session = await db.clientPortalSession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid or expired link');
  }

  // Mark session as used (delete or mark)
  await db.clientPortalSession.delete({ where: { id: session.id } });

  // Update last login
  await db.clientPortalUser.update({
    where: { id: session.userId },
    data: { lastLoginAt: new Date() },
  });

  return session.user;
}
```

#### Approval Workflow

```typescript
// src/modules/portal/actions/approval-actions.ts

// Request approval from client
async function requestApproval(briefId: string): Promise<BriefApproval> {
  const brief = await db.brief.findUnique({
    where: { id: briefId },
    include: { client: { include: { portalUsers: true } } },
  });

  // Create approval request
  const approval = await db.briefApproval.create({
    data: {
      briefId,
      requestedById: session.user.id,
    },
  });

  // Update brief status
  await db.brief.update({
    where: { id: briefId },
    data: { status: 'CLIENT_REVIEW' },
  });

  // Notify client users who can approve
  const approvers = brief.client.portalUsers.filter(u => u.canApprove);
  for (const approver of approvers) {
    await sendEmail({
      to: approver.email,
      subject: `Approval Requested: ${brief.title}`,
      template: 'approval-request',
      data: {
        briefTitle: brief.title,
        approvalLink: `${portalUrl}/briefs/${briefId}`,
      },
    });
  }

  return approval;
}

// Client approves
async function approveDeliverable(
  briefId: string,
  feedback?: string
): Promise<void> {
  const approval = await db.briefApproval.findFirst({
    where: { briefId, status: 'PENDING' },
  });

  await db.briefApproval.update({
    where: { id: approval.id },
    data: {
      status: 'APPROVED',
      respondedAt: new Date(),
      respondedById: portalUser.id,
      feedback,
    },
  });

  await db.brief.update({
    where: { id: briefId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  // Notify internal team
  await notificationService.send({
    type: 'BRIEF_FEEDBACK',
    recipientId: brief.assigneeId,
    title: 'Brief approved by client',
    body: brief.title,
    actionUrl: `/briefs/${briefId}`,
  });
}

// Client requests revisions
async function requestRevisions(
  briefId: string,
  notes: string
): Promise<void> {
  // Similar to approve but sets status to REVISIONS
}
```

### AI Agent Integration Points

| Integration | Description |
|-------------|-------------|
| Client Chat Bot | AI answers common client questions |
| Brief Assistant | AI helps clients write better brief requests |
| Status Summaries | AI generates plain-language status updates |
| Approval Insights | AI highlights what needs client attention |

---

## Implementation Roadmap

### Recommended Sequence

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           IMPLEMENTATION PHASES                                │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  FOUNDATION (Complete these first)                                             │
│  ├── Phase 5: Form Submission Flow          ████████░░  [2-3 days]            │
│  └── Phase 7: File Management               ████████░░  [2-3 days]            │
│                                                                                │
│  COMMUNICATION (Depends on Foundation)                                         │
│  ├── Phase 6: Notifications                 ██████░░░░  [2 days]              │
│  └── Phase 9: Slack Integration             ██████░░░░  [2-3 days]            │
│                                                                                │
│  INSIGHTS (Depends on data from above)                                         │
│  └── Phase 8: Analytics                     ████████░░  [2-3 days]            │
│                                                                                │
│  CLIENT FACING (Final polish)                                                  │
│  └── Phase 10: Client Portal               ████████░░  [2-3 days]             │
│                                                                                │
│  TOTAL ESTIMATE: 12-17 days                                                    │
│                                                                                │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Dependencies

| Phase | Depends On | Enables |
|-------|------------|---------|
| Phase 5 | Phase 4 (Forms) | Phase 6, 9, 10 |
| Phase 6 | None | Phase 9, 10 |
| Phase 7 | None | Phase 8, 10 |
| Phase 8 | Phase 5, 7 | Phase 10 |
| Phase 9 | Phase 5, 6 | - |
| Phase 10 | Phase 5, 6, 7 | - |

---

## AI Agent Deployment Strategy

### Phase 1: Copilots (Assist Humans)

These AI features help humans work faster:

| Agent | Function | Phase |
|-------|----------|-------|
| Brief Quality Reviewer | Scores briefs, suggests improvements | 5 |
| Document Analyzer | Extracts info from uploads | 7 |
| Report Narrator | Explains analytics in plain language | 8 |
| Client Chatbot | Answers common questions | 10 |

### Phase 2: Automators (Handle Routine Tasks)

These AI agents handle tasks independently:

| Agent | Function | When Ready |
|-------|----------|------------|
| Time Estimator | Estimates hours from brief content | After Phase 5 |
| Auto-Assigner | Suggests best-fit team member | After Phase 6 |
| Follow-up Bot | Sends reminders for overdue items | After Phase 6 |
| Invoice Drafter | Prepares invoices from time logs | After Phase 8 |

### Phase 3: Strategists (Provide Insights)

These AI agents offer strategic recommendations:

| Agent | Function | When Ready |
|-------|----------|------------|
| Capacity Planner | Predicts resource needs | After Phase 8 |
| Client Health Monitor | Flags at-risk relationships | After Phase 8 |
| Proposal Writer | Drafts RFP responses | After Phase 9 |
| Process Optimizer | Identifies workflow improvements | After Phase 8 |

---

## Success Metrics

### Operational Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Brief turnaround time | -20% | Average days from submission to completion |
| Time to first response | < 4 hours | Brief assignment after submission |
| Overdue briefs | < 5% | Briefs past deadline |
| Utilization rate | > 75% | Billable hours / capacity |

### Adoption Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users | 100% of staff | Unique logins / total users |
| Slack command usage | > 50 / week | Slash command invocations |
| Client portal logins | > 80% of clients | Monthly active clients |
| Mobile usage | > 20% | Sessions from mobile devices |

### AI Impact Metrics (Future)

| Metric | Target | Measurement |
|--------|--------|-------------|
| AI-assisted briefs | > 50% | Briefs with AI suggestions |
| Time saved | > 5 hrs/week | Estimated from automation |
| Prediction accuracy | > 80% | Time estimates vs actuals |
| Client satisfaction | +10 NPS | AI-assisted experiences |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data migration issues | Incremental rollout, fallback to old system |
| Slack API changes | Abstract integration layer, monitor deprecations |
| AI hallucinations | Human review for all AI outputs initially |
| Client adoption resistance | Gradual rollout, training materials, AM support |
| Performance at scale | Implement caching, pagination, background jobs |

---

## Next Steps

1. **Review and approve this roadmap**
2. **Prioritize phases** based on immediate business needs
3. **Begin Phase 5** (Form Submission Flow) as foundation
4. **Set up AI infrastructure** (vector DB, embeddings) in parallel
5. **Create client communication** about upcoming portal features

---

*Document Status: Draft - Pending Review*
*Last Updated: December 2024*
