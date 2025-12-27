# Social Media Buying & Listening Module

**Module Name:** SpokeStack
**Version:** 1.0
**Status:** Specification Complete

## Overview

The Social Media Buying & Listening module extends the TeamLMTD ERP platform with comprehensive CRM, Creator/Influencer Management, and Campaign Management capabilities. This module enables the agency to:

- Manage client relationships through a full-featured CRM
- Track and manage influencer/creator partnerships
- Connect and manage ad accounts across platforms
- Run and monitor multi-platform campaigns
- Sync metrics from BigQuery and social platforms

## Architecture

### Multi-Tenancy

The module follows the same multi-tenant architecture as the core ERP:

```
Platform (SpokeStack)
    └── Agency (TeamLMTD)
        └── Brand (Client accounts)
```

Every table is scoped by `organizationId` for tenant isolation.

### Key Integrations

| Integration | Purpose |
|-------------|---------|
| **Phyllo** | Creator social data aggregation |
| **BigQuery** | Campaign metrics sync |
| **Meta Ads API** | Facebook/Instagram ad management |
| **Google Ads API** | Search, Display, YouTube ads |
| **TikTok Ads API** | TikTok campaign management |

## Data Model

### Core Entities

#### CRM Layer

| Entity | Description |
|--------|-------------|
| `Company` | Business entities (prospects, clients, partners) |
| `Contact` | Individual contacts linked to companies |
| `Deal` | Sales pipeline opportunities |
| `Task` | CRM tasks and reminders |
| `Note` | Notes and email capture |
| `Activity` | Unified activity log for timelines |

#### Creator Management

| Entity | Description |
|--------|-------------|
| `Creator` | Extends Contact with influencer-specific data |
| `CreatorPlatform` | Per-platform metrics and connection status |
| `CreatorContent` | Individual content pieces with metrics |

#### Campaign Management

| Entity | Description |
|--------|-------------|
| `Campaign` | Multi-platform marketing campaigns |
| `CampaignCreator` | Creator assignments to campaigns |
| `CampaignAdAccount` | Ad account assignments to campaigns |
| `CampaignMetric` | Daily performance metrics |

#### Ad Accounts

| Entity | Description |
|--------|-------------|
| `AdAccount` | Connected advertising platform accounts |

### Enums

#### Social Platforms
```
INSTAGRAM, TIKTOK, YOUTUBE, TWITTER, LINKEDIN,
SNAPCHAT, PINTEREST, TWITCH, FACEBOOK
```

#### Ad Platforms
```
META, GOOGLE, TIKTOK, SNAPCHAT, LINKEDIN,
TWITTER, PINTEREST, AMAZON, DV360
```

#### Campaign Objectives
```
AWARENESS, REACH, TRAFFIC, ENGAGEMENT, APP_INSTALLS,
VIDEO_VIEWS, LEAD_GENERATION, CONVERSIONS,
CATALOG_SALES, STORE_TRAFFIC
```

## Module Structure

```
/src/modules/social-media/
├── CLAUDE.md                 # Module instructions
├── components/
│   ├── crm/
│   │   ├── CompanyCard.tsx
│   │   ├── ContactList.tsx
│   │   ├── DealPipeline.tsx
│   │   └── ActivityTimeline.tsx
│   ├── creators/
│   │   ├── CreatorCard.tsx
│   │   ├── CreatorSearch.tsx
│   │   ├── PlatformMetrics.tsx
│   │   └── AudienceDemo.tsx
│   ├── campaigns/
│   │   ├── CampaignDashboard.tsx
│   │   ├── CampaignBuilder.tsx
│   │   ├── MetricsChart.tsx
│   │   └── CreatorAssignment.tsx
│   └── ad-accounts/
│       ├── AccountConnect.tsx
│       ├── AccountList.tsx
│       └── SpendAlerts.tsx
├── actions/
│   ├── companies.ts
│   ├── contacts.ts
│   ├── deals.ts
│   ├── creators.ts
│   ├── campaigns.ts
│   └── ad-accounts.ts
├── hooks/
│   ├── useCompany.ts
│   ├── useCreator.ts
│   ├── useCampaign.ts
│   └── useCampaignMetrics.ts
├── lib/
│   ├── phyllo.ts            # Phyllo API client
│   ├── bigquery.ts          # BigQuery sync
│   └── ad-platforms/
│       ├── meta.ts
│       ├── google.ts
│       └── tiktok.ts
└── types.ts
```

## Key Features

### 1. CRM

- **Company Management**: Track businesses with industry, size, type classification
- **Contact Management**: Individual contacts with lifecycle status
- **Deal Pipeline**: LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED
- **Activity Timeline**: Unified log of all interactions
- **Email Capture**: CC-to-CRM email logging

### 2. Creator Management

- **Creator Profiles**: Extended from contacts with influencer data
- **Multi-Platform Tracking**: Instagram, TikTok, YouTube, etc.
- **Phyllo Integration**: Automated metrics sync
- **Contract Management**: Commission rates, exclusivity, dates
- **Audience Demographics**: Age, gender, location breakdowns

### 3. Campaign Management

- **Multi-Platform Campaigns**: Run across multiple ad accounts
- **Creator Assignments**: Track deliverables, fees, status
- **Budget Allocation**: Per-platform budget distribution
- **Metrics Dashboard**: Real-time performance tracking
- **BigQuery Sync**: Daily metrics aggregation

### 4. Ad Account Management

- **OAuth Connections**: Secure token storage
- **Agency Hierarchy**: Parent/child account structure
- **Spend Alerts**: Daily/monthly budget limits
- **Sync Monitoring**: Track sync status and errors

## Metrics Tracked

### Campaign Metrics
- Spend, Impressions, Clicks, Conversions
- Reach, Frequency
- CPM, CPC, CTR, CPA, ROAS
- Video views (25%, 50%, 75%, 100%)

### Creator Metrics
- Followers, Following
- Engagement Rate
- Average Views, Likes, Comments
- Posts Count

## Permissions

| Role | Access |
|------|--------|
| OWNER | Full access, can delete organization |
| ADMIN | Full access except billing/deletion |
| MEMBER | Standard access to assigned entities |
| VIEWER | Read-only access |

## API Endpoints

### CRM
- `POST /api/social-media/companies` - Create company
- `GET /api/social-media/contacts` - List contacts
- `PATCH /api/social-media/deals/:id/stage` - Update deal stage

### Creators
- `POST /api/social-media/creators` - Create creator from contact
- `POST /api/social-media/creators/:id/connect` - Initiate Phyllo connection
- `GET /api/social-media/creators/:id/metrics` - Get creator metrics

### Campaigns
- `POST /api/social-media/campaigns` - Create campaign
- `POST /api/social-media/campaigns/:id/creators` - Assign creators
- `GET /api/social-media/campaigns/:id/metrics` - Get performance data

### Ad Accounts
- `POST /api/social-media/ad-accounts/connect` - OAuth flow start
- `POST /api/social-media/ad-accounts/:id/sync` - Trigger sync

## Webhooks

### Phyllo Webhooks
- `POST /api/webhooks/phyllo` - Handle Phyllo events
  - `ACCOUNT.CONNECTED` - Platform connected
  - `ACCOUNT.DISCONNECTED` - Platform disconnected
  - `PROFILE.UPDATED` - Metrics updated

### Ad Platform Webhooks
- `POST /api/webhooks/meta` - Meta conversion events
- `POST /api/webhooks/google` - Google Ads notifications

## Database Schema

See: `/prisma/social-media.prisma`

The schema includes:
- 20 models
- 25 enums
- Comprehensive indexes for query performance
- Soft delete support via `isActive` flags
- Audit trail via Activity model

## Configuration

```typescript
// config/modules/social-media.config.ts
export const socialMediaConfig = {
  phyllo: {
    clientId: process.env.PHYLLO_CLIENT_ID,
    clientSecret: process.env.PHYLLO_CLIENT_SECRET,
    environment: 'production',
  },
  bigquery: {
    projectId: process.env.GCP_PROJECT_ID,
    datasetId: 'campaign_metrics',
    syncSchedule: '0 6 * * *', // Daily at 6 AM
  },
  adPlatforms: {
    meta: {
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET,
    },
    google: {
      clientId: process.env.GOOGLE_ADS_CLIENT_ID,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    },
  },
};
```

## Environment Variables

```bash
# Phyllo
PHYLLO_CLIENT_ID=
PHYLLO_CLIENT_SECRET=

# BigQuery
GCP_PROJECT_ID=
GCP_SERVICE_ACCOUNT_KEY=

# Meta
META_APP_ID=
META_APP_SECRET=

# Google Ads
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_DEVELOPER_TOKEN=

# TikTok
TIKTOK_APP_ID=
TIKTOK_APP_SECRET=
```

## Implementation Phases

### Phase 1: CRM Foundation
- [ ] Company CRUD
- [ ] Contact CRUD
- [ ] Deal pipeline
- [ ] Activity logging
- [ ] Basic UI components

### Phase 2: Creator Management
- [ ] Creator profiles
- [ ] Platform tracking
- [ ] Phyllo integration
- [ ] Metrics display
- [ ] Search and filtering

### Phase 3: Ad Account Integration
- [ ] Meta OAuth flow
- [ ] Google Ads OAuth flow
- [ ] Account listing
- [ ] Basic sync

### Phase 4: Campaign Management
- [ ] Campaign CRUD
- [ ] Creator assignment
- [ ] Ad account assignment
- [ ] Metrics dashboard

### Phase 5: Advanced Features
- [ ] BigQuery sync
- [ ] Automated reporting
- [ ] Budget alerts
- [ ] Content tracking

## Related Documentation

- [Platform Overview](./01_Platform_Overview.md)
- [Technical Architecture](./02_Technical_Architecture.md)
- [Database Schema (CMS/Analytics/CRM)](./19_Database_Schema_CMS_Analytics_CRM.md)
