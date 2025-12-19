# SpokeStack - Phases 6-10 Technical Planning

**Date:** December 20, 2024
**Status:** Draft - Awaiting Review

---

## Overview

This document outlines the technical specifications for five new modules to be added to the SpokeStack ERP platform:

| Phase | Module | Priority | Complexity |
|-------|--------|----------|------------|
| 6 | Employee & Client Onboarding | High | Medium |
| 7 | Leave & Compensation Management | High | Medium |
| 8 | Client NPS & Feedback | Medium | Low |
| 9 | Client CRM & Lead Pipeline | High | High |
| 10 | Google Workspace Integration | Medium | High |

---

## Phase 6: Employee & Client Onboarding

### Purpose
Streamline the process of onboarding new employees and clients with structured workflows, document collection, and task tracking.

### Database Schema Changes

```prisma
// New models to add to schema.prisma

model OnboardingTemplate {
  id             String   @id @default(cuid())
  organizationId String
  name           String   // "Employee Onboarding", "Client Onboarding"
  type           OnboardingType
  description    String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  steps          OnboardingStep[]
  instances      OnboardingInstance[]

  @@index([organizationId])
  @@map("onboarding_templates")
}

enum OnboardingType {
  EMPLOYEE
  CLIENT
}

model OnboardingStep {
  id          String   @id @default(cuid())
  templateId  String
  title       String
  description String?
  type        OnboardingStepType
  config      Json     @default("{}")  // Form fields, document requirements, etc.
  sortOrder   Int
  isRequired  Boolean  @default(true)
  dueOffset   Int?     // Days from start date

  template    OnboardingTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  completions OnboardingStepCompletion[]

  @@index([templateId])
  @@map("onboarding_steps")
}

enum OnboardingStepType {
  FORM           // Fill out a form
  DOCUMENT       // Upload a document
  ACKNOWLEDGMENT // Read and acknowledge
  TASK           // Complete a task
  MEETING        // Schedule/complete a meeting
  SYSTEM_ACCESS  // Grant system access
}

model OnboardingInstance {
  id             String   @id @default(cuid())
  organizationId String
  templateId     String

  // For employee onboarding
  userId         String?

  // For client onboarding
  clientId       String?

  status         OnboardingStatus @default(NOT_STARTED)
  startDate      DateTime
  targetEndDate  DateTime?
  completedAt    DateTime?

  assignedToId   String?  // HR person or Account Manager responsible
  notes          String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  template       OnboardingTemplate @relation(fields: [templateId], references: [id])
  user           User? @relation("OnboardingUser", fields: [userId], references: [id])
  client         Client? @relation(fields: [clientId], references: [id])
  assignedTo     User? @relation("OnboardingAssignee", fields: [assignedToId], references: [id])
  stepCompletions OnboardingStepCompletion[]

  @@index([organizationId])
  @@index([userId])
  @@index([clientId])
  @@map("onboarding_instances")
}

enum OnboardingStatus {
  NOT_STARTED
  IN_PROGRESS
  BLOCKED
  COMPLETED
  CANCELLED
}

model OnboardingStepCompletion {
  id           String   @id @default(cuid())
  instanceId   String
  stepId       String
  status       StepCompletionStatus @default(PENDING)
  completedAt  DateTime?
  completedById String?
  formData     Json?    // Submitted form data
  documentUrl  String?  // Uploaded document URL
  notes        String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  instance     OnboardingInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  step         OnboardingStep @relation(fields: [stepId], references: [id])
  completedBy  User? @relation(fields: [completedById], references: [id])

  @@unique([instanceId, stepId])
  @@map("onboarding_step_completions")
}

enum StepCompletionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
  BLOCKED
}
```

### Features

#### Employee Onboarding
1. **Template Builder**
   - Create/edit onboarding templates
   - Define steps: forms, documents, tasks, meetings
   - Set due date offsets (e.g., "Day 1", "Week 1")

2. **Onboarding Checklist**
   - Personal information form
   - Emergency contact details
   - Bank details for payroll
   - Document uploads (Emirates ID, Passport, Visa, etc.)
   - Policy acknowledgments
   - IT equipment request
   - System access provisioning
   - Welcome meeting scheduling

3. **Dashboard**
   - Active onboardings list
   - Progress tracking per employee
   - Overdue items alerts
   - Completion statistics

#### Client Onboarding
1. **Client Setup Checklist**
   - Company information form
   - Brand guidelines upload
   - Access credentials collection
   - Point of contact details
   - Contract/SOW acknowledgment
   - Kickoff meeting scheduling

2. **Account Manager View**
   - All client onboardings
   - Progress by client
   - Pending items

### UI Components
- `/settings/onboarding` - Template management (Admin only)
- `/onboarding` - Active onboarding dashboard
- `/onboarding/[id]` - Individual onboarding progress
- `/onboarding/new` - Start new onboarding

### Questions for Will
1. What documents do you typically collect for new employees? (Emirates ID, visa, passport copies, etc.)
2. What forms/acknowledgments do new employees need to sign?
3. For client onboarding, what information do you need before starting work?
4. Who should be responsible for employee onboarding - HR only, or department leads too?
5. Do you want email notifications for overdue onboarding tasks?

---

## Phase 7: Leave & Compensation Management

### Purpose
Track employee leave requests, balances, and compensation details including salary, benefits, and bonuses.

### Database Schema Changes

```prisma
// Leave Management

model LeaveType {
  id             String   @id @default(cuid())
  organizationId String
  name           String   // "Annual Leave", "Sick Leave", "Unpaid Leave"
  code           String   // "AL", "SL", "UL"
  color          String   @default("#3B82F6")
  defaultDays    Int      // Default annual allocation
  carryOverMax   Int?     // Max days that can carry over
  requiresApproval Boolean @default(true)
  requiresDocument Boolean @default(false) // e.g., medical certificate
  isActive       Boolean  @default(true)

  organization   Organization @relation(fields: [organizationId], references: [id])
  balances       LeaveBalance[]
  requests       LeaveRequest[]

  @@unique([organizationId, code])
  @@map("leave_types")
}

model LeaveBalance {
  id             String   @id @default(cuid())
  userId         String
  leaveTypeId    String
  year           Int
  allocated      Decimal  @db.Decimal(5, 2) // Days allocated
  used           Decimal  @db.Decimal(5, 2) @default(0)
  carriedOver    Decimal  @db.Decimal(5, 2) @default(0)
  adjustment     Decimal  @db.Decimal(5, 2) @default(0) // Manual adjustments

  user           User @relation(fields: [userId], references: [id])
  leaveType      LeaveType @relation(fields: [leaveTypeId], references: [id])

  @@unique([userId, leaveTypeId, year])
  @@map("leave_balances")
}

model LeaveRequest {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  leaveTypeId    String

  startDate      DateTime @db.Date
  endDate        DateTime @db.Date
  days           Decimal  @db.Decimal(5, 2)
  isHalfDay      Boolean  @default(false)
  halfDayPeriod  HalfDayPeriod?

  reason         String?
  documentUrl    String?  // Supporting document

  status         LeaveRequestStatus @default(PENDING)
  approvedById   String?
  approvedAt     DateTime?
  rejectionReason String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  user           User @relation("LeaveRequester", fields: [userId], references: [id])
  leaveType      LeaveType @relation(fields: [leaveTypeId], references: [id])
  approvedBy     User? @relation("LeaveApprover", fields: [approvedById], references: [id])

  @@index([organizationId])
  @@index([userId])
  @@index([status])
  @@map("leave_requests")
}

enum LeaveRequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum HalfDayPeriod {
  MORNING
  AFTERNOON
}

model PublicHoliday {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  date           DateTime @db.Date
  year           Int

  organization   Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, date])
  @@map("public_holidays")
}

// Compensation Management

model Compensation {
  id             String   @id @default(cuid())
  userId         String
  effectiveDate  DateTime @db.Date

  baseSalary     Decimal  @db.Decimal(12, 2)
  currency       String   @default("AED")
  payFrequency   PayFrequency @default(MONTHLY)

  housingAllowance    Decimal? @db.Decimal(12, 2)
  transportAllowance  Decimal? @db.Decimal(12, 2)
  otherAllowances     Decimal? @db.Decimal(12, 2)

  notes          String?
  createdById    String
  createdAt      DateTime @default(now())

  user           User @relation(fields: [userId], references: [id])
  createdBy      User @relation("CompensationCreator", fields: [createdById], references: [id])

  @@index([userId])
  @@map("compensations")
}

enum PayFrequency {
  MONTHLY
  BI_WEEKLY
  WEEKLY
}

model Bonus {
  id             String   @id @default(cuid())
  userId         String
  type           BonusType
  amount         Decimal  @db.Decimal(12, 2)
  currency       String   @default("AED")
  reason         String?
  effectiveDate  DateTime @db.Date
  paidAt         DateTime?

  createdById    String
  createdAt      DateTime @default(now())

  user           User @relation(fields: [userId], references: [id])
  createdBy      User @relation("BonusCreator", fields: [createdById], references: [id])

  @@index([userId])
  @@map("bonuses")
}

enum BonusType {
  PERFORMANCE
  SIGNING
  RETENTION
  PROJECT
  ANNUAL
  OTHER
}
```

### Features

#### Leave Management
1. **Employee Self-Service**
   - View leave balances
   - Submit leave requests
   - Cancel pending requests
   - View request history

2. **Manager Approval**
   - Pending requests queue
   - Approve/reject with comments
   - View team calendar
   - Conflict detection (multiple people off)

3. **Team Calendar**
   - Monthly view of all leave
   - Public holidays
   - Filter by department

4. **Admin Tools**
   - Configure leave types
   - Manage public holidays
   - Adjust balances manually
   - Year-end carry-over processing

#### Compensation (Admin/HR Only)
1. **Salary Management**
   - View/edit compensation history
   - Salary change tracking
   - Effective date management

2. **Bonus Tracking**
   - Record bonuses
   - Bonus history per employee

3. **Reports**
   - Salary summary
   - Leave usage report
   - Upcoming leave calendar export

### UI Components
- `/leave` - Leave dashboard (balances, upcoming)
- `/leave/request` - Submit leave request
- `/leave/calendar` - Team leave calendar
- `/leave/approvals` - Approval queue (managers)
- `/settings/leave` - Leave type configuration (admin)
- `/hr/compensation` - Compensation management (admin)

### UAE-Specific Considerations
- Annual leave: 30 days (standard UAE)
- Sick leave: 90 days (15 full pay, 30 half pay, 45 unpaid)
- Maternity leave: 60 days
- Paternity leave: 5 days
- Hajj leave: 30 days (once)
- Public holidays: UAE national holidays

### Questions for Will
1. What leave types do you currently offer? (Annual, Sick, Unpaid, others?)
2. How many annual leave days do employees get?
3. Can leave carry over to the next year? If so, how many days max?
4. Who approves leave - direct manager, HR, or both?
5. Do you want to track compensation/salary in the system, or keep that separate?
6. Are there any UAE-specific requirements I should know about?

---

## Phase 8: Client NPS & Feedback

### Purpose
Collect and track Net Promoter Score (NPS) and general feedback from clients to measure satisfaction and identify areas for improvement.

### Database Schema Changes

```prisma
model NPSSurvey {
  id             String   @id @default(cuid())
  organizationId String
  name           String   // "Q4 2024 NPS Survey"
  description    String?
  isActive       Boolean  @default(true)

  // Survey configuration
  introMessage   String?
  thankYouMessage String?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  responses      NPSResponse[]
  invitations    NPSInvitation[]

  @@index([organizationId])
  @@map("nps_surveys")
}

model NPSInvitation {
  id             String   @id @default(cuid())
  surveyId       String
  clientId       String
  contactEmail   String
  contactName    String?

  token          String   @unique @default(cuid()) // For anonymous access
  sentAt         DateTime?
  respondedAt    DateTime?
  reminderSentAt DateTime?

  createdAt      DateTime @default(now())

  survey         NPSSurvey @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  client         Client @relation(fields: [clientId], references: [id])
  response       NPSResponse?

  @@index([surveyId])
  @@index([clientId])
  @@map("nps_invitations")
}

model NPSResponse {
  id             String   @id @default(cuid())
  surveyId       String
  invitationId   String?  @unique
  clientId       String?

  // NPS Score (0-10)
  score          Int

  // Follow-up questions
  whatDoWeDoWell    String? @db.Text
  whatCanWeImprove  String? @db.Text
  additionalComments String? @db.Text

  // Would you recommend specific services?
  serviceRatings    Json?   // { "video": 9, "design": 8, "social": 7 }

  isAnonymous    Boolean  @default(false)
  respondedAt    DateTime @default(now())

  survey         NPSSurvey @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  invitation     NPSInvitation? @relation(fields: [invitationId], references: [id])
  client         Client? @relation(fields: [clientId], references: [id])

  @@index([surveyId])
  @@index([clientId])
  @@map("nps_responses")
}

model FeedbackRequest {
  id             String   @id @default(cuid())
  organizationId String
  clientId       String
  briefId        String?  // Optional: feedback for specific brief

  type           FeedbackType
  requestedById  String

  token          String   @unique @default(cuid())
  sentAt         DateTime?
  respondedAt    DateTime?

  createdAt      DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id])
  client         Client @relation(fields: [clientId], references: [id])
  brief          Brief? @relation(fields: [briefId], references: [id])
  requestedBy    User @relation(fields: [requestedById], references: [id])
  response       FeedbackResponse?

  @@index([organizationId])
  @@index([clientId])
  @@map("feedback_requests")
}

enum FeedbackType {
  PROJECT_COMPLETION
  QUARTERLY_CHECK_IN
  AD_HOC
}

model FeedbackResponse {
  id             String   @id @default(cuid())
  requestId      String   @unique

  overallRating  Int      // 1-5 stars

  // Specific ratings (1-5)
  qualityRating      Int?
  communicationRating Int?
  timelinessRating   Int?
  valueRating        Int?

  positives      String?  @db.Text
  improvements   String?  @db.Text
  comments       String?  @db.Text

  wouldRecommend Boolean?

  respondedAt    DateTime @default(now())

  request        FeedbackRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  @@map("feedback_responses")
}
```

### Features

#### NPS Surveys
1. **Survey Management**
   - Create NPS surveys
   - Customize intro/thank you messages
   - Send to multiple clients

2. **NPS Collection**
   - Score (0-10) with promoter/passive/detractor classification
   - Follow-up questions
   - Anonymous option

3. **Analytics Dashboard**
   - Overall NPS score (Promoters % - Detractors %)
   - Score trend over time
   - Client-by-client breakdown
   - Service-specific ratings
   - Word cloud from feedback

#### Project Feedback
1. **Post-Project Surveys**
   - Trigger after brief completion
   - Quality, communication, timeliness ratings
   - Open-ended feedback

2. **Feedback Tracking**
   - All feedback by client
   - Identify at-risk clients
   - Action items from feedback

### UI Components
- `/feedback` - Feedback dashboard
- `/feedback/nps` - NPS survey management
- `/feedback/nps/[id]` - Survey results
- `/feedback/responses` - All feedback responses
- `/survey/[token]` - Public survey form (no auth required)

### NPS Scoring
- **Promoters (9-10)**: Loyal enthusiasts
- **Passives (7-8)**: Satisfied but unenthusiastic
- **Detractors (0-6)**: Unhappy customers

**NPS = % Promoters - % Detractors** (ranges from -100 to +100)

### Questions for Will
1. How often do you want to send NPS surveys? (Quarterly, after project completion?)
2. What specific questions do you want to ask beyond the NPS score?
3. Do you want to rate specific services (video, design, social) separately?
4. Should feedback be anonymous or tied to the client contact?
5. Do you want automatic feedback requests after brief completion?

---

## Phase 9: Client CRM & Lead Pipeline

### Purpose
Comprehensive client relationship management including lead tracking, contact management, activity logging, and integration with the RFP pipeline.

### Database Schema Changes

```prisma
// Extend existing Client model
model Client {
  // ... existing fields ...

  // CRM fields
  industry       String?
  companySize    CompanySize?
  website        String?
  linkedIn       String?

  // Relationship info
  accountManagerId String?
  relationshipStatus RelationshipStatus @default(ACTIVE)
  lifetimeValue  Decimal? @db.Decimal(14, 2)

  // Source tracking
  leadSource     LeadSource?
  referredById   String?  // Another client who referred them

  accountManager User? @relation("AccountManager", fields: [accountManagerId], references: [id])
  contacts       ClientContact[]
  activities     ClientActivity[]
  deals          Deal[]
}

enum CompanySize {
  STARTUP      // 1-10
  SMALL        // 11-50
  MEDIUM       // 51-200
  LARGE        // 201-1000
  ENTERPRISE   // 1000+
}

enum RelationshipStatus {
  LEAD
  PROSPECT
  ACTIVE
  AT_RISK
  CHURNED
  DORMANT
}

enum LeadSource {
  REFERRAL
  WEBSITE
  SOCIAL_MEDIA
  EVENT
  COLD_OUTREACH
  RFP_PORTAL
  PARTNERSHIP
  OTHER
}

model ClientContact {
  id             String   @id @default(cuid())
  clientId       String

  name           String
  email          String?
  phone          String?
  jobTitle       String?
  department     String?
  linkedIn       String?

  isPrimary      Boolean  @default(false)
  isDecisionMaker Boolean @default(false)
  isBillingContact Boolean @default(false)

  notes          String?
  isActive       Boolean  @default(true)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  client         Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@map("client_contacts")
}

model ClientActivity {
  id             String   @id @default(cuid())
  organizationId String
  clientId       String
  userId         String

  type           ActivityType
  title          String
  description    String?  @db.Text

  // For meetings
  meetingDate    DateTime?
  meetingDuration Int?    // minutes
  attendees      String[] @default([])

  // For emails
  emailSubject   String?

  // For calls
  callDuration   Int?     // minutes

  createdAt      DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id])
  client         Client @relation(fields: [clientId], references: [id])
  user           User @relation(fields: [userId], references: [id])

  @@index([organizationId])
  @@index([clientId])
  @@map("client_activities")
}

enum ActivityType {
  NOTE
  EMAIL
  CALL
  MEETING
  TASK
  STATUS_CHANGE
}

// Lead/Deal Pipeline (feeds into RFP)
model Deal {
  id             String   @id @default(cuid())
  organizationId String
  clientId       String?  // Can be null for new leads

  name           String
  companyName    String?  // If no client yet
  contactName    String?
  contactEmail   String?

  stage          DealStage @default(LEAD)
  value          Decimal? @db.Decimal(14, 2)
  currency       String   @default("AED")
  probability    Int?     // 0-100%

  source         LeadSource?

  expectedCloseDate DateTime?
  actualCloseDate   DateTime?

  ownerId        String

  lostReason     String?
  wonRfpId       String?  // Link to RFP if converted

  notes          String?  @db.Text

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  client         Client? @relation(fields: [clientId], references: [id])
  owner          User @relation(fields: [ownerId], references: [id])

  @@index([organizationId])
  @@index([clientId])
  @@index([stage])
  @@map("deals")
}

enum DealStage {
  LEAD           // Initial contact
  QUALIFIED      // Qualified opportunity
  PROPOSAL       // Proposal sent
  NEGOTIATION    // In negotiation
  WON            // Deal won
  LOST           // Deal lost
}
```

### Features

#### Client Management
1. **Client Profiles**
   - Company information
   - Multiple contacts per client
   - Activity timeline
   - Relationship health indicators

2. **Contact Management**
   - Primary contacts
   - Decision makers
   - Communication preferences

3. **Activity Logging**
   - Notes, emails, calls, meetings
   - Automatic logging from integrations
   - Activity timeline

#### Lead Pipeline
1. **Deal Board**
   - Kanban-style pipeline
   - Lead → Qualified → Proposal → Negotiation → Won/Lost
   - Drag-and-drop stage changes

2. **Lead Capture**
   - Manual entry
   - From RFP portal
   - Website form integration (future)

3. **Conversion**
   - Convert lead to client
   - Convert deal to RFP
   - Track win/loss reasons

#### Dashboards
1. **Pipeline Overview**
   - Total pipeline value
   - Deals by stage
   - Expected revenue by month

2. **Client Health**
   - At-risk clients
   - Engagement scores
   - Recent activity

### UI Components
- `/clients` - Client list with CRM view
- `/clients/[id]` - Client profile with activities
- `/clients/[id]/contacts` - Contact management
- `/pipeline` - Deal pipeline board
- `/pipeline/[id]` - Deal detail
- `/reports/crm` - CRM analytics

### Integration with Existing Modules
- **RFP**: Deals can convert to RFPs, RFP wins create clients
- **Briefs**: Activity logged when briefs created/completed
- **NPS**: Feedback influences relationship status

### Questions for Will
1. Do you have an existing CRM or spreadsheet with client data to import?
2. What stages make sense for your sales pipeline?
3. Who should manage leads - specific BD people or anyone?
4. Do you want to track lost deal reasons for analysis?
5. How do you currently track client relationships and activities?

---

## Phase 10: Google Workspace Integration

### Purpose
Deep integration with Google Workspace (Gmail, Calendar, Drive, Docs) to sync data and streamline workflows.

### Integration Scope

#### 1. Google Calendar
- **Sync shoot dates** from briefs to team calendars
- **Leave calendar** sync
- **Meeting scheduling** for client meetings
- **Resource booking** (meeting rooms, equipment)

#### 2. Gmail
- **Activity logging**: Auto-log client emails to CRM
- **Email templates**: Send templated emails from the app
- **Notifications**: Email notifications for approvals, assignments

#### 3. Google Drive
- **Brief attachments**: Store in organized Drive folders
- **Client folders**: Auto-create folder structure per client
- **Deliverable storage**: Link completed work
- **Shared drives**: Per-client shared drives for collaboration

#### 4. Google Docs/Sheets
- **Brief export**: Generate brief documents
- **Reports**: Export to Sheets
- **Proposal templates**: Generate from templates

### Database Schema Changes

```prisma
// Extend Integration model
model Integration {
  // ... existing fields ...

  // Google-specific
  googleRefreshToken String?
  googleAccessToken  String?
  googleTokenExpiry  DateTime?
  googleCalendarId   String?  // Primary calendar to sync to
  googleDriveFolderId String? // Root folder for organization

  syncSettings       Json     @default("{}") // What to sync
}

model CalendarSync {
  id             String   @id @default(cuid())
  organizationId String

  entityType     String   // "brief", "leave", "meeting"
  entityId       String
  googleEventId  String
  calendarId     String

  lastSyncedAt   DateTime
  syncStatus     SyncStatus @default(SYNCED)
  errorMessage   String?

  @@unique([entityType, entityId])
  @@index([organizationId])
  @@map("calendar_syncs")
}

enum SyncStatus {
  SYNCED
  PENDING
  ERROR
}

model DriveFolder {
  id             String   @id @default(cuid())
  organizationId String

  entityType     String   // "client", "brief", "rfp"
  entityId       String
  googleFolderId String
  folderPath     String   // e.g., "Clients/CCAD/2024/Briefs"

  createdAt      DateTime @default(now())

  @@unique([entityType, entityId])
  @@index([organizationId])
  @@map("drive_folders")
}
```

### Features

#### Calendar Integration
1. **Brief → Calendar**
   - Shoot dates create calendar events
   - Include location, attendees, brief link
   - Update when brief changes

2. **Leave → Calendar**
   - Approved leave shows on team calendar
   - All-day events for full days
   - Color-coded by leave type

3. **Two-way Sync**
   - Changes in Google Calendar update the app
   - Conflict detection

#### Drive Integration
1. **Automatic Folder Structure**
   ```
   TeamLMTD/
   ├── Clients/
   │   ├── CCAD/
   │   │   ├── 2024/
   │   │   │   ├── Briefs/
   │   │   │   ├── Deliverables/
   │   │   │   └── Contracts/
   │   │   └── Brand Assets/
   │   └── DET/
   │       └── ...
   ├── RFPs/
   │   └── 2024/
   └── Internal/
       └── Templates/
   ```

2. **Brief Attachments**
   - Upload goes to client's brief folder
   - Shareable links generated
   - Version tracking

3. **Deliverable Management**
   - Final files stored in deliverables folder
   - Client access via sharing

#### Gmail Integration
1. **Email Tracking**
   - BCC address to log emails to CRM
   - Or Gmail API to scan sent emails

2. **Templates**
   - Brief notification templates
   - Approval request emails
   - Client communication templates

### Technical Implementation

#### OAuth Setup
```typescript
// Google OAuth scopes needed
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];
```

#### Sync Architecture
- Background jobs for syncing (using Inngest or similar)
- Webhook listeners for Google changes
- Retry logic for failed syncs
- Rate limiting handling

### UI Components
- `/settings/integrations` - Integration setup
- `/settings/integrations/google` - Google-specific settings
- Connection status indicators
- Sync logs and error handling

### Questions for Will
1. Do you use Google Workspace for email/calendar/drive?
2. What Google account should be the "admin" for integrations?
3. Do you want automatic folder creation for new clients?
4. Should briefs automatically create calendar events for shoot dates?
5. Do you want email tracking (requires reading emails) or just sending?
6. Any specific folder structure you already use in Drive?

---

## Implementation Order Recommendation

Based on dependencies and value:

1. **Phase 9: Client CRM** (High priority)
   - Foundation for other features
   - Feeds into RFP pipeline
   - Needed for NPS tracking

2. **Phase 6: Onboarding** (High priority)
   - Standalone, no dependencies
   - Immediate operational value

3. **Phase 7: Leave Management** (High priority)
   - Standalone, no dependencies
   - Daily operational need

4. **Phase 8: NPS & Feedback** (Medium priority)
   - Depends on Client CRM
   - Important for client health

5. **Phase 10: Google Integration** (Medium priority)
   - Complex, requires OAuth setup
   - Enhances all other modules

---

## Next Steps

1. **Review this document** and provide feedback
2. **Answer the questions** in each phase section
3. **Prioritize** which phases to tackle first
4. **Identify** any missing requirements
5. **Begin implementation** phase by phase

---

## Will's Answers (December 20, 2024)

### Phase 9 - CRM
- **Existing data**: Minimal, currently in spreadsheet
- **Pipeline stages**: Simplified - Lead → RFP Invite → RFP Submitted → Won/Lost
- **Current tracking**: Spreadsheet

### Phase 6 - Onboarding
- **Employee documents**: Emirates ID, Passport, Bank details, Visa, Birthday, Family info (kids, married, etc.)
- **Forms**: Standard employment forms
- **Handler**: TBD (assume HR + Department leads)

### Phase 7 - Leave
- **Leave policy**: Standard UAE labor law
- **Special feature**: "Blackout days" - periods when clients need 100% support (no leave allowed)
- **Carry over**: Per UAE law

### Phase 8 - NPS
- **Frequency**: Quarterly
- **Recipients**: Tied to clients, going to CEO/CFO level contacts
- **Anonymous**: No, tied to client contacts

### Phase 10 - Google
- **Google Workspace**: Yes
- **Integrations needed**: Calendar, Docs, Slides, Sheets, Drive
- **Auto-create**: Yes for calendars and drive structure

---

*Document created: December 20, 2024*
*Last updated: December 20, 2024*
