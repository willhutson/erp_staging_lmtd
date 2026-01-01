# Thoughts Directory
## Session Continuity & Context Preservation

This directory implements a ledger-based context preservation system inspired by [Continuous Claude v2](https://github.com/parcadei/Continuous-Claude-v2).

## Why This Exists

Long-running projects suffer from context degradation. Each conversation compaction creates a "summary of a summary of a summary." After multiple sessions, signal degrades into noise.

**Solution:** Preserve state explicitly in ledgers. Clear context when needed. Resume with full signal intact.

## Directory Structure

```
/thoughts
├── README.md              # This file
├── DECISIONS.md           # Architectural decisions log
├── ledgers/               # Active session state
│   └── CONTINUITY_*.md    # Per-epic/project ledgers
├── shared/                # Templates and plans
│   └── HANDOFF_TEMPLATE.md
└── handoffs/              # Completed session transfers
    └── HANDOFF_*.md       # Historical handoffs
```

## How to Use

### Starting a Session

```
1. Read /thoughts/ledgers/CONTINUITY_Q1-EPIC.md (or relevant ledger)
2. Check DECISIONS.md for architectural context
3. Look for recent handoffs if resuming someone else's work
4. Review "Next Actions" in the ledger
```

### During a Session

- Update the ledger when making significant progress
- Add decisions to DECISIONS.md as they're made
- Reference decision IDs in code comments (e.g., `// See D-002`)

### Ending a Session

```
1. Update ledger with completed items
2. If work is incomplete, create handoff from template
3. Note blockers/questions for next session
4. Commit the ledger update
```

## Files

### Ledgers (`/ledgers/`)

Active state documents that survive `/clear` commands. One per major epic or project.

**Current ledgers:**
- `CONTINUITY_Q1-EPIC.md` - Q1 2025 Platform Enhancement Epic

### Decisions (`DECISIONS.md`)

Architectural decisions with context, options considered, and rationale. Use format:
```markdown
### D-XXX: [Title]
**Date:** YYYY-MM-DD
**Status:** ACCEPTED
**Decision:** What we chose
**Rationale:** Why we chose it
```

### Handoffs (`/handoffs/`)

Session transfer documents. Created when ending a session with incomplete work. Named with date: `HANDOFF_2025-01-15_phase0-filtering.md`

### Templates (`/shared/`)

Reusable templates like `HANDOFF_TEMPLATE.md`.

## Integration with Codebase

This system complements:
- `/CLAUDE.md` - Project-level instructions
- `/docs/EPIC_*.md` - Epic specifications
- `/src/modules/*/CLAUDE.md` - Module-specific context

## Best Practices

1. **Update frequently** - Don't wait until session end
2. **Be specific** - "Fixed filter bug" < "Fixed filter click handler in KanbanBoard.tsx line 142"
3. **Capture the 'why'** - Decisions without rationale are useless later
4. **Note gotchas** - What would trip up the next developer?
5. **Reference files** - Include paths, not just descriptions
