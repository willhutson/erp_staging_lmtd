# SpokeStack Platform Architecture

**Version:** 1.0
**Date:** December 2024
**Status:** Technical Specification

---

## Executive Summary

**SpokeStack** is a white-label professional services management platform. It's designed to be deployed as branded instances for different organizations while sharing a common codebase and infrastructure.

**TeamLMTD ERP** is the first branded deployment - a customized instance of SpokeStack configured for a Dubai-based digital/social agency.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPOKESTACK PLATFORM                                │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   TeamLMTD      │  │   Agency B      │  │   Agency C      │              │
│  │   ERP           │  │   (Future)      │  │   (Future)      │              │
│  │                 │  │                 │  │                 │              │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │              │
│  │  │ Branding  │  │  │  │ Branding  │  │  │  │ Branding  │  │              │
│  │  │ Config    │  │  │  │ Config    │  │  │  │ Config    │  │              │
│  │  │ Workflows │  │  │  │ Workflows │  │  │  │ Workflows │  │              │
│  │  │ Forms     │  │  │  │ Forms     │  │  │  │ Forms     │  │              │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│           │                   │                   │                          │
│           └───────────────────┼───────────────────┘                          │
│                               │                                              │
│  ┌────────────────────────────┴────────────────────────────────────────┐    │
│  │                     SHARED PLATFORM CORE                             │    │
│  │                                                                      │    │
│  │  • Multi-tenant Database      • File Storage                        │    │
│  │  • Authentication             • Notification Engine                 │    │
│  │  • Form Engine                • Analytics Engine                    │    │
│  │  • Workflow Engine            • Integration Framework               │    │
│  │  • AI/Agent Framework         • API Layer                           │    │
│  │                                                                      │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architectural Layers

### Layer 1: Platform Core (Shared)

The core platform provides the foundational capabilities shared across all deployments.

| Component | Description | Technology |
|-----------|-------------|------------|
| **Auth Engine** | Multi-tenant SSO, role-based access | NextAuth.js v5 |
| **Database** | Tenant-isolated PostgreSQL | Prisma + Neon/Supabase |
| **Form Engine** | Dynamic form builder & renderer | React Hook Form + Zod |
| **Workflow Engine** | Status machines, approvals, triggers | State machines + Jobs |
| **File Engine** | Upload, storage, CDN, AI processing | Cloudflare R2 + Workers |
| **Notification Engine** | Multi-channel delivery, preferences | Email + Slack + In-app |
| **Analytics Engine** | Metrics, reports, dashboards | SQL aggregations + Charts |
| **AI Framework** | Agent orchestration, embeddings | Claude API + Vector DB |
| **API Layer** | REST + Server Actions | Next.js API Routes |

### Layer 2: Tenant Configuration (Per-Deployment)

Each branded deployment has its own configuration that customizes platform behavior.

```typescript
// config/tenants/lmtd.config.ts
export const lmtdConfig: TenantConfig = {
  // Identity
  id: 'lmtd',
  name: 'TeamLMTD',
  domain: 'app.teamlmtd.com',

  // Branding
  branding: {
    logo: '/tenants/lmtd/logo.svg',
    favicon: '/tenants/lmtd/favicon.ico',
    primaryColor: '#52EDC7',
    primaryDark: '#1BA098',
    fontFamily: 'Inter',
  },

  // Feature toggles
  features: {
    briefs: true,
    rfp: true,
    clientPortal: true,
    timeTracking: true,
    resourcePlanning: true,
    slack: true,
    googleWorkspace: true,
  },

  // Business configuration
  business: {
    currency: 'AED',
    timezone: 'Asia/Dubai',
    weekStartsOn: 'sunday',  // UAE work week
    departments: [
      'Creative & Design',
      'Video Production',
      'Paid Media',
      'Client Servicing',
      'Copywriting',
      'Management',
    ],
  },

  // Custom terminology
  terminology: {
    brief: 'Brief',
    client: 'Client',
    project: 'Campaign',
    timeEntry: 'Time Log',
  },
};
```

### Layer 3: Tenant Data (Isolated)

Each tenant has completely isolated data within the shared database.

```sql
-- Every table includes organization_id
-- Row-level security ensures data isolation

CREATE POLICY tenant_isolation ON briefs
  FOR ALL
  USING (organization_id = current_setting('app.current_organization'));
```

---

## Deployment Models

### Model A: Single-Tenant SaaS (Current)

One deployment serves one organization. Simplest to operate.

```
┌──────────────────┐     ┌──────────────────┐
│  app.teamlmtd.com│────▶│  Vercel Edge     │
└──────────────────┘     │  + Neon DB       │
                         └──────────────────┘
```

**Pros:** Simple, isolated, easy to customize
**Cons:** More infrastructure per tenant

### Model B: Multi-Tenant SaaS (Future)

One deployment serves multiple organizations with subdomain routing.

```
┌──────────────────┐
│  lmtd.spoke.app  │────┐
└──────────────────┘    │     ┌──────────────────┐
                        ├────▶│  Shared Vercel   │
┌──────────────────┐    │     │  + Shared DB     │
│  agencyb.spoke.app│───┘     └──────────────────┘
└──────────────────┘
```

**Pros:** Lower cost per tenant, easier updates
**Cons:** Blast radius, noisy neighbor risks

### Model C: Hybrid (Recommended for Scale)

Large tenants get dedicated infrastructure; smaller tenants share.

```
┌──────────────────┐     ┌──────────────────┐
│  app.teamlmtd.com│────▶│  Dedicated       │  (Enterprise tenant)
└──────────────────┘     └──────────────────┘

┌──────────────────┐
│  agencyb.spoke.app│───┐
└──────────────────┘    │     ┌──────────────────┐
                        ├────▶│  Shared Pool     │  (SMB tenants)
┌──────────────────┐    │     └──────────────────┘
│  agencyc.spoke.app│───┘
└──────────────────┘
```

---

## Module Architecture

Each feature is a self-contained module within the platform.

```
/src/modules/
├── briefs/
│   ├── CLAUDE.md           # Module documentation
│   ├── components/         # UI components
│   ├── actions/            # Server actions
│   ├── hooks/              # React hooks
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── forms/
├── resources/
├── time-tracking/
├── notifications/
├── files/
├── analytics/
├── integrations/
│   ├── slack/
│   ├── google/
│   └── meta/
└── portal/                 # Client portal
```

### Module Interface Contract

Every module exposes a consistent interface:

```typescript
// src/modules/[module]/index.ts

export interface ModuleDefinition {
  // Identity
  id: string;
  name: string;
  version: string;

  // Feature flag
  featureFlag: string;

  // Dependencies
  requires: string[];      // Other modules this depends on

  // Routes
  routes: RouteDefinition[];

  // Navigation
  navItems: NavItem[];

  // Permissions
  permissions: Permission[];

  // Database tables
  models: string[];        // Prisma model names

  // Settings
  settings: SettingDefinition[];

  // AI capabilities
  aiCapabilities?: AICapability[];
}
```

---

## Data Architecture

### Multi-Tenant Database Design

```prisma
// Every model includes organization context

model Brief {
  id              String   @id @default(cuid())
  organizationId  String   // Tenant isolation key

  // ... other fields

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])  // Always indexed for performance
}
```

### Data Isolation Strategies

| Strategy | When to Use | Implementation |
|----------|-------------|----------------|
| **Row-Level** | Default | `WHERE organizationId = ?` |
| **Schema-Level** | High-security tenants | Separate Postgres schemas |
| **Database-Level** | Enterprise isolation | Separate database instances |

### Data Residency (Future)

For tenants with data sovereignty requirements:

```typescript
interface TenantDataConfig {
  primaryRegion: 'us-east' | 'eu-west' | 'me-south';
  backupRegion: string;
  encryptionKey: string;  // Customer-managed key
}
```

---

## AI/Agent Architecture

### Agent Framework

SpokeStack provides infrastructure for deploying AI agents at different levels:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI/AGENT FRAMEWORK                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AGENT TYPES                                                                 │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Copilots   │  │ Automators  │  │ Analysts    │  │ Strategists │         │
│  │             │  │             │  │             │  │             │         │
│  │ Assist      │  │ Handle      │  │ Analyze     │  │ Recommend   │         │
│  │ humans      │  │ routine     │  │ data        │  │ actions     │         │
│  │             │  │ tasks       │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                              │
│  CAPABILITIES                                                                │
│                                                                              │
│  • Tool calling (database, API, file operations)                            │
│  • Memory (conversation + long-term knowledge)                              │
│  • Multi-step reasoning                                                      │
│  • Human-in-the-loop escalation                                             │
│  • Audit logging                                                             │
│                                                                              │
│  INFRASTRUCTURE                                                              │
│                                                                              │
│  • Claude API (reasoning)                                                    │
│  • Vector database (knowledge retrieval)                                     │
│  • Job queue (async processing)                                              │
│  • Webhook triggers (event-driven)                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Agent Deployment Phases

| Phase | Agent Type | Examples | Tenant Control |
|-------|------------|----------|----------------|
| **1. Copilots** | Human-assist | Brief quality scorer, time estimator | Always optional |
| **2. Automators** | Task handlers | Reminder sender, report generator | Per-task toggle |
| **3. Analysts** | Data processors | Trend detector, anomaly alerter | Threshold config |
| **4. Strategists** | Advisors | Resource planner, proposal writer | Approval required |

### Agent Configuration (Per-Tenant)

```typescript
interface TenantAIConfig {
  enabled: boolean;

  agents: {
    briefQualityReviewer: {
      enabled: boolean;
      autoSuggest: boolean;      // Show suggestions automatically
      minScore: number;          // Below this, block submission
    };
    timeEstimator: {
      enabled: boolean;
      model: 'conservative' | 'balanced' | 'aggressive';
    };
    slackBot: {
      enabled: boolean;
      channels: string[];
      capabilities: ('answer' | 'create' | 'update')[];
    };
  };

  // Data access
  dataAccess: {
    canReadBriefs: boolean;
    canReadTime: boolean;
    canReadFinancials: boolean;
  };

  // Human oversight
  oversight: {
    requireApprovalFor: string[];  // Which agent actions need human approval
    escalateTo: string[];          // User IDs for escalation
  };
}
```

---

## Integration Architecture

### Integration Framework

```typescript
// src/lib/integrations/base.ts

abstract class Integration {
  abstract id: string;
  abstract name: string;
  abstract icon: string;

  // OAuth flow
  abstract getAuthUrl(): string;
  abstract handleCallback(code: string): Promise<Credentials>;

  // Connection test
  abstract testConnection(): Promise<boolean>;

  // Sync operations
  abstract sync(): Promise<SyncResult>;

  // Webhook handler
  abstract handleWebhook(payload: unknown): Promise<void>;

  // Available actions
  abstract getActions(): IntegrationAction[];
}
```

### Supported Integrations

| Integration | Status | Capabilities |
|-------------|--------|--------------|
| **Slack** | Phase 9 | Commands, notifications, approvals |
| **Google Workspace** | Phase 9 | Calendar, Drive, SSO |
| **Meta Business** | Future | Ad accounts, insights |
| **Xero/QuickBooks** | Future | Invoicing, time sync |
| **Monday.com** | Migration | Import existing data |
| **Brandwatch** | Future | Social listening |

### Integration per Tenant

```typescript
// Each tenant can configure which integrations to enable
interface TenantIntegrations {
  slack: {
    enabled: boolean;
    workspaceId: string;
    channels: Record<string, string>;  // event -> channel mapping
  };
  google: {
    enabled: boolean;
    domain: string;
    calendarSync: boolean;
    driveIntegration: boolean;
  };
  // ... other integrations
}
```

---

## Security Architecture

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  NextAuth   │────▶│  Provider   │
│             │     │             │     │  (Google)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Session    │
                    │  + Org ID   │
                    │  + Perms    │
                    └─────────────┘
```

### Permission Model

```typescript
enum PermissionLevel {
  ADMIN,       // Full access
  LEADERSHIP,  // Strategic + operational
  TEAM_LEAD,   // Team management
  STAFF,       // Own work
  FREELANCER,  // Assigned work only
  CLIENT,      // Portal access only
}

// Fine-grained permissions
type Permission =
  | 'brief:create'
  | 'brief:read'
  | 'brief:update'
  | 'brief:delete'
  | 'brief:assign'
  | 'brief:approve'
  | 'time:read_own'
  | 'time:read_team'
  | 'time:read_all'
  | 'time:approve'
  | 'rfp:read'
  | 'rfp:create'
  | 'settings:read'
  | 'settings:write'
  // ... more permissions
```

### Data Security

| Concern | Implementation |
|---------|----------------|
| **Encryption at rest** | Database encryption (provider-managed) |
| **Encryption in transit** | TLS 1.3 everywhere |
| **Secrets management** | Environment variables + Vault |
| **API authentication** | Session tokens + API keys |
| **Audit logging** | All mutations logged |
| **Data retention** | Configurable per tenant |

---

## TeamLMTD Deployment Specification

### Tenant Profile

| Attribute | Value |
|-----------|-------|
| **Tenant ID** | `lmtd` |
| **Organization Name** | TeamLMTD |
| **Domain** | app.teamlmtd.com |
| **Primary Region** | Middle East (Dubai) |
| **Team Size** | 46 users |
| **Client Count** | 4+ active clients |
| **Brief Types** | 7 (Video, Design, Copy, Paid Media, RFP) |

### Enabled Features

| Module | Status | Notes |
|--------|--------|-------|
| Briefs | ✅ Active | All 7 brief types |
| Forms | ✅ Active | Dynamic form builder |
| Time Tracking | ✅ Active | Timer + manual entry |
| Resource Planning | ✅ Active | Kanban + Timeline |
| RFP Pipeline | ✅ Active | Leadership only |
| Client Portal | 🔜 Phase 10 | Magic link auth |
| Slack | 🔜 Phase 9 | Full integration |
| Analytics | 🔜 Phase 8 | Utilization + client reports |
| AI Agents | 🔜 Future | Brief quality, estimation |

### Custom Configuration

```typescript
// TeamLMTD-specific settings
const lmtdSettings = {
  // Brief numbering
  briefNumberFormat: 'LMTD-{YEAR}-{SEQ:3}',  // LMTD-2024-001

  // Default workflow
  briefWorkflow: {
    requiresApproval: true,
    autoAssign: false,
    notifyOnSubmit: ['team-lead', 'assignee'],
  },

  // Time tracking
  timeTracking: {
    weeklyTarget: 40,
    billableTarget: 0.8,
    overtimeThreshold: 45,
    approvalRequired: true,
  },

  // Slack channels
  slack: {
    briefs: '#briefs',
    rfp: '#rfp-private',
    general: '#general',
  },

  // Client portal
  portal: {
    magicLinkExpiry: 24,  // hours
    allowBriefSubmission: true,
    requireApproval: true,
  },
};
```

---

## Phase 6-10: Revised Specifications

Based on the platform architecture, here's how each phase should be implemented:

### Phase 6: Notification System

**Platform Layer:**
- Generic notification engine
- Multi-channel delivery (email, in-app, push, webhook)
- Preference management
- Scheduling and batching

**Tenant Layer:**
- Channel configuration (which events → which channels)
- Template customization (branding, copy)
- Quiet hours per timezone
- Escalation rules

### Phase 7: File/Document Management

**Platform Layer:**
- Upload/download infrastructure (R2/S3)
- Thumbnail generation
- AI processing pipeline (OCR, tagging)
- Full-text search indexing

**Tenant Layer:**
- Storage quotas
- File categories (per tenant's taxonomy)
- Retention policies
- Brand asset organization

### Phase 8: Reporting & Analytics

**Platform Layer:**
- Aggregation queries
- Report generation (PDF, Excel)
- Scheduling engine
- Dashboard widget framework

**Tenant Layer:**
- Custom metrics and KPIs
- Report templates
- Access controls (who sees what)
- Export destinations

### Phase 9: Slack Integration

**Platform Layer:**
- Slack app infrastructure
- OAuth flow
- Event subscription handling
- Modal/block building

**Tenant Layer:**
- Workspace connection
- Channel mappings
- User linkage
- Command permissions

### Phase 10: Client Portal

**Platform Layer:**
- Separate auth system
- Portal UI framework
- Approval workflow engine
- Asset delivery system

**Tenant Layer:**
- Portal branding
- Client user permissions
- Visible features toggle
- Custom terminology

---

## Implementation Priority

For TeamLMTD as the first tenant:

| Priority | Phase | Rationale |
|----------|-------|-----------|
| **1** | Phase 6: Notifications | Core communication, enables others |
| **2** | Phase 7: Files | Briefs need attachments, clients need assets |
| **3** | Phase 9: Slack | Team lives in Slack, high impact |
| **4** | Phase 8: Analytics | Leadership visibility, client reporting |
| **5** | Phase 10: Portal | Client empowerment, self-service |

---

## Next Steps

1. **Finalize Phase 6 spec** with TeamLMTD notification requirements
2. **Implement notification engine** as platform component
3. **Configure for TeamLMTD** (Slack channels, email templates)
4. **Document patterns** for future tenants

---

*Document Status: Draft - Pending Approval*
*Last Updated: December 2024*
