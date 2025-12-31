# Architectural Decisions Log
## SpokeStack ERP Platform

This document captures architectural decisions made during development. Each decision includes context, options considered, and rationale.

---

## How to Use This Document

When making a significant architectural choice:
1. Add an entry with the template below
2. Reference the decision ID in code comments where relevant
3. Update if the decision is revisited

```markdown
## D-XXX: [Title]
**Date:** YYYY-MM-DD
**Status:** ACCEPTED | SUPERSEDED | DEPRECATED
**Context:** Why this decision was needed
**Options Considered:**
1. Option A - pros/cons
2. Option B - pros/cons
**Decision:** What we chose
**Rationale:** Why we chose it
**Consequences:** What this means for the codebase
```

---

## Decisions

### D-001: Unified Epic Document Over Separate Specs
**Date:** 2025-12-31
**Status:** ACCEPTED
**Deciders:** Will, Albert

**Context:**
Initial feedback session produced two documents: meeting notes with quick wins, and detailed technical specs for major initiatives. Needed to consolidate.

**Decision:**
Combine into single `/docs/EPIC_SPOKESTACK_Q1_2025.md` with phased implementation plan.

**Rationale:**
- Single source of truth for Q1 work
- Phases create natural checkpoints
- Quick wins (Phase 0) can ship while bigger initiatives are built

**Consequences:**
- All epic work references one document
- Phase 0 items must complete before Phase 1 begins
- Document will need updates as phases complete

---

### D-002: Workflow Builder Over Hardcoded RFP Automation
**Date:** 2025-12-31
**Status:** ACCEPTED
**Deciders:** Will, Albert

**Context:**
Albert showed impressive RFP automation in Monday.com. Initial instinct was to replicate specifically for RFPs.

**Options Considered:**
1. Build RFP-specific automation - faster, narrower
2. Build generic Workflow Builder - slower, reusable

**Decision:**
Build generic Workflow Builder. RFP workflow is first template, not the feature itself.

**Rationale:**
- "Build many options, not one-and-done" - Albert
- Same engine can power client onboarding, brief approval chains, DOA
- Aligns with SpokeStack as configurable platform, not point solution
- Vertical expansion (PR, recruiting, etc.) will need custom workflows

**Consequences:**
- Phase 3 scope is larger (generic engine vs. specific feature)
- Need robust template/instance separation in schema
- Builder UI must be intuitive for non-technical admins
- RFP automation ships later but platform is more capable

---

### D-003: Like-for-Like Role Matching for Delegation
**Date:** 2025-12-31
**Status:** ACCEPTED
**Deciders:** Will, Albert

**Context:**
DOA system needs to find delegates when someone goes on leave. Question: can anyone be a delegate?

**Options Considered:**
1. Any available person can be delegate - simple, flexible
2. Same role/seniority required - complex, safer
3. Configurable per user - most flexible, most complex

**Decision:**
Like-for-like matching with AI assistance. Senior AM → Senior AM, Designer → Designer.

**Rationale:**
- Prevents mismatched handoffs (junior handling senior decisions)
- AI skill `delegate-matcher` can find best match by role + capacity + client familiarity
- Junior-to-junior, senior-to-senior maintains appropriate authority levels

**Consequences:**
- Need role/seniority data on User model (already exists via PermissionLevel)
- AI skill must understand role equivalence
- May need override for edge cases (admin can force-assign different role)

---

### D-004: Tiered Builder Permissions with Approval Workflow
**Date:** 2025-12-31
**Status:** ACCEPTED
**Deciders:** Will, Albert

**Context:**
Builder allows creating templates, workflows, AI skills. Who should have access?

**Options Considered:**
1. Admin-only - secure, bottleneck
2. Anyone can edit - dangerous
3. Tiered with approval - balanced

**Decision:**
Four permission levels:
- Admin: Full access, can publish
- Template Editor: Can create/edit, must submit for approval
- Department Builder: Can create/edit for own department, must submit
- Read-Only: Can view configurations

**Rationale:**
- Department leads can contribute (Design Lead builds Design templates)
- No one accidentally breaks production (approval required)
- Admins aren't bottleneck for creation, only for publishing
- Audit trail of who created/approved what

**Consequences:**
- Need BuilderPermission model in schema
- Need approval workflow UI
- Templates have DRAFT/PENDING/PUBLISHED states

---

### D-005: Air Traffic Control for Leave Conflicts
**Date:** 2025-12-31
**Status:** ACCEPTED
**Deciders:** Will, Albert

**Context:**
DOA system auto-delegates when someone is on leave. What if the delegate is also on leave?

**Decision:**
Proactive conflict detection at leave request time, not reactive at task assignment time.

**Implementation:**
When leave request submitted:
1. Check if requester's delegate is available during requested dates
2. If not, check chain delegation
3. Alert manager with options: approve with chain, request date change, assign alternate

**Rationale:**
- Managers shouldn't discover coverage gaps after approving leave
- "Hi CJ, you've got 3 leave requests pending and two have DOA on each other" - proactive alert
- Prevents the scramble of manual reassignment

**Consequences:**
- Leave request form needs delegation preview
- Manager approval screen shows delegation implications
- Need `leave-conflict-detector` AI skill

---

### D-006: Cascading Gantt-Style Deadline Calculation
**Date:** 2025-12-31
**Status:** ACCEPTED
**Deciders:** Will, Albert

**Context:**
Workflow tasks need due dates. How should they be calculated?

**Options Considered:**
1. Fixed dates set manually - tedious, error-prone
2. Relative to workflow start (start + X days) - doesn't work backwards
3. Relative to deadline (deadline - X days) - reverse Gantt

**Decision:**
Cascade backwards from workflow deadline. "Deadline - 21 days" for first task, etc.

**Rationale:**
- RFPs have hard submission deadlines - work backwards from there
- Dependencies flow naturally (task B starts when task A completes)
- Matches mental model: "we need to submit on Jan 15, so..."

**Consequences:**
- All workflow instances need deadline field
- Task due dates recalculate if deadline changes
- Visual Gantt preview in Builder shows cascade

---

### D-007: Brief.createdById as "Briefed By"
**Date:** 2025-12-31
**Status:** ACCEPTED

**Context:**
AMs want visibility on tasks they briefed. Need "Briefed By" field on brief cards.

**Options Considered:**
1. Add new `briefedById` field - explicit, migration needed
2. Use existing `createdById` - already exists, semantic match

**Decision:**
Use `createdById` as the briefer. The person who creates the brief is the one who briefed it.

**Rationale:**
- No schema change needed
- Semantic match (creator = briefer in agency context)
- Already populated on all existing briefs

**Consequences:**
- UI change only (display createdById on cards, add filter)
- If admin creates on behalf of AM, createdById won't match - edge case accepted

---

### D-008: Co-Assigner Field as DOA Foundation
**Date:** 2025-12-31
**Status:** ACCEPTED

**Context:**
Phase 0 includes adding backup assignee field to briefs. This is foundation for Phase 4 DOA.

**Decision:**
Add `backupAssigneeId` to Brief model in Phase 0. Wire to DOA in Phase 4.

**Rationale:**
- Quick win that provides immediate value (visibility)
- Foundation for automated delegation later
- AMs can set backup at brief creation time

**Consequences:**
- Schema change in Phase 0
- Phase 4 DOA will check this field when delegating
- Brief form needs backup assignee dropdown

---

## Pending Decisions

### P-001: Hub Widget Framework
**Status:** NEEDS_DECISION
**Context:** Hub will show role-based widgets. Should widgets be:
- Hardcoded per role?
- User-customizable layout?
- Admin-configurable defaults with user overrides?

**Leaning toward:** Admin defaults + user overrides (like Salesforce dashboards)

---

### P-002: Notification Channel Priority
**Status:** NEEDS_DECISION
**Context:** Nudges can go to Slack, email, in-app. When to use which?

**Options:**
1. Always all channels - noisy
2. User preference - more settings
3. Escalating (in-app → Slack → email) - smart but complex

---

## Superseded Decisions

*None yet*
