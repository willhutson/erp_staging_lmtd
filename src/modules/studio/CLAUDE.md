# Studio Module

AI-assisted creative workspace within SpokeStack.

## Purpose

SpokeStudio bridges brief intake (Agency module) and content publishing (Marketing module) with tools for:
- Document creation with Google Docs sync
- Social content calendar
- Video pre-production (scripts, storyboards, shot lists)
- Pitch deck builder
- Moodboard Lab (AI-grounded creative generation)

## Module Structure

```
/src/modules/studio/
├── actions/          # Server actions
│   ├── docs-actions.ts
│   ├── calendar-actions.ts
│   ├── video-actions.ts
│   ├── deck-actions.ts
│   └── moodboard-actions.ts
├── components/       # Studio-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and services
│   ├── google-docs.ts
│   ├── google-slides.ts
│   └── moodboard-indexer.ts
└── types/           # TypeScript types
    └── index.ts
```

## Key Entities

| Entity | Purpose |
|--------|---------|
| StudioDocument | Google Docs sync documents |
| StudioCalendarEntry | Social content calendar |
| VideoProject | Video pre-production |
| PitchDeck | Presentation builder |
| Moodboard | AI-grounded creative context |

## Routes

All routes under `/studio`:
- `/studio` - Dashboard
- `/studio/docs` - Documents
- `/studio/decks` - Pitch decks
- `/studio/video` - Video projects
- `/studio/moodboard` - Moodboard Lab
- `/studio/calendar` - Social calendar
- `/studio/skills` - AI skill configuration

## Key Patterns

### Google Sync
Documents and decks sync with Google Workspace:
```typescript
// Pull changes from Google
await pullFromGoogle(documentId);

// Push changes to Google
await pushToGoogle(documentId);
```

### Moodboard Context
Moodboards provide AI context:
```typescript
// Index moodboard items for AI
await indexMoodboard(moodboardId);

// Generate content with moodboard context
await generateWithContext({
  skillId: "social-copy-writer",
  moodboardId,
  prompt: "Write Instagram caption",
});
```

### Client Context
All Studio entities can link to:
- Client (brand context)
- Project (scope context)
- Brief (task context)

## Related Modules

- **Agency** - Briefs flow into Studio
- **Marketing** - Content flows out to publishing
- **Builder** - Uses AgentSkill infrastructure
