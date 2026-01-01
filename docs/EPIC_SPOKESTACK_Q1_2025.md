# SpokeStack Q1 2025 Epic
## Platform Enhancement: Workflow Automation, Delegation & UX Restructure

**Version:** 1.0
**Date:** December 2025
**Source:** Will Hutson & Albert Khoury Feedback Session
**Status:** Approved for Implementation

---

## Executive Summary

This epic captures all feedback from the Will & Albert platform review and consolidates it into a single implementation roadmap. The work spans **14 weeks** across 6 phases:

| Phase | Focus | Weeks | Effort |
|-------|-------|-------|--------|
| **0** | Quick Wins & Bug Fixes | 1-2 | Low |
| **1** | Navigation Restructure | 2-3 | Medium |
| **2** | Builder Infrastructure | 4-5 | Medium |
| **3** | Workflow Builder Engine | 6-8 | High |
| **4** | Delegation of Authority | 9-11 | High |
| **5** | Integration & Polish | 12-14 | Medium |

**Key Outcomes:**
- AMs never lose visibility on tasks they brief
- Leave management triggers automatic delegation
- RFP (and any workflow) auto-generates tasks with cascading deadlines
- Navigation is intuitive with Agency grouping
- Admins can build templates, workflows, and automations without code

---

## Table of Contents

1. [Phase 0: Quick Wins & Bug Fixes](#phase-0-quick-wins--bug-fixes)
2. [Phase 1: Navigation Restructure](#phase-1-navigation-restructure)
3. [Phase 2: Builder Infrastructure](#phase-2-builder-infrastructure)
4. [Phase 3: Workflow Builder Engine](#phase-3-workflow-builder-engine)
5. [Phase 4: Delegation of Authority System](#phase-4-delegation-of-authority-system)
6. [Phase 5: Integration & Polish](#phase-5-integration--polish)
7. [Technical Specifications](#technical-specifications)
8. [Appendices](#appendices)

---

# Phase 0: Quick Wins & Bug Fixes
**Timeline:** Weeks 1-2
**Effort:** Low
**Impact:** High (immediate UX improvements)

These items can be shipped immediately while larger initiatives are being built.

---

## 0.1 Fix Board Filter Bug

**Priority:** P0 (Blocker)
**Effort:** 1-2 days

**Problem:** Filter click does nothing on the design board. Albert demonstrated this at 00:01:16 in the meeting.

**Acceptance Criteria:**
- [ ] Debug filter click handler on `/resources` Kanban board
- [ ] Test all filter combinations (status, assignee, client, AM)
- [ ] Ensure multi-AM scenarios filter correctly
- [ ] Add loading state while filter applies

**Files to Investigate:**
- `/src/modules/resources/components/KanbanBoard.tsx`
- `/src/modules/resources/components/FilterBar.tsx`

---

## 0.2 Add "Briefed By" Visibility

**Priority:** P1
**Effort:** 2-3 days

**Problem:** AMs (assigners) lose visibility once they assign a task. The board shows assignees but not who briefed/created the task.

**Solution:**

```
┌─────────────────────────────────────────┐
│ BRIEF CARD (Current)                    │
├─────────────────────────────────────────┤
│ ADEK Social Campaign                    │
│ Due: Jan 5                              │
│ Assignee: 👤 Mariam                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ BRIEF CARD (Enhanced)                   │
├─────────────────────────────────────────┤
│ ADEK Social Campaign                    │
│ Due: Jan 5                              │
│ Assignee: 👤 Mariam                     │
│ Briefed by: 👤 Albert        ← NEW      │
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Add `briefedById` display on Kanban cards
- [ ] Add "Briefed By" column option in list view
- [ ] Add "Briefed By" filter to filter bar
- [ ] Add "My Briefed Tasks" quick filter preset

**Schema Note:** `Brief` model already has `createdById` - use this as the "briefer".

---

## 0.3 Project Selector in Brief Form

**Priority:** P1
**Effort:** 3-4 days

**Problem:** No way to group related briefs under a project from the submission form. Use case: Ramadan campaign = 1 project with multiple briefs.

**Solution:**

```
┌─────────────────────────────────────────┐
│ BRIEF SUBMISSION FORM                   │
├─────────────────────────────────────────┤
│                                         │
│ Client: [ADEK ▼]                        │
│                                         │
│ Project: [Select or Create ▼]     ← NEW │
│   ┌─────────────────────────────┐       │
│   │ ○ Ramadan 2025 Campaign     │       │
│   │ ○ Q1 Social Content         │       │
│   │ ○ Product Launch            │       │
│   │ ─────────────────────────── │       │
│   │ + Create New Project        │       │
│   └─────────────────────────────┘       │
│                                         │
│ Brief Type: [Video Shoot ▼]             │
│ ...                                     │
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Add Project dropdown to brief submission form
- [ ] Dropdown shows existing projects for selected client
- [ ] "Create New Project" option opens inline name input
- [ ] New project auto-created and linked on brief submit
- [ ] Project visible on brief card and detail view

**Schema Note:** `Brief` model already has optional `projectId` - just need UI.

---

## 0.4 Resources View Data Cleanup

**Priority:** P1
**Effort:** 1 day

**Problem:** Placeholder names in Resources view don't match actual team members.

**Solution:**
- [ ] Run data reconciliation script
- [ ] Ensure all seed users match actual team
- [ ] Verify capacity calculations use real user data

---

## 0.5 "My Briefed Tasks" Dashboard Widget

**Priority:** P2
**Effort:** 2-3 days

**Problem:** AMs need a dedicated view of all tasks they've briefed, regardless of who's assigned.

**Solution:**

```
┌─────────────────────────────────────────────────────────────────┐
│ MY BRIEFED TASKS                                    [View All →]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔴 NEEDS ATTENTION (2)                                         │
│  ├── ADEK Campaign Brief    Overdue 2 days    → Mariam         │
│  └── CCAD Social Pack       Pending feedback  → Design Team    │
│                                                                  │
│  🟡 IN PROGRESS (4)                                             │
│  ├── DET Instagram          Due tomorrow      → Salma          │
│  ├── ECD Product Brief      Due Jan 8         → Ted            │
│  └── +2 more                                                    │
│                                                                  │
│  ✅ RECENTLY COMPLETED (3)                                      │
│  └── Show last 7 days                                           │
│                                                                  │
│  Quick Actions: [Nudge] [Reassign] [View All]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] New dashboard widget component
- [ ] Shows tasks where `createdById` = current user
- [ ] Grouped by status (Needs Attention, In Progress, Completed)
- [ ] Quick actions: Nudge assignee, Reassign, View detail
- [ ] Persists until task is archived

---

## 0.6 Co-Assigner Field (Foundation for DOA)

**Priority:** P2
**Effort:** 3-4 days

**Problem:** AMs want to assign backup person when briefing (e.g., "I'm assigning this to Mariam, but if I go on leave, Salma should handle it").

**Solution:**

```
┌─────────────────────────────────────────┐
│ ASSIGNMENT SECTION                      │
├─────────────────────────────────────────┤
│                                         │
│ Primary Assignee: [Mariam ▼]  (required)│
│                                         │
│ Backup Assignee: [Salma ▼]   (optional) │
│   ℹ️ Backup will be notified if primary │
│      is unavailable                     │
│                                         │
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Add `backupAssigneeId` field to Brief model
- [ ] Add Backup Assignee dropdown to brief form
- [ ] Both assignees visible on brief card
- [ ] Backup receives notification if primary on leave (ties into Phase 4 DOA)

**Schema Addition:**
```prisma
model Brief {
  // ... existing fields
  backupAssigneeId  String?
  backupAssignee    User?    @relation("BackupAssignee", fields: [backupAssigneeId], references: [id])
}
```

---

## Phase 0 Checklist

| Item | Priority | Days | Owner | Status |
|------|----------|------|-------|--------|
| Fix board filter bug | P0 | 1-2 | TBD | ⬜ |
| Add "Briefed By" visibility | P1 | 2-3 | TBD | ⬜ |
| Project selector in brief form | P1 | 3-4 | TBD | ⬜ |
| Resources data cleanup | P1 | 1 | TBD | ⬜ |
| "My Briefed Tasks" widget | P2 | 2-3 | TBD | ⬜ |
| Co-Assigner field | P2 | 3-4 | TBD | ⬜ |

**Total Phase 0:** ~2 weeks

---

# Phase 1: Navigation Restructure
**Timeline:** Weeks 2-3
**Effort:** Medium

---

## 1.1 New Navigation Structure

### Current vs. Proposed

```
CURRENT                          PROPOSED
───────                          ────────

Hub                              Hub (Global View)
Dashboard
                                 ─── WORK ───
Work ─┬─ Briefs                  Agency ─┬─ Briefs
      ├─ Submissions                     │   └─ [Builder] (Admin)
      └─ Resources                       ├─ Projects
                                         ├─ Clients
Management ─┬─ Time tracking             ├─ Resources / Capacity
            ├─ Clients                   └─ Retainers
            ├─ Retainer management              └─ Scope Changes
            └─ Scope Changes
                                 ─── TRACKING ───
Team ─┬─ Team directory          Time & Resources ─┬─ Time Tracking
      ├─ Leave management                          ├─ Timesheets
      └─ Files, Assets                             └─ Leave

CRM Pipeline                     ─── RELATIONSHIPS ───
                                 CRM ─┬─ Pipeline / Deals
RFP Management                        ├─ Contacts
                                      └─ RFP Management
WhatsApp & Chat
                                 ─── COMMUNICATION ───
Client Health ─┬─ Overview       Messaging ─┬─ Team Chat
               ├─ NPS Surveys              ├─ WhatsApp
               └─ Issues                   └─ Client Health (NPS)

Content Engine (collapsed)       ─── CONTENT ───
                                 Content Engine (collapsed)
Reports
                                 ─── INSIGHTS ───
Settings                         Reports & Analytics

                                 ─── ADMIN ───
                                 Team Directory
                                 Settings ─┬─ Organization
                                           ├─ Permissions
                                           ├─ Integrations
                                           └─ Builder (Admin only)
```

---

## 1.2 Agency Section Detail

```
Agency
├── Briefs
│   ├── All Briefs (Kanban/List/Calendar views)
│   ├── My Briefs (assigned to me)
│   ├── My Team's Briefs (for Team Leads)
│   ├── Submissions (pending review)
│   └── [Builder] ← Admin only, contextual
│
├── Projects
│   ├── Active Projects
│   ├── Project Templates
│   └── Archive
│
├── Clients
│   ├── Client List
│   ├── Client Health Overview
│   └── Add Client
│
├── Resources
│   ├── Capacity Overview
│   ├── Gantt View
│   ├── Kanban Board
│   └── Team Availability
│
└── Retainers
    ├── Active Retainers
    ├── Utilization Tracking
    └── Scope Changes (nested)
```

---

## 1.3 Hub Enhancement

Role-based personalized views:

**Account Manager View:**
```
┌─────────────────────────────────────────────────────────────────┐
│ HUB - Good morning, Matt                       Dec 31, 2025    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ YOUR FOCUS TODAY                                            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  🔴 OVERDUE (2)                                             ││
│  │  • ADEK Campaign Brief - 2 days overdue                     ││
│  │  • CCAD Social Pack - Client feedback pending               ││
│  │                                                              ││
│  │  ⚡ DUE TODAY (3)                                            ││
│  │  • DET Instagram Review • ECD Product Brief • ADEK Planning ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ MY CLIENTS           │  │ TEAM CAPACITY        │            │
│  │ ADEK ████░ 78%       │  │ Design ███░░ 62%     │            │
│  │ CCAD ██░░░ 45%       │  │ Video  ████░ 85%     │            │
│  └──────────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Leadership View:** Pipeline overview, team utilization heatmap, P&L indicators
**Designer View:** My assignments kanban, deadlines, asset library quick access

---

## Phase 1 Deliverables

- [ ] Restructure `/src/components/layout/Sidebar.tsx`
- [ ] Create `/src/app/(dashboard)/agency/` route group
- [ ] Move Briefs, Projects, Clients, Resources under Agency
- [ ] Nest Scope Changes under Retainers
- [ ] Add Builder placeholder (admin-only visibility)
- [ ] Implement role-based Hub views
- [ ] Update breadcrumbs and page titles

---

# Phase 2: Builder Infrastructure
**Timeline:** Weeks 4-5
**Effort:** Medium

---

## 2.1 Builder Concept

The Builder is where admins configure the platform without code:
- Brief Templates (form fields, workflow stages)
- Workflows (automation rules, task generation)
- Dashboard Widgets
- Report Templates
- AI Skill Configurations

---

## 2.2 Dual Access Pattern

1. **Top-Level Builder** (`/admin/builder`): Unified view of all configurable items
2. **Contextual Builder**: Within each module, admins see [Builder] shortcut

```
┌─────────────────────────────────────────────────────────────────┐
│ BUILDER                                                [Search] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Filter by Module: [All ▼]                                      │
│                                                                  │
│  BRIEF TEMPLATES                                       [+ New]  │
│  ├── Video Shoot Brief      Published    Agency                 │
│  ├── Video Edit Brief       Published    Agency                 │
│  ├── Design Brief           Published    Agency                 │
│  └── RFP Brief              Published    CRM                    │
│                                                                  │
│  WORKFLOWS                                             [+ New]  │
│  ├── RFP Submission Process Published    CRM                    │
│  ├── Client Onboarding      Published    CRM                    │
│  └── Leave Delegation       Published    Team                   │
│                                                                  │
│  DASHBOARD WIDGETS                                     [+ New]  │
│  ├── Team Capacity Gauge    Published    Agency                 │
│  └── NPS Score Card         Published    Client Health          │
│                                                                  │
│  AI SKILLS                                             [+ New]  │
│  ├── brief-quality-scorer   Active       Agency                 │
│  ├── rfp-opportunity-scorer Active       CRM                    │
│  └── delegate-matcher       Active       Team                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2.3 Builder Permissions

| Level | Access | Publish? |
|-------|--------|----------|
| **Admin** | Full access to all Builder features | Yes |
| **Template Editor** | Create/edit, submit for approval | No - requires Admin approval |
| **Department Builder** | Create/edit for own department only | No - requires Admin approval |
| **Read-Only** | View configurations | No |

### Approval Workflow

```
Department Builder creates template
              │
              ▼
    Status: DRAFT (can test in sandbox)
              │
              ▼ [Submit for Approval]
    Status: PENDING (Admin notified)
              │
     ┌────────┴────────┐
     ▼                 ▼
  [Approve]      [Request Changes]
     │                 │
     ▼                 ▼
  PUBLISHED      Back to DRAFT
  (Active)       with feedback
```

---

## 2.4 Database Schema

```prisma
model BuilderTemplate {
  id              String   @id @default(cuid())
  templateType    BuilderTemplateType
  name            String
  description     String?
  module          String   // "agency", "crm", "content"
  definition      Json     // The actual template content

  // Approval workflow
  status          TemplateStatus @default(DRAFT)
  submittedAt     DateTime?
  submittedById   String?
  approvedAt      DateTime?
  approvedById    String?
  rejectionReason String?

  // Versioning
  version         Int      @default(1)
  previousVersionId String?

  // Creator & department
  createdById     String
  departmentId    String?  // For Department Builders

  organizationId  String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, templateType, name, version])
}

enum BuilderTemplateType {
  BRIEF_TEMPLATE
  WORKFLOW
  DASHBOARD_WIDGET
  REPORT_TEMPLATE
  AI_SKILL_CONFIG
}

enum TemplateStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  PUBLISHED
  DEPRECATED
}

model BuilderPermission {
  id              String   @id @default(cuid())
  userId          String
  level           BuilderPermissionLevel
  departmentId    String?  // For DEPARTMENT_BUILDER
  templateTypes   BuilderTemplateType[]
  organizationId  String

  @@unique([userId, organizationId])
}

enum BuilderPermissionLevel {
  ADMIN
  TEMPLATE_EDITOR
  DEPARTMENT_BUILDER
  READ_ONLY
}
```

---

## Phase 2 Deliverables

- [ ] BuilderTemplate schema and migrations
- [ ] BuilderPermission system
- [ ] Top-level Builder page (`/admin/builder`)
- [ ] Contextual Builder links in modules
- [ ] Template approval workflow
- [ ] Draft/Publish status management

---

# Phase 3: Workflow Builder Engine
**Timeline:** Weeks 6-8
**Effort:** High

---

## 3.1 Vision

A flexible **Workflow Builder** that allows admins to create automated, event-driven workflows. RFP automation is one *instance* of what this builder creates - not a hardcoded feature.

**Key Insight from Albert:** "The goal is to be able to build many options - not a one-and-done spec."

---

## 3.2 Workflow Anatomy

```
WORKFLOW: "RFP Submission Process"
═══════════════════════════════════

TRIGGER
───────
When: RFP created
Condition: Status = ACTIVE

TASK TEMPLATE (auto-generated tasks)
────────────────────────────────────
┌────────────────────────────────────────────────────────┐
│ Task              │ Role         │ Due Calc            │
├────────────────────────────────────────────────────────┤
│ Initial Research  │ Strategist   │ Deadline - 21 days  │
│ Competitive Scan  │ Analyst      │ Deadline - 18 days  │
│ Draft Approach    │ Creative Dir │ Deadline - 14 days  │
│ Cost Estimation   │ Finance      │ Deadline - 12 days  │
│ First Draft       │ Copywriter   │ Deadline - 10 days  │
│ Design Mockups    │ Designer     │ Deadline - 8 days   │
│ Internal Review   │ Leadership   │ Deadline - 5 days   │
│ Final Polish      │ Copywriter   │ Deadline - 3 days   │
│ Leadership Sign-off│ MD          │ Deadline - 1 day    │
│ Submit            │ BD Lead      │ Deadline            │
└────────────────────────────────────────────────────────┘

DEPENDENCIES (Gantt-style cascade)
──────────────────────────────────
Initial Research ──► Competitive Scan ──► Draft Approach
                                              │
                                              ▼
                                        Cost Estimation
                                              │
              ┌───────────────────────────────┴────────┐
              ▼                                        ▼
         First Draft ────────────────────► Internal Review
         Design Mockups ─────────────────►      │
                                                ▼
                                          Final Polish
                                                │
                                                ▼
                                      Leadership Sign-off
                                                │
                                                ▼
                                             Submit

NUDGE RULES
───────────
• 3 days before due: Slack reminder to assignee
• 1 day before due: Slack reminder + manager CC
• On due date: Escalation to task owner
• 1 day overdue: Alert to workflow owner

STAGE GATES
───────────
• "Internal Review" requires: All prior tasks complete
• "Leadership Sign-off" requires: Approval from MD

AI SKILLS
─────────
• On create: rfp-opportunity-scorer (win probability)
• Before submit: rfp-readiness-checker (completeness)
```

---

## 3.3 Cascading Deadline Calculation

Deadlines reverse-engineer from the submission date (Gantt-style):

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  assigneeRole: string;  // Role-based assignment

  dueOffset: {
    value: number;
    unit: 'days' | 'hours' | 'weeks';
    from: 'deadline' | 'workflow_start' | 'previous_task';
  };

  dependsOn: string[];  // Task IDs that must complete first
  estimatedHours?: number;

  // Can this task auto-create a Brief?
  createsBrief?: {
    briefType: BriefType;
    titleTemplate: string;  // "RFP Pitch Deck: {{rfp.name}}"
  };
}
```

---

## 3.4 Connection to Briefs & Assets

When an RFP task requires a deliverable:

```
RFP Task: "Design Mockups"
           │
           ▼
   [Auto-create Brief]  OR  [Pull from Asset Library]
           │                        │
           ▼                        ▼
   Brief: "RFP Pitch Deck:    Search existing assets
           Dubai Tourism"      and attach
           │
           ▼
   Brief completion updates
   RFP task status
```

---

## 3.5 RFP Opportunity Scoring (AI Skill)

**Skill:** `rfp-opportunity-scorer`

| Factor | Weight | Source |
|--------|--------|--------|
| Client Fit | 25% | Industry match, size |
| Historical Win Rate | 20% | Previous similar RFPs |
| Team Confidence | 15% | BD team input |
| Competition Level | 15% | Known competitors |
| Scope Alignment | 15% | Services vs. strengths |
| Budget Fit | 10% | Value vs. typical range |

**Output:**
```json
{
  "overallScore": 78,
  "winProbability": "HIGH",
  "recommendation": "PURSUE",
  "risks": ["Tight timeline", "New sector"],
  "strengths": ["Strong portfolio", "Existing relationship"]
}
```

---

## 3.6 Database Schema

```prisma
model WorkflowTemplate {
  id                String   @id @default(cuid())
  name              String
  description       String?
  triggerType       String   // "rfp.created", "brief.created", "deal.won"
  triggerConditions Json?
  taskTemplates     Json     // Array of TaskTemplate
  nudgeRules        Json     // Array of NudgeRule
  stageGates        Json     // Array of StageGate
  aiSkills          Json     // Array of {event, skillId}
  module            String
  status            WorkflowStatus @default(DRAFT)
  publishedAt       DateTime?
  version           Int      @default(1)
  createdById       String
  organizationId    String

  instances         WorkflowInstance[]

  @@unique([organizationId, name, version])
}

model WorkflowInstance {
  id                String   @id @default(cuid())
  templateId        String
  template          WorkflowTemplate @relation(...)
  triggerEntityType String   // "RFP", "Brief", "Deal"
  triggerEntityId   String
  deadline          DateTime?
  status            WorkflowInstanceStatus @default(ACTIVE)
  completedAt       DateTime?
  organizationId    String

  tasks             WorkflowTask[]
}

model WorkflowTask {
  id              String   @id @default(cuid())
  instanceId      String
  instance        WorkflowInstance @relation(...)
  templateTaskId  String
  name            String
  assigneeId      String?
  assigneeRole    String
  dueDate         DateTime
  startedAt       DateTime?
  completedAt     DateTime?
  status          TaskStatus @default(PENDING)
  linkedBriefId   String?    // If task created a Brief
  dependsOnIds    String[]
  notes           String?
}

model WorkflowNudge {
  id              String   @id @default(cuid())
  taskId          String
  ruleId          String
  recipientId     String
  channel         String   // "slack", "email", "in_app"
  sentAt          DateTime?
  acknowledged    Boolean  @default(false)
}
```

---

## Phase 3 Deliverables

- [ ] WorkflowTemplate schema and migrations
- [ ] Workflow Builder UI (task editor, dependencies, Gantt preview)
- [ ] Cascading deadline calculator
- [ ] Nudge rule configuration and dispatcher
- [ ] Stage gate configuration
- [ ] AI skill integration points
- [ ] Task → Brief auto-creation
- [ ] RFP workflow template (as first example)

---

# Phase 4: Delegation of Authority System
**Timeline:** Weeks 9-11
**Effort:** High

---

## 4.1 Vision

When someone goes on leave, the system **knows** and **acts intelligently**. No manual task reassignment. This is "air traffic control" for professional services workforce management.

---

## 4.2 Delegation Triggers

| Trigger | Description |
|---------|-------------|
| **Existing Tasks** | All in-progress tasks assigned to the person |
| **Future Routing** | Tasks that would normally route to this role |
| **New Assignments** | Tasks assigned during leave period |

---

## 4.3 Delegation Chain Logic

```
Task needs assignee "Matt" (AM, Design briefs, Client: ADEK)
                 │
                 ▼
    ┌─────────────────────────┐
    │ Is Matt available?       │
    │ (Check leave calendar)   │
    └───────────┬─────────────┘
          NO    │
                ▼
    ┌─────────────────────────┐
    │ Get Matt's delegate     │
    │ (Salma - same role)     │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │ Is Salma available?      │
    └───────────┬─────────────┘
          NO    │
                ▼
    ┌─────────────────────────┐
    │ Chain to Salma's delegate│
    │ (Ted - next in chain)    │
    └───────────┬─────────────┘
          NO    │
                ▼
    ┌─────────────────────────┐
    │ Escalate to Dept Head   │
    │ (CJ - Client Services)  │
    │ Alert: "Coverage gap"   │
    └───────────┬─────────────┘
                │
                ▼
    ┌─────────────────────────┐
    │ Admin notified if       │
    │ still unresolved        │
    └─────────────────────────┘
```

---

## 4.4 Like-for-Like Matching

| Original Role | Valid Delegates | Invalid Delegates |
|---------------|-----------------|-------------------|
| Senior AM | Senior AM, AM Lead | Junior AM, Intern |
| Designer | Designer (same level) | Copywriter, AM |
| Leadership | Leadership | Staff |

---

## 4.5 Air Traffic Control: Leave Conflict Detection

When a leave request is submitted:

```
┌─────────────────────────────────────────────────────────────────┐
│ LEAVE CONFLICT DETECTION                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Matt requests leave: Dec 20-27                                  │
│                                                                  │
│  ⚠️ CONFLICT DETECTED                                           │
│                                                                  │
│  Matt's delegate: Salma                                          │
│  Salma's status Dec 20-27: ON LEAVE (Dec 18-26)                 │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  MANAGER NOTIFICATION (CJ - Client Services Director)           │
│                                                                  │
│  "You have 3 pending leave requests. Two of them have           │
│   DOA backing up activities for each other:                     │
│                                                                  │
│   • Matt (Dec 20-27) → delegates to Salma                       │
│   • Salma (Dec 18-26) → delegates to Matt                       │
│                                                                  │
│   Options:                                                       │
│   [Approve with chain delegation to Ted]                        │
│   [Request date adjustment]                                     │
│   [Assign alternative delegate]"                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4.6 Return & Handoff

When the person returns from leave:

```
Day before return (Dec 26, 6pm)
────────────────────────────────
📧 Email: "Welcome back tomorrow! Handoff scheduled"

Return day (Dec 27, 9am)
────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│ AI-GENERATED HANDOFF BRIEFING                                    │
│ Summary: Dec 20-27 Coverage by Salma                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ COMPLETED (3):                                                   │
│ ✓ ADEK Social Pack - Delivered Dec 22                           │
│ ✓ CCAD Holiday Video - Client approved Dec 24                   │
│ ✓ DET Instagram Stories - Published Dec 26                      │
│                                                                  │
│ IN PROGRESS (4):                                                 │
│ → ADEK Campaign Brief - In client review (feedback due)         │
│ → CCAD Q1 Strategy - 60% complete, on track                     │
│ → ECD Product Launch - Awaiting assets from client              │
│ → ADEK Event Coverage - Scheduled for Jan 3                     │
│                                                                  │
│ ESCALATED (1):                                                   │
│ ⚠️ CCAD Budget Issue - Escalated to CJ, needs your input        │
│                                                                  │
│ NEW ASSIGNMENTS (2):                                             │
│ + ADEK New Year Post - Assigned Dec 23, due Jan 2               │
│ + DET Partnership Deck - Assigned Dec 26, due Jan 5             │
│                                                                  │
│ [View full log] [Schedule sync with Salma]                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Handoff meeting auto-scheduled: 30-min Matt ↔ Salma
AI-generated agenda attached
Tasks auto-reassigned back to Matt
```

---

## 4.7 Delegation Scope Configuration

Users can configure what they delegate:

```typescript
interface DelegationProfile {
  userId: string;
  primaryDelegateId: string;

  scope: {
    clients: 'all' | string[];           // All or specific clients
    briefTypes: 'all' | BriefType[];     // All or specific types
    valueThreshold?: number;             // Escalate above this
    authority: 'full' | 'execute_only' | 'monitor_only';
  };

  escalation: {
    escalateIf: ('over_threshold' | 'new_client' | 'high_priority')[];
    escalateTo: string;  // Manager ID
  };
}
```

---

## 4.8 Database Schema

```prisma
model DelegationProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  primaryDelegateId String?
  scope             Json     // DelegationScope
  escalationRules   Json
  organizationId    String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model ActiveDelegation {
  id                String   @id @default(cuid())
  delegatorId       String
  delegateId        String
  leaveRequestId    String?
  startDate         DateTime
  endDate           DateTime
  scopeSnapshot     Json
  status            DelegationStatus @default(ACTIVE)
  handoffScheduled  Boolean  @default(false)
  handoffCompletedAt DateTime?
  handoffNotes      String?
  organizationId    String

  activities        DelegationActivity[]

  @@index([delegatorId, status])
  @@index([startDate, endDate])
}

model DelegationActivity {
  id                  String   @id @default(cuid())
  activeDelegationId  String
  activityType        DelegationActivityType
  entityType          String   // "brief", "task", "approval"
  entityId            String
  description         String
  metadata            Json?
  performedById       String
  createdAt           DateTime @default(now())
}

enum DelegationStatus {
  PENDING
  ACTIVE
  COMPLETED
  CANCELLED
}

enum DelegationActivityType {
  TASK_ASSIGNED
  TASK_COMPLETED
  TASK_ESCALATED
  APPROVAL_GIVEN
  DECISION_MADE
  CLIENT_COMMUNICATION
}
```

---

## 4.9 AI Skills for DOA

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `delegate-matcher` | Leave request | Find best-fit delegate (role, capacity, skills) |
| `leave-conflict-detector` | Leave request | Detect mutual delegation conflicts |
| `handoff-briefing-generator` | Day before return | Generate return briefing + meeting agenda |
| `delegation-load-balancer` | Scheduled | Alert if someone is over-delegated |

---

## Phase 4 Deliverables

- [ ] DelegationProfile schema and migrations
- [ ] ActiveDelegation tracking
- [ ] Leave request conflict detection UI
- [ ] Delegation chain resolution logic
- [ ] Return handoff automation
- [ ] Handoff briefing generator (AI skill)
- [ ] Integration with Leave Management module
- [ ] Delegate-matcher AI skill

---

# Phase 5: Integration & Polish
**Timeline:** Weeks 12-14
**Effort:** Medium

---

## 5.1 End-to-End Testing

- [ ] Full RFP workflow: create → auto-tasks → nudges → approval → submit
- [ ] DOA flow: leave request → conflict check → delegation → return handoff
- [ ] Builder: create template → approve → publish → use
- [ ] Navigation: all routes work, breadcrumbs correct

---

## 5.2 First Workflow Templates

Using the Workflow Builder, create:
- [ ] RFP Submission Process (10 tasks, cascading deadlines)
- [ ] Client Onboarding (triggered when Deal won)
- [ ] Leave Delegation (triggered when leave approved)

---

## 5.3 Documentation

- [ ] Admin guide: How to use Builder
- [ ] User guide: Understanding delegations
- [ ] API documentation for workflows

---

## 5.4 Role-Based Hub Views

Finalize Hub personalization for:
- [ ] Account Manager view
- [ ] Designer view
- [ ] Leadership view
- [ ] Client Portal view

---

## 5.5 Demo to Albert

- [ ] Show NPS portal (already exists!)
- [ ] Demo Workflow Builder with RFP example
- [ ] Demo DOA with leave conflict detection
- [ ] Walk through new navigation

---

# Technical Specifications

## Database Schema Summary

See individual phase sections for detailed schemas. Summary of new models:

| Model | Phase | Purpose |
|-------|-------|---------|
| `BuilderTemplate` | 2 | Store configurable templates |
| `BuilderPermission` | 2 | Builder access control |
| `WorkflowTemplate` | 3 | Workflow definitions |
| `WorkflowInstance` | 3 | Running workflow instances |
| `WorkflowTask` | 3 | Individual tasks in workflow |
| `WorkflowNudge` | 3 | Reminder/nudge log |
| `DelegationProfile` | 4 | User delegation config |
| `ActiveDelegation` | 4 | Active delegation periods |
| `DelegationActivity` | 4 | Delegation action log |

## AI Skills Summary

| Skill | Phase | Trigger |
|-------|-------|---------|
| `rfp-opportunity-scorer` | 3 | RFP created |
| `rfp-readiness-checker` | 3 | Before RFP submit |
| `workflow-task-assigner` | 3 | Task created |
| `delegate-matcher` | 4 | Leave request |
| `leave-conflict-detector` | 4 | Leave request |
| `handoff-briefing-generator` | 4 | Day before return |
| `delegation-load-balancer` | 4 | Scheduled |

## Files to Create/Modify

### Phase 0
- `/src/modules/resources/components/KanbanBoard.tsx` (fix filter)
- `/src/modules/briefs/components/BriefCard.tsx` (add Briefed By)
- `/src/modules/briefs/components/BriefForm.tsx` (add Project selector)

### Phase 1
- `/src/components/layout/Sidebar.tsx` (restructure)
- `/src/app/(dashboard)/agency/` (new route group)
- `/src/app/(dashboard)/hub/` (role-based views)

### Phase 2
- `/src/app/(dashboard)/admin/builder/` (Builder pages)
- `/src/modules/builder/` (new module)

### Phase 3
- `/src/modules/workflows/` (new module)
- `/src/lib/workflow-engine.ts` (execution engine)

### Phase 4
- `/src/modules/delegation/` (new module)
- Integration with `/src/modules/leave/`

---

# Appendices

## Appendix A: Meeting Action Items

From Will & Albert session:

1. **Will:** Move Briefs under Agency, create Builder module ✓ (Phase 1)
2. **Albert:** Check for dead links in Agency section
3. **Albert:** Screen grabs of current system + written explanation
4. **Both:** Review NPS portal (already exists - demo needed)

## Appendix B: NPS Portal Status

**Already Implemented:**
- Agency: `/feedback/nps` - Survey creation, sending, analytics
- Portal: `/portal/dashboard/nps` - Client response submission
- Analytics: Promoter/Passive/Detractor classification, quarterly tracking

**Location in Sidebar:** Client Health → NPS Surveys

## Appendix C: Monday.com Features to Replicate

1. ✓ Form → Auto-subtask creation (Phase 3)
2. ✓ Deadline-based date calculation (Phase 3)
3. ✓ Role-based auto-assignment (Phase 3)
4. ✓ Integrated Slack nudging (Phase 3)
5. ✓ Status-triggered notifications (Phase 3)

## Appendix D: Priority Matrix

| Priority | Item | Phase | Status |
|----------|------|-------|--------|
| P0 | Fix board filter bug | 0 | ⬜ |
| P1 | Briefed By visibility | 0 | ⬜ |
| P1 | Project selector | 0 | ⬜ |
| P1 | Navigation restructure | 1 | ⬜ |
| P2 | Builder infrastructure | 2 | ⬜ |
| P2 | Workflow Builder | 3 | ⬜ |
| P3 | DOA System | 4 | ⬜ |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | Will & Albert Session | Combined epic from feedback + specs |
