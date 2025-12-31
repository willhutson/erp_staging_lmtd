# Workflow Module

## Overview

The Workflow module is the automation engine for SpokeStack. It enables no-code workflow creation that automatically:
- Generates tasks when triggers fire (e.g., RFP created)
- Calculates cascading deadlines based on a final date
- Auto-assigns tasks based on roles and availability
- Sends reminders (nudges) before/on/after due dates
- Tracks all activity for audit and reporting

## Architecture

### Core Concepts

```
WorkflowTemplate     →    WorkflowInstance    →    WorkflowTask
(Definition)              (Running Instance)       (Individual Task)
                               ↓
                          WorkflowNudge
                          WorkflowActivity
```

**WorkflowTemplate**: A reusable workflow definition with:
- Trigger (what starts it)
- Task templates (what tasks to create)
- Nudge rules (when to remind)
- Stage gates (approval checkpoints)
- AI skill integrations

**WorkflowInstance**: A running workflow tied to an entity (RFP, Brief, etc.)

**WorkflowTask**: An individual task with assignee, due date, status

### Trigger Types

```typescript
TRIGGER_TYPES = {
  // RFP/Sales
  "rfp.created": { module: "crm", entityType: "RFP" },
  "deal.won": { module: "crm", entityType: "Deal" },

  // Briefs
  "brief.created": { module: "agency", entityType: "Brief" },
  "brief.submitted": { module: "agency", entityType: "Brief" },

  // Content
  "content_plan.created": { module: "content", entityType: "ContentPlan" },

  // Schedule-based
  "schedule.monthly": { module: "content", entityType: "Schedule" },
  "schedule.weekly": { module: "content", entityType: "Schedule" },

  // Team
  "leave.approved": { module: "team", entityType: "LeaveRequest" },
}
```

### Deadline Calculation

Tasks calculate due dates relative to the final deadline:

```typescript
dueOffset: {
  value: 21,
  unit: "days",
  from: "deadline"  // or "workflow_start" or "previous_task"
}
```

If deadline is Jan 31 and offset is -21 days, task due Jan 10.

Dependencies are respected - a task cannot be due before its dependencies.

## Files

```
/src/modules/workflows/
├── index.ts                          # Module exports
├── types/
│   └── index.ts                     # TypeScript definitions
├── services/
│   ├── workflow-engine.ts           # Core engine (start, complete, etc.)
│   ├── deadline-calculator.ts       # Date calculation logic
│   ├── auto-assigner.ts             # Role-based assignment
│   ├── nudge-dispatcher.ts          # Reminder system
│   └── activity-logger.ts           # Audit logging
└── CLAUDE.md                        # This file
```

## Usage

### Starting a Workflow

```typescript
import { startWorkflow } from "@/modules/workflows";

const instance = await startWorkflow({
  templateId: "cuid-of-template",
  triggerEntityType: "RFP",
  triggerEntityId: rfp.id,
  deadline: new Date("2025-01-31"),
  ownerId: session.user.id,
  variables: {
    rfpName: rfp.name,
    clientName: rfp.client.name,
  },
});
```

### Completing a Task

```typescript
import { completeTask } from "@/modules/workflows";

await completeTask(taskId, userId, "Notes about completion");
```

### Calculating Critical Path

```typescript
import { calculateCriticalPath, calculateTaskDates } from "@/modules/workflows";

const dates = calculateTaskDates(taskTemplates, deadline);
const criticalPath = calculateCriticalPath(taskTemplates, dates);
// Returns array of task IDs on the longest dependency chain
```

## Example Templates

### RFP Submission Process

```json
{
  "triggerType": "rfp.created",
  "triggerConditions": [{ "field": "status", "operator": "equals", "value": "ACTIVE" }],
  "taskTemplates": [
    {
      "id": "research",
      "name": "Initial Research",
      "assigneeRole": "strategist",
      "dueOffset": { "value": 21, "unit": "days", "from": "deadline" },
      "dependsOn": []
    },
    {
      "id": "approach",
      "name": "Draft Approach",
      "assigneeRole": "creative_director",
      "dueOffset": { "value": 14, "unit": "days", "from": "deadline" },
      "dependsOn": ["research"]
    }
  ],
  "nudgeRules": [
    {
      "id": "3-day-warning",
      "name": "3 Day Warning",
      "trigger": { "type": "before_due", "offset": 3, "unit": "days" },
      "recipients": ["assignee"],
      "channel": "SLACK",
      "messageTemplate": "{{taskName}} is due {{dueDateRelative}}"
    }
  ]
}
```

### Monthly Content Calendar

```json
{
  "triggerType": "schedule.monthly",
  "taskTemplates": [
    {
      "id": "content-planning",
      "name": "Content Planning Session",
      "assigneeRole": "strategist",
      "dueOffset": { "value": 25, "unit": "days", "from": "deadline" },
      "dependsOn": []
    },
    {
      "id": "content-approval",
      "name": "Content Calendar Approval",
      "assigneeRole": "account_director",
      "dueOffset": { "value": 20, "unit": "days", "from": "deadline" },
      "dependsOn": ["content-planning"]
    }
  ]
}
```

## Database Models

See `/prisma/schema.prisma` for:
- `WorkflowTemplate`
- `WorkflowInstance`
- `WorkflowTask`
- `WorkflowNudge`
- `WorkflowActivity`

## Integration Points

### Triggering from Entity Creation

```typescript
// In RFP creation action:
import { startWorkflow, checkTriggerConditions } from "@/modules/workflows";

// Find matching templates
const templates = await db.workflowTemplate.findMany({
  where: { triggerType: "rfp.created", status: "PUBLISHED" }
});

for (const template of templates) {
  if (checkTriggerConditions(template.triggerConditions, rfp)) {
    await startWorkflow({
      templateId: template.id,
      triggerEntityType: "RFP",
      triggerEntityId: rfp.id,
      deadline: rfp.deadline,
      ownerId: session.user.id,
    });
  }
}
```

### Cron Jobs

```typescript
// Process nudges every 15 minutes
import { processDueNudges } from "@/modules/workflows";

const sentCount = await processDueNudges();
console.log(`Sent ${sentCount} nudges`);
```

## Security

- Workflows respect organizationId scoping
- All changes logged in WorkflowActivity
- Templates require PUBLISHED status to run
- Task assignment respects user permissions and availability

## Future Enhancements

- Visual workflow builder (drag-and-drop)
- Gantt chart preview
- Stage gate approval UI
- AI skill integration for auto-decisions
- Parallel task support
- Conditional branching
