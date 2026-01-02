# Database Setup Guide: Prisma + Supabase + Vercel

This guide documents the complete setup for running Prisma with Supabase on Vercel serverless functions, including common pitfalls and their solutions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              VERCEL                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │  Function   │  │  Function   │  │  Function   │   Serverless         │
│  │  Instance   │  │  Instance   │  │  Instance   │   Functions          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                      │
│         │                │                │                              │
│         └────────────────┼────────────────┘                              │
│                          │                                               │
│                   Prisma Client                                          │
│                   (cached globally)                                      │
└──────────────────────────┼───────────────────────────────────────────────┘
                           │
                           │ DATABASE_URL
                           │ ?pgbouncer=true&connection_limit=1
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    PgBouncer (Connection Pooler)                 │    │
│  │                    pooler.supabase.com:6543                      │    │
│  │                    Transaction mode                              │    │
│  └──────────────────────────────┬──────────────────────────────────┘    │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │                      PostgreSQL Database                         │    │
│  │                   db.[project].supabase.co:5432                  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Connection Strings

### Two URLs Required

Prisma needs TWO different connection strings:

| Variable | Purpose | Host | Port | Used For |
|----------|---------|------|------|----------|
| `DATABASE_URL` | Runtime queries | `pooler.supabase.com` | 6543 | App queries via PgBouncer |
| `DIRECT_URL` | Schema migrations | `db.[project].supabase.co` | 5432 | `prisma db push`, `prisma migrate` |

### Format

```bash
# DATABASE_URL - Through connection pooler (for runtime)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=30"

# DIRECT_URL - Direct connection (for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Critical Parameters

| Parameter | Value | Why |
|-----------|-------|-----|
| `?pgbouncer=true` | Required | Tells Prisma to use PgBouncer-compatible queries |
| `&connection_limit=1` | Required for serverless | Each function instance uses only 1 connection |
| `&pool_timeout=30` | Recommended | Increases timeout from 10s to 30s |

## Prisma Configuration

### Schema Setup (`prisma/schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Used for migrations
}

generator client {
  provider = "prisma-client-js"
}
```

### Client Setup (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// CRITICAL: Cache in BOTH dev and production for serverless
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;

export default prisma;
```

**Why cache in production?** Without this, each serverless function invocation creates a new PrismaClient, quickly exhausting the connection pool.

## Environment Setup

### Local Development (`.env`)

```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Vercel Production

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Environment | Value |
|----------|-------------|-------|
| `DATABASE_URL` | Production | Full pooler URL with `?pgbouncer=true&connection_limit=1&pool_timeout=30` |
| `DIRECT_URL` | Production | Direct URL (optional, only needed if running migrations in CI) |

## Workflows

### Schema Changes Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SCHEMA CHANGES WORKFLOW                           │
└─────────────────────────────────────────────────────────────────────┘

1. Edit Schema Locally
   ┌─────────────────────────────────────────────────┐
   │  prisma/schema.prisma                           │
   │  + model NewTable {                             │
   │  +   id    String @id @default(cuid())          │
   │  +   name  String                               │
   │  + }                                            │
   └─────────────────────────────────────────────────┘
                          │
                          ▼
2. Push to Production Database
   ┌─────────────────────────────────────────────────┐
   │  $ npx prisma db push                           │
   │                                                 │
   │  Uses DIRECT_URL to connect directly            │
   │  (not through pooler)                           │
   └─────────────────────────────────────────────────┘
                          │
                          ▼
3. Commit & Push Code
   ┌─────────────────────────────────────────────────┐
   │  $ git add -A                                   │
   │  $ git commit -m "Add NewTable model"           │
   │  $ git push origin main                         │
   └─────────────────────────────────────────────────┘
                          │
                          ▼
4. Vercel Builds & Deploys
   ┌─────────────────────────────────────────────────┐
   │  Build runs: prisma generate && next build      │
   │  Prisma Client regenerated with new types       │
   │  App deployed with new model support            │
   └─────────────────────────────────────────────────┘
```

### Debugging Connection Issues

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEBUGGING FLOWCHART                               │
└─────────────────────────────────────────────────────────────────────┘

Error: "Unable to check out connection from the pool due to timeout"
                          │
                          ▼
          ┌───────────────────────────────┐
          │ Is ?pgbouncer=true in URL?    │
          └───────────────┬───────────────┘
                    No    │    Yes
                    ▼     │     ▼
              ┌───────┐   │   ┌─────────────────────────────┐
              │ Add it│   │   │ Is connection_limit=1 set? │
              └───────┘   │   └─────────────┬───────────────┘
                          │           No    │    Yes
                          │           ▼     │     ▼
                          │     ┌───────┐   │   ┌─────────────────────────┐
                          │     │ Add it│   │   │ Is Prisma client cached │
                          │     └───────┘   │   │ in production?          │
                          │                 │   └─────────────┬───────────┘
                          │                 │           No    │    Yes
                          │                 │           ▼     │     ▼
                          │                 │     ┌───────┐   │   ┌───────────────┐
                          │                 │     │Fix it │   │   │Increase       │
                          │                 │     │       │   │   │pool_timeout=30│
                          │                 │     └───────┘   │   └───────────────┘
                          │                 │                 │
                          └─────────────────┴─────────────────┘

Error: "relation does not exist"
                          │
                          ▼
          ┌───────────────────────────────────────┐
          │ Tables exist in production Supabase?  │
          └───────────────┬───────────────────────┘
                    No    │    Yes
                    ▼     │     ▼
          ┌─────────────────────────────────────┐
          │ Run: npx prisma db push             │
          │ (with production DIRECT_URL in .env)│
          └─────────────────────────────────────┘
```

## Common Mistakes

### 1. Using Pooler URL for DIRECT_URL

**Wrong:**
```bash
DIRECT_URL="postgresql://...@pooler.supabase.com:5432/postgres"
```

**Right:**
```bash
DIRECT_URL="postgresql://...@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### 2. Missing pgbouncer Parameter

**Wrong:**
```bash
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres"
```

**Right:**
```bash
DATABASE_URL="postgresql://...@pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 3. Not Caching Prisma Client in Production

**Wrong:**
```typescript
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Right:**
```typescript
if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;
```

### 4. Forgetting to Redeploy After Env Var Changes

Vercel environment variable changes require a new deployment to take effect!

## Finding Your Connection Strings

### Supabase Dashboard

1. Go to **Project Settings → Database**
2. Scroll to **Connection string**
3. Select **URI** format
4. Choose connection type:
   - **Session pooler** (port 5432) - NOT for Prisma
   - **Transaction pooler** (port 6543) - Use for DATABASE_URL
   - **Direct connection** - Use for DIRECT_URL

### Identifying Project Reference

Your project ref is in the URL:
```
https://app.supabase.com/project/[PROJECT_REF]/settings/database
                                  ▲
                                  This part
```

## Vercel Environment Variables

### Via CLI

```bash
# Remove old variable
vercel env rm DATABASE_URL production

# Add new variable (will prompt for value)
vercel env add DATABASE_URL production

# Pull env vars for local development
vercel env pull --environment=production .env.production.local
```

### Via Dashboard

1. **Project → Settings → Environment Variables**
2. Click variable to edit
3. Update value
4. **Redeploy** for changes to take effect

## Quick Reference

### Complete .env Template

```bash
# Supabase Database Connection Strings
# PROJECT_REF: Your Supabase project reference (from dashboard URL)
# PASSWORD: Your database password (from Project Settings → Database)
# REGION: Your Supabase region (e.g., ap-southeast-2)

# Runtime queries (through connection pooler)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=30"

# Schema migrations (direct connection)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Commands Cheatsheet

```bash
# Push schema to production
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# View database in Supabase
# Go to: https://app.supabase.com/project/[PROJECT_REF]/editor
```

## Troubleshooting Checklist

- [ ] DATABASE_URL uses `pooler.supabase.com` with port `6543`
- [ ] DATABASE_URL has `?pgbouncer=true`
- [ ] DATABASE_URL has `&connection_limit=1` (for serverless)
- [ ] DIRECT_URL uses `db.[project].supabase.co` with port `5432`
- [ ] Prisma client is cached globally (not just in development)
- [ ] Vercel env vars are set correctly
- [ ] Redeployed after changing env vars
- [ ] Ran `prisma db push` after schema changes
