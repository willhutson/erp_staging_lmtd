# SpokeStack Configuration Strategy

## Overview

This document outlines the configurable values that need to be updated when deploying SpokeStack for a new client or changing domains.

---

## Part 1: Domain & Email Configuration

### Environment Variables (Recommended Approach)

Create these in `.env` or your deployment platform:

```env
# Platform Domain Configuration
NEXT_PUBLIC_PLATFORM_DOMAIN="spokestack.io"        # Change to your domain
NEXT_PUBLIC_SUPPORT_EMAIL="support@spokestack.io"  # Change to your support email
NEXT_PUBLIC_CNAME_TARGET="cname.spokestack.io"     # CNAME target for custom domains
```

### Files to Update

| File | Line(s) | Current Value | Replace With |
|------|---------|---------------|--------------|
| **Core Config** |
| `src/lib/tenant.ts` | 5, 6, 30, 57, 82, 322, 341 | `spokestack.io` | `${PLATFORM_DOMAIN}` |
| `src/lib/supabase/middleware.ts` | 9, 11 | `spokestack.io` | `${PLATFORM_DOMAIN}` |
| **UI Components** |
| `src/app/(platform)/hub/page.tsx` | 301 | `support@spokestack.io` | `${SUPPORT_EMAIL}` |
| `src/app/(platform)/docs/page.tsx` | 202, 205 | `support@spokestack.io` | `${SUPPORT_EMAIL}` |
| `src/app/(platform)/superadmin/instances/new/page.tsx` | 300 | `.spokestack.io` | `.${PLATFORM_DOMAIN}` |
| `src/app/(platform)/superadmin/instances/page.tsx` | 144, 149 | `.spokestack.io` | `.${PLATFORM_DOMAIN}` |
| `src/app/(platform)/superadmin/domains/page.tsx` | 178, 246 | `.spokestack.io` | `.${PLATFORM_DOMAIN}` |
| `src/app/(platform)/admin/instances/page.tsx` | 228, 233 | `.spokestack.io` | `.${PLATFORM_DOMAIN}` |
| `src/app/(platform)/admin/instances/new/page.tsx` | 156, 249 | `.spokestack.io` | `.${PLATFORM_DOMAIN}` |
| `src/app/(platform)/admin/settings/portal/page.tsx` | 319, 366 | `.spokestack.io` | `.${PLATFORM_DOMAIN}` |
| **Documentation** |
| `docs/README.md` | 102 | `support@spokestack.io` | `${SUPPORT_EMAIL}` |
| `docs/user-guides/getting-started.md` | 10 | `yourcompany.spokestack.io` | `yourcompany.${PLATFORM_DOMAIN}` |

---

## Part 2: Country/Region Configuration (CLIENT_COUNTRY)

### Environment Variables

```env
# Client Region Configuration
NEXT_PUBLIC_DEFAULT_COUNTRY="UAE"                   # Primary country
NEXT_PUBLIC_DEFAULT_TIMEZONE="Asia/Dubai"           # Default timezone
NEXT_PUBLIC_DEFAULT_CURRENCY="AED"                  # Default currency
NEXT_PUBLIC_DEFAULT_CITY="Dubai"                    # Default city for examples
```

### Database Schema Updates Required

| File | Line(s) | Current Value | Notes |
|------|---------|---------------|-------|
| `prisma/schema.prisma` | 108-110 | `emiratesId`, `emiratesIdExpiry` | Rename to `nationalId`, `nationalIdExpiry` |
| `prisma/schema.prisma` | 809 | `EMIRATES_ID` enum | Rename to `NATIONAL_ID` |
| `prisma/schema.prisma` | 1861, 3874, 4177 | `Asia/Dubai` | Use `${DEFAULT_TIMEZONE}` |
| `prisma/schema.prisma` | 439 | `AED` | Use `${DEFAULT_CURRENCY}` |

### Dummy Data Files (CLIENT_COUNTRY Placeholders)

These files contain UAE-specific dummy data that should be replaced per client:

| File | Type | Replace |
|------|------|---------|
| **CRM Module** |
| `crm/companies/page.tsx` | Companies | Dubai, Abu Dhabi, UAE → CLIENT_CITY, CLIENT_COUNTRY |
| `crm/contacts/page.tsx` | Contacts | UAE company names → Generic or client-specific |
| `crm/deals/page.tsx` | Deals | Dubai campaigns → Generic campaigns |
| `crm/tasks/page.tsx` | Tasks | UAE references → Generic |
| **Listening Module** |
| `listening/trackers/page.tsx` | Trackers | UAE hashtags, Dubai clients → Generic |
| `listening/trackers/[id]/page.tsx` | Tracker detail | Dubai mentions → Generic |
| `listening/trackers/new/page.tsx` | New tracker | UAE clients dropdown → Generic |
| `listening/campaigns/page.tsx` | Campaigns | UAE campaigns → Generic |
| `listening/content/page.tsx` | Content | Dubai/UAE content → Generic |
| `listening/creators/new/page.tsx` | Creators | Dubai placeholder → Generic |
| **RFP Module** |
| `rfp/rfp-view.tsx` | RFPs | Dubai Tourism, UAE Space Agency, etc. → Generic |
| **Media Buying** |
| `mediabuying/budgets/page.tsx` | Budgets | UAE clients → Generic |
| `mediabuying/campaigns/page.tsx` | Campaigns | DET campaigns → Generic |
| **Team Module** |
| `team/add-member-dialog.tsx` | Clients dropdown | UAE clients → Client-specific |
| `team/departments/page.tsx` | Departments | UAE clients → Client-specific |
| **Analytics** |
| `analytics/campaigns/page.tsx` | Campaigns | DET campaigns → Generic |
| **Admin** |
| `admin/organizations/page.tsx` | Organizations | Dubai Tourism → Generic |
| `admin/users/page.tsx` | Users | Dubai Tourism dropdown → Generic |
| `admin/settings/profile/page.tsx` | Profile | Dubai timezone/location defaults → Configurable |
| `admin/crm/*` | All CRM admin | Same as CRM module above |

---

## Part 3: Implementation Strategy

### Phase 1: Create Config Files (Immediate)

1. Create `/src/config/platform.ts`:
```typescript
export const PLATFORM_CONFIG = {
  domain: process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "spokestack.io",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@spokestack.io",
  cnameTarget: process.env.NEXT_PUBLIC_CNAME_TARGET || "cname.spokestack.io",
};
```

2. Create `/src/config/region.ts`:
```typescript
export const REGION_CONFIG = {
  country: process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "UAE",
  timezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Asia/Dubai",
  currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "AED",
  city: process.env.NEXT_PUBLIC_DEFAULT_CITY || "Dubai",
};
```

### Phase 2: Update Core Files

1. Update `src/lib/tenant.ts` to use `PLATFORM_CONFIG.domain`
2. Update `src/lib/supabase/middleware.ts` to use `PLATFORM_CONFIG.domain`
3. Update all UI files to import from config

### Phase 3: Create Dummy Data Factory

1. Create `/src/config/dummy-data/` folder
2. Create region-specific data generators
3. Replace hardcoded dummy data with factory functions

### Phase 4: Database Migration

1. Rename `emiratesId` → `nationalId`
2. Add `countryCode` field to Organization
3. Make timezone/currency configurable per organization

---

## Part 4: Quick Reference - Files by Priority

### Priority 1: Must Change for Deployment
- [ ] `.env` - Add environment variables
- [ ] `src/lib/tenant.ts` - Platform domain
- [ ] `src/lib/supabase/middleware.ts` - Platform domain
- [ ] `prisma/schema.prisma` - Default timezone/currency

### Priority 2: User-Facing
- [ ] `hub/page.tsx` - Support email
- [ ] `docs/page.tsx` - Support email
- [ ] All `instances` pages - Domain display

### Priority 3: Dummy Data (Per Client)
- [ ] CRM dummy data
- [ ] RFP dummy data
- [ ] Listening dummy data
- [ ] Team dummy data

---

## Part 5: Onboarding Questions

When onboarding a new client, collect:

1. **Domain**: What domain will you use? (e.g., `app.clientname.com`)
2. **Support Email**: What email for support inquiries?
3. **Primary Country**: Where is majority of your team? (for timezone/currency defaults)
4. **Currency**: What currency for budgets/values? (USD, EUR, GBP, AED, etc.)
5. **Sample Clients**: Names of 3-4 clients for demo data (optional)

---

*Last Updated: December 2025*
