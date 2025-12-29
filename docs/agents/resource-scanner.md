---
id: skill_resource_scanner
type: skill
version: "1.0.0"
status: draft
category: WORKFLOW

triggers:
  - type: event
    event: brief.created
  - type: event
    event: brief.assignee_needed
  - type: manual
    permission: resource:view

inputs:
  - name: brief_context
    type: object
    required: true
    description: Brief type, client, deadline, required skills
  - name: team_filter
    type: object
    required: false
    description: Optional filters (department, skill, availability window)

outputs:
  - name: recommendations
    type: array
    description: Ranked list of suitable team members
  - name: capacity_report
    type: object
    description: Current team utilization overview
  - name: conflicts
    type: array
    description: Resource conflicts that need resolution
  - name: warnings
    type: array
    description: Capacity or deadline concerns

dependencies:
  - skill_timeline_estimator

permissions:
  - user:read
  - brief:read
  - time:read
---

# Resource Scanner Skill

## Purpose

Analyzes team capacity and recommends the right person for a project. Goes beyond "who's available" to consider client knowledge, speed, discipline fit, and growth opportunities.

## When to Use

- New brief created, needs assignee
- Resource conflict needs resolution
- Capacity planning for upcoming work
- Team lead reviewing workload distribution

---

## Founder Knowledge (Captured)

### Real Capacity Calculation

> **From Will:**
>
> "40 hours available" never means 40 hours of capacity.
>
> **Real capacity = 80% utilization**
>
> The 20% covers:
> - Meetings and coordination
> - Context switching between projects
> - Administrative tasks
> - Unplanned interruptions
>
> Also: "We work more than 40 hours sometimes" - so consider flexibility for urgent projects.

### Beyond Availability - What Makes Someone RIGHT

> The right person for a project depends on:
>
> 1. **Speed** - How fast can they execute this type of work?
> 2. **Client knowledge** - Have they worked with this client before?
> 3. **Discipline match** - Copy, design, or video requires different thinking
>
> It also depends on the person's growth trajectory - sometimes a stretch assignment is the right call.

### Conflict Resolution Framework

> When two projects need the same person:
>
> **"Which client is more valuable and when are the deadlines - who do we owe and who owes us?"**
>
> This is rhetorical but captures the real calculus:
> - Client relationship health (do we owe them a win?)
> - Payment/approval patterns (are they good partners?)
> - Deadline firmness (hard deadline vs. soft preference)
> - Strategic value (growth opportunity vs. maintenance)

---

## Process

### Step 1: Calculate Real Capacity

For each team member:

```
weekly_capacity_hours = user.weeklyCapacity  # Usually 40
real_capacity_hours = weekly_capacity_hours * 0.8  # 80% rule

# Get committed hours for the period
committed_hours = sum(
  timeEntries.where(date >= start AND date <= end).hours +
  briefs.where(status IN ['IN_PROGRESS', 'APPROVED']).estimatedHours
)

available_hours = real_capacity_hours - committed_hours
utilization_percent = committed_hours / real_capacity_hours * 100
```

**Utilization thresholds:**
- < 60%: Underutilized, ideal for new work
- 60-80%: Healthy, can take on standard projects
- 80-95%: At capacity, only urgent/small tasks
- > 95%: Overloaded, need redistribution

### Step 2: Match Skills & Experience

Score each candidate:

```
base_score = 0

# Skill match (required)
if user.skills.includes(required_skill):
  base_score += 30
else:
  base_score = 0  # Disqualified

# Client experience
if user.previousBriefs.some(b => b.clientId == brief.clientId):
  base_score += 25

# Brief type experience
type_experience = user.completedBriefs.filter(type == brief.type).count
base_score += min(type_experience * 2, 20)  # Max 20 points

# Speed factor (based on historical data)
avg_completion_ratio = user.avgActualHours / user.avgEstimatedHours
if avg_completion_ratio < 1.0:
  base_score += 15  # Fast executor
elif avg_completion_ratio < 1.2:
  base_score += 10  # On-time executor
# Slow executors get no bonus

# Availability
if utilization_percent < 60:
  base_score += 10
elif utilization_percent < 80:
  base_score += 5
```

### Step 3: Apply Context Factors

Consider strategic factors:

```
# Growth opportunity (for junior team members)
if user.permissionLevel == 'STAFF' AND brief.complexity == 'moderate':
  if user.briefsCompleted < 10:
    growth_bonus = 5  # Stretch opportunity

# Client relationship health
if client.relationshipStatus == 'AT_RISK':
  # Prefer experienced, reliable team members
  if user.clientSatisfactionScore > 4.5:
    base_score += 10

# Discipline alignment
discipline_map = {
  'VIDEO_SHOOT': ['Video Production'],
  'VIDEO_EDIT': ['Video Production', 'Motion Graphics'],
  'DESIGN': ['Design', 'Motion Graphics'],
  'COPYWRITING_EN': ['Content', 'Strategy'],
  'COPYWRITING_AR': ['Content Arabic'],
  'PAID_MEDIA': ['Performance', 'Strategy']
}
if user.department IN discipline_map[brief.type]:
  base_score += 5
```

### Step 4: Resolve Conflicts

When multiple briefs compete for the same person:

```
def resolve_conflict(person, brief_a, brief_b):
  scores = {}

  for brief in [brief_a, brief_b]:
    score = 0

    # Client value (lifetime value, relationship status)
    score += calculate_client_priority(brief.client)

    # Deadline urgency
    days_until_deadline = (brief.deadline - today).days
    if days_until_deadline <= 2:
      score += 50  # Critical
    elif days_until_deadline <= 5:
      score += 30  # Urgent
    elif days_until_deadline <= 10:
      score += 15  # Soon

    # "Who do we owe?"
    if client.lastDeliveryStatus == 'LATE':
      score += 20  # We owe them
    if client.outstandingApprovals > 0:
      score -= 10  # They owe us

    # Payment health
    if client.paymentStatus == 'OVERDUE':
      score -= 15  # They owe us

    scores[brief.id] = score

  return max(scores, key=scores.get)
```

### Step 5: Generate Recommendations

Return ranked list with rationale:

```json
{
  "recommendations": [
    {
      "userId": "...",
      "name": "Sara",
      "score": 92,
      "available_hours": 16,
      "utilization": 68,
      "rationale": [
        "Worked on 3 previous CCAD projects",
        "Fastest video production turnaround (avg 0.85x estimate)",
        "Client specifically requested in last feedback"
      ],
      "concerns": []
    },
    {
      "userId": "...",
      "name": "Ahmed",
      "score": 78,
      "available_hours": 24,
      "utilization": 52,
      "rationale": [
        "Video production certified",
        "Most available capacity this week",
        "Growth opportunity for client exposure"
      ],
      "concerns": [
        "No prior CCAD experience"
      ]
    }
  ],
  "capacity_report": {
    "team_avg_utilization": 72,
    "overloaded_count": 2,
    "underutilized_count": 4,
    "recommended_redistribution": [...]
  },
  "conflicts": [
    {
      "userId": "...",
      "competing_briefs": ["brief_1", "brief_2"],
      "resolution": "Prioritize brief_1 (CCAD deadline critical, we owe them)",
      "requires_human_decision": false
    }
  ]
}
```

---

## Validation Checkpoint

> **FOUNDER CHECK-IN (Required before v1.0):**
>
> 1. Is 80% utilization the right threshold? Does it vary by department or role?
>
> 2. The "who owes who" logic - is this captured correctly? What other factors matter?
>
> 3. When should this skill NEVER auto-assign?
>    - Specific clients that always need founder approval?
>    - High-value projects above a certain threshold?
>
> 4. How do you factor in "political" considerations?
>    - Client executives who prefer specific people
>    - Team dynamics that don't show in data
>
> 5. What's your escalation threshold for resource conflicts?
>    - At what point does it need leadership involvement?
>
> 6. Freelancer considerations:
>    - When do you bring in external help vs. stretch internal?
>    - What's the true cost beyond day rate?

---

## Edge Cases

### No Available Resources

```
if all_candidates.utilization > 95:
  return {
    "status": "CAPACITY_EXCEEDED",
    "options": [
      { "action": "extend_deadline", "impact": "Low risk if client flexible" },
      { "action": "split_work", "suggestion": "Divide between A and B" },
      { "action": "freelance", "contacts": [...] },
      { "action": "escalate", "reason": "Requires leadership decision" }
    ]
  }
```

### Conflicting Requirements

When brief requires multiple disciplines:
```
if brief.type == 'VIDEO_SHOOT' AND brief.requires_copy:
  return {
    "primary_assignee": video_recommendation,
    "support_assignee": copy_recommendation,
    "coordination_note": "Sara (video) leads, Mark (copy) supports on scripts"
  }
```

### Urgent Override

For URGENT priority:
```
if brief.priority == 'URGENT':
  # Ignore current utilization for top performers
  # Factor in overtime willingness
  # Consider historical urgent project handling
```

---

## Metrics

Track after deployment:
- Assignment accuracy (did recommended person complete on time?)
- Override rate (how often do managers change suggestions?)
- Utilization balance (variance across team)
- Conflict resolution time
- Overtime hours post-assignment

---

## Changelog

- v1.0.0 (Draft): Initial skill definition from founder interview
