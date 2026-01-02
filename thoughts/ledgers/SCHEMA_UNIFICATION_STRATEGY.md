# Schema Unification Strategy: ERP Root → Spokestack

**Created:** 2026-01-02
**Status:** ANALYSIS COMPLETE - READY FOR DECISION

## Executive Summary

The codebase has two divergent Prisma schemas:
- **ROOT** (`/prisma/schema.prisma`): 6,880 lines - Enterprise ERP features
- **SPOKESTACK** (`/spokestack/prisma/schema.prisma`): 6,856 lines - SaaS platform features

These must be unified for multi-tenant deployment with modular feature containerization.

## Schema Divergence Analysis

### Models ONLY in ROOT (Enterprise Features)

| Model | Purpose | Lines |
|-------|---------|-------|
| `DelegationProfile` | DOA scope configuration per user | 1071-1098 |
| `ActiveDelegation` | Currently active delegations (leave coverage) | 1100-1145 |
| `DelegationActivity` | Audit trail of delegation actions | 1147-1175 |
| `BuilderTemplate` | Generic template system with approvals | 5826-5878 |
| `BuilderAuditLog` | Template change audit trail | 5880-5907 |
| `BuilderPermission` | Template-level permissions | 5909-5940 |
| `WorkflowInstance` | BPM-style triggered workflows | 5995-6040 |
| `WorkflowTask` | Tasks within workflow instances | 6042-6102 |
| `WorkflowActivity` | Workflow execution audit trail | 6104-6140 |
| `WorkflowNudge` | Reminder/escalation system | 6142-6180 |

### Models ONLY in SPOKESTACK (Platform Features)

| Model | Purpose | Lines |
|-------|---------|-------|
| `ClientInstance` | Multi-tenant client white-labeling | 5852-5890 |
| `ClientInstanceUser` | User-to-client-instance access | 5892-5920 |
| `BuilderDashboard` | Dashboard Builder - custom dashboards | 1643-1684 |
| `BuilderDashboardTemplate` | Dashboard templates | 1686-1724 |
| `BuilderWidget` | Dashboard widgets | 1726-1764 |
| `WorkflowBoard` | Kanban-style boards | 6621-6655 |
| `WorkflowColumn` | Board columns | 6657-6678 |
| `WorkflowCard` | Kanban cards | 6680-6722 |
| `WorkflowBoardMember` | Board access control | 6724-6740 |
| `WorkflowChecklist` | Card checklists | 6742-6768 |
| `WorkflowChecklistItem` | Checklist items | 6770-6800 |
| `WorkflowComment` | Card comments | 6802-6832 |
| `WorkflowAttachment` | Card attachments | 6834-6860 |

### Field-Level Differences

| Location | ROOT | SPOKESTACK |
|----------|------|------------|
| `User` | Has `backupBriefsAssigned` relation | Has `supabaseId` for Supabase Auth |
| `Organization` | No workflow/builder relations | Has `workflowBoards`, `builderDashboards`, `clientInstances` |
| `Brief` | Has `backupAssigneeId` field | No backup assignee field |

### Enum Differences

**ROOT only:**
- `DelegationStatus` (ACTIVE, COMPLETED, CANCELLED, SUPERSEDED)
- `DelegationActivityType` (CREATED, ACTIVATED, DEACTIVATED, ESCALATED)
- `BuilderTemplateType` (BRIEF, DASHBOARD, REPORT, WORKFLOW)
- `BuilderPermissionLevel` (VIEW, USE, EDIT, ADMIN)
- `BuilderAuditAction` (CREATED, UPDATED, PUBLISHED, etc.)
- `TemplateStatus` (DRAFT, SUBMITTED, APPROVED, REJECTED)
- `WorkflowInstanceStatus` / `WorkflowTaskStatus` / `WorkflowStatus`
- `NudgeChannel` (EMAIL, SLACK, IN_APP)

**SPOKESTACK only:**
- `ClientInstanceRole` (OWNER, ADMIN, MANAGER, MEMBER, VIEWER)
- `DashboardVisibility` (PRIVATE, ORGANIZATION, CLIENT, PUBLIC)
- `BuilderWidgetType` (METRIC_CARD, LINE_CHART, DATA_TABLE, etc.)
- `WorkflowMemberRole` (OWNER, ADMIN, MEMBER)

## Recommendation: SPOKESTACK as Source of Truth

**Rationale:**
1. Spokestack has the newer, more evolved architecture
2. Spokestack has proper SaaS multi-tenancy with `ClientInstance`
3. Spokestack has Supabase Auth integration (`supabaseId`)
4. Spokestack's Workflow system (Kanban) is more user-friendly than BPM
5. Spokestack's Dashboard Builder is functional and deployed
6. ROOT's enterprise features (DOA) can be added as optional module

## Module Containerization Strategy

```
/src/modules/
├── core/                    # Multi-tenant foundation
│   ├── auth/               # Supabase + session management
│   ├── organization/       # Org settings, branding
│   └── users/             # User management
│
├── agency/                  # Agency operations
│   ├── briefs/            # Brief management
│   ├── time-tracking/     # Time entries
│   └── resources/         # Resource planning
│
├── crm/                     # Client relationship
│   ├── clients/           # Client management
│   ├── deals/             # Deal pipeline
│   └── contacts/          # Contact management
│
├── workflow/                # Kanban workflow (SPOKESTACK version)
│   ├── boards/            # Board management
│   ├── cards/             # Card CRUD
│   └── templates/         # Workflow templates
│
├── builder/                 # Dashboard Builder
│   ├── dashboards/        # Dashboard CRUD
│   ├── widgets/           # Widget library
│   └── templates/         # Dashboard templates
│
├── studio/                  # Content studio
│   ├── docs/              # Studio documents
│   ├── calendar/          # Content calendar
│   └── video/             # Video projects
│
├── platform/                # Spokestack SaaS features
│   ├── client-instances/  # White-label instances
│   └── subscriptions/     # (future) billing
│
└── enterprise/              # Enterprise addons (from ROOT)
    └── delegation/        # Delegation of Authority
```

## Migration Path

### Phase 1: Schema Consolidation
1. Delete ROOT `/prisma/schema.prisma`
2. Symlink or copy SPOKESTACK schema to root
3. Merge ROOT-only features into SPOKESTACK schema:
   - Add DOA models: `DelegationProfile`, `ActiveDelegation`, `DelegationActivity`
   - Add DOA enums
   - Add `backupAssigneeId` to `Brief` model (optional field)

### Phase 2: Code Consolidation
1. Move SPOKESTACK `/spokestack/src` to ROOT `/src`
2. Delete the nested spokestack app
3. Ensure all modules reference unified schema

### Phase 3: Database Migration
```bash
# From unified project root
npx prisma migrate dev --name consolidate-schemas
# Or for production
npx prisma migrate deploy
```

## Immediate Action Required

Before any unification, the database needs the missing tables:

```bash
cd ~/erp_staging_lmtd/spokestack
npx prisma db push
```

This creates:
- `workflow_boards`
- `workflow_columns`
- `workflow_cards`
- `builder_dashboards`
- `builder_dashboard_templates`
- `builder_widgets`

## Decision Points

1. **Keep both Workflow systems?**
   - Kanban (visual project boards) ← User-facing
   - BPM (triggered workflows) ← Automation

2. **Keep backup assignee on Briefs?**
   - Useful for leave management integration
   - Could tie into DOA system

3. **Single app or monorepo?**
   - Single app: Simpler deployment
   - Monorepo: Independent scaling (not recommended for current scale)

## Next Steps

- [ ] User decision on recommendation
- [ ] Run `prisma db push` to create missing tables
- [ ] Test Workflows and Dashboard Builder
- [ ] Begin Phase 1 schema consolidation
- [ ] Migrate code to unified structure
