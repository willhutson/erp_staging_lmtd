# SpokeStack Frontend Redesign: User Stories & Design Specification

**Created**: January 2025
**Source**: Will Hutson Q&A Session
**Purpose**: Guide frontend redesign with frontend-design skill principles

---

## Design Philosophy

### Frontend-Design Skill Principles Applied:
- **Bold aesthetic direction**: Living workspace (light, airy, activity-focused) with mode options
- **Typography**: Characterful, distinctive fonts
- **Motion**: High-impact moments, staggered reveals
- **Spatial composition**: Unexpected layouts, role-adaptive views
- **Visual details**: Gradients, subtle textures, turquoise (#52EDC7) accents

### Core Platform Principles (from Monday.com Reference):
1. **Forms as intake layer** — AI can generate, humans approve structure
2. **Ownership columns are first-class** — never implicit
3. **Automations replace memory** — system enforces deadlines and routing
4. **Subitems for phased workflows** — with relative date calculation
5. **Communication is item-attached** — not channel-sprawled
6. **Slack is notification layer only** — always links back to source
7. **Views are role-specific** — same data, different lenses
8. **Guests get scoped access** — board-level permissioning

---

## Module 1: Hub (Dashboard)

### Emotional Response
- Role-adaptive: Calm for creatives, control for managers

### Visual Hierarchy (Priority Order)
1. Today's deadlines / overdue items
2. Unread messages / notifications
3. Quick actions (new brief, start timer)
4. Team capacity (managers only)

### Layout Approach
- Consistent structure across roles, data varies
- "Pods" are client-centric, managed by Client Service Director
- AI presence: Conversational greeting ("Good morning Will, 3 items need attention")

### Aesthetic
- **Default**: Living workspace (light, airy, activity-focused)
- **Options**: Control tower (dark, data-dense) + Executive dashboard (clean, KPI-forward)

---

## Module 2: Studio (Content Creation)

### Identity
- AI-powered content engine for entire org (not just creatives)
- Users: Creatives, AMs bashing ideas, Commercial for pitches
- Core principle: "What the engine creates" > "What you bring"
- Document ingest for complex topics to inform generation
- Feel: Expressive but progress-forward; design tool vibes but process > precision

### Content Calendar
- Grid view for client focus
- Unified view with filters as option
- Leadership gets hybrid "all clients" drill-down
- Purpose: Inspiration → connection → fast execution

### AI Calendar Generator
- Full-page immersive + AI chat hybrid
- Split-screen pattern (input left, output right)

### Moodboard
- Drag-drop anywhere + AI image generation
- **"Randomness dial" (0-10)** — creativity temperature
- Two paths: Brief → Moodboard → Client OR direct Moodboard → Client approval

### Decks & Docs
- Full editing + templates + AI generation
- AI works off preset modules → push for creative flourish

### Video
- Process management + pre-shoot storyboarding
- **Listening → Video pipeline** (spot trend → send to workflow/moodboard)
- Asset library is critical (b-roll, off-the-shelf)
- WhatsApp handles actual editing/preview

### Skills
- Universal tool (analysts, CMs, copywriters, AMs, everyone)
- Future: "Build Your Own SpokeStack" onboarding with dummy data → deposit → buy
- "Submit a skill" feature for community contributions

---

## Module 3: Briefs (Agency Work)

### Submission Experience
- Hybrid: Quick mode for routine, Guided for complex

### AM Visibility
- "My Briefed Work" dashboard section
- Automatic status notifications
- "Nudge" capability to ping assignees

### Hierarchy
- Client → Project → Brief (retainer-based work is primary)
- Retainer context visible (remaining hours, burn rate)

### Status Flow
- Current works: Submit → Assign → In Progress → Review → Complete

### Templates
- AMs create + mandatory share
- Managers can institute good templates org-wide

### AI Role
- Quality scoring for AMs
- **Designer feedback loop** ("Does this brief make sense? How can it be better?")
- Feedback filters back to process and AM

### Brief Card Fields (from Monday.com)
- Title + Client
- AM (who briefed) + Assignee (who's doing)
- Status badge
- Type of Media icon
- Internal Deadline with urgency
- Platforms tags

---

## Module 4: Resources (Capacity)

### Views
- All available: Kanban + Gantt + Calendar (leave) + Heatmap
- Tabbed interface

### Grouping
- Role-based defaults:
  - Person (users/account leads)
  - Department (management)
  - Client (account team)
- Switchable

### Capacity Indicators
- Color coding (green/yellow/red)
- "Fuel gauge" style visualization

### Assignment Flow
- AI recommendations ("Sarah has 60% capacity and did similar work")
- Drag-drop from unassigned pool
- Assignment modal with filters
- Quick-assign from brief detail

### Retainer Integration
- Hours remaining + burn rate + warnings
- **Proactive management nudges for creeping liabilities**

### Leave/DOA Integration
- Gray out users on leave
- Show who's covering for whom
- Block assignment to unavailable
- Auto-suggest delegate

---

## Module 5: CRM (Pipeline)

### Users
- BD + Leadership + AMs (for cross/upsell, continuity when people leave)

### Pipeline View
- Kanban primary (movable cards)
- List for sorting
- Funnel for quarterly
- All toggleable

### Deal Card
- Company + Deal Value + ACV (annual)
- Days Open + Hours Invested
- Stage + Probability
- Owner/assignee

### Contacts
- Moderate — mainly key decision-makers

### Won Actions (Auto)
- Create Client record
- Create onboarding project with tasks
- Notify relevant teams (Slack/Chat)
- Schedule kickoff meeting
- Provision client portal access

### RFP vs Deal
- **Merge into one pipeline with "type" tag** (Gov RFP vs Private Deal)

### AI Priority
- Near-term: Deal timeline prediction
- Medium-term: Reading docs, building proposals
- Long-term: Proposal generation

---

## Module 6: RFP Workflow

### Subitems
- Auto-generate when deal type = RFP
- Templated but manually triggerable
- Vary by RFP size/complexity

### Deadline Calculation
- Fixed offsets + Configurable per template + AI-suggested
- Interconnectivity with other groups is key

### RFP-Specific Fields
- Submission deadline (anchor)
- Bid bond required + amount
- Tender number / reference
- Technical vs Financial envelope dates
- Pre-qualification status

### Win Probability
- Both: AI suggests, human overrides

### Document Management
- Central folder per RFP
- Version control
- AI doc parsing (extract requirements)
- Collaborative editing (but 1-2 people compile/submit at end)

### Post-Submission
- Track follow-ups/clarifications
- Log presentation dates
- Capture win/loss reasons

### RFP Won Handoff
- Same as Deal Won + Additional gov steps + Contract milestones
- Dovetail into client onboarding

---

## Module 7: Time Tracking

### Timer Experience
- All options: Global floating + header bar + per task

### Time Entry
- Both timer + manual entry

### Billable vs Non-Billable
- Both: Tag per entry + Infer from brief type
- Important for non-retainer clients

### Timesheet Approval
- Configurable per instance onboarding (weekly submit or auto-submit)

### Retainer Integration
- Show hours logged vs allocation
- Warn when approaching limit
- (Don't block beyond allocation)

### AI in Time
- Suggest entries from calendar/activity
- Flag unusual entries
- Predict project overruns
- **Flag to manager**

---

## Module 8: Team / Leave / Delegation

### Team Directory
- All views: Simple list + Org chart + Card grid with skills/capacity

### Leave Request Flow
- AI checks conflicts first → then approval
- "Submit anyway" option after conflict warning
- **Blackout days support**

### Delegation of Authority (DOA)
- Manual backup assignment
- Auto-suggest based on role/capacity
- Chain delegation (if backup unavailable, escalate)

### Return from Leave
- Tasks auto-reassign back
- AI-generated handoff briefing
- Handoff meeting auto-scheduled

### Department View
- Capacity + Skills matrix + Current assignments

---

## Module 9: Chat (SpokeChat)

### Chat Structure
- Channels + DMs + Item-linked threads
- Must be Slack-like in robustness (power users)

### Item-Linked Threads
- Every brief/RFP has a thread
- Opt-in threads per item (both approaches)

### AI in Chat
- @mention AI for questions
- AI summarizes long threads
- AI suggests responses

### Notifications
- Configurable per channel at creation

### Chat vs Slack
- LMTD: SpokeChat replaces Slack internally
- Other instances: Hybrid option available

---

## Module 10: Analytics / Reporting

### Primary Users
- Everyone (role-filtered) — clients get reports too

### Dashboard Style
- Both: Pre-built per role + Build-your-own

### Key Metrics
- Team utilization
- Client profitability
- Brief turnaround time
- Retainer burn rate (leadership only)

### Report Generation
- Manual export (PDF/Excel)
- Scheduled email reports
- AI-generated narrative reports
- White-label with client logos

### Client Reports
- Both internal + white-labeled versions

---

## Module 11: Client Portal

### Portal Purpose
- Deliverable review/approval
- Full project visibility
- Self-service brief requests

### Approval Flow
- Approve / Request Changes buttons
- Inline commenting on deliverables
- Multi-stakeholder sign-off

### Portal Branding
- Configurable via onboarding/admin (LMTD, white-label, or co-branded)

### Content Access
- Toggleable: Only shared items OR all project work

### NPS / Feedback
- Integrated into portal
- Separate survey link option
- AI-triggered based on project completion

---

## Module 12: Admin / Builder

### Builder Access
- Configurable via onboarding (Admins only, +Dept leads, or propose+approve)

### What Can Be Built
- Form templates
- Workflow automations
- Dashboard widgets
- AI skill configs

### Template Approval
- Hybrid: Draft → Test in sandbox → Publish

### AI Skill Builder
- Full skill builder (triggers, actions, prompts)
- Sandbox + approval workflow

### Settings Scope
- All levels: Global org, Department overrides, User preferences

---

## Meta: Instance Onboarding Skill

This Q&A process becomes a reusable skill for new instance onboarding.

**Location**: `/.claude/skills/onboarding-skill.md`

**Purpose**: When spinning up a new SpokeStack instance, guide configuration Q&A, capture answers, auto-generate:
- Form templates
- Workflow configurations
- Dashboard layouts
- Permission structures
- AI skill configurations

**LMTD = Instance #1** — the template from which all others derive.

---

## Next Steps

1. Create `onboarding-skill.md` with this Q&A structure
2. Apply frontend-design skill to each module
3. Build component library with mode support (Living/Control/Executive)
4. Implement role-adaptive Hub views
5. Enhance Studio with split-screen AI patterns
6. Add "fuel gauge" capacity indicators to Resources
7. Merge RFP into CRM pipeline with type tag
8. Add blackout days to Leave module
9. Ensure SpokeChat matches Slack robustness

---

*Document Owner: Will Hutson | Created: January 2025*
