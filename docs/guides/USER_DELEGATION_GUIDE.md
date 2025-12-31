# User Delegation Guide

The Delegation of Authority (DOA) system ensures business continuity when team members are on leave. It automatically routes tasks to designated delegates and manages handoff processes.

## Overview

When you go on leave:
1. Your delegate receives your tasks
2. Notifications keep everyone informed
3. A handoff briefing is generated when you return
4. Tasks are reassigned back to you

## Setting Up Your Delegation Profile

### Navigate to Settings

Go to **Settings > Delegation** (`/settings/delegation`)

### Configure Your Primary Delegate

1. Click **Select Delegate**
2. Choose a team member who can cover for you
3. The system suggests "like-for-like" matches:
   - Designers are paired with designers
   - Account managers with account managers
   - Same department/seniority level preferred

### Set Your Delegation Scope

Choose which items should be delegated:

| Scope | What Gets Delegated |
|-------|---------------------|
| Briefs | Tasks where you're the assignee |
| Approvals | Items awaiting your approval |
| Client Communications | Emails and Slack messages |
| All | Everything above |

### Configure Escalation Rules

Define what happens if your delegate is also unavailable:

1. **Next in Chain** - Task goes to delegate's delegate
2. **Department Head** - Escalates to team lead
3. **Admin** - Goes to system admin
4. **Hold** - Task waits until someone is available

## Requesting Leave

### Submit Leave Request

1. Go to **Leave > Request Leave**
2. Select dates and leave type
3. The system automatically checks for conflicts

### Conflict Detection

The system warns you about:

| Conflict Type | Description | Suggested Action |
|---------------|-------------|------------------|
| Mutual Delegation | You and your delegate both on leave | Choose different delegate |
| Chain Unavailable | Your delegate's delegate is also out | Extend the chain |
| Coverage Gap | No delegate configured | Set up a delegate |

### Approval Flow

```
Submit Request → Manager Approval → Delegation Activated
```

When approved:
1. ActiveDelegation record is created
2. Your delegate is notified
3. Tasks will route to them during your absence

## During Your Absence

### What Happens Automatically

- New tasks assigned to you → routed to delegate
- Approvals in your queue → delegate can approve
- Notifications sent → delegate informed

### What Your Delegate Sees

Your delegate will see:
- A "Covering For" section in their dashboard
- Your active tasks in their task list
- Notifications tagged as delegated

### Daily Check-ins

Delegates receive daily prompts to:
- Review delegated tasks
- Flag any issues
- Log significant activities

## Returning from Leave

### Pre-Return Notification

One day before you return:
- Your delegate receives a reminder
- Handoff briefing is generated

### Handoff Briefing

The system generates a summary including:

1. **Completed Tasks** - What was finished
2. **In Progress** - What's still ongoing
3. **New Items** - What came in while you were out
4. **Escalated Issues** - Anything that needed attention
5. **Key Decisions** - Decisions made on your behalf

### Handoff Meeting

Schedule a brief sync with your delegate to:
- Walk through the briefing
- Transfer context on ongoing items
- Answer any questions

### Task Reassignment

After handoff is complete:
1. Click **Complete Handoff**
2. Tasks are reassigned back to you
3. Delegate's coverage ends

## Best Practices

### Before Leave

1. **Set up delegation early** - At least 3 days before
2. **Brief your delegate** - Walk through active work
3. **Document client context** - Note any sensitivities
4. **Notify stakeholders** - Email key clients

### During Leave

1. **Trust your delegate** - Avoid checking in constantly
2. **Set proper OOO** - Include delegate's contact info
3. **Define escalation criteria** - What warrants contact

### After Return

1. **Read the handoff briefing** - Before meeting
2. **Thank your delegate** - Acknowledge their help
3. **Follow up on escalations** - Address any issues
4. **Update your profile** - Adjust delegate if needed

## Viewing Delegation Status

### My Profile Tab

Shows:
- Your current delegate
- Delegation scope settings
- Escalation rules

### Active Delegations Tab

Shows:
- Your upcoming/active leave periods
- Status of each delegation

### Covering For Tab

Shows:
- Who you're currently covering for
- Tasks delegated to you
- Handoff status

## Troubleshooting

### Tasks not routing to delegate

1. Check delegation is ACTIVE (not just APPROVED)
2. Verify scope includes the task type
3. Check delegate hasn't also gone on leave

### Delegate not receiving notifications

1. Check delegate's notification preferences
2. Verify Slack integration is connected
3. Check email address is correct

### Handoff not generating

1. Handoff starts 1 day before return
2. Check ActiveDelegation status
3. Look for errors in activity log

## Need Help?

Contact your system admin or raise a support ticket.

## Related Documentation

- [Admin Builder Guide](/docs/guides/ADMIN_BUILDER_GUIDE.md)
- [Workflow API Documentation](/docs/api/WORKFLOW_API.md)
