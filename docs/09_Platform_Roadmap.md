# SpokeStack Platform Roadmap - Technical Specification

**Version:** 1.1
**Date:** December 2024
**Author:** Will Hutson / Claude
**Status:** Approved

---

## Executive Summary

This document outlines four major development phases to mature the SpokeStack platform:

1. **Phase 1: CRM Entity Clarification** - Fix the Deal/Client/RFP relationships
2. **Phase 2: Theme Customization** - Admin-controlled branding, colors, fonts
3. **Phase 3: Dashboard Layout Builder** - Drag-drop widget arrangement
4. **Phase 4: Visual Form Builder** - No-code brief type configuration (Admin only)

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Separate Lead entity? | **No** - Lead remains a stage of Deal |
| RFP creates Deal? | **No** - RFP is a parallel path (government), Deal is for private sector (pitches) |
| Deal WON auto-creates Client? | **Yes** - Automate conversion |
| RFP WON auto-creates Client? | **Yes** - Automate conversion |
| Remove deprecated contact fields? | **Yes** - Use ClientContact exclusively |
| Theme scope? | **Full** - Colors, fonts, and more |
| Form builder access? | **Admin only** |

---

## Phase 1: CRM Entity Clarification & Refactor

### The Business Model

TeamLMTD wins clients through two distinct paths:

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEW BUSINESS                              │
├─────────────────────────────┬───────────────────────────────────┤
│      GOVERNMENT PATH        │        PRIVATE SECTOR PATH        │
│      (RFP Pipeline)         │        (Deal Pipeline)            │
├─────────────────────────────┼───────────────────────────────────┤
│                             │                                    │
│   RFP Received              │   Deal Created (Lead stage)        │
│        ↓                    │        ↓                           │
│   Vetting                   │   Pitch/Proposal                   │
│        ↓                    │        ↓                           │
│   Active (working on it)    │   Negotiation                      │
│        ↓                    │        ↓                           │
│   Submitted                 │   ───────────────                  │
│        ↓                    │        ↓                           │
│   Awaiting Response         │   WON ──────────► CLIENT CREATED   │
│        ↓                    │   or LOST                          │
│   WON ──────────► CLIENT    │                                    │
│   or LOST        CREATED    │                                    │
│                             │                                    │
└─────────────────────────────┴───────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────────┐
│                         DELIVERY                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   CLIENT ────► PROJECT ────► BRIEF ────► DELIVERABLE            │
│                                                                  │
│   (Relationship)  (Scope)    (Task)     (Output)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Entity Definitions (Revised)

#### Deal
- **What it is:** A private sector sales opportunity (pitch-based)
- **Stages:** LEAD → PITCH → NEGOTIATION → WON/LOST
- **Auto-action:** WON → Creates Client + first Project
- **Key fields:** Company info, contact, value, probability, owner

#### RFP
- **What it is:** A government/formal tender response
- **Stages:** VETTING → ACTIVE → SUBMITTED → AWAITING_RESPONSE → WON/LOST
- **Auto-action:** WON → Creates Client + first Project
- **Key fields:** Portal, deadline, bid bond, scope, subitems

#### Client
- **What it is:** An active customer relationship
- **Source:** Created from Deal WON or RFP WON
- **Statuses:** ACTIVE, AT_RISK, CHURNED, DORMANT, PAUSED
- **Contacts:** Use ClientContact table exclusively (remove deprecated fields)

#### ClientContact
- **What it is:** A person at a Client company
- **Key fields:** Name, email, phone, title, isPrimary, isDecisionMaker, isBillingContact

#### Project
- **What it is:** A defined scope of work
- **Types:** RETAINER, PROJECT, PITCH, INTERNAL
- **Contains:** Multiple Briefs

#### Brief
- **What it is:** A specific deliverable/task
- **Types:** VIDEO_SHOOT, VIDEO_EDIT, DESIGN, etc.
- **Assigned to:** Team member

### Database Changes Required

#### 1. Update Deal Stages
```prisma
enum DealStage {
  LEAD           // Initial contact/interest
  PITCH          // Proposal being prepared (was RFP_INVITE)
  NEGOTIATION    // Terms being discussed (was RFP_SUBMITTED)
  WON            // Deal closed
  LOST           // Deal lost
}
```

#### 2. Update Client RelationshipStatus
```prisma
enum RelationshipStatus {
  ACTIVE         // Current paying client
  AT_RISK        // Relationship issues
  CHURNED        // Left/cancelled
  DORMANT        // No activity, but not churned
  PAUSED         // Temporarily on hold
}
// REMOVED: LEAD, PROSPECT (these are Deal stages now)
```

#### 3. Add Conversion Tracking
```prisma
model Client {
  // ... existing fields

  // Conversion source (one or the other)
  convertedFromDealId  String?  @unique
  convertedFromRfpId   String?  @unique
  convertedAt          DateTime?

  convertedFromDeal    Deal?    @relation(fields: [convertedFromDealId], references: [id])
  convertedFromRfp     RFP?     @relation(fields: [convertedFromRfpId], references: [id])
}

model Deal {
  // ... existing fields

  convertedToClient    Client?  // Reverse relation
}

model RFP {
  // ... existing fields

  convertedToClient    Client?  // Reverse relation
}
```

#### 4. Remove Deprecated Fields from Client
```prisma
model Client {
  // REMOVE these fields:
  // contactName    String?
  // contactEmail   String?

  // KEEP ClientContact relation
  contacts         ClientContact[]
}
```

#### 5. Clean Up Unused Field
```prisma
model Deal {
  // REMOVE (was never used):
  // wonRfpId       String?
}
```

### Conversion Functions

#### Deal WON → Client
```typescript
async function convertDealToClient(dealId: string): Promise<Client> {
  const deal = await db.deal.findUnique({ where: { id: dealId } });

  // 1. Create Client
  const client = await db.client.create({
    data: {
      organizationId: deal.organizationId,
      name: deal.companyName || deal.name,
      code: generateClientCode(deal.companyName),
      industry: deal.industry,
      relationshipStatus: 'ACTIVE',
      leadSource: deal.source,
      convertedFromDealId: deal.id,
      convertedAt: new Date(),
      accountManagerId: deal.ownerId,
    },
  });

  // 2. Create ClientContact from deal contact info
  if (deal.contactName && deal.contactEmail) {
    await db.clientContact.create({
      data: {
        clientId: client.id,
        name: deal.contactName,
        email: deal.contactEmail,
        isPrimary: true,
        isDecisionMaker: true,
      },
    });
  }

  // 3. Create initial Project
  await db.project.create({
    data: {
      organizationId: deal.organizationId,
      clientId: client.id,
      name: `${client.name} - Initial Project`,
      type: 'PROJECT',
      status: 'ACTIVE',
      budgetAmount: deal.value,
    },
  });

  // 4. Update deal stage
  await db.deal.update({
    where: { id: dealId },
    data: { stage: 'WON', actualCloseDate: new Date() },
  });

  return client;
}
```

#### RFP WON → Client
```typescript
async function convertRfpToClient(rfpId: string): Promise<Client> {
  const rfp = await db.rfp.findUnique({ where: { id: rfpId } });

  // 1. Create Client
  const client = await db.client.create({
    data: {
      organizationId: rfp.organizationId,
      name: rfp.clientName,
      code: generateClientCode(rfp.clientName),
      industry: 'Government', // RFPs are typically government
      relationshipStatus: 'ACTIVE',
      leadSource: 'RFP_PORTAL',
      convertedFromRfpId: rfp.id,
      convertedAt: new Date(),
    },
  });

  // 2. Create initial Project
  await db.project.create({
    data: {
      organizationId: rfp.organizationId,
      clientId: client.id,
      name: rfp.name.replace('RFP – ', ''),
      type: 'PROJECT',
      status: 'ACTIVE',
      budgetAmount: rfp.estimatedValue,
      description: rfp.scopeOfWork,
    },
  });

  // 3. Update RFP status
  await db.rfp.update({
    where: { id: rfpId },
    data: {
      status: 'WON',
      outcome: 'WON',
    },
  });

  return client;
}
```

### UI Changes Required

| Page | Change |
|------|--------|
| `/pipeline` | Rename stages: LEAD → PITCH → NEGOTIATION → WON/LOST |
| `/pipeline` | Add "Convert to Client" button on WON deals |
| `/rfp` | Add "Convert to Client" button on WON RFPs |
| `/clients/new` | Keep for manual client creation (rare cases) |
| `/clients/[id]` | Show "Source: Deal #X" or "Source: RFP #X" |
| `/clients/[id]` | Remove contact fields, show ClientContact list only |

### Migration Steps

1. Create migration for schema changes
2. Migrate existing `Client.relationshipStatus = LEAD/PROSPECT` to Deals
3. Migrate `Client.contactName/Email` to ClientContact records
4. Remove deprecated columns
5. Update all UI components

---

## Phase 2: Theme Customization System

### Overview

Allow organization admins to fully customize the platform's appearance.

### Scope (Expanded)

- **Logo & Favicon:** Upload organization branding
- **Colors:** Primary, accent, backgrounds, text
- **Fonts:** Heading and body font families
- **Border Radius:** Sharp to rounded corners
- **Dark Mode:** Light/dark/system preference
- **Email Templates:** Branded email styling

### Database Schema

```prisma
model Organization {
  // ... existing fields

  // Branding
  logo            String?   // Main logo URL
  logoMark        String?   // Square icon version
  favicon         String?   // Browser favicon

  // Theme (stored as JSON)
  themeSettings   Json      @default("{}")
}
```

**themeSettings structure:**
```typescript
interface ThemeSettings {
  colors: {
    primary: string;        // #52EDC7
    primaryDark: string;    // #1BA098
    accent: string;         // Secondary color
    background: string;     // Page background
    surface: string;        // Card background
    border: string;         // Border color
    text: string;           // Primary text
    textMuted: string;      // Secondary text
    success: string;        // Green
    warning: string;        // Yellow
    error: string;          // Red
  };
  fonts: {
    heading: string;        // e.g., "Inter"
    body: string;           // e.g., "Inter"
  };
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  mode: 'light' | 'dark' | 'system';
}
```

### Implementation Plan

1. **ThemeProvider component** - Injects CSS variables
2. **Settings/Branding page** - Color pickers, font selectors
3. **Live preview** - See changes before saving
4. **File upload** - Logo/favicon upload to storage
5. **Email templates** - Use theme colors in emails

---

## Phase 3: Dashboard Layout Builder

### Overview

Allow users to customize their dashboard with drag-and-drop widgets.

### Widget Library

| Widget | Description | Size Options |
|--------|-------------|--------------|
| My Tasks | Assigned briefs/tasks | 1x1, 2x1 |
| Team Capacity | Utilization chart | 2x1, 2x2 |
| Upcoming Deadlines | Calendar view | 1x2, 2x2 |
| Recent Briefs | Brief list | 2x1, 3x1 |
| Client Activity | Activity feed | 1x2, 2x2 |
| Time Logged | Weekly time chart | 2x1 |
| Pipeline Summary | Deal/RFP stats | 2x1 |
| NPS Score | Client satisfaction | 1x1 |
| Quick Actions | Common actions | 1x1 |

### Database Schema

```prisma
model DashboardLayout {
  id              String   @id @default(cuid())
  userId          String
  organizationId  String
  name            String   @default("My Dashboard")
  isDefault       Boolean  @default(false)
  layout          Json     // Widget positions
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id])

  @@unique([userId, name])
  @@map("dashboard_layouts")
}
```

### Implementation Plan

1. **Widget Registry** - Define available widgets
2. **Grid System** - 12-column CSS grid
3. **Drag-Drop** - @dnd-kit for reordering
4. **Resize** - Widget size options
5. **Persistence** - Save layout per user

---

## Phase 4: Visual Form Builder (Admin Only)

### Overview

Allow admins to create and modify brief types without code changes.

### Current State → Future State

**Current:** Form definitions in `/config/forms/*.form.ts` (code)
**Future:** Form definitions in database, edited via UI

### Database Schema

```prisma
model FormTemplate {
  id              String   @id @default(cuid())
  organizationId  String
  code            String   // "VIDEO_SHOOT"
  name            String   // "Video Shoot Request"
  description     String?
  icon            String?  // Lucide icon name
  sections        Json     // Form structure
  qualityRules    Json?    // Scoring rules
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, code])
  @@map("form_templates")
}
```

### Field Types Supported

| Type | Description |
|------|-------------|
| text | Single line text |
| textarea | Multi-line text |
| number | Numeric input |
| select | Dropdown |
| multi-select | Multi-choice |
| date | Date picker |
| date-range | Start/end dates |
| user-select | User dropdown |
| client-select | Client dropdown |
| file-upload | File attachment |
| url | URL input |
| checkbox | Boolean toggle |
| rich-text | WYSIWYG editor |

### Implementation Plan

1. **FormTemplate model** - Database storage
2. **Form Builder UI** - Drag-drop sections/fields
3. **Field Editor** - Configure field properties
4. **Form Renderer** - Dynamic rendering from template
5. **Migration** - Convert existing form configs

---

## Implementation Order

| Phase | Priority | Effort | Dependency |
|-------|----------|--------|------------|
| Phase 1: CRM | **HIGH** | 2-3 days | None |
| Phase 2: Theme | Medium | 1-2 days | None |
| Phase 3: Dashboard | Medium | 2-3 days | Phase 2 |
| Phase 4: Forms | Medium | 3-4 days | Phase 1 |

**Recommended sequence:** Phase 1 → Phase 2 → Phase 4 → Phase 3

---

## Next Steps

1. **Start Phase 1** - CRM refactor
   - Update Prisma schema
   - Create migration
   - Build conversion functions
   - Update pipeline UI
   - Test thoroughly

2. **Review after Phase 1** - Validate business logic before continuing

---

*Document approved. Ready to begin Phase 1 implementation.*
