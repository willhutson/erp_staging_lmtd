# SpokeStack Initiative Specifications
## DOA System, Workflow Builder, Navigation Restructure

**Version:** 1.0
**Date:** December 2025
**Source:** Will & Albert Feedback Session
**Status:** Specification Draft

---

## Table of Contents

1. [Initiative 1: Delegation of Authority (DOA) System](#initiative-1-delegation-of-authority-doa-system)
2. [Initiative 2: Workflow Builder & RFP Automation](#initiative-2-workflow-builder--rfp-automation)
3. [Initiative 3: Navigation Restructure & Builder Module](#initiative-3-navigation-restructure--builder-module)
4. [Cross-Initiative Dependencies](#cross-initiative-dependencies)
5. [Implementation Sequence](#implementation-sequence)

---

# Initiative 1: Delegation of Authority (DOA) System

## Vision

When someone goes on leave, the system should **know** and **act intelligently** - not require manual task reassignment. This is "air traffic control" for professional services workforce management.

## Core Concepts

### Delegation Triggers

| Trigger | Description | Example |
|---------|-------------|---------|
| **Existing Tasks** | All in-progress tasks assigned to the person | Matt has 12 active briefs when leave starts |
| **Future Routing** | Tasks that would normally route to this role/person | New briefs for Matt's clients during his absence |
| **New Assignments** | Tasks assigned during leave period | Someone tries to assign Matt while he's away |

### Delegation Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                    DELEGATION CHAIN LOGIC                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Task needs assignee "Matt" (AM, Design briefs, Client: ADEK)   │
│                           │                                      │
│                           ▼                                      │
│              ┌─────────────────────────┐                        │
│              │ Is Matt available?       │                        │
│              │ (Check leave calendar)   │                        │
│              └───────────┬─────────────┘                        │
│                    NO    │                                       │
│                          ▼                                       │
│              ┌─────────────────────────┐                        │
│              │ Get Matt's delegate     │                        │
│              │ (Salma - same role)     │                        │
│              └───────────┬─────────────┘                        │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────────┐                        │
│              │ Is Salma available?      │                        │
│              └───────────┬─────────────┘                        │
│                    NO    │                                       │
│                          ▼                                       │
│              ┌─────────────────────────┐                        │
│              │ Get Salma's delegate    │                        │
│              │ (Chain delegation)       │                        │
│              └───────────┬─────────────┘                        │
│                    NO    │  (also unavailable)                   │
│                          ▼                                       │
│              ┌─────────────────────────┐                        │
│              │ Escalate to Dept Head   │                        │
│              │ (CJ - Client Services)  │                        │
│              │ Alert: "Coverage gap"   │                        │
│              └───────────┬─────────────┘                        │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────────┐                        │
│              │ Admin notified if       │                        │
│              │ still unresolved        │                        │
│              └─────────────────────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Like-for-Like Matching

Delegation must respect role equivalence:

| Original Role | Valid Delegates | Invalid Delegates |
|---------------|-----------------|-------------------|
| Senior AM | Senior AM, AM Lead | Junior AM, Intern |
| Designer | Designer (same level) | Copywriter, AM |
| Video Editor | Video Editor | Designer |
| Leadership | Leadership | Staff |

**AI Skill: `delegate-matcher`**
- Inputs: User going on leave, their tasks, available team
- Logic: Match by role, seniority, skills, client familiarity, current capacity
- Output: Ranked list of suitable delegates

---

## Air Traffic Control: Leave Conflict Detection

When a leave request is submitted, the system proactively checks for conflicts:

```
┌─────────────────────────────────────────────────────────────────┐
│              LEAVE REQUEST CONFLICT DETECTION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Matt requests leave: Dec 20-27                                  │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ CONFLICT CHECK #1: Delegate Availability                 │    │
│  │                                                          │    │
│  │ Matt's delegate: Salma                                   │    │
│  │ Salma's status Dec 20-27: ON LEAVE (Dec 18-26)          │    │
│  │                                                          │    │
│  │ ⚠️  CONFLICT: Primary delegate unavailable               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ CONFLICT CHECK #2: Coverage Gap Analysis                 │    │
│  │                                                          │    │
│  │ Clients affected: ADEK, CCAD                            │    │
│  │ Active briefs: 8 (3 due during leave period)            │    │
│  │ Chain delegate: Ted (available, 78% capacity)           │    │
│  │                                                          │    │
│  │ ✓ Chain delegation possible but flagged                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ MANAGER NOTIFICATION (CJ - Client Services Director)    │    │
│  │                                                          │    │
│  │ "You have 3 pending leave requests. Two of them have    │    │
│  │  DOA backing up activities for each other:              │    │
│  │                                                          │    │
│  │  • Matt (Dec 20-27) → delegates to Salma                │    │
│  │  • Salma (Dec 18-26) → delegates to Matt                │    │
│  │                                                          │    │
│  │  Options:                                                │    │
│  │  [Approve with chain delegation to Ted]                 │    │
│  │  [Request date adjustment]                              │    │
│  │  [Assign alternative delegate]"                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Return & Handoff

When the person returns from leave:

### Automated Handoff Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN FROM LEAVE FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Day before return (Dec 26, 6pm)                                │
│  ─────────────────────────────────                              │
│  📧 Email to Matt: "Welcome back tomorrow! Handoff scheduled"   │
│                                                                  │
│  Return day (Dec 27, 9am)                                       │
│  ────────────────────────                                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ AI-GENERATED HANDOFF BRIEFING                           │    │
│  │                                                          │    │
│  │ 📋 Summary: Dec 20-27 Coverage by Salma                 │    │
│  │                                                          │    │
│  │ COMPLETED (3):                                           │    │
│  │ ✓ ADEK Social Pack - Delivered Dec 22                   │    │
│  │ ✓ CCAD Holiday Video - Client approved Dec 24           │    │
│  │ ✓ DET Instagram Stories - Published Dec 26              │    │
│  │                                                          │    │
│  │ IN PROGRESS (4):                                         │    │
│  │ → ADEK Campaign Brief - In client review (feedback due) │    │
│  │ → CCAD Q1 Strategy - 60% complete, on track             │    │
│  │ → ECD Product Launch - Awaiting assets from client      │    │
│  │ → ADEK Event Coverage - Scheduled for Jan 3             │    │
│  │                                                          │    │
│  │ ESCALATED (1):                                           │    │
│  │ ⚠️ CCAD Budget Issue - Escalated to CJ, needs your input│    │
│  │                                                          │    │
│  │ NEW ASSIGNMENTS (2):                                     │    │
│  │ + ADEK New Year Post - Assigned Dec 23, due Jan 2       │    │
│  │ + DET Partnership Deck - Assigned Dec 26, due Jan 5     │    │
│  │                                                          │    │
│  │ [View full activity log] [Schedule sync with Salma]     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Handoff meeting (auto-scheduled)                               │
│  ────────────────────────────────                               │
│  📅 30-min meeting: Matt ↔ Salma                                │
│  📝 AI-generated agenda attached                                │
│  🎯 Focus: Escalated items + in-progress context                │
│                                                                  │
│  Task reassignment                                              │
│  ─────────────────                                              │
│  All tasks auto-reassigned back to Matt                         │
│  Salma removed as delegate                                      │
│  Notifications resume to Matt                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Delegation Scope Configuration

Users can configure what they delegate:

### Delegation Profile (User Settings)

```typescript
interface DelegationProfile {
  userId: string;

  // Primary delegate (like-for-like role)
  primaryDelegateId: string;

  // Scope configuration
  scope: {
    // Client-based restrictions
    clients: 'all' | string[];  // All clients or specific IDs

    // Brief type restrictions
    briefTypes: 'all' | BriefType[];  // All types or specific types

    // Value threshold (escalate above this)
    valueThreshold?: number;  // e.g., 5000 = delegate under $5K

    // Authority level
    authority: 'full' | 'execute_only' | 'monitor_only';
  };

  // Escalation rules
  escalation: {
    // What triggers escalation to manager
    escalateIf: ('over_threshold' | 'new_client' | 'high_priority')[];
    escalateTo: string;  // Manager ID
  };
}
```

### Example Configurations

**Matt (Senior AM) - Full Delegation:**
```json
{
  "primaryDelegateId": "salma_id",
  "scope": {
    "clients": "all",
    "briefTypes": "all",
    "authority": "full"
  }
}
```

**Junior Designer - Limited Delegation:**
```json
{
  "primaryDelegateId": "senior_designer_id",
  "scope": {
    "clients": ["adek_id", "ccad_id"],
    "briefTypes": ["DESIGN"],
    "valueThreshold": 2000,
    "authority": "execute_only"
  },
  "escalation": {
    "escalateIf": ["over_threshold", "new_client"],
    "escalateTo": "design_lead_id"
  }
}
```

---

## Database Schema Additions

```prisma
// Delegation configuration per user
model DelegationProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])

  primaryDelegateId String?
  primaryDelegate   User?    @relation("PrimaryDelegate", fields: [primaryDelegateId], references: [id])

  // Scope as JSON for flexibility
  scope             Json     @default("{\"clients\":\"all\",\"briefTypes\":\"all\",\"authority\":\"full\"}")
  escalationRules   Json     @default("{}")

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])
}

// Active delegation periods (when someone is on leave)
model ActiveDelegation {
  id                String   @id @default(cuid())

  // Who is delegating
  delegatorId       String
  delegator         User     @relation("Delegator", fields: [delegatorId], references: [id])

  // Who is receiving delegation
  delegateId        String
  delegate          User     @relation("Delegate", fields: [delegateId], references: [id])

  // Link to leave request
  leaveRequestId    String?
  leaveRequest      LeaveRequest? @relation(fields: [leaveRequestId], references: [id])

  // Period
  startDate         DateTime
  endDate           DateTime

  // Scope snapshot (captured at delegation start)
  scopeSnapshot     Json

  // Status
  status            DelegationStatus @default(ACTIVE)

  // Handoff tracking
  handoffScheduled  Boolean  @default(false)
  handoffCompletedAt DateTime?
  handoffNotes      String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  organizationId    String
  organization      Organization @relation(fields: [organizationId], references: [id])

  @@index([delegatorId, status])
  @@index([delegateId, status])
  @@index([startDate, endDate])
}

enum DelegationStatus {
  PENDING      // Scheduled but not started
  ACTIVE       // Currently in effect
  COMPLETED    // Leave ended, handoff done
  CANCELLED    // Leave cancelled
}

// Delegation activity log
model DelegationActivity {
  id                String   @id @default(cuid())
  activeDelegationId String
  activeDelegation  ActiveDelegation @relation(fields: [activeDelegationId], references: [id])

  // What happened
  activityType      DelegationActivityType

  // Reference to affected entity
  entityType        String   // "brief", "task", "approval", etc.
  entityId          String

  // Details
  description       String
  metadata          Json?

  // Who performed the action (the delegate)
  performedById     String
  performedBy       User     @relation(fields: [performedById], references: [id])

  createdAt         DateTime @default(now())

  @@index([activeDelegationId])
}

enum DelegationActivityType {
  TASK_ASSIGNED      // New task routed to delegate
  TASK_COMPLETED     // Delegate completed a task
  TASK_ESCALATED     // Delegate escalated to manager
  APPROVAL_GIVEN     // Delegate approved something
  DECISION_MADE      // Delegate made a decision
  CLIENT_COMMUNICATION // Delegate communicated with client
}
```

---

## AI Skills for DOA

### 1. `delegate-matcher`
**Trigger:** Leave request submitted
**Inputs:** User, leave dates, their tasks, available team
**Outputs:** Ranked delegate suggestions with match scores

### 2. `leave-conflict-detector`
**Trigger:** Leave request submitted
**Inputs:** Leave request, existing approved leaves, delegation chains
**Outputs:** Conflict report, suggested resolutions

### 3. `handoff-briefing-generator`
**Trigger:** Day before return from leave
**Inputs:** Active delegation record, all delegation activities
**Outputs:** Structured briefing document, meeting agenda

### 4. `delegation-load-balancer`
**Trigger:** On-demand or scheduled
**Inputs:** All active delegations, team capacity
**Outputs:** Recommendations to rebalance if someone is over-delegated

---

## User Stories

### US-DOA-1: Configure My Delegate
> As an **Account Manager**, I want to configure who backs me up when I'm away, so that my clients have continuity.

**Acceptance Criteria:**
- Can select primary delegate from like-for-like roles
- Can restrict delegation by client or brief type
- Can set value threshold for escalation
- System validates delegate is appropriate role level

### US-DOA-2: Submit Leave with Confidence
> As a **Team Member**, I want the system to check for delegation conflicts when I submit leave, so that I know coverage is sorted before I go.

**Acceptance Criteria:**
- See conflict warnings before submitting
- See who will cover my tasks
- Option to adjust dates or delegate if conflicts exist

### US-DOA-3: Approve Leave as Manager
> As a **Department Head**, I want to see delegation implications when approving leave, so that I can ensure adequate coverage.

**Acceptance Criteria:**
- See all pending leaves in my team
- See delegation chain for each request
- Alert when mutual delegates both request leave
- Can override or reassign delegates

### US-DOA-4: Cover for Colleague Seamlessly
> As a **Delegate**, I want to receive clear handoff information and notifications, so that I can cover effectively.

**Acceptance Criteria:**
- Receive notification when delegation activates
- See all delegated tasks in dedicated view
- All nudges/notifications route to me
- Can escalate if needed

### US-DOA-5: Return from Leave Smoothly
> As a **Returning Employee**, I want an AI-generated briefing of what happened while I was away, so that I can get up to speed quickly.

**Acceptance Criteria:**
- Receive briefing day before return
- See completed, in-progress, and escalated items
- Handoff meeting auto-scheduled
- Tasks automatically reassigned back to me

---

# Initiative 2: Workflow Builder & RFP Automation

## Vision

A flexible **Workflow Builder** that allows admins to create automated, event-driven workflows. RFP automation is one *instance* of what this builder can create - not a hardcoded feature.

## Core Concepts

### Workflow = Template + Triggers + Tasks + Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                     WORKFLOW ANATOMY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WORKFLOW: "RFP Submission Process"                             │
│  ═══════════════════════════════════                            │
│                                                                  │
│  TRIGGER                                                         │
│  ───────                                                         │
│  When: RFP created                                               │
│  Condition: Status = ACTIVE                                      │
│                                                                  │
│  TASK TEMPLATE (auto-generated tasks)                           │
│  ─────────────────────────────────────                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ Task              │ Role         │ Due Calc            │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │ Initial Research  │ Strategist   │ Deadline - 21 days  │     │
│  │ Competitive Scan  │ Analyst      │ Deadline - 18 days  │     │
│  │ Draft Approach    │ Creative Dir │ Deadline - 14 days  │     │
│  │ Cost Estimation   │ Finance      │ Deadline - 12 days  │     │
│  │ First Draft       │ Copywriter   │ Deadline - 10 days  │     │
│  │ Design Mockups    │ Designer     │ Deadline - 8 days   │     │
│  │ Internal Review   │ Leadership   │ Deadline - 5 days   │     │
│  │ Final Polish      │ Copywriter   │ Deadline - 3 days   │     │
│  │ Leadership Sign-off│ MD          │ Deadline - 1 day    │     │
│  │ Submit            │ BD Lead      │ Deadline            │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  DEPENDENCIES (Gantt-style)                                      │
│  ──────────────────────────                                      │
│  Initial Research ──► Competitive Scan ──► Draft Approach       │
│                                               │                  │
│                                               ▼                  │
│                                         Cost Estimation          │
│                                               │                  │
│  ┌────────────────────────────────────────────┴────────┐        │
│  │                                                      │        │
│  ▼                                                      ▼        │
│  First Draft ──────────────────────────► Internal Review        │
│  Design Mockups ──────────────────────►      │                  │
│                                              ▼                  │
│                                        Final Polish             │
│                                              │                  │
│                                              ▼                  │
│                                    Leadership Sign-off          │
│                                              │                  │
│                                              ▼                  │
│                                           Submit                │
│                                                                  │
│  NUDGE RULES                                                     │
│  ───────────                                                     │
│  • 3 days before due: Slack reminder to assignee                │
│  • 1 day before due: Slack reminder + manager CC                │
│  • On due date: Escalation to task owner                        │
│  • 1 day overdue: Alert to workflow owner                       │
│                                                                  │
│  STAGE GATES                                                     │
│  ───────────                                                     │
│  • "Internal Review" requires: All prior tasks complete         │
│  • "Leadership Sign-off" requires: Approval from MD             │
│                                                                  │
│  AI SKILLS                                                       │
│  ─────────                                                       │
│  • On create: rfp-opportunity-scorer (win probability)          │
│  • Before submit: rfp-readiness-checker (completeness)          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cascading Deadline Calculation

Deadlines reverse-engineer from the submission date:

```typescript
interface TaskTemplate {
  id: string;
  name: string;

  // Who does this task
  assigneeRole: string;  // Role-based, not named person
  assigneeOverride?: string;  // Optional: specific person

  // When is it due (relative to workflow deadline)
  dueOffset: {
    value: number;
    unit: 'days' | 'hours' | 'weeks';
    from: 'deadline' | 'workflow_start' | 'previous_task';
  };

  // Dependencies
  dependsOn: string[];  // Task IDs that must complete first

  // Estimated effort
  estimatedHours?: number;

  // Can this task auto-create a Brief?
  createsBrief?: {
    briefType: BriefType;
    titleTemplate: string;  // e.g., "RFP Pitch Deck: {{rfp.name}}"
  };
}

// Example: Calculate actual due dates
function calculateTaskDueDates(
  workflowDeadline: Date,
  taskTemplates: TaskTemplate[]
): Map<string, Date> {
  const dueDates = new Map<string, Date>();

  for (const task of taskTemplates) {
    let baseDate = workflowDeadline;

    if (task.dueOffset.from === 'previous_task' && task.dependsOn.length > 0) {
      // Get latest dependency due date
      const depDates = task.dependsOn.map(id => dueDates.get(id)!);
      baseDate = new Date(Math.max(...depDates.map(d => d.getTime())));
    }

    const dueDate = subtractTime(baseDate, task.dueOffset.value, task.dueOffset.unit);
    dueDates.set(task.id, dueDate);
  }

  return dueDates;
}
```

---

## RFP Opportunity Scoring (AI Skill)

**Skill: `rfp-opportunity-scorer`**

Scores commercial opportunity based on:

| Factor | Weight | Data Source |
|--------|--------|-------------|
| Client Fit | 25% | Industry match, size, location |
| Historical Win Rate | 20% | Previous RFPs with similar clients |
| Team Confidence | 15% | Survey/input from BD team |
| Competition Level | 15% | Known competitors, incumbent status |
| Scope Alignment | 15% | Services requested vs. our strengths |
| Budget Fit | 10% | Estimated value vs. our typical range |

**Output:**
```json
{
  "overallScore": 78,
  "winProbability": "HIGH",
  "recommendation": "PURSUE",
  "factors": {
    "clientFit": { "score": 85, "notes": "Perfect industry match, similar to ADEK" },
    "historicalWinRate": { "score": 72, "notes": "Won 3/5 similar RFPs in 2024" },
    "teamConfidence": { "score": 80, "notes": "Team rated 4/5 confidence" },
    "competitionLevel": { "score": 65, "notes": "2 known competitors, no incumbent" },
    "scopeAlignment": { "score": 90, "notes": "Core services: video, social, paid" },
    "budgetFit": { "score": 75, "notes": "$50K estimate within sweet spot" }
  },
  "risks": [
    "Tight timeline (3 weeks to submission)",
    "New sector for us (hospitality)"
  ],
  "strengths": [
    "Strong portfolio in similar scope",
    "Previous relationship with procurement lead"
  ]
}
```

---

## Workflow Builder UI Concepts

### Builder Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  WORKFLOW BUILDER                                    [Save Draft]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Workflow Name: [RFP Submission Process          ]              │
│  Trigger: [When RFP Created ▼] Condition: [Status = Active ▼]   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ TASKS                                              [+ Add]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ ≡ Initial Research                                   │   ││
│  │  │   Role: [Strategist ▼]  Due: [Deadline ▼] - [21] days│   ││
│  │  │   Depends on: [None]                                 │   ││
│  │  │   □ Creates Brief: [Type ▼] Title: [________]       │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                          │                                  ││
│  │                          ▼                                  ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ ≡ Competitive Scan                                   │   ││
│  │  │   Role: [Analyst ▼]     Due: [Deadline ▼] - [18] days│   ││
│  │  │   Depends on: [Initial Research ▼]                   │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                          │                                  ││
│  │                          ▼                                  ││
│  │                        [...]                                ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ NUDGE RULES                                        [+ Add]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  • [3] days before due → [Slack ▼] to [Assignee ▼]         ││
│  │  • [1] day before due → [Slack ▼] to [Assignee + Manager ▼]││
│  │  • [0] days (due) → [Escalate ▼] to [Task Owner ▼]         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STAGE GATES                                        [+ Add]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  • Before [Leadership Sign-off ▼]: Require [Approval ▼]    ││
│  │    from [MD Role ▼]                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ AI SKILLS                                          [+ Add]  ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  • On [Create ▼]: Run [rfp-opportunity-scorer ▼]           ││
│  │  • On [Before Submit ▼]: Run [rfp-readiness-checker ▼]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Preview Gantt]  [Test Workflow]  [Publish]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Connection to Briefs & Assets

When an RFP task requires a deliverable:

```
┌─────────────────────────────────────────────────────────────────┐
│            RFP TASK → BRIEF → DELIVERABLE FLOW                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RFP: "Dubai Tourism Board Pitch"                               │
│  Task: "Design Mockups"                                         │
│                                                                  │
│       ┌──────────────────────────────────────────┐              │
│       │ Task requires deliverable                 │              │
│       │ [Auto-create Brief ▼]                     │              │
│       └─────────────────┬────────────────────────┘              │
│                         │                                        │
│           ┌─────────────┴─────────────┐                         │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌─────────────────┐        ┌─────────────────┐                │
│  │ CREATE NEW      │        │ PULL FROM       │                │
│  │ BRIEF           │        │ ASSET LIBRARY   │                │
│  ├─────────────────┤        ├─────────────────┤                │
│  │ Type: DESIGN    │        │ Search:         │                │
│  │ Title: "RFP     │        │ [pitch deck   ] │                │
│  │  Pitch Deck:    │        │                 │                │
│  │  Dubai Tourism" │        │ Results:        │                │
│  │ Due: RFP Due -8d│        │ • ADEK Pitch'24 │                │
│  │ Assignee: Via   │        │ • CCAD Deck     │                │
│  │  role mapping   │        │ • Template v3   │                │
│  │                 │        │                 │                │
│  │ [Create & Link] │        │ [Use as Base]   │                │
│  └─────────────────┘        └─────────────────┘                │
│                                                                  │
│  Brief linked to RFP task                                       │
│  ─────────────────────────                                      │
│  • Brief completion updates task status                         │
│  • Brief deliverable attaches to RFP                           │
│  • Time tracked against both Brief AND RFP                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Additions

```prisma
// Workflow template definition
model WorkflowTemplate {
  id              String   @id @default(cuid())
  name            String
  description     String?

  // What triggers this workflow
  triggerType     String   // "rfp.created", "brief.created", "deal.won", etc.
  triggerConditions Json?  // Additional conditions

  // Task templates
  taskTemplates   Json     // Array of TaskTemplate objects

  // Nudge rules
  nudgeRules      Json     // Array of NudgeRule objects

  // Stage gates
  stageGates      Json     // Array of StageGate objects

  // AI skills to run
  aiSkills        Json     // Array of {event, skillId} objects

  // Module this belongs to
  module          String   // "rfp", "briefs", "onboarding", etc.

  // Status
  status          WorkflowStatus @default(DRAFT)
  publishedAt     DateTime?

  // Versioning
  version         Int      @default(1)

  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Instances of this workflow
  instances       WorkflowInstance[]

  @@unique([organizationId, name, version])
}

enum WorkflowStatus {
  DRAFT
  PUBLISHED
  DEPRECATED
}

// Running instance of a workflow
model WorkflowInstance {
  id              String   @id @default(cuid())
  templateId      String
  template        WorkflowTemplate @relation(fields: [templateId], references: [id])

  // What entity triggered this workflow
  triggerEntityType String  // "RFP", "Brief", "Deal", etc.
  triggerEntityId   String

  // Calculated deadline (for cascading dates)
  deadline        DateTime?

  // Status
  status          WorkflowInstanceStatus @default(ACTIVE)
  completedAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Generated tasks
  tasks           WorkflowTask[]

  @@index([triggerEntityType, triggerEntityId])
}

enum WorkflowInstanceStatus {
  ACTIVE
  COMPLETED
  CANCELLED
  PAUSED
}

// Individual task in a workflow instance
model WorkflowTask {
  id              String   @id @default(cuid())
  instanceId      String
  instance        WorkflowInstance @relation(fields: [instanceId], references: [id])

  // From template
  templateTaskId  String   // Reference to task in template
  name            String

  // Assignment
  assigneeId      String?
  assignee        User?    @relation(fields: [assigneeId], references: [id])
  assigneeRole    String   // Role it was assigned by

  // Timing
  dueDate         DateTime
  startedAt       DateTime?
  completedAt     DateTime?

  // Status
  status          TaskStatus @default(PENDING)

  // If this task created a Brief
  linkedBriefId   String?
  linkedBrief     Brief?   @relation(fields: [linkedBriefId], references: [id])

  // Dependencies
  dependsOnIds    String[] // WorkflowTask IDs

  // Notes/outcome
  notes           String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([instanceId, status])
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  BLOCKED
  COMPLETED
  SKIPPED
}

// Nudge/reminder log
model WorkflowNudge {
  id              String   @id @default(cuid())
  taskId          String
  task            WorkflowTask @relation(fields: [taskId], references: [id])

  // What nudge rule triggered this
  ruleId          String

  // Who was nudged
  recipientId     String
  recipient       User     @relation(fields: [recipientId], references: [id])

  // Channel
  channel         String   // "slack", "email", "in_app"

  // Status
  sentAt          DateTime?
  acknowledged    Boolean  @default(false)

  createdAt       DateTime @default(now())
}
```

---

## User Stories

### US-WF-1: Create Workflow Template
> As an **Admin**, I want to create workflow templates with auto-generated tasks, so that repetitive processes are automated.

**Acceptance Criteria:**
- Can define trigger event and conditions
- Can add tasks with role-based assignment
- Can set cascading deadlines (relative to workflow deadline)
- Can define task dependencies
- Can preview as Gantt chart

### US-WF-2: Configure Nudge Rules
> As an **Admin**, I want to configure when and how people get reminded, so that nothing falls through the cracks.

**Acceptance Criteria:**
- Can set time-based nudges (X days before due)
- Can set event-based nudges (dependency completed)
- Can choose channel (Slack, email, in-app)
- Can choose recipients (assignee, manager, owner)
- Can configure escalation path

### US-WF-3: Link Tasks to Briefs
> As an **Admin**, I want workflow tasks to auto-create linked Briefs, so that deliverables are tracked in our standard system.

**Acceptance Criteria:**
- Can configure task to create Brief on start
- Brief inherits due date from task
- Brief assignee from task assignee
- Brief completion updates task status
- Can alternatively link to Asset Library items

### US-WF-4: Score RFP Opportunity
> As a **BD Lead**, I want AI to score our win probability when an RFP is created, so that we prioritize effectively.

**Acceptance Criteria:**
- Auto-runs on RFP creation
- Considers client fit, historical wins, team confidence
- Provides score, recommendation, and rationale
- Score visible on RFP card and detail view

### US-WF-5: Receive Smart Nudges
> As a **Task Assignee**, I want to receive contextual reminders via Slack, so that I stay on top of my workflow tasks.

**Acceptance Criteria:**
- Nudges include task context, due date, link
- Can acknowledge/snooze from Slack
- Escalation if ignored
- No spam - smart batching of multiple nudges

---

# Initiative 3: Navigation Restructure & Builder Module

## Vision

Make the platform more intuitive with logical groupings, while providing powerful admin tools (Builder) that are accessible but not cluttering the main experience.

## Navigation Restructure

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
                                               ├─ Brief Templates
                                               ├─ Workflows
                                               ├─ Dashboards
                                               ├─ Reports
                                               └─ AI Skills
```

### Agency Section Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                      AGENCY SECTION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agency                                                          │
│  ├── Briefs                                                      │
│  │   ├── All Briefs (Kanban/List/Calendar views)               │
│  │   ├── My Briefs (assigned to me)                            │
│  │   ├── My Team's Briefs (for Team Leads)                     │
│  │   ├── Submissions (pending review)                          │
│  │   └── [Builder] ← Admin only, contextual                    │
│  │       ├── Brief Templates                                    │
│  │       ├── Form Fields                                        │
│  │       └── Workflow Stages                                    │
│  │                                                               │
│  ├── Projects                                                    │
│  │   ├── Active Projects                                        │
│  │   ├── Project Templates                                      │
│  │   └── Archive                                                │
│  │                                                               │
│  ├── Clients                                                     │
│  │   ├── Client List                                            │
│  │   ├── Client Health Overview                                 │
│  │   └── Add Client                                             │
│  │                                                               │
│  ├── Resources                                                   │
│  │   ├── Capacity Overview                                      │
│  │   ├── Gantt View                                             │
│  │   ├── Kanban Board                                           │
│  │   └── Team Availability                                      │
│  │                                                               │
│  └── Retainers                                                   │
│      ├── Active Retainers                                       │
│      ├── Utilization Tracking                                   │
│      └── Scope Changes (nested)                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Builder Module

### Dual Access Pattern

1. **Top-Level Builder** (Admin > Builder): Unified view of all configurable items
2. **Contextual Builder**: Within each module, admins see [Builder] shortcut

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOP-LEVEL BUILDER                             │
│                    (Admin > Builder)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ BUILDER                                             [Search]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                              ││
│  │  Filter by Module: [All ▼]                                  ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ BRIEF TEMPLATES                            [+ New]   │   ││
│  │  ├─────────────────────────────────────────────────────┤   ││
│  │  │ • Video Shoot Brief      Published    Agency        │   ││
│  │  │ • Video Edit Brief       Published    Agency        │   ││
│  │  │ • Design Brief           Published    Agency        │   ││
│  │  │ • Copywriting Brief      Published    Agency        │   ││
│  │  │ • RFP Brief              Published    CRM           │   ││
│  │  │ • Campaign Brief         Draft        Content       │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ WORKFLOWS                                  [+ New]   │   ││
│  │  ├─────────────────────────────────────────────────────┤   ││
│  │  │ • RFP Submission Process Published    CRM           │   ││
│  │  │ • Client Onboarding      Published    CRM           │   ││
│  │  │ • Brief Approval Chain   Published    Agency        │   ││
│  │  │ • Leave Delegation       Published    Team          │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ DASHBOARD WIDGETS                          [+ New]   │   ││
│  │  ├─────────────────────────────────────────────────────┤   ││
│  │  │ • Team Capacity Gauge    Published    Agency        │   ││
│  │  │ • NPS Score Card         Published    Client Health │   ││
│  │  │ • RFP Pipeline           Published    CRM           │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ REPORT TEMPLATES                           [+ New]   │   ││
│  │  ├─────────────────────────────────────────────────────┤   ││
│  │  │ • Monthly Client Report  Published    Reports       │   ││
│  │  │ • Team Utilization       Published    Reports       │   ││
│  │  │ • RFP Win/Loss Analysis  Published    Reports       │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ AI SKILLS                                  [+ New]   │   ││
│  │  ├─────────────────────────────────────────────────────┤   ││
│  │  │ • brief-quality-scorer   Active       Agency        │   ││
│  │  │ • rfp-opportunity-scorer Active       CRM           │   ││
│  │  │ • delegate-matcher       Active       Team          │   ││
│  │  │ • smart-assigner         Active       Agency        │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Builder Permission Levels

```
┌─────────────────────────────────────────────────────────────────┐
│                   BUILDER PERMISSIONS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ADMIN (Will, Albert, Afaq)                                     │
│  ───────────────────────────                                    │
│  • Full access to all Builder features                          │
│  • Can create, edit, publish, delete templates                  │
│  • Can configure AI skills                                      │
│  • Can manage permissions for others                            │
│                                                                  │
│  TEMPLATE EDITOR (Department Leads)                             │
│  ──────────────────────────────────                             │
│  • Can create templates (saved as Draft)                        │
│  • Can edit existing templates                                  │
│  • Cannot publish - requires Admin approval                     │
│  • Can test workflows in sandbox                                │
│                                                                  │
│  DEPARTMENT BUILDER (e.g., Design Lead for Design templates)    │
│  ───────────────────────────────────────────────────────────    │
│  • Can create/edit templates for their department only          │
│  • e.g., Design Lead can build Design Brief templates           │
│  • Cannot modify other department templates                     │
│  • Publishing requires Admin approval                           │
│                                                                  │
│  READ-ONLY (Leadership who want visibility)                     │
│  ──────────────────────────────────────────                     │
│  • Can view all templates and configurations                    │
│  • Cannot create or modify                                      │
│  • Can comment/suggest changes                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Template Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│              TEMPLATE APPROVAL WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Department Builder creates template                             │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────────┐                                    │
│  │   Status: DRAFT         │                                    │
│  │   Can test in sandbox   │                                    │
│  └───────────┬─────────────┘                                    │
│              │                                                   │
│              ▼ [Submit for Approval]                            │
│  ┌─────────────────────────┐                                    │
│  │   Status: PENDING       │                                    │
│  │   Admin notified        │                                    │
│  └───────────┬─────────────┘                                    │
│              │                                                   │
│     ┌────────┴────────┐                                         │
│     │                 │                                         │
│     ▼                 ▼                                         │
│  [Approve]        [Request Changes]                             │
│     │                 │                                         │
│     ▼                 ▼                                         │
│  ┌─────────┐    ┌─────────────┐                                │
│  │PUBLISHED│    │ Back to     │                                │
│  │ Active  │    │ DRAFT with  │                                │
│  │ in use  │    │ feedback    │                                │
│  └─────────┘    └─────────────┘                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Hub Enhancement

The Hub is a **global command center** showing personalized views based on role.

### Role-Based Hub Views

```
┌─────────────────────────────────────────────────────────────────┐
│                    HUB - GLOBAL VIEW                             │
│                    (Role: Account Manager)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Good morning, Matt                            Dec 31, 2025     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ YOUR FOCUS TODAY                                            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                              ││
│  │  🔴 OVERDUE (2)                                             ││
│  │  • ADEK Campaign Brief - 2 days overdue                     ││
│  │  • CCAD Social Pack - Client feedback pending               ││
│  │                                                              ││
│  │  ⚡ DUE TODAY (3)                                            ││
│  │  • DET Instagram Review - Internal review                   ││
│  │  • ECD Product Brief - Assign designer                      ││
│  │  • ADEK Q1 Planning - Draft strategy                        ││
│  │                                                              ││
│  │  📅 COMING UP (5)                                            ││
│  │  • Tomorrow: CCAD Video Edit review                         ││
│  │  • Jan 3: ADEK Event Coverage                               ││
│  │  • Jan 5: DET Partnership Deck                              ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ MY CLIENTS           │  │ TEAM CAPACITY        │            │
│  ├──────────────────────┤  ├──────────────────────┤            │
│  │ ADEK      ████░ 78%  │  │ Design    ███░░ 62%  │            │
│  │ CCAD      ██░░░ 45%  │  │ Video     ████░ 85%  │            │
│  │ DET       ███░░ 55%  │  │ Copy      ██░░░ 40%  │            │
│  │ ECD       █░░░░ 20%  │  │ Paid      ███░░ 58%  │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ RECENT ACTIVITY                                             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ • Salma approved ADEK Video Edit - 2 hours ago              ││
│  │ • Client CCAD commented on Social Pack - 3 hours ago        ││
│  │ • You assigned DET brief to Mariam - Yesterday              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Different Role Views

**Leadership View:**
- Pipeline overview (RFP status, win rate)
- Team utilization heatmap
- Client health scores
- P&L indicators

**Designer View:**
- My assignments (Kanban)
- Upcoming deadlines
- Asset library quick access
- Time tracked this week

**Client Portal View:**
- Active projects status
- Pending approvals
- Recent deliverables
- NPS survey prompt (if pending)

---

## Database Schema Additions

```prisma
// Builder template metadata
model BuilderTemplate {
  id              String   @id @default(cuid())

  // Type of template
  templateType    BuilderTemplateType

  // Naming
  name            String
  description     String?

  // Module it belongs to
  module          String   // "agency", "crm", "content", etc.

  // The actual template content (form fields, workflow def, etc.)
  definition      Json

  // Status and approval
  status          TemplateStatus @default(DRAFT)
  submittedAt     DateTime?
  submittedById   String?
  approvedAt      DateTime?
  approvedById    String?
  rejectionReason String?

  // Versioning
  version         Int      @default(1)
  previousVersionId String?

  // Creator
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])

  // Department restriction (for Department Builders)
  departmentId    String?
  department      Department? @relation(fields: [departmentId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

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

// Builder permission assignments
model BuilderPermission {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  // Permission level
  level           BuilderPermissionLevel

  // Scope restriction (optional)
  departmentId    String?  // Only for DEPARTMENT_BUILDER
  department      Department? @relation(fields: [departmentId], references: [id])

  templateTypes   BuilderTemplateType[]  // Which types they can access

  createdAt       DateTime @default(now())

  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  @@unique([userId, organizationId])
}

enum BuilderPermissionLevel {
  ADMIN              // Full access
  TEMPLATE_EDITOR    // Create/edit, submit for approval
  DEPARTMENT_BUILDER // Create/edit for own department
  READ_ONLY          // View only
}

// Hub widget configuration per user
model HubConfiguration {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])

  // Widget layout
  widgets         Json     // Array of {widgetType, position, config}

  // Preferences
  defaultView     String   @default("focus")  // "focus", "kanban", "calendar"

  updatedAt       DateTime @updatedAt
}
```

---

## User Stories

### US-NAV-1: Navigate by Context
> As a **Team Member**, I want navigation grouped by what I'm trying to do, so that I can find features intuitively.

**Acceptance Criteria:**
- Agency work grouped together (Briefs, Projects, Clients)
- Admin features separated from daily work
- Consistent location for Builder (admin only)

### US-NAV-2: Access Builder Contextually
> As an **Admin**, I want to access the Builder from within each module, so that I can quickly edit related templates.

**Acceptance Criteria:**
- [Builder] link visible in each module (admin only)
- Links to filtered view of that module's templates
- Can also access full Builder from Admin section

### US-BUILD-1: Create Template with Approval
> As a **Department Builder**, I want to create templates that go through approval, so that I can contribute without risking production.

**Acceptance Criteria:**
- Can create templates (saved as Draft)
- Can test in sandbox mode
- Submit for Approval sends to Admin
- Admin can approve or request changes
- Only approved templates go live

### US-BUILD-2: Configure AI Skills
> As an **Admin**, I want to configure when AI skills run, so that I can customize automation for our workflows.

**Acceptance Criteria:**
- Can see available AI skills
- Can assign skills to workflow events
- Can configure skill parameters
- Can enable/disable skills

### US-HUB-1: See My Personalized View
> As a **Team Member**, I want the Hub to show what matters for my role, so that I start each day focused.

**Acceptance Criteria:**
- Hub shows role-appropriate widgets
- Focus section shows overdue, due today, upcoming
- Can customize widget layout
- Different views for different roles

---

# Cross-Initiative Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                 INITIATIVE DEPENDENCIES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │   NAVIGATION    │                                            │
│  │   RESTRUCTURE   │                                            │
│  └────────┬────────┘                                            │
│           │ Provides home for...                                │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │    BUILDER      │────────►│   WORKFLOW      │               │
│  │    MODULE       │ Creates │   BUILDER       │               │
│  └────────┬────────┘         └────────┬────────┘               │
│           │                           │                         │
│           │ Manages...                │ Configures...           │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │ Brief Templates │         │  DOA Workflows  │               │
│  │ AI Skills       │         │  (Leave-aware   │               │
│  │ Dashboards      │         │   delegation)   │               │
│  │ Reports         │         │                 │               │
│  └─────────────────┘         └─────────────────┘               │
│                                                                  │
│  RECOMMENDED BUILD ORDER:                                        │
│  ────────────────────────                                        │
│  1. Navigation Restructure (foundation)                         │
│  2. Builder Module (infrastructure for configuration)           │
│  3. Workflow Builder (generic workflow engine)                  │
│  4. DOA System (specific workflow implementation)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Implementation Sequence

## Phase 1: Navigation Foundation (Week 1-2)

**Deliverables:**
- [ ] Restructure sidebar navigation
- [ ] Move Briefs under Agency
- [ ] Create Agency section with Projects, Clients, Resources, Retainers
- [ ] Add Builder placeholder (admin-only visibility)
- [ ] Hub enhancements with role-based views

**Files to Modify:**
- `/src/components/layout/Sidebar.tsx`
- `/src/app/(dashboard)/layout.tsx`
- Create `/src/app/(dashboard)/agency/` route group

## Phase 2: Builder Infrastructure (Week 3-4)

**Deliverables:**
- [ ] BuilderTemplate schema and migrations
- [ ] Builder permission system
- [ ] Top-level Builder page (`/admin/builder`)
- [ ] Contextual Builder links in modules
- [ ] Template approval workflow

**Files to Create:**
- `/src/app/(dashboard)/admin/builder/page.tsx`
- `/src/modules/builder/` module
- Builder permission utilities

## Phase 3: Workflow Builder (Week 5-7)

**Deliverables:**
- [ ] WorkflowTemplate schema
- [ ] Workflow Builder UI
- [ ] Task template editor
- [ ] Cascading deadline calculator
- [ ] Nudge rule configuration
- [ ] Stage gate configuration
- [ ] Gantt preview

**Files to Create:**
- `/src/modules/workflows/` module
- Workflow execution engine
- Nudge/notification dispatcher

## Phase 4: DOA System (Week 8-10)

**Deliverables:**
- [ ] DelegationProfile schema
- [ ] ActiveDelegation tracking
- [ ] Leave request conflict detection
- [ ] Delegation chain logic
- [ ] Return handoff automation
- [ ] AI skills: delegate-matcher, leave-conflict-detector, handoff-briefing-generator

**Files to Create:**
- `/src/modules/delegation/` module
- Integration with Leave Management
- Handoff briefing generator

## Phase 5: Integration & Polish (Week 11-12)

**Deliverables:**
- [ ] RFP workflow template (using Workflow Builder)
- [ ] RFP opportunity scorer AI skill
- [ ] End-to-end testing
- [ ] Documentation
- [ ] Role-based Hub views finalized

---

# Appendix: AI Skills Summary

| Skill | Initiative | Trigger | Purpose |
|-------|------------|---------|---------|
| `delegate-matcher` | DOA | Leave request | Find best-fit delegate |
| `leave-conflict-detector` | DOA | Leave request | Detect delegation conflicts |
| `handoff-briefing-generator` | DOA | Day before return | Generate return briefing |
| `delegation-load-balancer` | DOA | Scheduled/on-demand | Rebalance over-delegation |
| `rfp-opportunity-scorer` | Workflow | RFP created | Score win probability |
| `rfp-readiness-checker` | Workflow | Before RFP submit | Validate completeness |
| `workflow-task-assigner` | Workflow | Task created | Match role to person |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | Will & Albert Session | Initial specification |
