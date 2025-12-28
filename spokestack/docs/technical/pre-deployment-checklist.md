# SpokeStack Pre-Deployment Checklist

## Master List for First Instance Deployment

**Created:** December 2025
**Status:** Pre-Production

---

## Overview

This document consolidates all configuration, integrations, and tasks required before deploying your first SpokeStack instance.

---

## SECTION 1: Environment Configuration

### 1.1 Required Environment Variables

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://user:password@host:5432/spokestack"

# ===========================================
# AUTHENTICATION (Supabase)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # For server-side operations

# ===========================================
# PLATFORM DOMAIN (See Section 2)
# ===========================================
NEXT_PUBLIC_PLATFORM_DOMAIN="__YOUR_DOMAIN__"           # e.g., spokestack.io
NEXT_PUBLIC_SUPPORT_EMAIL="__YOUR_EMAIL__"              # e.g., support@spokestack.io
NEXT_PUBLIC_CNAME_TARGET="cname.__YOUR_DOMAIN__"        # For custom domains

# ===========================================
# REGION DEFAULTS (See Section 3)
# ===========================================
NEXT_PUBLIC_DEFAULT_COUNTRY="__CLIENT_COUNTRY__"        # e.g., UAE, USA, UK
NEXT_PUBLIC_DEFAULT_TIMEZONE="__CLIENT_TIMEZONE__"      # e.g., Asia/Dubai
NEXT_PUBLIC_DEFAULT_CURRENCY="__CLIENT_CURRENCY__"      # e.g., AED, USD, GBP
NEXT_PUBLIC_DEFAULT_CITY="__CLIENT_CITY__"              # e.g., Dubai, New York

# ===========================================
# INTEGRATIONS (See Section 4)
# ===========================================
# Phyllo (Creator Data)
PHYLLO_CLIENT_ID="__OPTIONAL__"
PHYLLO_CLIENT_SECRET="__OPTIONAL__"
PHYLLO_ENVIRONMENT="sandbox"  # or "production"

# BigQuery (Analytics)
BIGQUERY_PROJECT_ID="__OPTIONAL__"
BIGQUERY_DATASET_ID="__OPTIONAL__"
BIGQUERY_SERVICE_ACCOUNT_JSON="__OPTIONAL__"
```

---

## SECTION 2: Domain Configuration

### 2.1 Files Requiring Domain Updates

| Priority | File | What to Update |
|----------|------|----------------|
| **P1** | `src/lib/tenant.ts` | Platform domain (7 references) |
| **P1** | `src/lib/supabase/middleware.ts` | Platform domain (2 references) |
| **P2** | `src/app/(platform)/hub/page.tsx:301` | Support email |
| **P2** | `src/app/(platform)/docs/page.tsx:202,205` | Support email |
| **P2** | `src/app/(platform)/superadmin/instances/new/page.tsx:300` | Domain display |
| **P2** | `src/app/(platform)/superadmin/instances/page.tsx:144,149` | Domain display |
| **P2** | `src/app/(platform)/superadmin/domains/page.tsx:178,246` | Domain display |
| **P2** | `src/app/(platform)/admin/instances/page.tsx:228,233` | Domain display |
| **P2** | `src/app/(platform)/admin/instances/new/page.tsx:156,249` | Domain display |
| **P2** | `src/app/(platform)/admin/settings/portal/page.tsx:319,366` | Domain display |
| **P3** | `docs/README.md:102` | Support email |
| **P3** | `docs/user-guides/getting-started.md:10` | Example domain |

### 2.2 Checklist

- [ ] Choose deployment domain (e.g., `app.yourcompany.com`)
- [ ] Set up DNS records
- [ ] Configure Vercel domain settings
- [ ] Update all P1 files with domain
- [ ] Update all P2 files with domain
- [ ] Update documentation with domain

---

## SECTION 3: Country/Region Configuration

### 3.1 Schema Updates Required

| File | Current | Change To |
|------|---------|-----------|
| `prisma/schema.prisma:108-110` | `emiratesId`, `emiratesIdExpiry` | `nationalId`, `nationalIdExpiry` |
| `prisma/schema.prisma:809` | `EMIRATES_ID` enum | `NATIONAL_ID` |
| `prisma/schema.prisma:1861,3874,4177` | `@default("Asia/Dubai")` | Configurable |
| `prisma/schema.prisma:439` | `@default("AED")` | Configurable |

### 3.2 Dummy Data Files (UAE → CLIENT_COUNTRY)

These contain hardcoded UAE references for demo purposes:

| Module | Files | Content Type |
|--------|-------|--------------|
| **CRM** | `crm/companies/page.tsx` | UAE companies |
| | `crm/contacts/page.tsx` | UAE contacts |
| | `crm/deals/page.tsx` | Dubai campaigns |
| | `crm/tasks/page.tsx` | UAE tasks |
| **Listening** | `listening/trackers/page.tsx` | UAE hashtags |
| | `listening/trackers/[id]/page.tsx` | Dubai content |
| | `listening/trackers/new/page.tsx` | UAE clients |
| | `listening/campaigns/page.tsx` | UAE campaigns |
| | `listening/content/page.tsx` | Dubai/UAE posts |
| | `listening/creators/new/page.tsx` | Dubai placeholder |
| **RFP** | `rfp/rfp-view.tsx` | Dubai Tourism, UAE Space, etc. |
| **Media Buying** | `mediabuying/budgets/page.tsx` | UAE client budgets |
| | `mediabuying/campaigns/page.tsx` | DET campaigns |
| **Team** | `team/add-member-dialog.tsx` | UAE client dropdown |
| | `team/departments/page.tsx` | UAE client refs |
| **Analytics** | `analytics/campaigns/page.tsx` | DET campaigns |
| **Admin** | `admin/organizations/page.tsx` | Dubai Tourism |
| | `admin/users/page.tsx` | Dubai dropdown |
| | `admin/settings/profile/page.tsx` | Dubai defaults |
| | `admin/crm/*` (5 files) | UAE CRM data |

### 3.3 Checklist

- [ ] Decide: Keep UAE as demo data or replace with generic?
- [ ] Update schema for generic national ID field
- [ ] Make timezone/currency configurable per organization
- [ ] Update demo data for first client (if not UAE)

---

## SECTION 4: Integrations

### 4.1 Available Integrations

| Integration | Purpose | Status | Required? |
|-------------|---------|--------|-----------|
| **Supabase** | Auth & Realtime | Ready | **Yes** |
| **Prisma/PostgreSQL** | Database | Ready | **Yes** |
| **Phyllo** | Creator data aggregation | Configured | No (Listening module) |
| **BigQuery** | Data warehouse/analytics | Configured | No (Analytics module) |
| **Slack** | Team notifications | Not started | No |
| **Google OAuth** | SSO login | Not started | No |
| **Meta Ads API** | Ad metrics | Not started | No (Media Buying) |
| **Google Ads API** | Ad metrics | Not started | No (Media Buying) |

### 4.2 Integration Checklist

**Required:**
- [ ] Create Supabase project
- [ ] Configure Supabase auth settings
- [ ] Set up PostgreSQL database
- [ ] Run Prisma migrations

**Optional (by module):**
- [ ] Phyllo account (for Listening module)
- [ ] BigQuery project (for Analytics)
- [ ] Slack app (for notifications)
- [ ] Meta Business account (for Media Buying)
- [ ] Google Ads account (for Media Buying)

---

## SECTION 5: Features with Placeholder/Mock Data

### 5.1 Using Mock Data (Demo Only)

These components use mock data for demonstration:

| Component | File | Mock Data |
|-----------|------|-----------|
| Notifications | `header.tsx:28` | `mockNotifications` array |
| Projects | `projects-view.tsx:38` | `DUMMY_PROJECTS` array |
| RFPs | `rfp-view.tsx:58` | `DUMMY_RFPS` array |
| Resources | `resources-view.tsx` | Dummy team/briefs |
| Briefs | `briefs-view.tsx` | Dummy briefs |
| CRM Contacts | `crm/contacts/page.tsx:58` | `mockContacts` |
| CRM Companies | `crm/companies/page.tsx:60` | `mockCompanies` |
| CRM Deals | `crm/deals/page.tsx:53` | `mockDeals` |
| CRM Tasks | `crm/tasks/page.tsx:58` | `mockTasks` |
| Pending Invites | `admin/users/page.tsx:131` | `pendingInvites` |

### 5.2 "Coming Soon" Features

| Feature | Location | Status |
|---------|----------|--------|
| AI RFP Document Extraction | `rfp-view.tsx:424` | Placeholder UI |

---

## SECTION 6: Database Setup

### 6.1 Checklist

- [ ] Create PostgreSQL database
- [ ] Run `pnpm db:push` to create schema
- [ ] Run `pnpm db:seed` to add seed data (optional)
- [ ] Verify all tables created in `prisma studio`

### 6.2 Seed Data Includes

- Sample organization
- 46 team members (LMTD team)
- 4 clients (CCAD, DET, ADEK, ECD)
- Sample briefs, projects, RFPs

---

## SECTION 7: Vercel Deployment

### 7.1 Checklist

- [ ] Connect GitHub repository to Vercel
- [ ] Add all environment variables
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Test build locally: `pnpm build`
- [ ] Deploy to production

---

## SECTION 8: Post-Deployment Testing

### 8.1 Smoke Tests

- [ ] Login works
- [ ] Hub loads correctly
- [ ] All sidebar navigation works
- [ ] Briefs module loads (List/Kanban/Timeline)
- [ ] RFP module loads with form
- [ ] Projects module loads
- [ ] Resources module loads
- [ ] Time tracking works
- [ ] Leave module works
- [ ] Team directory works
- [ ] Admin settings accessible
- [ ] Documentation page loads
- [ ] SpokeChat opens

### 8.2 Data Tests

- [ ] Can create new brief
- [ ] Can create new RFP
- [ ] Can log time entry
- [ ] Can submit leave request
- [ ] Can add team member

---

## SECTION 9: Client Onboarding Questions

Collect this information before deployment:

### Domain & Branding
1. What domain will you use? (e.g., `app.clientname.com`)
2. Support email address?
3. Logo file (SVG preferred)?
4. Primary brand color?

### Region
5. Primary country for your team?
6. Default timezone?
7. Default currency for budgets?

### Modules
8. Which bundles do you need?
   - [ ] ERP (Briefs, Time, Leave, Team, RFP)
   - [ ] Agency (Clients, Projects, Resources, CRM)
   - [ ] Marketing (Listening, Trackers, Analytics)
   - [ ] Client Portal

### Integrations
9. Do you need Slack integration?
10. Do you use BigQuery for analytics?
11. Do you need creator data (Phyllo)?
12. Which ad platforms? (Meta, Google, TikTok, etc.)

---

## Quick Reference: What You Need to Give Me

When ready to deploy, provide:

```
DEPLOYMENT INFO
===============
Domain: _______________
Support Email: _______________
Primary Color: _______________

REGION
======
Country: _______________
Timezone: _______________
Currency: _______________
City (for examples): _______________

INTEGRATIONS
============
Supabase URL: _______________
Supabase Anon Key: _______________
Database URL: _______________

OPTIONAL
========
Phyllo Client ID: _______________
BigQuery Project ID: _______________
```

---

*Last Updated: December 2025*
