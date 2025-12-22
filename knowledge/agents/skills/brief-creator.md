---
id: skill_brief_creator
type: skill
version: "1.0.0"
status: draft
category: CONTENT_CREATION

triggers:
  - type: event
    event: client_request.submitted
  - type: event
    event: brief.draft_started
  - type: manual
    permission: brief:create

inputs:
  - name: client_context
    type: object
    required: true
    description: Client profile, history, preferences, SLAs
  - name: request_details
    type: string
    required: true
    description: What the client is asking for
  - name: available_resources
    type: array
    required: false
    description: Team members with relevant skills

outputs:
  - name: draft_brief
    type: Brief
    description: Structured brief ready for review
  - name: resource_suggestions
    type: object
    description: Recommended assignees with rationale
  - name: timeline_estimate
    type: object
    description: Projected timeline with milestones
  - name: quality_warnings
    type: array
    description: Missing information that will cause problems

dependencies:
  - skill_timeline_estimator
  - skill_resource_scanner

permissions:
  - brief:create
  - client:read
  - user:read
---

# Brief Creator Skill

## Purpose

Transforms client requests into structured, actionable briefs with proper resource allocation and timeline estimates. Ensures every brief has what the creative team needs to start work without 2 hours of clarifying questions.

## When to Use

- Client submits a new request via portal
- Account manager initiates a new project
- RFP response requires brief breakdown

---

## Founder Knowledge (Captured)

### What Makes a Brief "Complete Enough"

> **From Will (15 years agency experience, Disney social scale):**
>
> A brief is complete when it has:
> 1. **Actionable deliverables** - Not "make a video" but "2-minute video for LinkedIn, vertical format, Arabic subtitles"
> 2. **Clear timeline** - With milestones, not just a final deadline
> 3. **Comparable reference work** - "Like the CCAD annual report video" or "Similar to campaign X from Q2"
>
> **The pain point:** When briefs lack timeframe and no comparable reference, the creative team wastes hours interpreting intent.

### Junior PM Mistakes

> The #1 mistake: **Account managers don't reference what has worked or what hasn't.**
>
> They create briefs in a vacuum instead of saying "Last time we did X for this client, they loved Y but hated Z."

---

## Required Context

### 1. Client Profile
```json
{
  "clientId": "...",
  "name": "CCAD",
  "industry": "Government",
  "relationshipStatus": "ACTIVE",
  "accountManagerId": "...",
  "preferences": {
    "communication_style": "formal",
    "revision_tolerance": "low",
    "turnaround_expectations": "standard"
  },
  "sla": {
    "response_time_hours": 24,
    "revision_rounds": 2
  }
}
```

### 2. Historical Context
- Previous briefs for this client
- What worked well (from feedback/NPS)
- What caused issues (from revision history)
- Similar briefs from other clients (for reference)

### 3. Resource Availability
- Team members with required skills
- Current workload and capacity
- Client familiarity (who has worked with them before)

---

## Process

### Step 1: Analyze Request

Extract key requirements:
- **Brief type** - VIDEO_SHOOT, DESIGN, COPYWRITING, etc.
- **Deliverables** - Specific outputs expected
- **Timeline** - Deadline and key milestones
- **Reference work** - Similar past projects to use as benchmark

Flag missing critical information:
- No deadline → WARN: "Timeline not specified"
- No reference → WARN: "No comparable work referenced"
- Vague deliverables → WARN: "Deliverables need specificity"

### Step 2: Find Comparable Work

Search past briefs for:
1. Same client + similar brief type
2. Same brief type + similar scope
3. Projects that received positive client feedback

Extract from comparables:
- Actual vs. estimated hours (for timeline accuracy)
- What was praised in client feedback
- What caused revision requests

### Step 3: Match Resources

Query available team members:
```
1. Filter by skill match (VIDEO_SHOOT → Video Production dept)
2. Filter by availability (capacity > 20% for next 2 weeks)
3. Rank by:
   - Client history (worked with this client before? +10)
   - Current workload (lower is better)
   - Project type experience
   - Growth opportunity (if stretch assignment appropriate)
```

### Step 4: Estimate Timeline

Use historical data:
```
base_estimate = avg_hours(similar_briefs)
client_factor = client.revision_tolerance == "low" ? 1.2 : 1.0
complexity_factor = calculate_complexity(deliverables)
buffer = 0.15  # 15% buffer

estimated_hours = base_estimate * client_factor * complexity_factor * (1 + buffer)
```

### Step 5: Generate Brief

Apply naming convention:
```
{Type}: {Client Code} – {Topic}

Examples:
- "Shoot: CCAD – Annual Report 2024"
- "Design: DET – Social Campaign Q1"
- "Copy: ADEK – Website Refresh"
```

Populate all required fields:
- Title (from naming convention)
- Type (from analysis)
- Client (from request)
- Assignee (from resource matching)
- Deadline (from timeline estimation)
- Form data (structured from request)

Calculate quality score:
- Deliverables specified: +20
- Timeline defined: +20
- Reference work linked: +20
- Client context complete: +15
- Assignee matched: +15
- Attachments included: +10

---

## Output Format

```json
{
  "brief": {
    "title": "Shoot: CCAD – Annual Report 2024",
    "type": "VIDEO_SHOOT",
    "clientId": "...",
    "assigneeId": "...",
    "deadline": "2024-02-15",
    "formData": {
      "topic": "Annual Report 2024",
      "deliverables": ["2-minute highlight video", "15-second social cuts x3"],
      "location": "CCAD HQ, Abu Dhabi",
      "objective": "Showcase 2024 achievements for stakeholder presentation"
    },
    "qualityScore": 85
  },
  "suggestions": {
    "assignee": {
      "primary": { "id": "...", "name": "Sara", "reason": "Worked on CCAD Q3 campaign, client requested" },
      "backup": { "id": "...", "name": "Ahmed", "reason": "Available, video production experience" }
    },
    "timeline": {
      "start": "2024-01-29",
      "shoot_date": "2024-02-05",
      "edit_complete": "2024-02-12",
      "delivery": "2024-02-15"
    },
    "comparables": [
      { "briefId": "...", "title": "Shoot: CCAD – Q3 Highlights", "hours": 24, "rating": 5 }
    ]
  },
  "warnings": [
    { "field": "location", "issue": "No specific address", "severity": "medium" },
    { "field": "reference", "issue": "No comparable work specified", "severity": "high" }
  ]
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Client not found | Return error, suggest client creation |
| No resources available | Flag for manual assignment, show capacity report |
| Deadline impossible | Suggest alternatives, show resource conflicts |
| Missing critical info | Create draft, list required fields |

---

## Validation Checkpoint

> **FOUNDER CHECK-IN (Required before v1.0):**
>
> 1. Does this capture how you actually evaluate brief completeness?
>
> 2. Is the "comparable work" emphasis correct? How important is this vs. other factors?
>
> 3. What's missing from the quality score calculation?
>
> 4. When should this skill NOT auto-assign, and require human decision?
>
> 5. What client-specific rules exist that should override the general logic?
>    (e.g., "CCAD always gets Sara for video")

---

## Metrics

Track after deployment:
- Briefs created with skill assistance vs. manual
- Average quality score at creation
- Revision rate (lower = skill is capturing requirements better)
- Time from request to brief creation
- Human override rate (when users change skill suggestions)

---

## Changelog

- v1.0.0 (Draft): Initial skill definition from founder interview
