# SpokeStack Feedback Review - Will & Albert
**Date:** December 2025
**Participants:** Will Hutson, Albert Khoury

---

## Condensed Feedback Summary

### 1. Task Ownership & Visibility (Priority: High)

**Problem:** Account Managers (assigners) lose visibility once they assign a task. When an AM goes on leave, there's no mechanism for task handover.

**Albert's Key Points:**
- The **assigner** should remain visible on the task card, not just in the brief submission
- AMs need to filter board views by "tasks I briefed"
- Constant visibility until task is archived is critical for AM workflow
- Co-assigner capability needed (e.g., assign self + backup person like Tad)

**Current Gap:** The board view shows assignees but doesn't prominently display the assigner/AM.

---

### 2. Board Filtering Issues (Priority: Medium)

**Problem:** Filter functionality not working on design board (clicking filter had no effect).

**Observation:** Multiple AMs like Dad and Mariam appear on same tasks because both are handling it - this clutters the view.

---

### 3. Navigation Reorganization (Priority: High)

**Agreed Changes:**
| Current | Proposed |
|---------|----------|
| Briefs (top level) | Briefs → under Agency |
| Builder scattered | Builder module under Briefs |

**Builder Access:** Admin-only (Will, Albert, select others) for creating new templates.

---

### 4. Project Hierarchy (Priority: High)

**Problem:** No way to group related briefs under a project from the submission form.

**Use Case:** Ramadan campaign = 1 project with multiple briefs (video, design, copy, etc.)

**Solution Needed:** Add field in brief submission form to:
- Assign to existing project, OR
- Create new project from the brief

**Purpose:** Non-retainer work tracking, rolling up tasks for management reports.

---

### 5. Resources View Data Quality (Priority: Medium)

**Problem:** Placeholder names don't match actual team members.

**Action Required:** Reconcile Resources view with current Team Directory data.

---

### 6. RFP Workflow Automation (Priority: High)

**Albert's Monday.com Reference:**
When an RFP form is submitted:
1. Auto-creates sub-tasks with assigned owners
2. Calculates due dates based on submission deadline
3. Sets up Slack nudges/reminders automatically
4. Nothing gets lost - full automation chain

**Will's Assessment:** Current SpokeStack build is "not far" from this capability.

---

### 7. Delegation of Authority (DOA) (Priority: High)

**Concept:** When an assignee is on leave, their responsibilities automatically shift to a designated backup.

**How It Should Work:**
- At workflow creation, designate backup person
- System checks leave calendar
- If assignee (e.g., Matt Cole) is on leave:
  - Tasks auto-delegate to backup
  - Nudges/notifications redirect
  - No manual reassignment needed by Matt

**Current Pain:** Matt has to manually reassign all his tasks when going on leave.

---

### 8. NPS Portal (Confirmed)

**Status:** Already implemented in codebase.

**Location:**
- Agency: `/feedback/nps` - Survey creation, sending, analytics
- Portal: `/portal/dashboard/nps` - Client response submission

**Note:** Albert may not have seen this in the demo - it exists under "Client Health" in sidebar.

---

## Improvement Ideas

### Quick Wins (1-2 weeks effort each)

#### 1. Add "Briefed By" Column to Board View
```
Brief Card Enhancement:
- Add assigner avatar next to assignee
- Show as "Briefed by [Name]"
- Make filterable from top filter bar
```

#### 2. Project Selector in Brief Form
```
Brief Submission Form:
- Add "Project" dropdown field
- Options: [Existing Projects] + "Create New Project"
- If "Create New", prompt for project name
- Auto-associate brief with project on submission
```

#### 3. Fix Board Filter Bug
- Debug filter click handler on design board
- Test all filter combinations
- Ensure multi-AM scenarios filter correctly

---

### Medium Effort (2-4 weeks)

#### 4. Co-Assigner/Backup Field
```
Brief Form Enhancement:
- "Primary Assignee" (required)
- "Backup Assignee" (optional)
- Both get visibility on board
- Backup inherits if primary goes on leave
```

#### 5. RFP Auto-Task Generation
```
RFP Workflow Enhancement:
- Template defines: required sub-tasks per RFP type
- On RFP creation, auto-generate subtasks
- Calculate deadlines: (RFP deadline - X days) per task
- Assign default owners from template
- Connect to Slack notification system
```

#### 6. "My Briefed Tasks" Dashboard Widget
```
AM Dashboard Addition:
- Widget showing all tasks where user = assigner
- Filter by: Active, Pending Review, Overdue
- Quick actions: View, Reassign, Nudge
- Persists until task archived
```

---

### Larger Initiatives (4+ weeks)

#### 7. Delegation of Authority System
```
Components:
1. User Profile: "Backup Delegate" field
2. Leave Request: "Delegate to" dropdown
3. Workflow Engine: Check leave calendar on task assignment
4. Auto-reassignment: If assignee on leave, route to delegate
5. Notification rerouting: All nudges go to delegate
6. Return handoff: Briefing when person returns from leave
```

#### 8. Navigation Restructure
```
Proposed Structure:
Agency/
├── Dashboard
├── Briefs/
│   ├── All Briefs
│   ├── My Briefs
│   ├── My Assignments
│   └── Builder (Admin)
├── Projects
├── Resources
└── Clients

Admin/
├── Team Directory
├── Templates
├── Workflows
└── Settings
```

#### 9. Smart RFP Pipeline (Monday.com Parity)
```
Full Feature Set:
- Templated sub-task generation
- Deadline calculation engine
- Auto-assignment from role templates
- Slack integration for nudges
- Progress tracking dashboard
- Conversion to project on win
```

---

## Priority Matrix

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Fix board filter bug | Low | High |
| P1 | Briefed By visibility | Low | High |
| P1 | Project selector in form | Medium | High |
| P1 | Resources data cleanup | Low | Medium |
| P2 | Co-assigner/backup field | Medium | High |
| P2 | RFP auto-task generation | Medium | High |
| P2 | Navigation restructure | Medium | Medium |
| P3 | Full DOA system | High | High |

---

## Action Items from Meeting

1. **Will:** Move Briefs under Agency, create Builder module
2. **Albert:** Check for dead links in Agency section, share hyperlinks
3. **Albert:** Screen grabs of current system + written explanation
4. **Both:** Review NPS portal (already exists - demo needed)

---

## Notes

### Existing NPS Implementation
The NPS system is fully functional:
- **Agency Side:** Create surveys, send to clients, view responses, calculate NPS score
- **Portal Side:** Clients receive surveys, submit scores (0-10), provide feedback
- **Analytics:** Promoter/Passive/Detractor classification, quarterly tracking

### Monday.com Features to Replicate
1. Form → Auto-subtask creation
2. Deadline-based date calculation
3. Role-based auto-assignment
4. Integrated Slack nudging
5. Status-triggered notifications
