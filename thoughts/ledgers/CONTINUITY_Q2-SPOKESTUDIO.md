# Continuity Ledger: Q2 SpokeStudio
## Content and Creative Automation at Scale

**Ledger ID:** Q2-SPOKESTUDIO-001
**Created:** 2025-12-31
**Last Updated:** 2025-12-31 (Session 001)
**Status:** ACTIVE

---

## Current Goal

Build SpokeStudio - the AI-assisted creative workspace within SpokeStack. Bridges brief intake (Agency) and publishing (Marketing) with tools for content creation, iteration, and approval.

**Primary Document:** `/docs/EPIC_SPOKESTUDIO_Q2_2025.md`

---

## Phase Status

| Phase | Name | Weeks | Status | Progress |
|-------|------|-------|--------|----------|
| S1 | Foundation | 1-2 | NOT_STARTED | - |
| S2 | Google Docs Sync | 2-3 | NOT_STARTED | - |
| S3 | Social Calendar | 3-4 | NOT_STARTED | - |
| S4 | Pitch Deck Builder | 4-5 | NOT_STARTED | - |
| S5 | Video Studio | 5-6 | NOT_STARTED | - |
| S6 | Moodboard Lab | 6-8 | NOT_STARTED | - |
| S7 | Creative Skills & Polish | 8-9 | NOT_STARTED | - |

---

## Phase S1 Checklist: Foundation

- [ ] **S1.1** Create (studio) route group and layout
  - `/src/app/(studio)/layout.tsx` - Studio shell with sidebar
  - `/src/app/(studio)/page.tsx` - Studio dashboard

- [ ] **S1.2** Add Studio to main navigation
  - Update Sidebar.tsx with Studio section
  - Add route: `/studio`

- [ ] **S1.3** Create Prisma schema for all Studio models
  - StudioDocument, StudioDocVersion
  - StudioCalendarEntry
  - VideoProject, VideoScript, Storyboard, StoryboardFrame, ShotListItem
  - PitchDeck, DeckSlide, DeckTemplate
  - Moodboard, MoodboardItem, MoodboardConversation, MoodboardOutput
  - All enums

- [ ] **S1.4** Run migrations
  - `pnpm db:push`

- [ ] **S1.5** Create basic page shells
  - `/studio/docs` - Documents list
  - `/studio/decks` - Pitch decks list
  - `/studio/video` - Video projects list
  - `/studio/moodboard` - Moodboards list
  - `/studio/calendar` - Social calendar
  - `/studio/skills` - AI skills config

- [ ] **S1.6** Set up module folder structure
  - `/src/modules/studio/actions/`
  - `/src/modules/studio/components/`
  - `/src/modules/studio/hooks/`
  - `/src/modules/studio/lib/`
  - `/src/modules/studio/types/`

- [ ] **S1.7** Create shared Studio components
  - StudioCard, StudioHeader, StudioFilters
  - StatusBadge variants for Studio

---

## Phase S2 Checklist: Google Docs Sync

- [ ] **S2.1** Set up Google OAuth for Docs/Drive scopes
- [ ] **S2.2** Create Google API service layer
- [ ] **S2.3** Implement document creation in Google
- [ ] **S2.4** Implement pull/push sync logic
- [ ] **S2.5** Build document list UI
- [ ] **S2.6** Build document editor with sync controls
- [ ] **S2.7** Add version history
- [ ] **S2.8** Handle sync conflicts

---

## Phase S3 Checklist: Social Calendar

- [ ] **S3.1** Build calendar component (react-big-calendar or custom)
- [ ] **S3.2** Create calendar entry CRUD
- [ ] **S3.3** Implement drag-drop rescheduling
- [ ] **S3.4** Add filters (client, platform, status)
- [ ] **S3.5** Build entry detail panel
- [ ] **S3.6** Connect to Marketing module for publishing
- [ ] **S3.7** Add brief deadline markers

---

## Phase S4 Checklist: Pitch Deck Builder

- [ ] **S4.1** Create deck templates system
- [ ] **S4.2** Build deck editor workspace
- [ ] **S4.3** Implement slide layouts (15 types)
- [ ] **S4.4** Build content block editor
- [ ] **S4.5** Add speaker notes
- [ ] **S4.6** Implement Google Slides export
- [ ] **S4.7** Add AI slide content generation
- [ ] **S4.8** Create template gallery

---

## Phase S5 Checklist: Video Studio

- [ ] **S5.1** Build video project list and workspace
- [ ] **S5.2** Create script editor (two-column format)
- [ ] **S5.3** Build storyboard canvas
- [ ] **S5.4** Implement frame image generation
- [ ] **S5.5** Create shot list table
- [ ] **S5.6** Add AI script generation
- [ ] **S5.7** Build timeline view

---

## Phase S6 Checklist: Moodboard Lab

- [ ] **S6.1** Build moodboard gallery and workspace layout
- [ ] **S6.2** Create drag-drop canvas (masonry + freeform)
- [ ] **S6.3** Implement multi-file upload with progress
- [ ] **S6.4** Build processing pipeline:
  - [ ] Images: color extraction, OCR, AI description
  - [ ] PDFs: text extraction, image extraction
  - [ ] Videos: keyframe extraction, transcription
  - [ ] Links: page fetch, screenshot, content extraction
- [ ] **S6.5** Set up embedding generation and storage
- [ ] **S6.6** Build board-level indexing and context summary
- [ ] **S6.7** Create chat interface for moodboard interaction
- [ ] **S6.8** Implement quick generate buttons
- [ ] **S6.9** Build output display and export
- [ ] **S6.10** Add sharing functionality

---

## Phase S7 Checklist: Creative Skills & Polish

- [ ] **S7.1** Register all Studio-specific AI skills
- [ ] **S7.2** Build skill configuration UI
- [ ] **S7.3** Connect to brief context (auto-pull client info)
- [ ] **S7.4** Add "Create from Brief" flows
- [ ] **S7.5** Implement "Send to Marketing" flows
- [ ] **S7.6** Build Studio dashboard with activity feed
- [ ] **S7.7** Add keyboard shortcuts
- [ ] **S7.8** Performance optimization

---

## Deployment Readiness

| Component | Code | Tests | Deployed | Verified |
|-----------|------|-------|----------|----------|
| Foundation | ❌ | ❌ | ❌ | ❌ |
| Google Docs Sync | ❌ | ❌ | ❌ | ❌ |
| Social Calendar | ❌ | ❌ | ❌ | ❌ |
| Pitch Deck Builder | ❌ | ❌ | ❌ | ❌ |
| Video Studio | ❌ | ❌ | ❌ | ❌ |
| Moodboard Lab | ❌ | ❌ | ❌ | ❌ |
| Creative Skills | ❌ | ❌ | ❌ | ❌ |

Legend: ✅ Done | ⏳ In Progress | ❌ Not Started

---

## Decisions Made

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D001 | Use ledger system from Q1 | Proven effective across 11 sessions | 2025-12-31 |
| D002 | Moodboard Lab is the differentiator | NotebookLM for creative - unique value prop | 2025-12-31 |
| D003 | Google Workspace is priority integration | Clients live in Google, essential for adoption | 2025-12-31 |

---

## Blocked / Waiting On

| Item | Blocker | Owner | Since |
|------|---------|-------|-------|
| - | - | - | - |

---

## Key Files

### Documentation
- `/docs/EPIC_SPOKESTUDIO_Q2_2025.md` - Master spec document
- `/thoughts/DECISIONS.md` - Architectural decisions log

### Schema (to be created)
- `/prisma/schema.prisma` - Will add Studio models

### Routes (to be created)
- `/src/app/(studio)/` - Studio route group

### Module (to be created)
- `/src/modules/studio/` - Studio module

---

## Session History

| Session | Date | Focus | Outcome |
|---------|------|-------|---------|
| 001 | 2025-12-31 | Epic setup | Created spec, ledger, branch |

---

## Next Actions

1. **Phase S1.1**: Create (studio) route group and layout
2. **Phase S1.2**: Add Studio to main navigation
3. **Phase S1.3**: Create Prisma schema for all Studio models

---

## Context Preservation Notes

When resuming this work:
1. Read this ledger first
2. Check `/docs/EPIC_SPOKESTUDIO_Q2_2025.md` for full spec
3. Check `/thoughts/DECISIONS.md` for architectural choices
4. Look at Phase Status table for current progress

**Key Insight:** Moodboard Lab is the "killer feature" - it's NotebookLM for creative work. Build the simpler features first (S1-S5) to establish patterns, then tackle S6 with full context.

**Dependency Note:** Q1 Epic provides foundation (Workflow Engine, Builder, Notifications). Q2 builds on top.
