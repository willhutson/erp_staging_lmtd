# Content Engine Module

## Purpose
The Content Engine is the AI-powered knowledge and skill management system. It enables:
- Agent skill registration, testing, and execution
- Knowledge document management (MD files with YAML frontmatter)
- Skill sandbox for development and validation
- Founder knowledge capture and encoding

## Architecture

```
/content-engine/
├── CLAUDE.md                    # This file
├── /actions/                    # Server actions
│   ├── skill-actions.ts         # CRUD for skills
│   ├── knowledge-actions.ts     # Document management
│   └── invocation-actions.ts    # Skill execution
├── /components/
│   ├── /sandbox/                # Skill development UI
│   │   ├── SkillPlayground.tsx  # Interactive testing
│   │   ├── KnowledgeCapture.tsx # Interview-style capture
│   │   ├── SkillWizard.tsx      # Guided skill creation
│   │   └── SkillGraph.tsx       # Dependency visualization
│   ├── /skills/                 # Skill-specific UIs
│   └── /knowledge/              # Document viewers/editors
└── /types/                      # TypeScript types
```

## Key Concepts

### Skills
Registered AI capabilities with defined inputs, outputs, and triggers.
```typescript
interface Skill {
  slug: string;           // unique identifier
  name: string;           // display name
  category: SkillCategory;
  triggers: Trigger[];    // when to invoke
  inputs: InputField[];   // what it needs
  outputs: OutputField[]; // what it produces
  dependsOn: string[];    // other skills it requires
}
```

### Knowledge Documents
Markdown files with YAML frontmatter consumed by agents.
```markdown
---
title: Client Onboarding Checklist
documentType: PROCEDURE
agentMetadata:
  usableBySkills: ["brief-creator", "client-analyzer"]
---
# Content here...
```

### Invocations
Tracked executions of skills with full audit trail.

## Founder Validation
Every skill must answer:
1. "What would Will do in this situation?"
2. "What mistake would a junior make?"
3. "What did 15 years of experience teach about this?"
