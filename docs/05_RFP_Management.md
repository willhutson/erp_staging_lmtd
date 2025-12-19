# TeamLMTD ERP Platform

## RFP Management

**Version:** 2.0 | **Access:** Leadership Only

---

## 1. Overview

RFP Management handles new business opportunities from vetting through outcome tracking. This is a leadership-only module that manages the agency's business development pipeline.

### Key Principle

> *"New business is the lifeblood of our team"*

### Access Control

| User | Role | Access |
|------|------|--------|
| Will Hutson | CEO | Full |
| Afaq Tariq | CFO | Full |
| CJ Holland | Client Servicing Director | Full |
| Matthew Cole | Project Manager | Full |
| All others | - | None |

---

## 2. RFP Form

**Naming:** `RFP – [Client/Entity Name]`  
**Example:** `RFP – Dubai South`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| RFP Name | text | ✅ | Auto-suggest format |
| Client Name | text | ✅ | Organization name |
| RFP Code | text | ✅ | Portal reference |
| Portal | text | ✅ | Where received |
| Date Received | date | ✅ | - |
| Submission Deadline | date | ✅ | Client deadline |
| RFP Owner | text | ✅ | Client contact |
| Scope of Work | textarea | ✅ | What they want |
| Bid Bond Required | select | ✅ | Yes / No |
| Estimated Value | number | ❌ | AED amount |
| Win Probability | select | ❌ | Low / Medium / High |
| Additional Info | textarea | ❌ | Other details |

---

## 3. Status Workflow

### Status Flow

```
VETTING
    │
    ▼
ACTIVE ──────────────────┐
    │                    │
    ▼                    │
AWAITING_REVIEW          │
    │                    │
    ▼                    │
READY_TO_SUBMIT          │
    │                    │
    ▼                    │
SUBMITTED ───────────────┤
    │                    │
    ▼                    │
AWAITING_RESPONSE        │
    │                    │
    ├────────┬───────────┘
    ▼        ▼
   WON      LOST      ABANDONED
```

### Status Definitions

| Status | Description | Color | Next Actions |
|--------|-------------|-------|--------------|
| VETTING | Pre-submission, evaluating fit | Gray | Activate, Abandon |
| ACTIVE | Working on proposal | Blue | Submit for Review |
| AWAITING_REVIEW | Draft ready for leadership | Yellow | Approve, Request Changes |
| READY_TO_SUBMIT | Approved, final prep | Green | Mark Submitted |
| SUBMITTED | Sent to client | Purple | Mark Response |
| AWAITING_RESPONSE | Waiting on client | Orange | Record Outcome |
| WON | We won 🎉 | Green | Create Project |
| LOST | Client chose another | Red | Record Learnings |
| ABANDONED | Withdrew or cancelled | Gray | - |

---

## 4. Automatic Subitems

When an RFP moves to ACTIVE status, the system automatically creates 12 workflow subitems with calculated due dates.

### Default Timeline (21 Days)

| # | Subitem | Default Owner | Due |
|---|---------|---------------|-----|
| 1 | Internal Alignment Call | Leadership | Day 1 |
| 2 | Document Requirements Gathering | Account Lead | Day 2 |
| 3 | Technical Deck | Technical Lead | Day 5 |
| 4 | Creative Workshop | Creative Director | Day 7 |
| 5 | Strategic Approach | Strategy Lead | Day 7 |
| 6 | Commercial Draft | Finance | Day 9 |
| 7 | First Draft Assembly | Account Lead | Day 10 |
| 8 | Leadership Review #1 | Leadership | Day 12 |
| 9 | Revisions | Account Lead | Day 15 |
| 10 | Final Leadership Review | Leadership | Day 17 |
| 11 | Prepare Submission Package | Account Lead | Day 19 |
| 12 | Submit Proposal | Leadership | Day 21 |

### Date Calculation

```typescript
function calculateSubitemDates(
  rfpDeadline: Date, 
  timeline: number = 21
): SubitemDate[] {
  const workingDays = getWorkingDaysBefore(rfpDeadline, timeline);
  
  return SUBITEM_TEMPLATE.map(item => ({
    ...item,
    dueDate: workingDays[item.dayOffset - 1],
  }));
}
```

### Subitem Status

| Status | Description |
|--------|-------------|
| PENDING | Not started |
| IN_PROGRESS | Work underway |
| COMPLETED | Finished |
| BLOCKED | Waiting on dependency |

---

## 5. Pipeline Dashboard

### Header Stats

```
┌─────────────────────────────────────────────────────────────────┐
│  RFP Pipeline                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│  │   $2.4M      │ │     8        │ │    67%       │ │  18d    ││
│  │ Total Value  │ │ Active RFPs  │ │ Win Rate Q4  │ │ Avg Time││
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Pipeline Funnel

```
┌─────────────────────────────────────────────────────────────────┐
│  Pipeline Funnel                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Vetting (12)     ████████████████████████████████  $1.8M      │
│  Active (8)       █████████████████████████         $2.4M      │
│  Submitted (3)    ███████████████                   $950K      │
│  Finalist (2)     ██████████                        $720K      │
│  Won (4)          ████████████████                  $1.2M      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### RFP List View

| Column | Description |
|--------|-------------|
| RFP Name | Link to detail |
| Status | Badge with color |
| Progress | X/12 subitems |
| Deadline | Days remaining |
| Value | Estimated AED |
| Win Prob | Badge |
| Actions | View, Edit |

### List Row Example

```
┌──────────────────────────────────────────────────────────────────────────┐
│ RFP – Dubai South    [ACTIVE]   ████████░░ 8/12   5 days   $450K   [HIGH]│
│ Government entity    Progress: Strategic Approach                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. RFP Detail View

### Header

```
┌─────────────────────────────────────────────────────────────────┐
│  RFP – Dubai South                              [Edit] [Archive]│
│  Status: [ACTIVE ▼]                                             │
├─────────────────────────────────────────────────────────────────┤
│  Client: Dubai South Authority                                  │
│  Code: DS-2024-RFP-001                                         │
│  Deadline: Dec 24, 2024 (5 days)                               │
│  Value: $450,000  •  Win Probability: [HIGH]                   │
│  Portal: Government Procurement Portal                          │
│  Bid Bond Required: Yes                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Subitems Checklist

```
┌─────────────────────────────────────────────────────────────────┐
│  Workflow Progress                              8/12 Complete   │
├─────────────────────────────────────────────────────────────────┤
│  ✅  Internal Alignment Call         Dec 4    CJ Holland       │
│  ✅  Document Requirements           Dec 5    Haidy Guirguis   │
│  ✅  Technical Deck                  Dec 8    Albert Khoury    │
│  ✅  Creative Workshop               Dec 10   Ted Totsidis     │
│  ✅  Strategic Approach              Dec 10   Salma Ahmed      │
│  ✅  Commercial Draft                Dec 12   Afaq Tariq       │
│  ✅  First Draft Assembly            Dec 13   Haidy Guirguis   │
│  ✅  Leadership Review #1            Dec 15   Will Hutson      │
│  🔄  Revisions                       Dec 18   Haidy Guirguis   │
│  ⬜  Final Leadership Review         Dec 20   Will Hutson      │
│  ⬜  Prepare Submission              Dec 22   Haidy Guirguis   │
│  ⬜  Submit Proposal                 Dec 24   Leadership       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Notifications

### Slack Integration

**Channel:** Private `#rfp-pipeline`

**New RFP Notification:**
```
🆕 New RFP Submitted

RFP – Dubai South
Client: Dubai South Authority
Value: $450K
Deadline: Dec 24, 2024 (21 days)
Win Probability: High

12 workflow subitems created automatically.
View Dashboard →
```

**Subitem Completion:**
```
✅ RFP Milestone Complete

RFP – Dubai South
Completed: Leadership Review #1
Next: Revisions (Due Dec 18)

Progress: 8/12 subitems
```

**Deadline Warning:**
```
⚠️ RFP Deadline Approaching

RFP – Dubai South
Deadline: Dec 24 (48 hours)
Status: ACTIVE

Outstanding subitems: 4
View Details →
```

**Outcome Recording:**
```
🎉 RFP WON!

RFP – Dubai South
Value: $450,000
Win Rate Impact: 67% → 70%

Create Project →
```

---

## 8. Analytics

### Key Metrics

| Metric | Calculation | Target |
|--------|-------------|--------|
| Win Rate | Won / (Won + Lost) | >50% |
| Pipeline Value | Sum of active RFPs | - |
| Weighted Pipeline | Σ (Value × Probability) | - |
| Avg Time to Submit | Days from Active to Submitted | <21 |
| Conversion Rate | Active → Submitted | >80% |

### Historical Tracking

- Win rate by quarter
- Win rate by industry
- Win rate by value range
- Time invested per RFP
- ROI on wins vs. total investment

### Outcome Notes

When recording outcome, capture:
- Why won/lost
- Competitor information
- Pricing feedback
- Lessons learned
- Reusable content tags

---

## 9. Integration Points

### Resource Planning

- Block team time for RFP work
- Show in capacity planning
- Alert if conflicts with client work

### Financial

- Track hours per RFP
- Calculate business development cost
- Forecast revenue from pipeline

### On Win: Auto-Create Project

```typescript
async function handleRFPWon(rfp: RFP) {
  // 1. Create or find client
  const client = await findOrCreateClient({
    name: rfp.clientName,
    organizationId: rfp.organizationId,
  });
  
  // 2. Create project
  const project = await createProject({
    clientId: client.id,
    name: rfp.name.replace('RFP – ', ''),
    type: 'PROJECT',
    budgetAmount: rfp.estimatedValue,
    startDate: new Date(),
  });
  
  // 3. Archive RFP materials
  await archiveRFPToProject(rfp.id, project.id);
  
  // 4. Notify team
  await notifyTeam('rfp.won', { rfp, project });
}
```

---

## 10. Wireframe Reference

| Component | File |
|-----------|------|
| Pipeline Dashboard | `05_rfp_pipeline_dashboard.html` |

---

*Next: 06_User_Directory.md*
