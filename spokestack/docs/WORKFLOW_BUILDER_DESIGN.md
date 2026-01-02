# Workflow Builder - Design Document

**Status:** Draft
**Created:** 2026-01-02
**Module:** `/src/modules/workflows`

## Overview

The Workflow Builder is a form-driven process orchestration system that enables users to design approval chains, automate routing, and track items through multi-step business processes.

## Core Concepts

### Workflow Template
A reusable definition of a process with steps, conditions, and routing rules.

### Workflow Instance
A specific entity (Brief, RFP, Document, etc.) moving through a workflow template.

### Workflow Task
An individual action item assigned to a person at a specific step.

### Workflow Form
Data collection at each step (approvals, feedback, additional info).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      WORKFLOW BUILDER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  TEMPLATES  │    │  INSTANCES  │    │    TASKS    │         │
│  │  (Design)   │───▶│  (Runtime)  │───▶│  (Actions)  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    FORMS    │    │  CONDITIONS │    │   ROUTING   │         │
│  │  (Fields)   │    │  (Logic)    │    │  (Assign)   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### WorkflowTemplate
```prisma
model WorkflowTemplate {
  id              String   @id @default(cuid())
  organizationId  String

  name            String
  description     String?
  icon            String?
  color           String?

  // What triggers this workflow
  triggerType     WorkflowTriggerType  // MANUAL, ENTITY_CREATED, ENTITY_UPDATED, SCHEDULED
  triggerEntity   String?              // "Brief", "RFP", "Document", etc.
  triggerConditions Json?              // { "status": "SUBMITTED", "type": "VIDEO_SHOOT" }

  // Steps definition (JSON for flexibility)
  steps           Json     // Array of WorkflowStep objects

  // Settings
  isActive        Boolean  @default(true)
  version         Int      @default(1)

  // Metadata
  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  organization    Organization @relation(...)
  createdBy       User @relation(...)
  instances       WorkflowInstance[]
}

enum WorkflowTriggerType {
  MANUAL          // User manually starts
  ENTITY_CREATED  // When Brief/RFP/etc created
  ENTITY_UPDATED  // When entity status/field changes
  SCHEDULED       // Recurring (daily, weekly)
  FORM_SUBMITTED  // External form submission
}
```

### WorkflowStep (JSON structure within template)
```typescript
interface WorkflowStep {
  id: string;
  name: string;
  type: "APPROVAL" | "REVIEW" | "TASK" | "NOTIFICATION" | "CONDITION" | "DELAY";

  // Assignment
  assigneeType: "SPECIFIC_USER" | "ROLE" | "DEPARTMENT" | "FIELD_VALUE" | "ROUND_ROBIN";
  assigneeValue: string;  // userId, role name, department, field path

  // Form to display at this step
  formId?: string;
  formFields?: FormField[];

  // Conditions to enter this step
  conditions?: Condition[];

  // Timing
  dueIn?: number;         // Hours from assignment
  dueDateField?: string;  // Or use a field from trigger entity

  // Escalation
  escalateAfter?: number; // Hours before escalation
  escalateTo?: string;    // userId or role

  // Branching
  onApprove?: string;     // Next step ID
  onReject?: string;      // Step ID or "END"
  onTimeout?: string;     // Step ID for timeout

  // Position for visual editor
  position?: { x: number; y: number };
}

interface Condition {
  field: string;          // "entity.budget", "step.approved", etc.
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in";
  value: any;
}

interface FormField {
  id: string;
  type: "TEXT" | "TEXTAREA" | "SELECT" | "CHECKBOX" | "DATE" | "FILE" | "SIGNATURE";
  label: string;
  required: boolean;
  options?: string[];     // For SELECT
  placeholder?: string;
}
```

### WorkflowInstance
```prisma
model WorkflowInstance {
  id              String   @id @default(cuid())
  organizationId  String

  templateId      String
  template        WorkflowTemplate @relation(...)

  // What triggered this workflow
  triggerEntityType String   // "Brief", "RFP", etc.
  triggerEntityId   String
  triggerData       Json?    // Snapshot of entity at trigger time

  // Current state
  currentStepId   String?
  status          WorkflowInstanceStatus

  // Collected data from forms
  formData        Json     @default("{}")

  // Timeline
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  dueDate         DateTime?

  // Relations
  tasks           WorkflowTask[]
  activities      WorkflowActivity[]
}

enum WorkflowInstanceStatus {
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
  FAILED
}
```

### WorkflowTask
```prisma
model WorkflowTask {
  id              String   @id @default(cuid())

  instanceId      String
  instance        WorkflowInstance @relation(...)

  stepId          String   // References step in template

  // Assignment
  assigneeId      String?
  assignee        User? @relation(...)

  // Status
  status          WorkflowTaskStatus

  // Response
  action          String?  // "APPROVED", "REJECTED", "COMPLETED"
  formResponse    Json?    // Data from step form
  comment         String?

  // Timing
  assignedAt      DateTime @default(now())
  dueAt           DateTime?
  completedAt     DateTime?

  // Escalation tracking
  escalatedAt     DateTime?
  escalatedTo     String?
}

enum WorkflowTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
  ESCALATED
  TIMED_OUT
}
```

---

## Views

### 1. Kanban View
Cards grouped by workflow step/status. Drag to manually advance (if permitted).

### 2. Gantt View
Timeline showing task durations, dependencies, and deadlines.

### 3. Table View
Spreadsheet-style with columns for each step, assignee, due date, status.

### 4. Calendar View
Tasks plotted by due date.

### 5. Timeline View
Activity feed showing all actions, comments, status changes.

### 6. Dashboard View
- Active workflows by template
- Bottlenecks (steps with most pending tasks)
- SLA compliance (% completed on time)
- Average completion time by template
- Overdue tasks by assignee

---

## Internal Module Integrations

### Briefs Module
```typescript
// Trigger: Brief submitted
{
  triggerType: "ENTITY_UPDATED",
  triggerEntity: "Brief",
  triggerConditions: { status: "SUBMITTED" }
}

// Actions available:
// - Update brief status
// - Assign resources
// - Create time entries
// - Generate deliverables
```

### RFP Module
```typescript
// Trigger: RFP created or stage changed
// Conditions: Route differently based on value, client tier
// Actions: Update pipeline, notify stakeholders
```

### Studio Module (Docs, Decks, Video)
```typescript
// Trigger: Document marked ready for review
// Steps: Internal review → Client review → Final approval
// Actions: Update document status, notify client
```

### Time Tracking
```typescript
// Trigger: Budget threshold reached (e.g., 80%)
// Actions: Alert project manager, require approval to continue
```

### CRM (Deals)
```typescript
// Trigger: Deal value updated above threshold
// Steps: Manager approval → Director approval (if > $50k)
// Actions: Update deal stage, create brief
```

### Resources
```typescript
// Trigger: Resource assigned to project
// Steps: Confirm availability → Manager approval
// Actions: Block calendar, update capacity
```

---

## External Communication Channels

### Email
- **Send:** Approval requests, task assignments, reminders, summaries
- **Receive:** Reply-to-approve (parse email responses)
- **Templates:** Customizable per workflow step

### WhatsApp (via API)
- **Send:** Urgent approvals, deadline warnings
- **Receive:** Quick responses (approve/reject buttons)
- **Use case:** Client approvals, executive escalations

### Slack
- **Send:** Channel notifications, DM assignments
- **Receive:** Slash commands (`/approve [id]`), button interactions
- **Features:** Thread updates, daily digests

### SMS (via Twilio)
- **Send:** Critical escalations only
- **Receive:** Simple confirmations (reply Y/N)

### In-App
- **Notification center:** All workflow activity
- **Task inbox:** Pending approvals/actions
- **Real-time updates:** WebSocket for live status

---

## External System Integrations

### Xero (Accounting)
```typescript
// Triggers FROM Xero:
// - Invoice created/approved
// - Payment received
// - Bill due date approaching
// - Budget threshold reached

// Workflow triggers:
{
  triggerType: "EXTERNAL_WEBHOOK",
  source: "XERO",
  event: "INVOICE_CREATED",
  conditions: { amount: { gte: 10000 } }  // High-value invoice
}

// Actions TO Xero:
// - Create invoice from approved brief
// - Mark invoice as sent after client approval
// - Reconcile payment on project completion
```

**Use Cases:**
- **Invoice Approval Chain**: Brief complete → Generate invoice → Finance review → Send to client
- **Budget Alerts**: Xero budget threshold → Alert project manager → Require approval to continue
- **Payment Workflows**: Invoice paid → Update project status → Notify account manager
- **Expense Approval**: Xero expense submitted → Manager approval → Finance processing

### Google Workspace
```typescript
// Calendar:
// - Block time for approved resources
// - Create shoot dates from brief approval
// - Meeting scheduling for review steps

// Drive:
// - Auto-create project folders on workflow start
// - Move deliverables through review folders
// - Set permissions based on workflow stage

// Gmail:
// - Send workflow emails from team accounts
// - Parse replies for approvals
```

### Webhooks (Generic)
```typescript
// Incoming (triggers workflow):
POST /api/workflows/webhook/:templateId
{
  source: "external_system",
  event: "entity_updated",
  payload: { ... }
}

// Outgoing (workflow action):
{
  action: "WEBHOOK",
  url: "https://external.system/api/notify",
  method: "POST",
  headers: { "Authorization": "Bearer {{secret}}" },
  body: { "workflowId": "{{instance.id}}", "status": "{{step.action}}" }
}
```

### Zapier / Make (n8n)
- **Receive:** Workflow completion triggers Zap
- **Send:** External Zap triggers Spokestack workflow
- **Use case:** Connect to 5000+ apps without custom integration

---

## Channel-Specific Features

### Slack Deep Integration
```typescript
// Channels:
// - Post to #project-updates on workflow events
// - Create dedicated channel per workflow instance
// - Archive channel on completion

// Threads:
// - Track entire approval conversation in thread
// - Mention specific users for escalations
// - Pin key decisions

// Interactive:
// - Button actions (Approve/Reject/Comment)
// - Modal forms for detailed feedback
// - Slash commands (/workflow status, /workflow approve)

// Triggers from Slack:
{
  triggerType: "SLACK_MESSAGE",
  channel: "#client-requests",
  contains: "urgent",
  action: "CREATE_WORKFLOW"
}
```

### WhatsApp Business API
```typescript
// Group workflows:
// - Monitor client WhatsApp groups for requests
// - Auto-create briefs from specific message formats
// - Post updates to project groups

// Template messages:
// - Approval requests with quick reply buttons
// - Status updates with delivery tracking
// - Deadline reminders

// Rich media:
// - Send document previews for review
// - Receive voice notes (transcribe for approval)
// - Share location for shoot approvals
```

---

## Automation Engine

### Time-Based Triggers
```typescript
// Daily digest at 9am
{ schedule: "0 9 * * *", action: "SEND_DIGEST" }

// SLA warning 24h before due
{ trigger: "DUE_DATE_APPROACHING", hours: 24, action: "SEND_REMINDER" }

// Escalate if no response in 48h
{ trigger: "TASK_PENDING", hours: 48, action: "ESCALATE" }
```

### Event-Based Triggers
```typescript
// When task completed, advance workflow
{ trigger: "TASK_COMPLETED", action: "ADVANCE_STEP" }

// When all parallel tasks done, continue
{ trigger: "ALL_TASKS_COMPLETED", stepId: "parallel-review", action: "ADVANCE_STEP" }

// When rejected, notify creator
{ trigger: "TASK_REJECTED", action: "NOTIFY_CREATOR" }
```

### Threshold Triggers
```typescript
// Budget > 80%
{ trigger: "FIELD_THRESHOLD", field: "budget.used", operator: "gte", value: 0.8, action: "ALERT" }

// Revision count > 3
{ trigger: "FIELD_THRESHOLD", field: "revisionCount", operator: "gt", value: 3, action: "REQUIRE_APPROVAL" }
```

---

## UI Components

### Flow Designer (Visual Editor)
- Drag-and-drop step nodes
- Connect steps with arrows
- Condition branches (diamond nodes)
- Parallel paths (split/join)
- Step configuration panel

### Form Builder
- Field type palette
- Drag to reorder
- Validation rules
- Conditional visibility

### Condition Builder
- Field selector (from trigger entity + workflow data)
- Operator dropdown
- Value input (with autocomplete for entities)
- AND/OR grouping

### Assignment Rules
- By specific user
- By role (Team Lead, Account Manager)
- By department
- By field value (e.g., client's account manager)
- Round-robin within group

---

## API Endpoints

```typescript
// Templates
GET    /api/workflows/templates
POST   /api/workflows/templates
GET    /api/workflows/templates/:id
PUT    /api/workflows/templates/:id
DELETE /api/workflows/templates/:id

// Instances
GET    /api/workflows/instances
POST   /api/workflows/instances          // Start workflow
GET    /api/workflows/instances/:id
POST   /api/workflows/instances/:id/cancel
POST   /api/workflows/instances/:id/pause
POST   /api/workflows/instances/:id/resume

// Tasks
GET    /api/workflows/tasks              // My pending tasks
GET    /api/workflows/tasks/:id
POST   /api/workflows/tasks/:id/complete
POST   /api/workflows/tasks/:id/reject
POST   /api/workflows/tasks/:id/reassign

// Triggers (webhooks)
POST   /api/workflows/trigger            // External trigger
```

---

## Migration Path

### Phase 1: Foundation
- [ ] Create Prisma models (WorkflowTemplate, WorkflowInstance, WorkflowTask)
- [ ] Basic CRUD actions
- [ ] Simple template designer (list of steps)
- [ ] Manual workflow triggering

### Phase 2: Core Features
- [ ] Visual flow designer
- [ ] Condition builder
- [ ] Form builder for steps
- [ ] Assignment rules engine
- [ ] Task inbox UI

### Phase 3: Automation
- [ ] Entity triggers (Brief, RFP integration)
- [ ] Time-based triggers (cron)
- [ ] Escalation engine
- [ ] SLA tracking

### Phase 4: Views
- [ ] Kanban view
- [ ] Gantt view
- [ ] Table view
- [ ] Dashboard with metrics

### Phase 5: Communication Integrations
- [ ] Email notifications (SendGrid/Resend)
- [ ] Slack integration (channels, threads, buttons)
- [ ] WhatsApp Business API
- [ ] SMS via Twilio

### Phase 6: External System Integrations
- [ ] Xero accounting (invoices, payments, budgets)
- [ ] Google Workspace (Calendar, Drive, Gmail)
- [ ] Generic webhook support (inbound/outbound)
- [ ] Zapier/Make connector
- [ ] AI-assisted workflow suggestions

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW ENGINE (Core)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐    ┌─────────────────────────┐          │
│  │   INTERNAL MODULES      │    │   EXTERNAL SYSTEMS      │          │
│  ├─────────────────────────┤    ├─────────────────────────┤          │
│  │ • Briefs                │    │ • Xero (Accounting)     │          │
│  │ • RFPs                  │    │ • Google Workspace      │          │
│  │ • Studio (Docs/Decks)   │    │ • Slack                 │          │
│  │ • CRM (Deals)           │    │ • WhatsApp              │          │
│  │ • Resources             │    │ • Email/SMS             │          │
│  │ • Time Tracking         │    │ • Webhooks              │          │
│  │ • Dashboard Builder     │    │ • Zapier/Make           │          │
│  └─────────────────────────┘    └─────────────────────────┘          │
│              │                           │                           │
│              └───────────┬───────────────┘                           │
│                          ▼                                           │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │              INTEGRATION ADAPTER LAYER                   │        │
│  │  • Event normalization                                   │        │
│  │  • Credential management (per-tenant)                    │        │
│  │  • Rate limiting & retry logic                           │        │
│  │  • Audit logging                                         │        │
│  └─────────────────────────────────────────────────────────┘        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Relation to Current "Boards" Module

The current Kanban implementation (`WorkflowBoard`, `WorkflowColumn`, `WorkflowCard`) should be:

1. **Renamed** to "Boards" or "Project Boards"
2. **Kept** as a standalone visual project management tool
3. **Optionally linked** - a Board could display workflow instances as cards

This separates:
- **Workflows** = Business process automation (this document)
- **Boards** = Visual project management (current Kanban)
