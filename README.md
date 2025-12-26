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
