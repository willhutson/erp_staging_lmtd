# SpokeStack - Social Media Buying & Listening Platform

**Version:** 1.0
**Status:** Technical Specification Complete
**Type:** Standalone SaaS Platform

---

## 1. Executive Summary

SpokeStack is a **standalone SaaS platform** (separate from TeamLMTD ERP) that provides:

1. **Media Buying** (`/MediaBuying`) - Ad account management and campaign tracking
2. **Analytics** (`/Analytics`) - Unified performance dashboards
3. **Social Listening** (`/Listening`) - Creator intelligence via Phyllo

### Key Architecture Principle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPOKESTACK ADMIN/BUILDER                      │
│         (Configure modules, dashboards, permissions)             │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  /MediaBuying │     │  /Analytics   │     │  /Listening   │
│  Standalone   │     │  Standalone   │     │  Standalone   │
│  Module       │     │  Module       │     │  Module       │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT INSTANCES                              │
│   WYSIWYG drag-drop dashboards based on enabled modules          │
│   + user permissions per client team                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Architecture

### 2.1 Multi-Tenancy Hierarchy

```
SpokeStack (Platform)
    └── Agency (e.g., LMTD/)
        └── Brand/Client (e.g., CCAD, DET)
            └── Client Instance (custom dashboard)
                └── Client Users (with permissions)
```

### 2.2 Standalone Modules

| Module | Route | Purpose |
|--------|-------|---------|
| Media Buying | `/MediaBuying` | Ad account OAuth, campaign management |
| Analytics | `/Analytics` | BigQuery-powered dashboards |
| Listening | `/Listening` | Creator/influencer management via Phyllo |
| Admin | `/Admin` | Agency configuration, user management |
| Builder | `/Builder` | WYSIWYG dashboard configuration |

### 2.3 Data Flow

```
Ad Platforms ──► Airbyte ──► BigQuery (raw)
                               │
Phyllo ──► Webhooks ──► Supabase (operational)
                               │
BigQuery ──► dbt ──► Transformed Models
                               │
BigQuery ──► Supabase Sync ──► Client Dashboards
                               │
Supabase ──► Prisma ──► Next.js API ──► UI
```

---

## 3. Technology Stack

### 3.1 Core Application

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React |
| Language | TypeScript | Type safety |
| Database | Supabase (PostgreSQL) | Operational data + Auth + RLS |
| ORM | Prisma | Type-safe DB access |
| UI | shadcn/ui + Tailwind | Design system |
| State | TanStack Query | Server state + caching |
| Forms | React Hook Form + Zod | Validation |
| Deployment | Vercel | Edge deployment |

### 3.2 Data Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Data Warehouse | Google BigQuery | Scalable analytics |
| Data Ingestion | Airbyte (self-hosted) | 550+ connectors |
| Transformation | dbt Core | SQL transforms |
| Orchestration | Dagster | Pipeline scheduling |
| Data Quality | Soda Core | Validation + alerts |
| Dashboards | Looker (embedded) | Client-facing analytics |

### 3.3 External Integrations

| Integration | Provider | Data |
|-------------|----------|------|
| Social Listening | Phyllo | Creator profiles, metrics |
| Meta Ads | Marketing API | Campaigns, insights |
| Google Ads | Google Ads API | Campaigns, keywords |
| TikTok Ads | Business API | Campaigns, creatives |
| Snapchat Ads | Marketing API | Campaigns, ads |
| LinkedIn Ads | Marketing API | Campaigns, analytics |

---

## 4. Module Specifications

### 4.1 Media Buying Module (`/MediaBuying`)

#### Features
- OAuth connection for ad platforms (Meta, Google, TikTok, Snapchat, LinkedIn)
- Agency-level authentication with child account inheritance
- Campaign creation and tracking linked to CRM deals
- Budget management and spend alerts
- Cross-platform unified metrics

#### Routes
```
/MediaBuying
├── /accounts          # Connected ad accounts
├── /accounts/connect  # OAuth flow
├── /campaigns         # Campaign list
├── /campaigns/new     # Campaign builder
├── /campaigns/[id]    # Campaign detail + metrics
└── /settings          # Platform preferences
```

#### Key Components
- `AdAccountConnect.tsx` - OAuth initiation
- `CampaignBuilder.tsx` - Create/edit campaigns
- `SpendTracker.tsx` - Budget vs actual
- `PlatformSelector.tsx` - Multi-platform management

### 4.2 Analytics Module (`/Analytics`)

#### Features
- BigQuery-powered dashboards
- Cross-platform performance comparison
- Custom date ranges and filters
- Embedded Looker visualizations
- Scheduled email reports

#### Routes
```
/Analytics
├── /overview          # Executive summary
├── /campaigns         # Campaign performance
├── /platforms         # Platform comparison
├── /creators          # Creator ROI
├── /custom            # Custom reports
└── /exports           # Data exports
```

#### Key Metrics
- Spend, Impressions, Clicks, Conversions
- CPM, CPC, CTR, CPA, ROAS
- Reach, Frequency
- Video views (25%, 50%, 75%, 100%)

### 4.3 Listening Module (`/Listening`)

#### Features
- Creator/influencer CRM
- Phyllo integration for social data
- Platform connection (Instagram, TikTok, YouTube)
- Audience demographics
- Content performance tracking
- Contract and commission management

#### Routes
```
/Listening
├── /creators          # Creator roster
├── /creators/[id]     # Creator profile
├── /creators/connect  # Phyllo SDK flow
├── /content           # Content tracking
├── /campaigns         # Creator campaigns
└── /discovery         # Find new creators
```

#### Key Components
- `CreatorRoster.tsx` - Filterable creator list
- `CreatorMetrics.tsx` - Engagement, followers
- `PlatformConnector.tsx` - Phyllo Connect SDK
- `AudienceDemo.tsx` - Demographics visualization

### 4.4 Admin Module (`/Admin`)

#### Features
- Organization management
- User invitations and roles
- Module enablement per client
- API key management
- Audit logs

#### Routes
```
/Admin
├── /organizations     # Org hierarchy
├── /users             # User management
├── /roles             # Permission configuration
├── /modules           # Enable/disable per client
├── /api-keys          # External integrations
└── /audit             # Activity logs
```

### 4.5 Builder Module (`/Builder`)

#### Features
- WYSIWYG dashboard builder
- Drag-and-drop widget placement
- Widget library (charts, tables, KPIs)
- Client-specific dashboard templates
- Permission-based widget visibility

#### Routes
```
/Builder
├── /dashboards        # Dashboard list
├── /dashboards/new    # Create dashboard
├── /dashboards/[id]   # Edit dashboard
├── /widgets           # Widget library
├── /templates         # Pre-built templates
└── /preview           # Client preview mode
```

#### Dashboard Builder Features
```typescript
interface DashboardConfig {
  id: string;
  name: string;
  clientId: string;
  layout: LayoutConfig[];
  widgets: WidgetConfig[];
  permissions: PermissionConfig;
}

interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: { x: number; y: number; w: number; h: number };
  dataSource: DataSourceConfig;
  visualization: VisualizationConfig;
  filters: FilterConfig[];
}

type WidgetType =
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'data_table'
  | 'sparkline'
  | 'gauge'
  | 'heatmap';
```

---

## 5. Data Models

### 5.1 Core Entities

#### Organization (Multi-Tenancy)
```prisma
model Organization {
  id          String    @id @default(cuid())
  name        String
  type        OrgType   @default(AGENCY)
  slug        String    @unique
  parentId    String?
  parent      Organization? @relation("OrgHierarchy")
  children    Organization[] @relation("OrgHierarchy")
  settings    Json      @default("{}")

  // Module enablement
  enabledModules  String[]  // ["MEDIA_BUYING", "ANALYTICS", "LISTENING"]

  // Relations
  members     OrganizationMember[]
  dashboards  Dashboard[]
  // ... other relations
}

enum OrgType {
  PLATFORM  // SpokeStack
  AGENCY    // LMTD/
  BRAND     // Client
}
```

#### Dashboard Builder
```prisma
model Dashboard {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(...)

  name            String
  description     String?
  isDefault       Boolean  @default(false)
  isPublished     Boolean  @default(false)

  // Layout configuration (JSON)
  layout          Json     // Grid layout config
  widgets         DashboardWidget[]

  // Access control
  visibility      DashboardVisibility @default(PRIVATE)
  allowedRoles    String[]

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  publishedAt     DateTime?
}

model DashboardWidget {
  id              String   @id @default(cuid())
  dashboardId     String
  dashboard       Dashboard @relation(...)

  type            WidgetType
  title           String

  // Position in grid
  x               Int
  y               Int
  width           Int
  height          Int

  // Data configuration
  dataSource      Json     // Query config
  visualization   Json     // Chart config
  filters         Json     @default("[]")

  // Permissions
  requiredRole    String?  // Minimum role to view
}

enum WidgetType {
  KPI_CARD
  LINE_CHART
  BAR_CHART
  PIE_CHART
  DATA_TABLE
  SPARKLINE
  GAUGE
  HEATMAP
  CAMPAIGN_LIST
  CREATOR_ROSTER
}

enum DashboardVisibility {
  PRIVATE      // Creator only
  ORGANIZATION // Org members
  PUBLIC       // Anyone with link
}
```

#### Client Instance
```prisma
model ClientInstance {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(...)

  name            String
  slug            String   @unique

  // Branding
  logo            String?
  primaryColor    String?

  // Module configuration
  enabledModules  String[]
  defaultDashboardId String?

  // Users with access
  users           ClientInstanceUser[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ClientInstanceUser {
  id                String   @id @default(cuid())
  clientInstanceId  String
  clientInstance    ClientInstance @relation(...)
  userId            String

  role              ClientRole @default(VIEWER)
  permissions       String[]  // Granular overrides

  // Module-specific access
  moduleAccess      Json     @default("{}")
}

enum ClientRole {
  ADMIN      // Full access to client instance
  EDITOR     // Can edit dashboards
  VIEWER     // Read-only access
}
```

### 5.2 CRM Entities

See `prisma/social-media.prisma` for:
- `CrmCompany` - Business entities
- `CrmContact` - Individual contacts
- `CrmDeal` - Sales pipeline
- `CrmTask` - CRM tasks
- `CrmNote` - Notes and emails
- `CrmActivity` - Unified activity log

### 5.3 Creator Entities

- `Creator` - Contact extension for influencers
- `CreatorPlatform` - Per-platform metrics
- `CreatorContent` - Content tracking

### 5.4 Campaign Entities

- `SocialCampaign` - Marketing campaigns
- `CampaignCreator` - Creator assignments
- `CampaignAdAccount` - Ad account assignments
- `CampaignMetric` - Daily performance metrics

### 5.5 Ad Account Entities

- `AdAccount` - Connected advertising platforms
- Token encryption, sync status, budget limits

---

## 6. API Design

### 6.1 Module Routes

```
/api/
├── media-buying/
│   ├── accounts/           # Ad account CRUD
│   ├── accounts/[platform]/connect
│   ├── campaigns/          # Campaign CRUD
│   └── metrics/            # Performance data
├── analytics/
│   ├── dashboards/         # Dashboard queries
│   ├── reports/            # Custom reports
│   └── exports/            # Data exports
├── listening/
│   ├── creators/           # Creator CRUD
│   ├── creators/[id]/connect
│   ├── content/            # Content tracking
│   └── campaigns/          # Creator campaigns
├── admin/
│   ├── organizations/      # Org management
│   ├── users/              # User management
│   └── modules/            # Module config
├── builder/
│   ├── dashboards/         # Dashboard CRUD
│   ├── widgets/            # Widget library
│   └── templates/          # Dashboard templates
└── webhooks/
    ├── phyllo/             # Phyllo events
    └── ad-platforms/       # Platform callbacks
```

### 6.2 Client Instance API

```typescript
// Get client instance with custom dashboard
GET /api/client/[slug]
Response: {
  instance: ClientInstance,
  dashboard: Dashboard,
  user: ClientInstanceUser
}

// Get widget data
POST /api/client/[slug]/widget/[widgetId]
Body: { filters: FilterConfig[] }
Response: { data: WidgetData }
```

---

## 7. Security & Compliance

### 7.1 Authentication
- Supabase Auth with Google/Azure AD SSO
- JWT tokens (1hr expiry) + refresh tokens
- Session management via Supabase helpers

### 7.2 Authorization
- Role-based access (Owner, Admin, Member, Viewer)
- Module-level permissions
- Widget-level permissions in dashboards

### 7.3 Data Security
- AES-256 encryption at rest
- TLS 1.3 in transit
- Application-level token encryption
- Row-Level Security (RLS) policies

### 7.4 Compliance Roadmap
| Requirement | Status |
|-------------|--------|
| GDPR | Phase 2 |
| CCPA | Phase 2 |
| SOC 2 | Roadmap |
| UAE PDPL | Phase 3 |

---

## 8. Implementation Phases

### Phase 1: CRM Core (4-6 weeks)
- Contact, Company, Deal, Task, Note, Activity models
- API endpoints and React Query hooks
- ContactList, DealPipeline (Kanban)
- Activity logging

### Phase 2: Creator Module (3-4 weeks)
- Creator and CreatorPlatform models
- Phyllo SDK integration
- Creator roster and metrics display
- Contract tracking

### Phase 3A: Ad Account Integration (4-5 weeks)
- OAuth flows (Meta, Google, TikTok)
- Child account discovery
- Campaign builder UI
- Token refresh automation

### Phase 3B: Data Pipeline (3-4 weeks)
- GCP + BigQuery setup
- Airbyte connections
- dbt models
- BigQuery → Supabase sync

### Phase 4: Analytics & Dashboards (3-4 weeks)
- Looker project
- Embedded dashboards
- Dashboard Builder WYSIWYG
- Scheduled reports

### Phase 5: Client Instances (3-4 weeks)
- Client instance management
- WYSIWYG dashboard builder
- Widget library
- Permission-based visibility

### Phase 6: Polish & Scale (Ongoing)
- Performance optimization
- Mobile responsiveness
- White-labeling
- Additional integrations

---

## 9. Deployment

### 9.1 Environments

| Environment | Database | URL |
|-------------|----------|-----|
| Development | Supabase local | localhost:3000 |
| Staging | Supabase staging | staging.spokestack.app |
| Production | Supabase prod | app.spokestack.app |

### 9.2 Module URLs

```
app.spokestack.app/MediaBuying  → Media Buying module
app.spokestack.app/Analytics    → Analytics module
app.spokestack.app/Listening    → Listening module
app.spokestack.app/Admin        → Admin module
app.spokestack.app/Builder      → Dashboard builder

# Client instances
[client-slug].spokestack.app    → Client dashboard
```

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Contact Management | <1000 contacts/agency |
| Campaign Sync Latency | <15 minutes |
| Dashboard Load Time | <3 seconds (p95) |
| Ad Account Connection | >95% success rate |
| Creator Data Freshness | Daily sync |

---

## 11. Related Documentation

- [Prisma Schema](../prisma/social-media.prisma)
- [Platform Overview](./01_Platform_Overview.md)
- [Technical Architecture](./02_Technical_Architecture.md)

---

*SpokeStack Technical Specification v1.0 - December 2024*
