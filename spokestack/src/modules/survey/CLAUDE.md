# Survey/Form Builder Module

## Overview

Template-based survey and form creation system with versioning, logic, and analytics.

## Key Concepts

### Template Versioning
- Templates are versioned to track changes
- Surveys reference a specific version for consistency
- `currentVersionId` links to the active version

### Question Types
See `QuestionKind` enum in types.ts:
- Basic: SHORT_TEXT, LONG_TEXT, NUMBER, EMAIL, etc.
- Choice: SINGLE_CHOICE, MULTIPLE_CHOICE, DROPDOWN, RANKING
- Rating: RATING_SCALE, NPS, STAR_RATING, SLIDER
- Matrix: MATRIX_SINGLE, MATRIX_MULTIPLE, MATRIX_SCALE
- Layout: SECTION_BREAK, PAGE_BREAK, STATEMENT

### Template vs Survey
- **Template**: Reusable definition (questions, design, settings)
- **Survey**: Instance of a template with distribution settings

## Data Flow

```
Template (definition)
    │
    ├── TemplateVersion (schema snapshot)
    │       └── Questions, Design, Settings
    │
    └── Survey (runtime instance)
            ├── Distribution settings
            ├── Target audience
            └── Submissions
                    └── Answers
```

## Logic System

Questions can have conditional logic:
```typescript
logicRules: [
  {
    condition: { type: "equals", value: "Yes" },
    action: { type: "show", questionIds: ["q2", "q3"] }
  }
]
```

## Files

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript types and interfaces |
| `actions.ts` | Server actions for CRUD operations |
| `components/` | UI components |

## Database Tables

- `survey_templates` - Template definitions
- `survey_template_versions` - Version history
- `survey_template_tags` - Template tagging
- `survey_tags` - Tag taxonomy
- `surveys` - Survey instances
- `survey_submissions` - Response data
- `survey_invitations` - Email tracking

## Common Operations

### Create Template
```typescript
const template = await createTemplate({
  name: "Client Satisfaction Survey",
  kind: "SURVEY",
  category: "CLIENT_SATISFACTION"
});
```

### Create Survey from Template
```typescript
const survey = await createSurvey({
  templateId: template.id,
  title: "Q1 2025 Client Feedback",
  channels: ["EMAIL", "WEB_LINK"],
  targetClientId: "client_123"
});
```

### Publish Survey
```typescript
await updateSurveyStatus(surveyId, "ACTIVE");
```

## Permissions

| Action | Required Level |
|--------|---------------|
| View templates | STAFF+ |
| Create template | TEAM_LEAD+ |
| Publish template | LEADERSHIP+ |
| View surveys | STAFF+ |
| Create survey | TEAM_LEAD+ |
| View submissions | STAFF+ (own), TEAM_LEAD+ (all) |
