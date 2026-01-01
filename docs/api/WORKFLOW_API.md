# Workflow API Documentation

This document describes the server actions and services for the Workflow Engine in SpokeStack.

## Overview

The Workflow Engine automates multi-step processes with:
- Trigger-based activation
- Task dependencies and cascading deadlines
- Role-based auto-assignment
- Nudge notifications
- Stage gates for approvals

## Server Actions

All actions are located in `/src/modules/workflows/actions/`.

### Starting a Workflow

```typescript
import { startWorkflowAction } from "@/modules/workflows/actions";

const result = await startWorkflowAction({
  templateId: "template-uuid",
  triggerEntityType: "RFP",
  triggerEntityId: "rfp-uuid",
  deadline: new Date("2025-02-15"),
  ownerId: "user-uuid",
  variables: {
    rfpName: "ACME Corp Pitch",
    clientName: "ACME Corp"
  }
});
```

### Getting Workflows

```typescript
import {
  getActiveWorkflows,
  getWorkflowById,
  getWorkflowsByEntity
} from "@/modules/workflows/actions";

// Get all active workflows for the organization
const workflows = await getActiveWorkflows();

// Get a specific workflow with tasks
const workflow = await getWorkflowById(workflowId);

// Get workflows for a specific entity
const rfpWorkflows = await getWorkflowsByEntity("RFP", rfpId);
```

### Managing Tasks

```typescript
import {
  completeTaskAction,
  startTaskAction,
  blockTaskAction,
  reassignTaskAction
} from "@/modules/workflows/actions";

// Complete a task
await completeTaskAction(taskId, {
  outputs: { deliverable_url: "https://..." }
});

// Start working on a task
await startTaskAction(taskId);

// Block a task with reason
await blockTaskAction(taskId, "Waiting for client assets");

// Reassign to different user
await reassignTaskAction(taskId, newAssigneeId, "Original assignee on leave");
```

### Workflow Status Updates

```typescript
import { cancelWorkflowAction } from "@/modules/workflows/actions";

// Cancel a workflow
await cancelWorkflowAction(workflowId, "Client cancelled project");
```

## Services

### Workflow Engine

Location: `/src/modules/workflows/services/workflow-engine.ts`

Core execution engine for workflow operations.

```typescript
import {
  startWorkflow,
  completeTask,
  startTask,
  blockTask,
  reassignTask,
  cancelWorkflow
} from "@/modules/workflows/services/workflow-engine";
```

#### startWorkflow

Creates a new workflow instance from a template.

```typescript
async function startWorkflow(
  templateId: string,
  options: {
    triggerEntityType: string;
    triggerEntityId: string;
    deadline?: Date;
    ownerId: string;
    variables?: Record<string, unknown>;
  }
): Promise<WorkflowInstance>
```

#### completeTask

Marks a task as complete and unlocks dependent tasks.

```typescript
async function completeTask(
  taskId: string,
  options?: {
    outputs?: Record<string, unknown>;
    completedById?: string;
  }
): Promise<WorkflowTask>
```

### Deadline Calculator

Location: `/src/modules/workflows/services/deadline-calculator.ts`

Calculates task due dates based on dependencies.

```typescript
import {
  calculateTaskDates,
  recalculateDatesForDelay,
  calculateCriticalPath,
  calculateBufferDays
} from "@/modules/workflows/services/deadline-calculator";
```

#### calculateTaskDates

Calculates dates for all tasks based on workflow deadline.

```typescript
async function calculateTaskDates(
  templateId: string,
  workflowDeadline: Date,
  workflowStartDate?: Date
): Promise<CalculatedTaskDates[]>

// Returns:
interface CalculatedTaskDates {
  taskId: string;
  dueDate: Date;
  canStart: boolean;
}
```

#### recalculateDatesForDelay

Adjusts dates when a task is delayed.

```typescript
async function recalculateDatesForDelay(
  workflowInstanceId: string,
  delayedTaskId: string,
  newDueDate: Date
): Promise<Map<string, Date>>
```

### Auto-Assigner

Location: `/src/modules/workflows/services/auto-assigner.ts`

Assigns tasks based on roles and availability.

```typescript
import {
  assignTasksForWorkflow,
  findBestAssignee,
  getAssignmentReasons
} from "@/modules/workflows/services/auto-assigner";
```

#### findBestAssignee

Finds the best user for a task role.

```typescript
async function findBestAssignee(
  organizationId: string,
  role: string,
  options?: {
    excludeUserIds?: string[];
    preferUserId?: string;
    checkAvailability?: boolean;
  }
): Promise<{ userId: string; reason: string } | null>
```

Considers:
- Role/department match
- Current workload
- Availability (not on leave)
- Delegation chains

### Nudge Dispatcher

Location: `/src/modules/workflows/services/nudge-dispatcher.ts`

Handles reminder notifications.

```typescript
import {
  scheduleTaskNudges,
  processDueNudges,
  acknowledgeNudge,
  getPendingNudgesForUser
} from "@/modules/workflows/services/nudge-dispatcher";
```

#### scheduleTaskNudges

Creates nudge records for a task.

```typescript
async function scheduleTaskNudges(
  task: WorkflowTask,
  nudgeRules: NudgeRule[]
): Promise<void>
```

#### processDueNudges

Processes and sends due nudges (called by cron).

```typescript
async function processDueNudges(): Promise<number>
```

Returns count of nudges sent.

### Activity Logger

Location: `/src/modules/workflows/services/activity-logger.ts`

Audit trail for workflow events.

```typescript
import {
  logWorkflowActivity,
  getWorkflowTimeline,
  getRecentActivity
} from "@/modules/workflows/services/activity-logger";
```

## Types

Location: `/src/modules/workflows/types/index.ts`

### WorkflowTemplateDefinition

```typescript
interface WorkflowTemplateDefinition {
  triggerType: string;
  triggerConditions: TriggerCondition[];
  taskTemplates: TaskTemplate[];
  nudgeRules: NudgeRule[];
  stageGates: StageGate[];
  aiSkills: AISkillReference[];
}
```

### TaskTemplate

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  assigneeRole: string;
  assigneeUserId?: string;
  dueOffset: {
    value: number;
    unit: "hours" | "days" | "weeks";
    from: "deadline" | "workflow_start" | "previous_task";
  };
  dependsOn: string[];
  estimatedHours?: number;
  createsBrief?: {
    briefType: string;
    titleTemplate: string;
    formDefaults?: Record<string, unknown>;
  };
  requiresApproval?: boolean;
  approverRole?: string;
}
```

### NudgeRule

```typescript
interface NudgeRule {
  id: string;
  name: string;
  trigger: {
    type: "before_due" | "on_due" | "after_due" | "task_started" | "task_blocked";
    offset?: number;
    unit?: "hours" | "days";
  };
  recipients: ("assignee" | "manager" | "owner" | "creator")[];
  channel: "SLACK" | "EMAIL" | "IN_APP";
  messageTemplate: string;
  taskIds?: string[];
}
```

### TriggerCondition

```typescript
interface TriggerCondition {
  field: string;
  operator: "equals" | "not_equals" | "in" | "not_in" | "gt" | "lt" | "contains";
  value: unknown;
}
```

## Trigger Types

Available workflow triggers:

| Trigger | Module | Entity |
|---------|--------|--------|
| `rfp.created` | crm | RFP |
| `rfp.status_changed` | crm | RFP |
| `deal.won` | crm | Deal |
| `deal.created` | crm | Deal |
| `brief.created` | agency | Brief |
| `brief.submitted` | agency | Brief |
| `brief.completed` | agency | Brief |
| `content_plan.created` | content | ContentPlan |
| `content_plan.approved` | content | ContentPlan |
| `project.created` | agency | Project |
| `project.started` | agency | Project |
| `schedule.monthly` | content | Schedule |
| `schedule.weekly` | content | Schedule |
| `leave.approved` | team | LeaveRequest |

## Cron Jobs

### Nudge Processing

**Endpoint:** `/api/cron/nudges`
**Schedule:** Every 15 minutes
**Purpose:** Process and send due nudges

### Delegation Management

**Endpoint:** `/api/cron/delegations`
**Schedule:** Daily at 2 AM UTC
**Purpose:** Activate delegations, start handoffs, send reminders

## Error Handling

All actions throw errors on failure:

```typescript
try {
  await completeTaskAction(taskId, { outputs });
} catch (error) {
  if (error.message.includes("not found")) {
    // Task doesn't exist
  } else if (error.message.includes("already complete")) {
    // Task already completed
  } else if (error.message.includes("blocked")) {
    // Task is blocked by dependencies
  }
}
```

## Examples

### Complete RFP Workflow Setup

```typescript
// 1. Start workflow when RFP is created
const workflow = await startWorkflowAction({
  templateId: "rfp-submission-template-id",
  triggerEntityType: "RFP",
  triggerEntityId: rfpId,
  deadline: rfp.submissionDeadline,
  ownerId: session.user.id,
  variables: {
    rfpName: rfp.entityName,
    clientName: rfp.entityName,
  }
});

// 2. Tasks are auto-assigned based on roles
// 3. Nudges are scheduled automatically
// 4. As tasks complete, dependent tasks unlock

// 5. Complete tasks as work is done
await completeTaskAction(researchTaskId, {
  outputs: {
    research_doc_url: "https://drive.google.com/..."
  }
});

// 6. Monitor progress
const status = await getWorkflowById(workflow.id);
console.log(`Progress: ${status.completedTasks}/${status.totalTasks}`);
```

### Handling Task Delays

```typescript
// When a task will be delayed
const newDates = await recalculateDatesForDelay(
  workflowId,
  delayedTaskId,
  new Date("2025-02-20")
);

// Update dependent tasks
for (const [taskId, newDate] of newDates) {
  await updateTaskDueDate(taskId, newDate);
}
```

## Related Documentation

- [Admin Builder Guide](/docs/guides/ADMIN_BUILDER_GUIDE.md)
- [User Delegation Guide](/docs/guides/USER_DELEGATION_GUIDE.md)
