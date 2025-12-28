# SpokeStack API Roadmap

## Overview

This document outlines the complete API buildout strategy for SpokeStack, covering all modules, entities, and integration points.

**Created:** December 2025
**Status:** Planning Phase

---

## Current State

### Existing API Routes

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/superadmin/instances` | GET, POST, PATCH | Manage client instances |
| `/api/superadmin/organizations` | GET, POST | Manage organizations |
| `/api/admin/users` | GET, POST | List and create users |

**Total:** 3 routes covering basic admin functions

---

## API Architecture Principles

### 1. RESTful Design
- Resource-based URLs: `/api/v1/{resource}`
- Standard HTTP methods: GET, POST, PUT, PATCH, DELETE
- Consistent response formats with proper status codes

### 2. Multi-Tenant by Default
- All endpoints require `organizationId` context
- Automatic tenant isolation via middleware

### 3. Authentication
- Supabase Auth JWT tokens for user authentication
- API keys for external integrations
- Client Portal uses separate auth context

### 4. Authorization Levels
| Level | Access Scope |
|-------|-------------|
| ADMIN | Full organization access |
| LEADERSHIP | All modules + RFP |
| TEAM_LEAD | Department + team management |
| STAFF | Own records + assigned work |
| FREELANCER | Assigned work only |
| CLIENT | Portal access only |

---

## Phase 1: Core Foundation (Priority: CRITICAL)

### 1.1 Authentication & Authorization
```
/api/v1/auth
├── POST /login          - Email/password login
├── POST /logout         - End session
├── POST /refresh        - Refresh token
├── GET  /me             - Current user profile
└── POST /password/reset - Password reset request
```

### 1.2 Organizations
```
/api/v1/organizations
├── GET    /              - List orgs (superadmin)
├── POST   /              - Create organization
├── GET    /:id           - Get organization details
├── PATCH  /:id           - Update organization
├── DELETE /:id           - Delete organization
└── GET    /:id/settings  - Get org settings
```

### 1.3 Users
```
/api/v1/users
├── GET    /              - List users (filtered by org)
├── POST   /              - Create user
├── GET    /:id           - Get user details
├── PATCH  /:id           - Update user
├── DELETE /:id           - Deactivate user
├── GET    /:id/permissions - Get user permissions
└── GET    /me            - Current user full profile
    ├── PATCH /me/profile - Update own profile
    └── PATCH /me/password - Change password
```

### 1.4 Clients
```
/api/v1/clients
├── GET    /              - List clients
├── POST   /              - Create client
├── GET    /:id           - Get client details
├── PATCH  /:id           - Update client
├── DELETE /:id           - Archive client
├── GET    /:id/contacts  - List client contacts
├── POST   /:id/contacts  - Add contact
├── GET    /:id/projects  - List client projects
└── GET    /:id/activities - List client activities
```

**Estimated Routes:** 25
**Priority:** P0 - Required for basic functionality

---

## Phase 2: ERP Bundle APIs

### 2.1 Briefs
```
/api/v1/briefs
├── GET    /              - List briefs (filterable)
├── POST   /              - Create brief
├── GET    /:id           - Get brief details
├── PATCH  /:id           - Update brief
├── DELETE /:id           - Delete brief
├── PATCH  /:id/status    - Update brief status
├── POST   /:id/assign    - Assign brief to user
├── GET    /:id/comments  - Get comments
├── POST   /:id/comments  - Add comment
├── GET    /:id/attachments - List attachments
├── POST   /:id/attachments - Upload attachment
├── GET    /:id/history   - Status history
└── GET    /:id/time      - Time entries for brief
```

### 2.2 Time Tracking
```
/api/v1/time
├── GET    /              - List time entries (date range)
├── POST   /              - Log time entry
├── PATCH  /:id           - Update entry
├── DELETE /:id           - Delete entry
├── POST   /timer/start   - Start timer
├── POST   /timer/stop    - Stop timer
├── GET    /timer/current - Get running timer
├── GET    /reports/weekly - Weekly summary
├── GET    /reports/user/:id - User time report
└── GET    /reports/project/:id - Project time report
```

### 2.3 Leave Management
```
/api/v1/leave
├── GET    /types         - List leave types
├── GET    /balances      - Current user balances
├── GET    /balances/:userId - User balances (manager)
├── GET    /requests      - List leave requests
├── POST   /requests      - Submit leave request
├── GET    /requests/:id  - Get request details
├── PATCH  /requests/:id  - Update request
├── POST   /requests/:id/approve - Approve request
├── POST   /requests/:id/reject  - Reject request
├── GET    /calendar      - Team calendar view
└── GET    /holidays      - Public holidays
```

### 2.4 Team Directory
```
/api/v1/team
├── GET    /              - Team directory
├── GET    /departments   - List departments
├── GET    /by-department - Users grouped by dept
├── GET    /org-chart     - Organization hierarchy
├── GET    /:id           - Team member profile
└── GET    /:id/documents - Employee documents
```

**Estimated Routes:** 45
**Priority:** P1 - Core ERP functionality

---

## Phase 3: Agency Bundle APIs

### 3.1 Projects
```
/api/v1/projects
├── GET    /              - List projects
├── POST   /              - Create project
├── GET    /:id           - Get project details
├── PATCH  /:id           - Update project
├── DELETE /:id           - Archive project
├── GET    /:id/briefs    - Project briefs
├── GET    /:id/time      - Project time entries
├── GET    /:id/budget    - Budget status
└── GET    /:id/team      - Project team members
```

### 3.2 RFP Management
```
/api/v1/rfps
├── GET    /              - List RFPs
├── POST   /              - Create RFP
├── GET    /:id           - Get RFP details
├── PATCH  /:id           - Update RFP
├── DELETE /:id           - Delete RFP
├── PATCH  /:id/status    - Update RFP status
├── GET    /:id/subitems  - Get subitems/tasks
├── POST   /:id/subitems  - Add subitem
├── PATCH  /:id/subitems/:sid - Update subitem
├── GET    /:id/attachments - RFP documents
├── POST   /:id/attachments - Upload document
└── POST   /:id/convert   - Convert to client
```

### 3.3 Deals/Pipeline
```
/api/v1/deals
├── GET    /              - List deals
├── POST   /              - Create deal
├── GET    /:id           - Get deal details
├── PATCH  /:id           - Update deal
├── PATCH  /:id/stage     - Move deal stage
├── POST   /:id/convert   - Convert to client
└── GET    /pipeline      - Pipeline view data
```

### 3.4 Resources/Capacity
```
/api/v1/resources
├── GET    /capacity      - Team capacity overview
├── GET    /capacity/:userId - User capacity
├── GET    /allocations   - Current allocations
├── POST   /allocations   - Create allocation
├── PATCH  /allocations/:id - Update allocation
├── GET    /availability  - Team availability
└── GET    /forecasting   - Capacity forecast
```

**Estimated Routes:** 35
**Priority:** P1 - Agency operations

---

## Phase 4: Marketing Bundle APIs

### 4.1 Creators (Listening Module)
```
/api/v1/creators
├── GET    /              - List tracked creators
├── POST   /              - Add creator
├── GET    /:id           - Creator profile
├── PATCH  /:id           - Update creator
├── DELETE /:id           - Remove creator
├── GET    /:id/platforms - Platform accounts
├── GET    /:id/content   - Creator content
└── GET    /:id/metrics   - Performance metrics
```

### 4.2 Trackers
```
/api/v1/trackers
├── GET    /              - List trackers
├── POST   /              - Create tracker
├── GET    /:id           - Tracker details
├── PATCH  /:id           - Update tracker
├── DELETE /:id           - Delete tracker
├── GET    /:id/content   - Tracked content
└── GET    /:id/metrics   - Tracker metrics
```

### 4.3 Social Campaigns
```
/api/v1/campaigns
├── GET    /              - List campaigns
├── POST   /              - Create campaign
├── GET    /:id           - Campaign details
├── PATCH  /:id           - Update campaign
├── GET    /:id/creators  - Campaign creators
├── POST   /:id/creators  - Add creator
├── GET    /:id/metrics   - Campaign metrics
└── GET    /:id/content   - Campaign content
```

### 4.4 Analytics
```
/api/v1/analytics
├── GET    /dashboards         - User dashboards
├── POST   /dashboards         - Create dashboard
├── GET    /dashboards/:id     - Dashboard data
├── GET    /widgets/:id        - Widget data
├── GET    /reports/performance - Performance report
├── GET    /reports/roi        - ROI analysis
└── POST   /export             - Export data
```

**Estimated Routes:** 35
**Priority:** P2 - Marketing capabilities

---

## Phase 5: Client Portal APIs

### 5.1 Portal Authentication
```
/api/portal/auth
├── POST   /magic-link    - Request magic link
├── POST   /verify        - Verify magic link
├── GET    /me            - Portal user profile
└── POST   /logout        - End portal session
```

### 5.2 Portal Content
```
/api/portal/briefs
├── GET    /              - Client's briefs
├── GET    /:id           - Brief details
├── POST   /:id/approve   - Approve brief
├── POST   /:id/request-changes - Request changes
└── POST   /:id/comments  - Add comment

/api/portal/projects
├── GET    /              - Client's projects
└── GET    /:id           - Project details

/api/portal/approvals
├── GET    /              - Pending approvals
└── POST   /:id           - Submit approval decision
```

**Estimated Routes:** 15
**Priority:** P1 - Client collaboration

---

## Phase 6: Integration APIs

### 6.1 Webhooks
```
/api/v1/webhooks
├── GET    /              - List webhook subscriptions
├── POST   /              - Create subscription
├── GET    /:id           - Subscription details
├── PATCH  /:id           - Update subscription
├── DELETE /:id           - Delete subscription
├── GET    /:id/deliveries - Delivery history
└── POST   /:id/test      - Test webhook
```

### 6.2 API Keys
```
/api/v1/api-keys
├── GET    /              - List API keys
├── POST   /              - Create API key
├── DELETE /:id           - Revoke API key
└── POST   /:id/rotate    - Rotate key
```

### 6.3 External Integrations
```
/api/v1/integrations
├── GET    /              - List integrations
├── GET    /available     - Available integrations
├── POST   /:type/connect - Connect integration
├── DELETE /:type         - Disconnect integration
└── GET    /:type/status  - Integration status

/api/v1/integrations/slack
├── POST   /install       - Install Slack app
├── GET    /channels      - List channels
└── POST   /send          - Send message

/api/v1/integrations/phyllo
├── GET    /creators      - Sync creator data
└── POST   /connect       - Connect creator account

/api/v1/integrations/bigquery
├── POST   /sync          - Sync data to BigQuery
└── GET    /status        - Sync status
```

**Estimated Routes:** 25
**Priority:** P2 - External connectivity

---

## Phase 7: Content & Files APIs

### 7.1 File Management
```
/api/v1/files
├── GET    /              - List files
├── POST   /upload        - Upload file
├── GET    /:id           - File details
├── GET    /:id/download  - Download file
├── DELETE /:id           - Delete file
└── PATCH  /:id           - Update metadata

/api/v1/folders
├── GET    /              - List folders
├── POST   /              - Create folder
├── GET    /:id           - Folder contents
├── PATCH  /:id           - Rename folder
└── DELETE /:id           - Delete folder
```

### 7.2 Content CMS
```
/api/v1/content
├── GET    /posts         - List content posts
├── POST   /posts         - Create post
├── GET    /posts/:id     - Post details
├── PATCH  /posts/:id     - Update post
├── POST   /posts/:id/versions - Save version
├── GET    /posts/:id/versions - Version history
├── POST   /posts/:id/submit   - Submit for approval
├── POST   /posts/:id/approve  - Approve content
├── POST   /posts/:id/publish  - Publish content
└── GET    /calendar      - Content calendar
```

### 7.3 Digital Asset Management
```
/api/v1/assets
├── GET    /libraries     - List asset libraries
├── POST   /libraries     - Create library
├── GET    /libraries/:id - Library contents
├── POST   /upload        - Upload asset
├── GET    /:id           - Asset details
├── PATCH  /:id           - Update asset
├── DELETE /:id           - Delete asset
├── GET    /:id/versions  - Asset versions
└── POST   /:id/versions  - Upload new version
```

**Estimated Routes:** 35
**Priority:** P2 - Content management

---

## Phase 8: Real-time & Notifications APIs

### 8.1 Notifications
```
/api/v1/notifications
├── GET    /              - List notifications
├── GET    /unread        - Unread count
├── PATCH  /:id/read      - Mark as read
├── POST   /read-all      - Mark all read
├── GET    /preferences   - Notification settings
└── PATCH  /preferences   - Update settings
```

### 8.2 Real-time Events (WebSocket)
```
/api/ws
├── /presence            - User presence
├── /notifications       - Push notifications
├── /briefs/:id          - Brief updates
├── /chat/:channelId     - Chat messages
└── /dashboard           - Dashboard updates
```

### 8.3 Chat/Messaging
```
/api/v1/chat
├── GET    /channels      - List channels
├── POST   /channels      - Create channel
├── GET    /channels/:id  - Channel details
├── GET    /channels/:id/messages - Get messages
├── POST   /channels/:id/messages - Send message
├── GET    /dms           - Direct messages
└── POST   /dms           - Start DM
```

**Estimated Routes:** 20
**Priority:** P3 - Enhanced UX

---

## Phase 9: CRM APIs (Enhanced)

### 9.1 Contacts
```
/api/v1/crm/contacts
├── GET    /              - List contacts
├── POST   /              - Create contact
├── GET    /:id           - Contact details
├── PATCH  /:id           - Update contact
├── DELETE /:id           - Delete contact
├── GET    /:id/activities - Contact activities
├── POST   /:id/activities - Log activity
├── GET    /:id/notes     - Contact notes
└── POST   /:id/notes     - Add note
```

### 9.2 CRM Deals
```
/api/v1/crm/deals
├── GET    /              - List CRM deals
├── POST   /              - Create deal
├── GET    /:id           - Deal details
├── PATCH  /:id           - Update deal
├── PATCH  /:id/stage     - Move stage
├── GET    /:id/contacts  - Deal contacts
├── GET    /:id/activities - Deal activities
├── GET    /:id/products  - Deal products
└── GET    /pipeline/:id  - Pipeline view
```

### 9.3 Pipelines
```
/api/v1/crm/pipelines
├── GET    /              - List pipelines
├── POST   /              - Create pipeline
├── GET    /:id           - Pipeline details
├── PATCH  /:id           - Update pipeline
└── DELETE /:id           - Delete pipeline
```

### 9.4 CRM Tasks
```
/api/v1/crm/tasks
├── GET    /              - List tasks
├── POST   /              - Create task
├── PATCH  /:id           - Update task
├── PATCH  /:id/complete  - Mark complete
└── GET    /today         - Today's tasks
```

### 9.5 Campaigns
```
/api/v1/crm/campaigns
├── GET    /              - List campaigns
├── POST   /              - Create campaign
├── GET    /:id           - Campaign details
├── PATCH  /:id           - Update campaign
├── GET    /:id/members   - Campaign members
├── POST   /:id/members   - Add members
└── GET    /:id/activities - Campaign activities
```

**Estimated Routes:** 45
**Priority:** P2 - Sales operations

---

## Phase 10: Admin & Superadmin APIs

### 10.1 Instance Management
```
/api/v1/superadmin/instances
├── GET    /              - List all instances
├── POST   /              - Create instance
├── GET    /:id           - Instance details
├── PATCH  /:id           - Update instance
├── DELETE /:id           - Delete instance
├── POST   /:id/activate  - Activate instance
├── POST   /:id/suspend   - Suspend instance
└── GET    /:id/users     - Instance users
```

### 10.2 Domain Management
```
/api/v1/superadmin/domains
├── GET    /              - List custom domains
├── POST   /              - Add domain
├── GET    /:id/verify    - Verify domain
└── DELETE /:id           - Remove domain
```

### 10.3 Audit & Compliance
```
/api/v1/admin/audit
├── GET    /logs          - Audit logs
├── GET    /logs/:id      - Log details
├── GET    /export        - Export logs
└── GET    /reports       - Compliance reports
```

### 10.4 Settings
```
/api/v1/admin/settings
├── GET    /general       - General settings
├── PATCH  /general       - Update general
├── GET    /branding      - Branding settings
├── PATCH  /branding      - Update branding
├── GET    /security      - Security settings
├── PATCH  /security      - Update security
├── GET    /billing       - Billing info
└── GET    /usage         - Usage metrics
```

**Estimated Routes:** 25
**Priority:** P1 - Platform management

---

## Summary: API Phases

| Phase | Focus | Routes | Priority | Dependencies |
|-------|-------|--------|----------|--------------|
| 1 | Core Foundation | 25 | P0 | None |
| 2 | ERP Bundle | 45 | P1 | Phase 1 |
| 3 | Agency Bundle | 35 | P1 | Phase 1 |
| 4 | Marketing Bundle | 35 | P2 | Phase 1 |
| 5 | Client Portal | 15 | P1 | Phase 1 |
| 6 | Integrations | 25 | P2 | Phase 1 |
| 7 | Content & Files | 35 | P2 | Phase 1 |
| 8 | Real-time | 20 | P3 | Phase 1 |
| 9 | Enhanced CRM | 45 | P2 | Phase 1 |
| 10 | Admin/Superadmin | 25 | P1 | Phase 1 |

**Total Estimated Routes:** ~305

---

## Implementation Strategy

### Route File Organization
```
/src/app/api/v1
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
├── users/
│   ├── route.ts           # GET, POST
│   └── [id]/route.ts      # GET, PATCH, DELETE
├── clients/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── contacts/route.ts
├── briefs/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       ├── status/route.ts
│       └── comments/route.ts
... (similar pattern for all resources)
```

### Shared Utilities
```
/src/lib/api
├── middleware.ts          # Auth, tenant, logging
├── response.ts            # Standard response helpers
├── validation.ts          # Request validation
├── pagination.ts          # Pagination helpers
├── errors.ts              # Error handling
└── permissions.ts         # Permission checks
```

### Standard Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

---

## Webhook Events (Phase 6)

### Available Events
| Category | Events |
|----------|--------|
| **Briefs** | `brief.created`, `brief.updated`, `brief.status_changed`, `brief.assigned`, `brief.completed` |
| **Projects** | `project.created`, `project.updated`, `project.status_changed` |
| **Time** | `time.logged`, `time.approved` |
| **RFP** | `rfp.created`, `rfp.status_changed`, `rfp.submitted`, `rfp.won`, `rfp.lost` |
| **Clients** | `client.created`, `client.updated`, `client.status_changed` |
| **Users** | `user.created`, `user.updated`, `user.deactivated` |
| **Leave** | `leave.requested`, `leave.approved`, `leave.rejected` |
| **Portal** | `portal.approval_requested`, `portal.approved`, `portal.changes_requested` |

---

## Rate Limiting

| Tier | Requests/min | Burst |
|------|-------------|-------|
| Free | 60 | 10 |
| Pro | 300 | 50 |
| Enterprise | 1000 | 100 |

---

## Versioning Strategy

- URL versioning: `/api/v1/`, `/api/v2/`
- Breaking changes require new version
- Deprecation notices 6 months before removal
- v1 supported for 12 months after v2 release

---

## Development Priority Order

### Sprint 1-2: Foundation
1. Authentication routes
2. User management
3. Organization management
4. Permission middleware

### Sprint 3-4: ERP Core
1. Briefs CRUD
2. Time tracking
3. Leave management
4. Team directory

### Sprint 5-6: Agency & Portal
1. Projects CRUD
2. RFP management
3. Client portal auth
4. Portal content APIs

### Sprint 7-8: Extensions
1. File management
2. Notifications
3. Webhooks
4. Integration connectors

### Sprint 9-10: Advanced
1. Enhanced CRM
2. Content CMS
3. Real-time updates
4. Analytics APIs

---

*Last Updated: December 2025*
