# CLAUDE.md - TeamLMTD ERP Platform

## What This Project Is

A multi-tenant ERP platform for professional services agencies. TeamLMTD (a Dubai-based social/digital agency) is the first and currently only tenant.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, NextAuth.js v5

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
