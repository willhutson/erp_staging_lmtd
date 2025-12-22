---
title: Deadline Tracker
slug: deadline-tracker
version: 1.0.0
status: DRAFT
category: WORKFLOW
description: Monitors project timelines, predicts delays, and manages deadline risk
---

# Deadline Tracker

## Purpose

Proactively monitors all active briefs and projects, predicting deadline risks before they become crises and recommending interventions to stay on track.

## Triggers

```yaml
triggers:
  - type: SCHEDULE
    schedule: "0 9 * * *"  # Daily at 9am
  - type: EVENT
    eventType: "brief.deadline.approaching"  # 48h warning
  - type: EVENT
    eventType: "brief.status.blocked"
  - type: MANUAL
```

## Inputs

| Name | Type | Required | Description |
|------|------|----------|-------------|
| scope | string | No | ALL, CLIENT, TEAM, BRIEF_ID (default: ALL) |
| scopeId | string | No | ID for CLIENT/TEAM/BRIEF_ID scope |
| horizonDays | number | No | Look-ahead window (default: 14) |
| includeCompleted | boolean | No | Include recently completed for patterns (default: false) |

## Outputs

| Name | Type | Description |
|------|------|-------------|
| atRisk | array | Briefs at risk of missing deadline |
| onTrack | array | Briefs proceeding normally |
| completed | array | Recently completed (if requested) |
| systemicIssues | array | Patterns across multiple briefs |
| recommendedActions | array | Priority interventions |
| capacityImpact | object | How deadline issues affect team capacity |

## Founder Knowledge

### The Real Timeline

> "80% utilization is real capacity. The other 20% is meetings, context switching, and admin."

When estimating, account for:
- **Actual work hours:** 6-7 productive hours in an 8-hour day
- **Dependencies:** Client approvals, internal reviews, asset delivery
- **Buffer:** Rush requests and scope changes are inevitable
- **Human factors:** Illness, leave, energy levels

### Deadline Categories

**Hard Deadlines:**
- Event dates (launches, campaigns, live shows)
- Regulatory/legal requirements
- Contractual obligations
- External publication schedules

**Soft Deadlines:**
- Internal milestones
- Client preferences (not requirements)
- "Would be nice" targets
- Self-imposed goals

**Know the difference.** Hard deadlines require heroics if at risk. Soft deadlines can be renegotiated.

### Early Warning Signs

**Process Indicators:**
- Brief sitting in one status too long
- Internal review taking multiple rounds
- Questions/clarifications increasing
- Team member going quiet

**Dependency Indicators:**
- Waiting on client assets > 48 hours
- Approval delay without communication
- External vendor silence
- Missing feedback loops

**Resource Indicators:**
- Assignee capacity > 90%
- Key person on multiple deadline projects
- Skill bottleneck (one person who can do X)
- Holiday/leave conflicts

### "Who Owes Who" Framework

When deadlines conflict, prioritize based on:

1. **Client Value:** Which client is more strategically important?
2. **Deadline Type:** Hard vs soft
3. **Delivery Balance:** Are we behind with one client? "Who owes who"
4. **Recovery Time:** Which has buffer after delivery?
5. **Team Impact:** Which protects team from weekend work?

### Managing Up and Out

When a deadline will slip:

**DO:**
- Communicate early (as soon as you know, not the day before)
- Offer alternatives (phased delivery, reduced scope)
- Own the timeline (don't blame client even if warranted)
- Provide new realistic date with confidence

**DON'T:**
- Wait until the last minute
- Make promises you can't keep to "buy time"
- Throw team members under the bus
- Pretend it's not happening

## Validation Questions

1. Are we tracking actual progress or just status changes?
2. Have we identified the real blockers, not symptoms?
3. Does our "at risk" definition match client expectations?
4. Are we applying "who owes who" framework fairly?
5. What would a junior PM miss about this timeline?

## Dependencies

- `resource-scanner` for capacity data
- `brief-creator` for scope understanding
- Calendar integration for hard dates

## Risk Scoring Model

```yaml
risk_factors:
  timeline_position:
    weight: 25
    rules:
      - days_remaining < 2: +50
      - days_remaining < 5: +30
      - days_remaining < 7: +15
      - percent_complete < expected: +20

  status_velocity:
    weight: 20
    rules:
      - stuck_in_status > 48h: +30
      - stuck_in_status > 24h: +15
      - regression (went backwards): +40

  dependency_health:
    weight: 20
    rules:
      - pending_client_approval > 48h: +25
      - missing_assets: +35
      - external_vendor_delay: +20

  resource_capacity:
    weight: 20
    rules:
      - assignee_utilization > 100%: +40
      - assignee_utilization > 90%: +20
      - no_assignee: +50

  historical_pattern:
    weight: 15
    rules:
      - similar_brief_overran: +15
      - client_known_for_delays: +10
      - team_track_record_strong: -10
```

## Example Invocation

```json
{
  "skillSlug": "deadline-tracker",
  "input": {
    "scope": "ALL",
    "horizonDays": 14,
    "includeCompleted": false
  }
}
```

## Expected Output

```json
{
  "atRisk": [
    {
      "briefId": "brief_123",
      "title": "CCAD Campaign Video Edit",
      "deadline": "2024-12-24T17:00:00Z",
      "daysRemaining": 2,
      "riskScore": 78,
      "riskLevel": "HIGH",
      "primaryRisk": "RESOURCE_CAPACITY",
      "details": "Assignee (Sarah) at 115% capacity with 3 other deadline briefs",
      "blockers": [
        {
          "type": "APPROVAL_PENDING",
          "waiting_on": "Client",
          "waiting_since": "2024-12-21T10:00:00Z",
          "hours_waiting": 36
        }
      ],
      "recommendedActions": [
        "Escalate approval request to AM",
        "Prepare backup editor (James available 24th)",
        "Pre-communicate potential slip to client"
      ]
    }
  ],
  "onTrack": [
    {
      "briefId": "brief_456",
      "title": "DET Social Pack Design",
      "deadline": "2024-12-27T12:00:00Z",
      "daysRemaining": 5,
      "riskScore": 22,
      "riskLevel": "LOW",
      "status": "IN_PROGRESS",
      "progress": "65%"
    }
  ],
  "systemicIssues": [
    {
      "type": "CAPACITY_BOTTLENECK",
      "detail": "Video editors at 105% average capacity this week",
      "affectedBriefs": ["brief_123", "brief_789", "brief_012"],
      "recommendation": "Consider freelancer support or deadline renegotiation"
    }
  ],
  "recommendedActions": [
    {
      "priority": 1,
      "action": "Address CCAD video deadline - escalate approval and prepare backup",
      "briefId": "brief_123",
      "owner": "Account Manager"
    },
    {
      "priority": 2,
      "action": "Review video team capacity for next week",
      "briefId": null,
      "owner": "Resource Manager"
    }
  ],
  "capacityImpact": {
    "totalAtRisk": 3,
    "totalOnTrack": 12,
    "weekendWorkRisk": "MEDIUM",
    "bottleneckRoles": ["VIDEO_EDITOR"]
  }
}
```
