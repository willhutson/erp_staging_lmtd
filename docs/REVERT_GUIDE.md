# Frontend Redesign Revert Guide

**Created**: January 2025
**Purpose**: Emergency escape hatches for frontend redesign

---

## Quick Reference

### Full Revert (back to before any redesign)
```bash
git checkout pre-redesign-checkpoint
# or create a branch from it:
git checkout -b safe-rollback pre-redesign-checkpoint
```

### Revert to Specific Phase
```bash
# See all redesign commits
git log --oneline --grep="redesign"

# Revert to a specific commit
git checkout <commit-hash>

# Or reset branch to that point (destructive!)
git reset --hard <commit-hash>
```

---

## Phase Commits

Each phase creates a commit with a predictable message:

| Phase | Commit Message Pattern |
|-------|----------------------|
| 1 | `[Redesign Phase 1] Design system foundation` |
| 2 | `[Redesign Phase 2] Navigation restructure` |
| 3 | `[Redesign Phase 3] Hub redesign` |
| 4 | `[Redesign Phase 4] Studio enhancement` |
| 5 | `[Redesign Phase 5] Component refresh` |

### Find a phase commit:
```bash
git log --oneline --grep="Redesign Phase 1"
```

---

## Escape Hatches

### Option 1: Checkout Tag (safest, non-destructive)
```bash
# View the safe state without losing current work
git checkout pre-redesign-checkpoint

# Return to redesign branch
git checkout claude/redesign-spokestack-frontend-g5fcx
```

### Option 2: Create Safe Branch
```bash
# Create a new branch from the safe point
git checkout -b my-safe-branch pre-redesign-checkpoint
```

### Option 3: Hard Reset (destructive - discards all redesign work)
```bash
# WARNING: This throws away all redesign commits!
git reset --hard pre-redesign-checkpoint
```

### Option 4: Revert Specific Phase
```bash
# Undo just one phase commit
git revert <phase-commit-hash>
```

---

## What's in Each Phase

### Phase 1: Design System Foundation
- `spokestack/src/styles/design-tokens.css` — CSS custom properties
- `spokestack/src/styles/modes.css` — Living/Control/Executive modes
- `spokestack/src/components/ui/` — Updated base components

### Phase 2: Navigation Restructure
- `spokestack/src/components/layout/Sidebar.tsx` — New nav structure
- `spokestack/src/app/(platform)/` — Route reorganization

### Phase 3: Hub Redesign
- `spokestack/src/app/(platform)/hub/` — Role-adaptive views
- `spokestack/src/modules/dashboard/` — New widgets

### Phase 4: Studio Enhancement
- `spokestack/src/app/(platform)/studio/` — Split-screen AI
- `spokestack/src/modules/studio/` — New patterns

### Phase 5: Component Refresh
- Brief cards, capacity gauges, chat components

---

## Emergency Contacts

If something goes wrong:
1. Don't panic — everything is tagged
2. Run `git checkout pre-redesign-checkpoint`
3. You're back to safety

---

*The only thing we have to fear is not having a revert plan.*
