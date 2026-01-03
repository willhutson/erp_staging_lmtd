# CLAUDE.md - TeamLMTD ERP Platform

## What This Project Is

A multi-tenant ERP platform for professional services agencies. TeamLMTD (a Dubai-based social/digital agency) is the first and currently only tenant.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, NextAuth.js v5

## CRITICAL: SpokeStack is the Source of Truth

**The `/spokestack` folder is the production codebase deployed to Vercel.**

- **DO NOT** edit files in the root `/src` or `/prisma` folders - they are legacy/deprecated
- **ALWAYS** make changes in `/spokestack/`
- The root `/src` and `/prisma` folders may be removed in a future cleanup

```
/spokestack                     # ← PRODUCTION CODEBASE (edit here)
  /src/
    /app/(platform)/            # Main app routes (dashboard, studio, admin, etc.)
    /app/(auth)/                # Auth routes (login, signup)
    /app/api/                   # API routes
    /modules/                   # Feature modules (briefs, studio, rfp, lms, etc.)
    /lib/                       # Utilities (db.ts, auth.ts, supabase/, etc.)
    /components/                # Shared UI components
  /prisma/
    schema.prisma               # Production database schema
    seed.ts                     # Seed data

/src                            # ← DEPRECATED (do not edit)
/prisma                         # ← DEPRECATED (do not edit)
```

**Database:** Use `spokestack/prisma/schema.prisma` for all schema changes.

## Core Architecture Principles

1. **Config-Driven**: Tenant behavior lives in `/config`, never hardcoded
2. **Multi-Tenant Ready**: Every database table has `organizationId`
3. **Module Isolation**: Features in `/src/modules/[feature]` are self-contained
4. **TypeScript Strict**: No `any` types, full type safety
5. **Server-First**: Use Server Components and Server Actions by default

## Project Structure

```
/config                 # Tenant and form configurations
  /tenants/lmtd.config.ts
  /forms/*.form.ts
  /workflows/*.workflow.ts

/prisma
  schema.prisma         # Database schema
  seed.ts              # LMTD seed data (46 users, 4 clients)

/src
  /app                  # Next.js App Router pages
    /(auth)            # Login, signup
    /(dashboard)       # Main app (protected)
    /portal            # Client portal (separate auth)
    /api               # API routes
  
  /modules             # Feature modules (each has own CLAUDE.md)
    /briefs
    /resources
    /time-tracking
    /rfp
    /integrations
    /studio            # SpokeStudio - content creation suite
    /lms               # Learning Management System
  
  /components
    /ui                # shadcn/ui components
    /layout            # Shell, sidebar, header
    /forms             # Form field components
  
  /lib
    db.ts              # Prisma client
    auth.ts            # NextAuth config
    permissions.ts     # Permission utilities
    config.ts          # Config loading
```

## Critical Rules

### Database Queries
ALWAYS filter by organizationId:
```typescript
const briefs = await db.brief.findMany({
  where: { 
    organizationId: session.user.organizationId,
    // other filters
  },
});
```

### Permission Checks
```typescript
import { can } from '@/lib/permissions';

// In Server Actions or API routes
if (!can(user, 'brief:create')) {
  throw new Error('Unauthorized');
}
```

### Form Handling
Forms are config-driven. Don't hardcode fields:
```typescript
// Load form config
const formConfig = await loadFormConfig('VIDEO_SHOOT');

// Generate Zod schema from config
const schema = generateZodSchema(formConfig);

// Use with react-hook-form
const form = useForm({ resolver: zodResolver(schema) });
```

### Component Pattern
```typescript
// Server Component (default)
export default async function BriefsPage() {
  const briefs = await getBriefs(); // Server action
  return <BriefsList briefs={briefs} />;
}

// Client Component (only when needed)
'use client';
export function BriefForm() {
  const [state, setState] = useState();
  // Interactive logic
}
```

## Key Entities

| Entity | Purpose |
|--------|---------|
| Organization | Multi-tenant root (LMTD) |
| User | 46 team members with PermissionLevel |
| Client | Agency clients (CCAD, DET, ADEK, ECD) |
| Brief | Work items with 7 types |
| TimeEntry | Time tracking with timer |
| RFP | New business pipeline |

## Permission Levels

| Level | Users | Access |
|-------|-------|--------|
| ADMIN | Will, Afaq, Albert | Everything |
| LEADERSHIP | CJ, Ted, Salma, Matthew | All + RFP |
| TEAM_LEAD | Department heads | Team + assign |
| STAFF | Employees | Own work |
| FREELANCER | Contractors | Assigned only |

## Brief Types

1. VIDEO_SHOOT - `Shoot: [Client] – [Topic]`
2. VIDEO_EDIT - `Edit: [Client] – [Topic]`
3. DESIGN - `Design: [Client] – [Topic]`
4. COPYWRITING_EN - `Copy: [Client] – [Topic]`
5. COPYWRITING_AR - `Copy: [Client] – [Topic]`
6. PAID_MEDIA - `Paid Media: [Client] – [Topic]`
7. RFP - `RFP – [Entity]` (Leadership only)

## Brand Colors

- Primary: `#52EDC7` (TeamLMTD Turquoise)
- Primary Dark: `#1BA098`
- Use in headings, buttons, accents

## Commands

```bash
pnpm dev          # Start dev server
pnpm db:push      # Push schema changes
pnpm db:seed      # Run seed data
pnpm db:studio    # Open Prisma Studio
pnpm build        # Production build
pnpm test         # Run tests
```

## Before Starting Any Task

1. Read this file
2. Read the module's CLAUDE.md if it exists
3. Check `/config` for relevant settings
4. Look at existing patterns in similar code
5. Check `/docs` for detailed specifications

## Don't

- Hardcode tenant-specific values
- Skip TypeScript types
- Use client components unnecessarily
- Forget organizationId in queries
- Bypass permission checks
- Create files outside the project structure

## Session Continuity System

This project uses a ledger-based context preservation system for long-running work. Instead of relying on lossy context compaction, we preserve state explicitly.

### Directory Structure

```
/thoughts
  /ledgers/           # Session state (survives context clears)
    CONTINUITY_Q1-EPIC.md   # Current epic tracking
  /shared/            # Plans, templates (preserved between sessions)
    LEDGER_TEMPLATE.md      # Template for new epics (START HERE)
    HANDOFF_TEMPLATE.md     # Template for session handoffs
  /handoffs/          # Completed session handoffs
  DECISIONS.md        # Architectural decisions log
```

### Creating a New Epic Ledger

```bash
cp /thoughts/shared/LEDGER_TEMPLATE.md /thoughts/ledgers/CONTINUITY_[EPIC-NAME].md
```

See `/thoughts/shared/LEDGER_TEMPLATE.md` for full documentation on:
- Ledger structure and best practices
- Phase tracking and checklists
- Deployment readiness tracking
- Session history logging

### When Starting a Session

1. Check `/thoughts/ledgers/` for active work
2. Read the relevant ledger for current state
3. Check `/thoughts/DECISIONS.md` for architectural context
4. Look for recent handoffs in `/thoughts/handoffs/`

### When Ending a Session

1. Update the relevant ledger with progress
2. Create a handoff document if work is incomplete
3. Add any architectural decisions to `DECISIONS.md`
4. Note blockers or questions for next session

### Current Active Work

**Q1 2025 Epic:** `/docs/EPIC_SPOKESTACK_Q1_2025.md`
- Ledger: `/thoughts/ledgers/CONTINUITY_Q1-EPIC.md`
- 6 phases over 14 weeks
- Phase 0: Quick wins, Phase 1-5: Major initiatives

### Natural Language Commands

These phrases trigger continuity actions:
- **"save state"** or **"update ledger"** → Preserve current progress
- **"create handoff"** → Generate session transfer document
- **"resume from handoff"** → Load prior context and continue
- **"what's the current state?"** → Review ledger and recent work

## SpokeStudio Module

SpokeStudio is the content creation suite located at [`/studio`](https://spokestack.vercel.app/studio). Key features:

### Content Calendar ([`/studio/calendar`](https://spokestack.vercel.app/studio/calendar))

**Gallery Landing Page** - Shows all client calendars as cards:
- Active calendars with entry previews and platform icons
- Empty clients prompt AI calendar generation
- AI Calendar Generator hero card prominently featured

**Client Calendar View** (`/studio/calendar/[clientId]`) - Per-client calendar:
- Full month calendar with scheduled posts
- Drag-and-drop rescheduling
- Brief deadline integration
- Filter by platform, content type, status

### AI Calendar Generator

AI-powered social media content calendar generator (GPT-4):

```typescript
// Server action: src/modules/studio/actions/ai-calendar-actions.ts
import { generateAICalendar, saveGeneratedCalendarEntries } from "./ai-calendar-actions";

const result = await generateAICalendar({
  clientId: "...",
  clientName: "Client Name",
  month: new Date("2025-02-01"),
  moodTheme: "Modern and minimalist",
  goals: "Launch new product, increase engagement",
  holidays: ["Valentine's Day (Feb 14)"],
  cadence: {
    instagram: { postsPerWeek: 5, contentMix: [...] },
    linkedin: { postsPerWeek: 3, contentMix: [...] },
    // ...
  },
  isPitchMode: false, // Set true for RFP sample calendars
});
```

**Features:**
- 3-step wizard: Setup → Cadence → Preview
- UAE holidays auto-populated (Islamic + international)
- Platform cadence settings per channel (posts/week)
- Content mix percentages (POST, REEL, CAROUSEL, etc.)
- "Sample for Pitch" mode for RFP demos
- GPT-4 powered content generation
- Bulk preview and select before saving

**File Structure:**
```
spokestack/src/modules/studio/
  /actions/ai-calendar-actions.ts   # Server actions for AI generation
  /components/AICalendarGeneratorModal.tsx
  /data/holidays.ts                 # UAE holidays (shared client/server)
```

### Content Types

| Type | Best For |
|------|----------|
| POST | Static image posts |
| CAROUSEL | Multi-image educational content |
| REEL | Short-form video (Instagram/TikTok) |
| STORY | Ephemeral 24h content |
| LIVE | Live streaming events |
| ARTICLE | LinkedIn long-form |
| THREAD | Twitter/X threads |
| AD | Paid promotional content |

## Performance Optimizations

### React `cache()` for Request Deduplication

Auth and session calls are memoized per-request to avoid redundant database queries:

```typescript
// src/lib/supabase/server.ts
import { cache } from "react";

export const getSession = cache(async () => {
  const client = await createClient();
  const { data } = await client?.auth.getSession();
  return data?.session ?? null;
});

export const getUser = cache(async () => {
  const client = await createClient();
  const { data } = await client?.auth.getUser();
  return data?.user ?? null;
});
```

### Loading Skeletons

Use `loading.tsx` files for instant feedback during navigation:

```
src/app/(platform)/loading.tsx      # Platform-wide skeleton
src/app/(platform)/lms/loading.tsx  # LMS-specific skeleton
src/app/(platform)/admin/loading.tsx
src/app/(platform)/hub/loading.tsx
```

### Graceful Error Handling

Modules with optional database tables should handle missing tables gracefully:

```typescript
// Example: LMS page with try-catch
let courses = [];
let hasError = false;

try {
  courses = await getCourses();
} catch (error) {
  console.error("LMS data fetch error:", error);
  hasError = true;
}

if (hasError) {
  return <SetupRequiredMessage />;
}
```

## Custom Commands

| Command | Description |
|---------|-------------|
| `/technicalwriter` | Update technical documentation after code changes |

## Design System Components

Located in `spokestack/src/components/ui/`:

### Pipeline Funnel (`pipeline-funnel.tsx`)

Sales pipeline visualization with conversion rates:

```typescript
import { PipelineFunnel, MiniFunnel, VerticalFunnel, DEMO_PIPELINE_STAGES } from "@/components/ui/pipeline-funnel";

// Full funnel with conversion percentages between stages
<PipelineFunnel
  stages={stages}
  title="Sales Pipeline"
  showConversion={true}
  showValue={true}
/>

// Compact horizontal mini funnel for dashboards
<MiniFunnel stages={stages} />

// Classic vertical funnel shape
<VerticalFunnel stages={stages} />
```

### Animated Icons (`animated-icons.tsx`)

CSS-based animated Lucide icons (no external dependencies):

```typescript
import {
  SparklesAnimated,  // Scale/rotate sparkle
  ZapAnimated,       // Electric flash with glow
  BellAnimated,      // Ring notification
  CheckAnimated,     // Pop-in checkmark
  SendAnimated,      // Fly animation
  HeartAnimated,     // Pulse/beat
  StarAnimated,      // Twinkle rotation
  TrendingAnimated,  // Grow animation
  SuccessAnimated,   // Circle draw + check
  AIThinking,        // Continuous loading pulse
} from "@/components/ui/animated-icons";

<SparklesAnimated trigger="hover" />
<BellAnimated hasNotification={true} />
<AIThinking />  // Use for AI loading states
```

### Hub Role-Adaptive Views

The Hub (`/hub`) adapts based on user role:

| Role | Stats Shown | Quick Actions |
|------|-------------|---------------|
| CEO | Revenue MTD, Pipeline, Retainers, Team | 12-module grid + Company Pulse |
| Leadership | Active Deals, Team Capacity, Retainer Health | Pipeline, Resources, RFP |
| AM | Active Briefs, Time Logged, Retainers, Team | New Brief, My Briefs, Calendar |
| Creative | Assignments, Time, Projects | My Work, Timer, Moodboard |

## Documentation

Full specs are in `/docs`:
- 01_Platform_Overview.md
- 02_Technical_Architecture.md
- 03_Briefing_System.md
- 04_Resource_Planning.md
- 05_RFP_Management.md
- 06_User_Directory.md
- 07_User_Stories.md
- 08_Code_Templates.md
- **EPIC_SPOKESTACK_Q1_2025.md** - Current Q1 Epic (start here)
- **SPOKESTACK_PLATFORM_STRATEGY.md** - AI-first platform vision
