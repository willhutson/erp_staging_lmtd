# SpokeStack

A modern multi-tenant ERP and creative studio platform built for professional services agencies.

## Features

### Core ERP
- **Briefs Management** - Create and track creative work items (video shoots, edits, design, copywriting, paid media)
- **Time Tracking** - Timer-based and manual time logging with billable/non-billable tracking
- **Leave Management** - Leave requests, balances, and team calendar
- **Team Directory** - Org chart, profiles, and department management
- **Client Management** - Client accounts, contacts, and activity tracking
- **Project Management** - Budgets, retainers, and project tracking
- **RFP Pipeline** - Track RFPs from vetting to outcome
- **Deal Pipeline** - Sales pipeline with lead to close tracking

### SpokeStudio (AI-Powered Creative Suite)
- **Documents** - Rich text documents with Google Docs sync
- **Video Projects** - Scripts, storyboards, shot lists, and production tracking
- **Pitch Decks** - AI-assisted presentation builder with slide templates
- **Moodboards** - Visual inspiration boards with AI generation
- **Content Calendar** - Social media content planning and scheduling
- **AI Skills** - Pre-built AI assistants for copywriting, video scripts, design briefs, and more

### Forms (Surveys, Polls & Quizzes)
- **All Forms** - Create and manage surveys, polls, and quizzes
- **Templates** - Reusable form templates for common use cases
- **Form Builder** - AI-powered builder for intelligent question generation
- **NPS** - Net Promoter Score surveys and analytics

### Learning (LMS)
- **Learning Center** - Training dashboard with enrollments and progress
- **Courses** - Browse and manage training courses
- **Course Builder** - AI-powered curriculum and quiz generation
- **My Learning** - Track personal course enrollments and progress
- **Certificates** - Earned credentials and certifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Supabase Auth
- **State**: Zustand + React Query
- **Deployment**: Vercel

## Performance Optimizations

### Request Deduplication
Auth and database calls are memoized using React's `cache()` function, ensuring each request only makes one call to Supabase and the database even when multiple components need user data:

```typescript
// src/lib/supabase/server.ts - Runs once per request
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
```

### Loading States
The platform uses skeleton loading components for instant visual feedback during navigation:

```
/src/app/(platform)/loading.tsx       # Platform-wide skeleton
/src/app/(platform)/lms/loading.tsx   # LMS-specific skeleton
/src/app/(platform)/admin/loading.tsx # Admin skeleton
/src/app/(platform)/hub/loading.tsx   # Hub skeleton
```

### Error Handling
Server Components include graceful error handling for modules that may not be initialized:

```typescript
// Example: LMS page handles missing database tables
try {
  [courses, enrollments] = await Promise.all([getCourses(), getMyEnrollments()]);
} catch (error) {
  hasError = true; // Shows setup message instead of crashing
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- Supabase project (for auth)

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional: Google Integration
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
/prisma
  schema.prisma         # Database schema

/src
  /app                  # Next.js App Router
    /(auth)            # Login, signup
    /(platform)        # Main authenticated app
      /studio          # SpokeStudio pages
    /api               # REST API routes

  /modules             # Feature modules
    /studio            # SpokeStudio module
      /actions         # Server actions
      /components      # React components
      /types           # TypeScript types

  /components
    /ui                # shadcn/ui components
    /layout            # Shell, sidebar, header

  /lib                 # Utilities and config
```

## API Reference

SpokeStack provides a REST API for integrations:

- **Base URL**: `https://spokestack.vercel.app/api/v1`
- **Auth**: Session-based (cookie)
- **70+ endpoints** across Auth, Users, Clients, Briefs, Projects, Time, Leave, Team, RFP, Deals, Resources

See `/docs` or `/admin/settings/api` in the app for full API documentation.

## Available Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (includes db push)
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Multi-Tenant Architecture

SpokeStack is built for multi-tenancy:
- All data is scoped to `organizationId`
- Custom domains supported via `ClientInstance`
- Role-based access control (ADMIN, LEADERSHIP, TEAM_LEAD, STAFF, FREELANCER)

## License

Private - All rights reserved.
