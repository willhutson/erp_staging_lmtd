# Handoff Document Template
## Session Transfer for SpokeStack Development

Use this template when ending a significant work session. The handoff preserves context for the next session (whether that's you tomorrow or another developer).

---

# HANDOFF: [Session Focus]

**Session ID:** [Auto-generated or manual]
**Date:** YYYY-MM-DD
**Duration:** X hours
**Developer:** [Name or Claude session]

---

## What Was Accomplished

### Completed Items
- [ ] Item 1 - brief description
- [ ] Item 2 - brief description

### Partial Progress
- Item 3 - 60% complete, stopped at [specific point]
- Item 4 - blocked by [reason]

### Files Modified
```
path/to/file1.tsx  - [what changed]
path/to/file2.ts   - [what changed]
prisma/schema.prisma - [what changed]
```

---

## Current State

### What's Working
- Feature X now does Y
- Test Z passes

### What's Broken
- Issue A - [description, reproduction steps]
- Issue B - [description]

### What's Left Undone
- Task 1 - [why stopped, what remains]
- Task 2 - [estimated effort to complete]

---

## Key Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Chose X over Y | Because Z | Affects [files/features] |

*Add to `/thoughts/DECISIONS.md` if architecturally significant*

---

## Blockers & Questions

### Blocked On
- [ ] Need clarification on [topic] from [person]
- [ ] Waiting for [dependency]

### Open Questions
- Should we [question]?
- How should [thing] handle [edge case]?

---

## Next Session Should

### Immediate Priority
1. [First thing to do]
2. [Second thing to do]

### Before Starting
- Read [specific file/doc] for context
- Run [command] to verify state
- Check [external dependency]

### Watch Out For
- [Gotcha or trap to avoid]
- [Assumption that might not hold]

---

## Context Preservation

### Mental Model
[Explain the conceptual understanding you developed that would take time to rebuild]

### Key Insight
[The "aha" moment that shouldn't be lost]

### Patterns Discovered
[Useful patterns found in the codebase]

---

## References

- Epic: `/docs/EPIC_SPOKESTACK_Q1_2025.md`
- Ledger: `/thoughts/ledgers/CONTINUITY_Q1-EPIC.md`
- Decisions: `/thoughts/DECISIONS.md`
- Related PR/Issue: [link if applicable]

---

## Session Metrics (Optional)

- Files touched: X
- Lines added/removed: +X/-Y
- Tests added: X
- Tests passing: Y/Z
