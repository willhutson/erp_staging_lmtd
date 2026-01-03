# SpokeStack Instance Onboarding Skill

## Purpose
Guide new SpokeStack instance configuration through structured Q&A, capturing business context and preferences to auto-generate platform configuration.

## When to Use
- Spinning up a new SpokeStack instance for a client
- Onboarding a new organization to the platform
- Reconfiguring an existing instance after significant business changes

## Template Instance
**LMTD** is Instance #1 — the reference implementation from which all others derive.

---

## Onboarding Flow

### Phase 1: Business Context

```
BUSINESS_CONTEXT:
  - Company name:
  - Industry vertical: [Agency | PR | Recruitment | HR | Accounting | Legal | Other]
  - Team size:
  - Primary service offering:
  - Key differentiator:
  - Current tools being replaced:
```

### Phase 2: Module Q&A

Guide through each module with quick-pick format. Capture answers in structured format.

---

## Module Questions Template

### Hub (Dashboard)

**HUB.1** First impression emotional response:
- A - Calm confidence
- B - Energized focus
- C - Executive control
- D - Role-adaptive (different per role)

**HUB.2** Priority information (rank top 3):
- A - Today's deadlines/overdue
- B - Team capacity/workload
- C - Client health indicators
- D - Unread messages/notifications
- E - Quick actions

**HUB.3** AI assistant presence:
- A - Yes, conversational greeting
- B - No, pure data display
- C - Optional/configurable

**HUB.4** Aesthetic direction:
- A - Control tower (dark, data-dense)
- B - Living workspace (light, airy)
- C - Executive dashboard (clean, minimal)
- D - All modes available

---

### Studio (Content Creation)

**STUDIO.1** Who uses Studio:
- A - Creatives only
- B - Creatives + Account team
- C - Everyone (content engine for org)

**STUDIO.2** Content Calendar landing:
- A - Grid of client cards
- B - Unified calendar with filters
- C - Hybrid with role-based defaults

**STUDIO.3** AI Calendar Generator:
- A - Modal wizard
- B - Full-page immersive
- C - AI chat interface
- D - Split-screen hybrid

**STUDIO.4** Moodboard priorities (rank):
- A - Drag-drop from anywhere
- B - AI image generation
- C - Real-time collaboration
- D - Client sharing/approval

**STUDIO.5** Decks & Docs approach:
- A - Full editing (Google Slides competitor)
- B - Simplified templates
- C - AI-first generation

---

### Briefs (Work Management)

**BRIEFS.1** Submission experience:
- A - Quick form
- B - Guided wizard
- C - AI-assisted
- D - Hybrid (quick + guided modes)

**BRIEFS.2** AM visibility features:
- A - "My Briefed Work" section
- B - Status notifications
- C - Nudge capability
- D - All of the above

**BRIEFS.3** Work hierarchy:
- A - Client → Project → Brief
- B - Project → Brief (flat clients)
- C - Brief only (no grouping)

**BRIEFS.4** Template management:
- A - Users create + share
- B - Admins only
- C - Users create, admins approve

---

### Resources (Capacity)

**RESOURCES.1** Primary view:
- A - Kanban
- B - Gantt/Timeline
- C - Calendar
- D - Heatmap
- E - All with tabs

**RESOURCES.2** Grouping axis:
- A - By person
- B - By department
- C - By client
- D - Switchable

**RESOURCES.3** Capacity indicators:
- A - Color bars
- B - Percentage numbers
- C - Fuel gauge
- D - Background shading

**RESOURCES.4** Retainer tracking:
- A - Hours vs allocation
- B - Burn rate warnings
- C - Block beyond allocation
- D - A + B only

---

### CRM (Pipeline)

**CRM.1** Primary users:
- A - BD/Commercial only
- B - Leadership visibility
- C - AMs for relationships
- D - All of the above

**CRM.2** Pipeline view:
- A - Kanban
- B - List/Table
- C - Funnel
- D - All with toggle

**CRM.3** RFP handling:
- A - Separate pipeline
- B - Same pipeline with type tag
- C - Different team/process

**CRM.4** Won deal automation:
- A - Create client only
- B - Client + onboarding project
- C - Full automation (client, project, notifications, portal)

---

### Time Tracking

**TIME.1** Timer experience:
- A - Global floating
- B - Header bar
- C - Per task only
- D - All options

**TIME.2** Billable tracking:
- A - Tag per entry
- B - Infer from brief type
- C - Both

**TIME.3** Approval workflow:
- A - Weekly submission + approval
- B - Auto-submit, review exceptions
- C - No approval needed
- D - Configurable

---

### Team / Leave

**TEAM.1** Directory views:
- A - Simple list
- B - Org chart
- C - Card grid with skills
- D - All views

**TEAM.2** Leave request flow:
- A - Submit → Manager approves
- B - Policy-based auto-approve
- C - AI conflict check first

**TEAM.3** Delegation of Authority:
- A - Manual backup
- B - Auto-suggest
- C - Chain delegation
- D - All

**TEAM.4** Blackout days:
- A - Yes, org-wide
- B - Yes, per department
- C - No blackout days

---

### Chat (SpokeChat)

**CHAT.1** Structure:
- A - Channels only
- B - DMs only
- C - Channels + DMs + Item threads
- D - C + AI assistant

**CHAT.2** Slack relationship:
- A - SpokeChat replaces Slack
- B - Work items only, Slack for casual
- C - Sync between both

**CHAT.3** AI features:
- A - @mention for questions
- B - Thread summaries
- C - Response suggestions
- D - All

---

### Analytics

**ANALYTICS.1** Access:
- A - Leadership only
- B - Leadership + Finance
- C - Everyone (role-filtered)

**ANALYTICS.2** Client reports:
- A - White-labeled
- B - Internal only
- C - Both versions

**ANALYTICS.3** Key metrics (pick top 4):
- A - Team utilization
- B - Client profitability
- C - Brief turnaround
- D - Retainer burn rate
- E - Win rate
- F - Time compliance

---

### Client Portal

**PORTAL.1** Purpose:
- A - Approvals only
- B - Full project visibility
- C - Self-service briefs
- D - All

**PORTAL.2** Branding:
- A - Your brand
- B - White-labeled per client
- C - Co-branded
- D - Configurable

**PORTAL.3** NPS/Feedback:
- A - Integrated
- B - Separate link
- C - AI-triggered
- D - All

---

### Admin / Builder

**ADMIN.1** Builder access:
- A - Admins only
- B - Admins + Department leads
- C - Anyone propose, admins approve

**ADMIN.2** Template workflow:
- A - Publish immediately
- B - Draft → Review → Publish
- C - Draft → Sandbox → Publish

**ADMIN.3** AI Skill builder:
- A - Pre-built only
- B - Admin configures prompts
- C - Full builder with approval

---

## Phase 3: Configuration Generation

Based on Q&A answers, auto-generate:

1. **Form Templates** — Brief types, intake forms
2. **Workflow Automations** — Status triggers, notifications
3. **Dashboard Layouts** — Role-specific widget arrangements
4. **Permission Structures** — Access levels, scoped visibility
5. **AI Skill Configurations** — Active skills, prompt tuning
6. **Integration Settings** — Slack channels, calendar sync
7. **Branding Assets** — Colors, logos, terminology

---

## Phase 4: Sandbox Testing

1. Provision sandbox instance with generated config
2. Populate with dummy data
3. Client tests key workflows
4. Iterate on configuration
5. Finalize and deploy to production

---

## Output Format

```yaml
instance:
  name: "ClientName"
  subdomain: "clientname.spokestack.app"
  vertical: "agency"

modules:
  hub:
    aesthetic: "living_workspace"
    ai_greeting: true
    priority_widgets: ["deadlines", "notifications", "quick_actions"]

  studio:
    enabled: true
    ai_calendar: "split_screen"
    moodboard_dial: true

  briefs:
    submission_mode: "hybrid"
    template_approval: "manager"

  # ... etc for all modules

permissions:
  levels: ["admin", "leadership", "team_lead", "staff", "freelancer"]
  builder_access: "admins_plus_leads"

integrations:
  slack:
    enabled: true
    channels: ["briefs", "rfp", "general"]
  calendar:
    provider: "google"
```

---

## Reference: LMTD Configuration

See `/docs/FRONTEND_REDESIGN_USER_STORIES.md` for the complete LMTD instance configuration captured through this Q&A process.

---

*Skill Version: 1.0 | Created: January 2025*
