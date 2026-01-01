# Builder Module

## Overview

The Builder module provides a no-code configuration system for the SpokeStack platform. It allows admins to create and manage:

- Brief Templates
- Workflows
- Dashboard Widgets
- Report Templates
- AI Skill Configurations
- Form Templates
- Notification Templates

## Architecture

### Database Models

Located in `/prisma/schema.prisma`:

- `BuilderTemplate` - Stores template definitions with versioning
- `BuilderPermission` - Controls access to the Builder
- `BuilderAuditLog` - Tracks all changes for compliance

### Key Concepts

**Template Status Flow:**
```
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → DEPRECATED
```

**Versioning:**
- Each template can have multiple versions
- Only one version is marked as `isLatest: true`
- Published templates are immutable; changes create new versions

**Permission Levels:**
- ADMIN: Full access
- TEMPLATE_EDITOR: Create/edit, needs approval to publish
- DEPARTMENT_BUILDER: Limited to own department
- READ_ONLY: View only

## Files

```
/src/modules/builder/
├── index.ts                    # Module exports
├── types/
│   └── index.ts               # TypeScript type definitions
├── services/
│   └── template-service.ts    # CRUD and query functions
└── CLAUDE.md                  # This file

/src/app/(dashboard)/admin/builder/
├── page.tsx                   # Builder dashboard
├── BuilderDashboard.tsx       # Dashboard UI
├── actions.ts                 # Server actions
├── new/
│   ├── page.tsx              # New template page
│   └── NewTemplateForm.tsx   # Creation form
└── [id]/
    ├── page.tsx              # Template detail page
    └── TemplateEditor.tsx    # Editor UI
```

## Usage

### Getting Published Templates

```typescript
import { getPublishedTemplates } from "@/modules/builder";

const briefTemplates = await getPublishedTemplates(
  organizationId,
  "BRIEF_TEMPLATE"
);
```

### Creating a Template

```typescript
import { createTemplate } from "@/app/(dashboard)/admin/builder/actions";

const template = await createTemplate({
  templateType: "WORKFLOW",
  name: "Client Onboarding",
  module: "crm",
});
```

### Validating Definitions

```typescript
import { validateTemplateDefinition } from "@/modules/builder";

const result = validateTemplateDefinition("WORKFLOW", myDefinition);
if (!result.valid) {
  console.error(result.errors);
}
```

## Template Definition Schemas

Each template type has a specific JSON schema. See `/src/modules/builder/types/index.ts` for TypeScript definitions.

### Brief Template Example

```json
{
  "sections": [
    {
      "id": "basics",
      "title": "Basic Information",
      "fields": [
        {
          "id": "topic",
          "label": "Topic",
          "type": "text",
          "required": true
        }
      ]
    }
  ],
  "stages": ["SUBMITTED", "IN_PROGRESS", "COMPLETED"],
  "defaultAssigneeRole": "designer"
}
```

### Workflow Example

```json
{
  "trigger": {
    "type": "rfp.created",
    "conditions": [{ "field": "status", "operator": "equals", "value": "ACTIVE" }]
  },
  "tasks": [
    {
      "id": "research",
      "name": "Initial Research",
      "assigneeRole": "strategist",
      "dueOffset": { "value": 21, "unit": "days", "from": "deadline" },
      "dependsOn": []
    }
  ],
  "nudgeRules": [],
  "stageGates": []
}
```

## Security

- Only ADMIN users can access `/admin/builder`
- All changes are logged in `BuilderAuditLog`
- Templates require organizationId scoping
- Published templates are versioned (never modified in place)

## Future Enhancements

- Visual form builder UI
- Workflow diagram editor
- Template marketplace/sharing
- Import/export functionality
- Template testing sandbox
