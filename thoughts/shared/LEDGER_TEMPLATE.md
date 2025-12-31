# Epic Continuity Ledger Template

Use this template when executing multi-phase epics that span multiple sessions. The ledger survives context loss and provides instant orientation for any session.

---

## When to Use This

- Epics spanning 2+ weeks
- Work requiring 3+ sessions
- Projects with multiple phases/milestones
- Any work where "where was I?" is a risk

---

## Template Structure

```markdown
# Continuity Ledger: [Epic Name]
## [Epic Subtitle]

**Ledger ID:** [EPIC-ID]-001
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD (Session XXX)
**Status:** ACTIVE | PAUSED | COMPLETE

---

## Current Goal

[1-2 sentence summary of what this epic achieves]

**Primary Document:** `/docs/[EPIC_DOC].md`

---

## Phase Status

| Phase | Name | Weeks | Status | Progress |
|-------|------|-------|--------|----------|
| 0 | [Phase Name] | 1-2 | COMPLETE | ✅ |
| 1 | [Phase Name] | 3-4 | IN_PROGRESS | 60% |
| 2 | [Phase Name] | 5-6 | NOT_STARTED | - |

---

## Phase [N] Checklist

- [x] **N.1** [Task name] ✅
  - [Implementation notes]
  - [Key files created/modified]

- [ ] **N.2** [Task name]
  - [Requirements]
  - [Blockers if any]

---

## Deployment Readiness

| Component | Code | Tests | Deployed | Verified |
|-----------|------|-------|----------|----------|
| [Feature] | ✅   | ⏳    | ❌       | ❌       |
| [Feature] | ✅   | ✅    | ✅       | ⏳       |

Legend: ✅ Done | ⏳ In Progress | ❌ Not Started

---

## Decisions Made

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D001 | [What was decided] | [Why] | YYYY-MM-DD |

---

## Blocked / Waiting On

| Item | Blocker | Owner | Since |
|------|---------|-------|-------|
| [Task] | [What's blocking] | [Who can unblock] | YYYY-MM-DD |

---

## Key Files

### [Category]
- `/path/to/file.ts` - [Purpose]

---

## Session History

| Session | Date | Focus | Outcome |
|---------|------|-------|---------|
| 001 | YYYY-MM-DD | [What was worked on] | [What was achieved] |

---

## Next Actions

1. [Immediate next step]
2. [Following step]
3. [Blocked item if any]

---

## Context Preservation Notes

When resuming this work:
1. Read this ledger first
2. Check primary document for full spec
3. Look at Phase Status table for current progress
4. Check Blocked section for anything needing resolution

**Key Insight:** [One sentence that captures the most important context]
```

---

## Best Practices

### Starting a Session
```
1. Read ledger → know exactly where you are
2. Check "Blocked" section → surface issues early
3. Check "Next Actions" → immediate priorities
```

### During a Session
```
1. Update checklist items as you complete them
2. Add files to "Key Files" as you create them
3. Log decisions immediately (you'll forget the rationale)
```

### Ending a Session
```
1. Update Phase Status percentage
2. Add session to history table
3. Update "Next Actions" for future you
4. Commit the ledger with your code
```

### Commit Strategy
```
# Checkpoint commits (do frequently)
git commit -m "Phase 2.3: Add user authentication"

# Ledger-only commits (when pausing)
git commit -m "Update ledger: Session 005 complete, Phase 2 at 80%"
```

---

## Common Patterns

### Progress Indicators
```
| Status | Meaning |
|--------|---------|
| ✅ | Complete and verified |
| ⏳ | In progress |
| ❌ | Not started |
| 🚫 | Blocked |
| ⚠️ | Needs attention |
```

### Phase Status Values
```
COMPLETE     - All items done
IN_PROGRESS  - Actively working
PAUSED       - Waiting on external
NOT_STARTED  - Future phase
BLOCKED      - Cannot proceed
```

### Checklist Item Format
```markdown
- [x] **1.3** Task name (Priority) ✅
  - Created `/path/to/file.ts`
  - Updated `/path/to/other.ts`
  - Key decision: [what and why]
```

---

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Update ledger at end of session only | Update as you go |
| Leave "Blocked" empty when stuck | Surface blockers immediately |
| Vague task descriptions | Specific, actionable items |
| Skip session history | Log every session (context is gold) |
| Forget key files | Add files as you create them |

---

## Integration with CLAUDE.md

Add this to your project's CLAUDE.md:

```markdown
## Session Continuity System

This project uses ledger-based context preservation for long-running work.

### Directory Structure
/thoughts
  /ledgers/           # Active epic tracking
  /shared/            # Templates (like this file)
  /handoffs/          # Completed session handoffs
  DECISIONS.md        # Architectural decisions log

### When Starting a Session
1. Check `/thoughts/ledgers/` for active work
2. Read the relevant ledger for current state

### Natural Language Commands
- **"update ledger"** → Preserve current progress
- **"what's the current state?"** → Review ledger
```

---

## Example: Real Usage

From the Q1 2025 Epic (11 sessions, 6 phases):

**What worked:**
- Phase checklist made progress crystal clear
- Key Files section eliminated searching
- Session history prevented duplicate investigations
- Decisions table preserved architectural rationale

**Improvement made:**
- Added Deployment Readiness table (code ≠ deployed)
- Added Blocked/Waiting On section (surfaces issues)

---

## Creating a New Ledger

```bash
# 1. Create ledger file
cp /thoughts/shared/LEDGER_TEMPLATE.md /thoughts/ledgers/CONTINUITY_[EPIC-NAME].md

# 2. Fill in header info
# 3. Define phases and initial checklist
# 4. Commit with epic kickoff
git add thoughts/ledgers/
git commit -m "Initialize [Epic Name] ledger"
```
