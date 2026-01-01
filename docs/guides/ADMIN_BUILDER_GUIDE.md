# Builder Administration Guide

The Builder is SpokeStack's template management system for creating and managing workflow templates, brief templates, dashboard widgets, and AI skill configurations.

## Access Requirements

- **Permission Level:** ADMIN or LEADERSHIP
- **Location:** Admin > Builder (`/admin/builder`)

## Template Types

### 1. Workflow Templates

Automated multi-step processes triggered by events.

| Field | Description |
|-------|-------------|
| Name | Display name for the workflow |
| Trigger Type | Event that starts the workflow (e.g., `rfp.created`, `deal.won`, `leave.approved`) |
| Tasks | Ordered list of tasks with dependencies |
| Nudge Rules | Reminder notifications before/after deadlines |
| Stage Gates | Approval checkpoints |

**Example Use Cases:**
- RFP Submission Process (10 tasks, 21-day timeline)
- Client Onboarding (17 tasks, 14-day timeline)
- Content Series Production (18 tasks across 4 phases)

### 2. Brief Templates

Form configurations for different brief types.

| Field | Description |
|-------|-------------|
| Sections | Grouped fields with headers |
| Fields | Input fields (text, date, select, file, etc.) |
| Stages | Brief lifecycle stages |
| Auto-Assignment | Rules for automatic assignee selection |

### 3. Dashboard Widgets

Custom dashboard components.

| Field | Description |
|-------|-------------|
| Data Source | Query for widget data |
| Visualization | card, chart, table, list, metric |
| Refresh Interval | How often to reload (seconds) |
| Permissions | Who can see this widget |

### 4. AI Skill Configurations

AI automation hooks for workflows.

| Field | Description |
|-------|-------------|
| Model | AI model to use |
| System Prompt | Instructions for the AI |
| Triggers | Events that invoke the skill |
| Output Format | text, json, structured |

## Creating a Template

### Step 1: Navigate to Builder

1. Go to **Admin > Builder** in the sidebar
2. Click **New Template**

### Step 2: Select Template Type

Choose from:
- Workflow
- Brief Template
- Dashboard Widget
- AI Skill Config

### Step 3: Configure Template

For **Workflow Templates:**

```
1. Set trigger type and conditions
2. Add tasks with:
   - Name and description
   - Assignee role (strategist, designer, etc.)
   - Due offset (days/hours before deadline)
   - Dependencies (which tasks must complete first)
   - Estimated hours
3. Add nudge rules for reminders
4. Add stage gates for approvals
5. Optionally add AI skill hooks
```

### Step 4: Save and Review

Templates are saved as **Draft** initially.

## Template Lifecycle

```
Draft → Pending Approval → Approved → Published
                ↓
            Rejected (with feedback)
```

### Statuses

| Status | Description |
|--------|-------------|
| DRAFT | Being edited, not visible to users |
| PENDING_APPROVAL | Submitted for review |
| APPROVED | Reviewed and approved |
| PUBLISHED | Active and available for use |
| ARCHIVED | No longer in use |

## Approval Workflow

1. **Editor** creates template and submits for approval
2. **Admin** reviews template
3. **Admin** approves or rejects with feedback
4. If approved, template becomes available

## Permission Levels

| Level | Can Create | Can Edit | Can Approve | Can Publish |
|-------|------------|----------|-------------|-------------|
| READ_ONLY | No | No | No | No |
| DEPT_BUILDER | Own dept only | Own templates | No | No |
| EDITOR | All types | All templates | No | No |
| ADMIN | All types | All templates | Yes | Yes |

## Version Control

Templates support versioning:
- Each edit creates a new version
- Previous versions are preserved
- Can rollback to earlier versions
- Active version is clearly marked

## Best Practices

### Workflow Design

1. **Start with the deadline** - Work backwards to set task due dates
2. **Keep dependencies minimal** - Avoid creating bottlenecks
3. **Use appropriate nudge intervals** - 7 days, 3 days, 1 day, overdue
4. **Add stage gates sparingly** - Only where approval is truly needed

### Role Assignment

Use standard role keys:
- `strategist`, `senior_strategist`
- `designer`, `senior_designer`, `art_director`
- `copywriter`
- `videographer`, `video_editor`
- `account_manager`, `account_director`
- `producer`, `project_manager`
- `creative_director`, `managing_director`
- `finance`

### Nudge Rules

Recommended pattern:
```
- 7 days before: Slack notification to assignee
- 3 days before: Slack notification to assignee
- 1 day before: Slack + email to assignee and manager
- 1 day overdue: Email to assignee, manager, and owner
```

## Troubleshooting

### Template not appearing

1. Check status is PUBLISHED
2. Verify trigger conditions match
3. Check user has permission to see workflows

### Workflow not starting

1. Verify trigger event is firing
2. Check trigger conditions are met
3. Look for errors in activity log

### Tasks not assigning

1. Check role mapping in organization
2. Verify users exist with matching roles
3. Check user availability (not on leave)

## Related Documentation

- [Workflow API Documentation](/docs/api/WORKFLOW_API.md)
- [User Delegation Guide](/docs/guides/USER_DELEGATION_GUIDE.md)
