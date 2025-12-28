# Architecture Overview

SpokeStack is built on a modern, scalable tech stack.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Next.js App Router (Server Components & Actions) |
| Database | PostgreSQL with Prisma ORM |
| Authentication | NextAuth.js v5 |
| Real-time | Supabase Realtime (for SpokeChat) |
| Hosting | Vercel |

---

## Application Structure

```
/spokestack
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Login, signup routes
│   │   ├── (platform)/        # Main app (protected)
│   │   │   ├── hub/           # Main dashboard
│   │   │   ├── briefs/        # Briefs module
│   │   │   ├── rfp/           # RFP module
│   │   │   ├── projects/      # Projects module
│   │   │   ├── resources/     # Resources module
│   │   │   ├── admin/         # Admin settings
│   │   │   ├── portal/        # Client portal
│   │   │   └── superadmin/    # Multi-tenant admin
│   │   └── api/               # API routes
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── layout/            # App shell, sidebar, header
│   │
│   └── lib/                   # Utilities
│       ├── prisma.ts          # Database client
│       ├── auth.ts            # Auth config
│       └── utils.ts           # Helper functions
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Seed data
│
└── docs/                      # This documentation
```

---

## Multi-Tenancy

SpokeStack is multi-tenant by design.

### Organization Model
Every data record includes an `organizationId`:

```typescript
model Brief {
  id             String   @id
  organizationId String   // Tenant isolation
  title          String
  // ...
}
```

### Instance Model
Each client gets an Instance with:
- Unique subdomain
- Enabled modules
- Branding settings
- User assignments

---

## Server-First Architecture

We prioritize Server Components and Server Actions:

### Server Components (Default)
```tsx
// Page with data fetching
export default async function BriefsPage() {
  const briefs = await getBriefs();
  return <BriefsList briefs={briefs} />;
}
```

### Client Components (When Needed)
```tsx
"use client";

export function BriefForm() {
  const [state, setState] = useState();
  // Interactive logic
}
```

---

## Data Flow

1. **User Request** → Next.js Route Handler
2. **Authentication** → NextAuth.js session check
3. **Authorization** → Permission check
4. **Data Fetch** → Prisma query with organizationId filter
5. **Render** → React Server Component
6. **Client Interactivity** → Client Components as needed

---

## Key Design Principles

### 1. Config-Driven
Tenant behavior defined in configuration, not hardcoded.

### 2. Type-Safe
Full TypeScript coverage with strict mode.

### 3. Modular
Features isolated in self-contained modules.

### 4. Secure
Multi-tenant data isolation, RBAC, secure defaults.

---

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."

# Supabase (for real-time)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## Build & Deploy

```bash
# Development
pnpm dev

# Production Build
pnpm build

# Database
pnpm db:push      # Push schema
pnpm db:seed      # Seed data
pnpm db:studio    # Open Prisma Studio
```

---

*Next: [API Reference](./api-reference.md)*
