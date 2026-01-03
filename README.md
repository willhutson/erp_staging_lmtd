# TeamLMTD ERP Platform

A multi-tenant ERP platform for professional services agencies. Built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (Google OAuth + Credentials)
- **Storage**: Supabase Storage (DAM bucket)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (local or Supabase)
- Supabase project (for storage)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Database (Supabase or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# For Supabase, use the pooling connection string for Vercel:
# DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth.js
AUTH_SECRET="your-auth-secret-min-32-chars"
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"

# Supabase (for storage)
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional: Local storage fallback
STORAGE_PROVIDER="supabase"  # or "local" for development
LOCAL_STORAGE_PATH="/tmp/uploads"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database (development)
pnpm db:push

# Run migrations (production)
pnpm prisma migrate deploy

# Seed the database with LMTD data
pnpm db:seed
```

### 4. Supabase Storage Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Storage and create a bucket named `dam` (private)
3. Copy your project URL and service role key to `.env`

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/config                 # Tenant and form configurations
/prisma
  schema.prisma         # Database schema
  seed.ts              # LMTD seed data
/src
  /app                  # Next.js App Router pages
    /(auth)            # Login, signup
    /(dashboard)       # Main app (protected)
    /api               # API routes
  /components          # React components
    /ui                # shadcn/ui components
  /lib                 # Utilities and services
    auth.ts            # NextAuth config + getOrgContext
    db.ts              # Prisma client
    /storage           # Storage services
  /modules             # Feature modules
  /types               # TypeScript types
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:seed` | Run seed script |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm prisma generate` | Regenerate Prisma client |
| `pnpm prisma migrate deploy` | Run migrations |

## API Endpoints

### Storage API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/storage/upload-url` | POST | Get signed URL for upload |
| `/api/storage/download-url` | GET | Get signed URL for download |
| `/api/storage/complete-upload` | POST | Finalize upload metadata |

### Brief API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/briefs` | GET | List briefs |
| `/api/v1/briefs` | POST | Create brief |
| `/api/v1/briefs/[id]` | GET/PATCH/DELETE | Brief CRUD |

## Multi-Tenancy

All tenant-scoped data is isolated by `organizationId`. Use `getOrgContext()` in Server Actions and API routes:

```typescript
import { getOrgContext } from "@/lib/auth";

export async function myServerAction() {
  const ctx = await getOrgContext();
  // ctx.organizationId, ctx.userId, ctx.permissionLevel

  const data = await db.brief.findMany({
    where: { organizationId: ctx.organizationId },
  });
}
```

## Authentication

- **Google OAuth**: Primary auth method with stable identity binding (`googleSub`)
- **Credentials**: Available for users without Google accounts (freelancers)
- **Session**: JWT-based, no database sessions

## License

Private - TeamLMTD

---

## Recent Updates (January 2025)

### AI Calendar Generator (SpokeStudio)

New AI-powered social media content calendar generator at **[spokestack.vercel.app/studio/calendar](https://spokestack.vercel.app/studio/calendar)**:

- **3-Step Wizard**: Setup → Cadence → Preview workflow
- **"Sample for Pitch" Mode**: Generate showcase-quality content for RFP demos
- **UAE Holidays**: Auto-populated Islamic holidays, National Day, international events
- **Platform Cadence**: Configure posts per week for Instagram, Facebook, LinkedIn, Twitter, TikTok
- **GPT-4 Powered**: Generates titles, descriptions, content types, optimal posting times
- **Bulk Preview**: Review and select AI-generated entries before adding to calendar

### Performance Optimizations

- **React `cache()` Deduplication**: Auth and session calls are memoized per-request
- **Loading Skeletons**: Instant feedback with `loading.tsx` files for platform routes
- **Graceful Error Handling**: LMS and other modules show setup messages instead of crashing

### Custom Commands

| Command | Description |
|---------|-------------|
| `/technicalwriter` | Update technical documentation after code changes |

### Files Added

```
src/modules/studio/actions/ai-calendar-actions.ts  # AI generation + UAE holidays
src/modules/studio/components/AICalendarGeneratorModal.tsx  # Full wizard UI
src/app/(platform)/loading.tsx  # Platform loading skeleton
src/app/(platform)/lms/loading.tsx  # LMS loading skeleton
.claude/commands/technicalwriter.md  # Documentation update command
```

---

## Frontend Redesign (January 2025)

### CEO Hub Dashboard

Role-adaptive Hub at `/hub` with executive-level views:

- **CEO View**: 12-module quick navigation grid, Revenue MTD, Pipeline value, Company Pulse alerts
- **AM View**: Briefs submitted, client calendars, focus items
- **Creative View**: Assignments, timer, moodboard access
- **Leadership View**: Team capacity, retainer health, pipeline

### Pipeline Funnel Component

Sales pipeline visualization at `/crm`:

```typescript
import { PipelineFunnel, MiniFunnel, VerticalFunnel } from "@/components/ui/pipeline-funnel";

// Full funnel with conversion rates
<PipelineFunnel stages={stages} showConversion showValue />

// Compact inline version
<MiniFunnel stages={stages} />

// Classic vertical shape
<VerticalFunnel stages={stages} />
```

### Animated Icons

CSS-based animated icons (no external dependencies):

```typescript
import {
  SparklesAnimated, ZapAnimated, BellAnimated,
  HeartAnimated, AIThinking, SuccessAnimated
} from "@/components/ui/animated-icons";

<SparklesAnimated trigger="hover" />
<BellAnimated hasNotification />
<AIThinking /> // Continuous loading animation
```

### Auth Redesign

Split-screen login/signup pages:
- Left: Branding panel with TeamLMTD turquoise gradient
- Right: Clean form with social login options

### New Pages Added

| Route | Description |
|-------|-------------|
| `/briefs/briefed-by-me` | AM view of submitted briefs |
| `/resources/availability` | Team capacity grid with fuel gauges |
| `/retainers/burn` | Retainer burn rate monitoring |
| `/retainers/scope-changes` | Scope change request management |
| `/lms/browse` | Course catalog with search |

### Design System Components

```
spokestack/src/components/ui/
  pipeline-funnel.tsx    # Funnel visualizations
  animated-icons.tsx     # CSS-animated Lucide icons
  design-system.ts       # Barrel export for all design components
```
