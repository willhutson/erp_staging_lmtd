# Delegation of Authority Module

## Overview

The Delegation of Authority (DOA) module implements automatic task delegation when team members are unavailable. Think of it as "air traffic control" for workforce management - when someone goes on leave, the system knows and acts intelligently.

## Key Concepts

### Delegation Profile
Every user can configure:
- **Primary Delegate**: Who covers when they're away
- **Scope**: Which clients/brief types to delegate
- **Authority Level**: Full, execute-only, or monitor-only
- **Escalation Rules**: When to escalate to manager instead

### Active Delegation
When leave is approved, an active delegation is created:
- Tracks the coverage period
- Logs all actions taken by the delegate
- Manages the return handoff process

### Delegation Chain
If the primary delegate is also unavailable:
1. Check delegate's delegate (chain)
2. Continue up to 5 levels deep
3. Escalate to department head if chain exhausted
4. Fall back to admin as last resort

## Services

### Profile Service (`profile-service.ts`)
- `getDelegationProfile(userId)` - Get user's delegation config
- `upsertDelegationProfile(...)` - Create/update config
- `findPotentialDelegates(...)` - Find matching candidates

### Chain Resolver (`chain-resolver.ts`)
- `checkUserAvailability(userId)` - Check if user is available
- `resolveDelegation(orgId, assigneeId)` - Resolve actual assignee
- `shouldDelegateTask(scope, task)` - Check if task is in scope

### Conflict Detector (`conflict-detector.ts`)
- `checkLeaveConflicts(...)` - Check for delegation conflicts
- `getUpcomingConflicts(...)` - Proactive conflict alerts

### Handoff Service (`handoff-service.ts`)
- `generateHandoffBriefing(...)` - AI-generated return summary
- `startHandoff(delegationId)` - Initiate return process
- `completeHandoff(...)` - Finish and reassign tasks

### Delegation Engine (`delegation-engine.ts`)
- `startDelegation(context)` - Begin a delegation period
- `routeTaskWithDelegation(...)` - Route task through delegation
- `cancelDelegation(...)` - Cancel early
- `getUserDelegations(userId)` - Get user's delegations

## Database Models

```prisma
model DelegationProfile {
  userId            String @unique
  primaryDelegateId String?
  scope             Json   // DelegationScope
  escalationRules   Json   // EscalationRules
}

model ActiveDelegation {
  delegatorId    String
  delegateId     String
  leaveRequestId String?
  startDate      DateTime
  endDate        DateTime
  scopeSnapshot  Json
  status         DelegationStatus
  handoffBriefing Json?
}

model DelegationActivity {
  activeDelegationId String
  activityType       DelegationActivityType
  entityType         String
  entityId           String
  description        String
}
```

## Integration Points

### Leave Module
When leave is approved:
1. Check for conflicts using `checkLeaveConflicts()`
2. Show conflicts to approver
3. On approval, call `startDelegation()` with leave request ID

### Brief Creation
When creating a brief:
1. Call `routeTaskWithDelegation()` with intended assignee
2. Use returned `assigneeId` as actual assignee
3. If `wasDelegated`, show delegation indicator

### Dashboard
- Show "Currently Covering For" widget
- Show "Upcoming Returns" for delegates
- Show delegation status indicators on tasks

## Like-for-Like Matching

Delegates should match the original assignee's level:

| Original | Valid Delegates |
|----------|-----------------|
| Senior AM | Senior AM, AM Lead |
| Designer | Designer (same level) |
| Leadership | Leadership |
| Staff | Staff |

## Conflict Types

1. **Mutual Delegation**: A and B delegate to each other, both on leave
2. **Chain Unavailable**: Primary delegate is also unavailable
3. **Coverage Gap**: No delegate configured

## Usage Example

```typescript
import {
  routeTaskWithDelegation,
  checkLeaveConflicts,
} from "@/modules/delegation";

// When creating a task
const routing = await routeTaskWithDelegation(
  organizationId,
  intendedAssigneeId
);

// Use routing.assigneeId instead of intendedAssigneeId
await createBrief({
  assigneeId: routing.assigneeId,
  // ...
});

// When approving leave
const conflicts = await checkLeaveConflicts(
  organizationId,
  userId,
  startDate,
  endDate
);

if (conflicts.hasConflicts) {
  // Show conflicts to approver
} else {
  // Proceed with approval
}
```

## Cron Jobs Needed

1. **Daily at midnight**: `activatePendingDelegations()` - Start delegations
2. **Daily at 6pm**: Send return reminders for next-day returns
3. **Weekly**: `getUpcomingConflicts()` - Alert on potential issues

## Files

- `types/index.ts` - TypeScript definitions
- `services/profile-service.ts` - Profile CRUD
- `services/chain-resolver.ts` - Delegation chain logic
- `services/conflict-detector.ts` - Conflict detection
- `services/handoff-service.ts` - Return handoff
- `services/delegation-engine.ts` - Core engine
- `index.ts` - Module exports
