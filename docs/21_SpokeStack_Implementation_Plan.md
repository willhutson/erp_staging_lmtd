# SpokeStack Implementation Plan

**Version:** 1.0
**Status:** Planning
**Platform:** Standalone SaaS

---

## Overview

This document outlines the implementation phases, features, and todos for building SpokeStack as a standalone SaaS platform with five core modules:

| Module | Route | Priority |
|--------|-------|----------|
| Admin | `/Admin` | Phase 0 (Foundation) |
| CRM | `/CRM` | Phase 1 |
| Listening | `/Listening` | Phase 2 |
| Media Buying | `/MediaBuying` | Phase 3 |
| Analytics | `/Analytics` | Phase 4 |
| Builder | `/Builder` | Phase 5 |

---

## Phase 0: Platform Foundation

**Duration:** 2-3 weeks
**Goal:** Core infrastructure and authentication

### 0.1 Project Setup
- [ ] Initialize Next.js 14 with App Router
- [ ] Configure TypeScript (strict mode)
- [ ] Setup Tailwind CSS + shadcn/ui
- [ ] Configure ESLint + Prettier
- [ ] Setup folder structure:
  ```
  /src/app/(auth)/
  /src/app/(platform)/Admin/
  /src/app/(platform)/MediaBuying/
  /src/app/(platform)/Analytics/
  /src/app/(platform)/Listening/
  /src/app/(platform)/Builder/
  /src/app/(client)/[slug]/
  ```

### 0.2 Database & ORM
- [ ] Setup Supabase project (dev + staging)
- [ ] Configure Prisma with Supabase
- [ ] Apply social-media.prisma schema
- [ ] Setup database migrations workflow
- [ ] Create seed script for test data

### 0.3 Authentication
- [ ] Configure Supabase Auth
- [ ] Setup Google SSO provider
- [ ] Implement session management
- [ ] Create auth middleware
- [ ] Build login/signup pages

### 0.4 Multi-Tenancy Core
- [ ] Organization CRUD
- [ ] Organization hierarchy (Platform → Agency → Brand)
- [ ] OrganizationMember management
- [ ] Role-based access control (RBAC)
- [ ] Tenant context provider

### 0.5 Admin Module (`/Admin`) - Basic
- [ ] `/Admin` - Dashboard overview
- [ ] `/Admin/organizations` - Org list + create
- [ ] `/Admin/users` - User management
- [ ] `/Admin/roles` - Role configuration
- [ ] Sidebar navigation component

---

## Phase 1: CRM Core

**Duration:** 4-5 weeks
**Goal:** Full CRM functionality for managing contacts and deals

### 1.1 Company Management
- [ ] `CrmCompany` model integration
- [ ] Company CRUD API endpoints
- [ ] Company list page with filters
- [ ] Company detail page
- [ ] Company form (create/edit)
- [ ] Industry/size/type dropdowns

### 1.2 Contact Management
- [ ] `CrmContact` model integration
- [ ] Contact CRUD API endpoints
- [ ] Contact list with search/filters
- [ ] Contact detail page
- [ ] Contact form with company linking
- [ ] Lifecycle status management
- [ ] Contact assignment (owner)

### 1.3 Deal Pipeline
- [ ] `CrmDeal` model integration
- [ ] Deal CRUD API endpoints
- [ ] Deal pipeline Kanban view
- [ ] Drag-and-drop stage changes
- [ ] Deal detail sidebar
- [ ] Deal form (create/edit)
- [ ] Win/loss tracking

### 1.4 Tasks & Notes
- [ ] `CrmTask` model integration
- [ ] Task CRUD with due dates
- [ ] Task list + calendar view
- [ ] Task completion workflow
- [ ] `CrmNote` model integration
- [ ] Note CRUD with rich text
- [ ] File attachments for notes

### 1.5 Activity Timeline
- [ ] `CrmActivity` model integration
- [ ] Activity logging service
- [ ] Unified timeline component
- [ ] Filter by activity type
- [ ] Activity on contact/deal pages

### 1.6 CRM UI Components
- [ ] `CompanyCard.tsx`
- [ ] `ContactList.tsx`
- [ ] `DealPipeline.tsx` (Kanban)
- [ ] `DealCard.tsx`
- [ ] `ActivityTimeline.tsx`
- [ ] `TaskList.tsx`
- [ ] `NoteEditor.tsx`

---

## Phase 2: Listening Module (Creator Management)

**Duration:** 3-4 weeks
**Goal:** Influencer/creator management with Phyllo integration

### 2.1 Creator Profiles
- [ ] `Creator` model integration
- [ ] Creator CRUD API endpoints
- [ ] Creator list with filters (followers, platform, category)
- [ ] Creator detail page
- [ ] Creator form (extend from contact)
- [ ] Contract/commission tracking
- [ ] Creator status workflow

### 2.2 Platform Connections
- [ ] `CreatorPlatform` model integration
- [ ] Platform list per creator
- [ ] Platform metrics display
- [ ] Audience demographics visualization
- [ ] Platform connection status

### 2.3 Phyllo Integration
- [ ] Phyllo SDK setup
- [ ] Phyllo Connect UI component
- [ ] OAuth flow for creator platforms
- [ ] Webhook handler (`/api/webhooks/phyllo`)
- [ ] Profile sync on connection
- [ ] Metrics sync automation

### 2.4 Content Tracking
- [ ] `CreatorContent` model integration
- [ ] Content list per creator
- [ ] Content metrics display
- [ ] Campaign attribution
- [ ] Content import from Phyllo

### 2.5 Listening Routes
- [ ] `/Listening` - Module overview
- [ ] `/Listening/creators` - Creator roster
- [ ] `/Listening/creators/[id]` - Creator profile
- [ ] `/Listening/creators/connect` - Phyllo connection
- [ ] `/Listening/content` - Content library
- [ ] `/Listening/campaigns` - Creator campaigns

### 2.6 Listening UI Components
- [ ] `CreatorRoster.tsx`
- [ ] `CreatorCard.tsx`
- [ ] `CreatorMetrics.tsx`
- [ ] `PlatformConnector.tsx`
- [ ] `AudienceDemo.tsx`
- [ ] `ContentGrid.tsx`

---

## Phase 3: Media Buying Module

**Duration:** 4-5 weeks
**Goal:** Ad account management and campaign tracking

### 3.1 Ad Account Management
- [ ] `AdAccount` model integration
- [ ] Ad account CRUD API
- [ ] Account list with sync status
- [ ] Account hierarchy (parent/child)
- [ ] Token encryption utilities

### 3.2 OAuth Integrations
- [ ] Meta Marketing API OAuth
- [ ] Google Ads API OAuth
- [ ] TikTok Ads API OAuth
- [ ] Snapchat Marketing API OAuth
- [ ] LinkedIn Marketing API OAuth
- [ ] Token refresh automation
- [ ] OAuth callback handlers

### 3.3 Campaign Management
- [ ] `SocialCampaign` model integration
- [ ] Campaign CRUD API
- [ ] Campaign list with filters
- [ ] Campaign detail page
- [ ] Campaign builder form
- [ ] Link campaigns to CRM deals

### 3.4 Campaign Assignments
- [ ] `CampaignCreator` junction table
- [ ] Creator assignment UI
- [ ] Deliverables tracking
- [ ] Fee/compensation tracking
- [ ] `CampaignAdAccount` junction table
- [ ] Ad account assignment UI
- [ ] Budget allocation per platform

### 3.5 Spend & Budget
- [ ] Daily/monthly budget limits
- [ ] Spend alerts configuration
- [ ] Budget vs actual dashboard
- [ ] Overspend notifications

### 3.6 Media Buying Routes
- [ ] `/MediaBuying` - Module overview
- [ ] `/MediaBuying/accounts` - Connected accounts
- [ ] `/MediaBuying/accounts/connect` - OAuth flows
- [ ] `/MediaBuying/campaigns` - Campaign list
- [ ] `/MediaBuying/campaigns/new` - Campaign builder
- [ ] `/MediaBuying/campaigns/[id]` - Campaign detail
- [ ] `/MediaBuying/settings` - Platform preferences

### 3.7 Media Buying UI Components
- [ ] `AdAccountConnect.tsx`
- [ ] `AdAccountList.tsx`
- [ ] `CampaignBuilder.tsx`
- [ ] `CampaignList.tsx`
- [ ] `SpendTracker.tsx`
- [ ] `PlatformSelector.tsx`

---

## Phase 3B: Data Pipeline

**Duration:** 3-4 weeks (parallel with Phase 3)
**Goal:** BigQuery infrastructure for analytics

### 3B.1 GCP Setup
- [ ] Create GCP project
- [ ] Configure BigQuery dataset
- [ ] Setup service account
- [ ] Configure IAM permissions

### 3B.2 Data Ingestion (Airbyte)
- [ ] Self-host Airbyte (Docker/K8s)
- [ ] Meta Ads connector
- [ ] Google Ads connector
- [ ] TikTok Ads connector
- [ ] Sync schedules (daily)

### 3B.3 Data Transformation (dbt)
- [ ] Initialize dbt project
- [ ] Staging models (raw → clean)
- [ ] Intermediate models (joins)
- [ ] Mart models (analytics-ready)
- [ ] Test coverage

### 3B.4 Orchestration (Dagster)
- [ ] Dagster setup
- [ ] Airbyte sync assets
- [ ] dbt run assets
- [ ] BigQuery → Supabase sync
- [ ] Alerting on failures

### 3B.5 Metrics Sync
- [ ] `CampaignMetric` model integration
- [ ] Daily metrics aggregation job
- [ ] BigQuery → Supabase ETL
- [ ] Metric calculation (CPM, CPC, CTR, CPA, ROAS)

---

## Phase 4: Analytics Module

**Duration:** 3-4 weeks
**Goal:** Unified dashboards and reporting

### 4.1 Analytics API
- [ ] Dashboard data endpoints
- [ ] Cross-platform aggregation
- [ ] Date range filtering
- [ ] Dimension breakdowns
- [ ] Export endpoints (CSV, Excel)

### 4.2 Looker Integration
- [ ] Looker project setup
- [ ] LookML models
- [ ] Dashboard templates
- [ ] Embedded dashboard component
- [ ] SSO pass-through

### 4.3 Analytics Routes
- [ ] `/Analytics` - Executive overview
- [ ] `/Analytics/campaigns` - Campaign performance
- [ ] `/Analytics/platforms` - Platform comparison
- [ ] `/Analytics/creators` - Creator ROI
- [ ] `/Analytics/custom` - Custom reports
- [ ] `/Analytics/exports` - Data exports

### 4.4 Scheduled Reports
- [ ] Report configuration UI
- [ ] Email scheduling (daily/weekly/monthly)
- [ ] PDF generation
- [ ] Report templates

### 4.5 Analytics UI Components
- [ ] `AnalyticsOverview.tsx`
- [ ] `CampaignPerformance.tsx`
- [ ] `PlatformComparison.tsx`
- [ ] `CreatorROI.tsx`
- [ ] `MetricCard.tsx`
- [ ] `DateRangePicker.tsx`
- [ ] `ExportButton.tsx`

---

## Phase 5: Builder & Client Instances

**Duration:** 4-5 weeks
**Goal:** WYSIWYG dashboard builder and client portals

### 5.1 Dashboard Builder Core
- [ ] `Dashboard` model integration
- [ ] Dashboard CRUD API
- [ ] Dashboard list page
- [ ] Dashboard editor page
- [ ] Grid layout system (react-grid-layout)
- [ ] Auto-save functionality

### 5.2 Widget System
- [ ] `DashboardWidget` model integration
- [ ] Widget CRUD within dashboard
- [ ] Widget library sidebar
- [ ] Drag-and-drop placement
- [ ] Widget resize handles
- [ ] Widget configuration panel

### 5.3 Widget Types
- [ ] KPI Card widget
- [ ] Line Chart widget
- [ ] Bar Chart widget
- [ ] Pie/Donut Chart widget
- [ ] Data Table widget
- [ ] Sparkline widget
- [ ] Gauge widget
- [ ] Campaign List widget
- [ ] Creator Roster widget
- [ ] Text Block widget
- [ ] Image widget
- [ ] Embed widget (Looker)

### 5.4 Widget Data Sources
- [ ] Data source selector
- [ ] BigQuery query builder (visual)
- [ ] Supabase table selector
- [ ] Filter configuration
- [ ] Refresh interval settings

### 5.5 Dashboard Templates
- [ ] `DashboardTemplate` model integration
- [ ] Template library page
- [ ] Clone template functionality
- [ ] Pre-built templates:
  - [ ] Media Buying Overview
  - [ ] Campaign Performance
  - [ ] Creator Analytics
  - [ ] Executive Summary

### 5.6 Client Instances
- [ ] `ClientInstance` model integration
- [ ] Client instance CRUD
- [ ] Subdomain configuration ([slug].spokestack.app)
- [ ] Branding settings (logo, colors)
- [ ] Module enablement per client
- [ ] Default dashboard assignment

### 5.7 Client Users
- [ ] `ClientInstanceUser` model integration
- [ ] User invitation flow
- [ ] Role assignment (Admin, Manager, Editor, Viewer)
- [ ] Module-level permissions
- [ ] Widget-level visibility

### 5.8 Client Portal
- [ ] `/[slug]` - Client landing page
- [ ] Client authentication (magic link or SSO)
- [ ] Dashboard rendering
- [ ] Widget data fetching
- [ ] Filter interactions
- [ ] Export functionality

### 5.9 Builder Routes
- [ ] `/Builder` - Builder overview
- [ ] `/Builder/dashboards` - Dashboard list
- [ ] `/Builder/dashboards/new` - Create dashboard
- [ ] `/Builder/dashboards/[id]` - Edit dashboard
- [ ] `/Builder/widgets` - Widget library
- [ ] `/Builder/templates` - Template library
- [ ] `/Builder/preview` - Client preview mode

### 5.10 Builder UI Components
- [ ] `DashboardEditor.tsx`
- [ ] `WidgetLibrary.tsx`
- [ ] `WidgetRenderer.tsx`
- [ ] `WidgetConfig.tsx`
- [ ] `GridLayout.tsx`
- [ ] `DataSourcePicker.tsx`
- [ ] `TemplateGallery.tsx`
- [ ] `ClientPreview.tsx`

---

## Phase 6: Polish & Scale

**Duration:** Ongoing
**Goal:** Production readiness and optimization

### 6.1 Performance
- [ ] Query optimization
- [ ] API response caching
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Bundle size optimization

### 6.2 Mobile Responsiveness
- [ ] Responsive layouts
- [ ] Mobile navigation
- [ ] Touch-friendly interactions
- [ ] Mobile dashboard view

### 6.3 White-Labeling
- [ ] Custom domain support
- [ ] Email template customization
- [ ] Full branding control
- [ ] Remove SpokeStack branding option

### 6.4 Security & Compliance
- [ ] Security audit
- [ ] Penetration testing
- [ ] GDPR compliance
- [ ] CCPA compliance
- [ ] UAE PDPL compliance
- [ ] SOC 2 preparation

### 6.5 Additional Integrations
- [ ] Slack notifications
- [ ] Email integrations (Gmail, Outlook)
- [ ] Google Calendar sync
- [ ] Zapier/Make webhooks
- [ ] Public API documentation

### 6.6 Monitoring & Observability
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation
- [ ] Alerting rules

---

## Summary by Module

### Admin (`/Admin`)
| Feature | Phase | Priority |
|---------|-------|----------|
| Organization management | 0 | Critical |
| User management | 0 | Critical |
| Role configuration | 0 | Critical |
| Module enablement | 5 | High |
| API key management | 6 | Medium |
| Audit logs | 6 | Medium |

### CRM (integrated into Admin/Listening)
| Feature | Phase | Priority |
|---------|-------|----------|
| Company management | 1 | Critical |
| Contact management | 1 | Critical |
| Deal pipeline | 1 | Critical |
| Tasks & Notes | 1 | High |
| Activity timeline | 1 | High |

### Listening (`/Listening`)
| Feature | Phase | Priority |
|---------|-------|----------|
| Creator profiles | 2 | Critical |
| Phyllo integration | 2 | Critical |
| Platform connections | 2 | Critical |
| Content tracking | 2 | High |
| Audience demographics | 2 | Medium |

### Media Buying (`/MediaBuying`)
| Feature | Phase | Priority |
|---------|-------|----------|
| Ad account OAuth | 3 | Critical |
| Campaign management | 3 | Critical |
| Budget tracking | 3 | High |
| Creator assignment | 3 | High |
| Spend alerts | 3 | Medium |

### Analytics (`/Analytics`)
| Feature | Phase | Priority |
|---------|-------|----------|
| BigQuery integration | 3B | Critical |
| Campaign metrics | 4 | Critical |
| Cross-platform dashboards | 4 | High |
| Scheduled reports | 4 | Medium |
| Data exports | 4 | Medium |

### Builder (`/Builder`)
| Feature | Phase | Priority |
|---------|-------|----------|
| Dashboard editor | 5 | Critical |
| Widget system | 5 | Critical |
| Client instances | 5 | Critical |
| Templates | 5 | High |
| Client portal | 5 | High |

---

## Quick Start Checklist

### Week 1-2: Foundation
- [ ] Project scaffold
- [ ] Supabase setup
- [ ] Auth working
- [ ] Basic Admin module

### Week 3-6: CRM
- [ ] Companies, Contacts, Deals
- [ ] Pipeline Kanban
- [ ] Activity logging

### Week 7-10: Listening
- [ ] Creator management
- [ ] Phyllo connected
- [ ] Content tracking

### Week 11-15: Media Buying + Pipeline
- [ ] Ad account OAuth
- [ ] Campaign management
- [ ] BigQuery + Airbyte

### Week 16-19: Analytics
- [ ] Looker integration
- [ ] Dashboard views
- [ ] Reports

### Week 20-24: Builder + Client Instances
- [ ] WYSIWYG builder
- [ ] Widget library
- [ ] Client portals live

---

*SpokeStack Implementation Plan v1.0 - December 2024*
