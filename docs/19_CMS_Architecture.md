# Phase 12: Enterprise Content Engine

**Version:** 2.0
**Status:** Architecture Specification
**Scope:** The knowledge backbone of an agentic enterprise platform

---

## Vision Statement

This is not a website CMS. This is the **Content Engine** that powers:

1. **The Agent Brain** - Hundreds/thousands of structured MD documents that give AI agents context, capabilities, and procedures
2. **The Work Product System** - Content IS the deliverable (videos, designs, copy, reports) flowing through agency workflows
3. **The Knowledge Graph** - All organizational intelligence queryable by humans and machines
4. **The Client Delivery Layer** - How clients receive, review, iterate, and approve work
5. **The Automation Backbone** - Content events that trigger workflows, agents, and integrations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENTERPRISE CONTENT ENGINE                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         KNOWLEDGE LAYER                                  ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        ││
│  │  │ Agent Docs  │ │ Procedures  │ │ Playbooks   │ │ Templates   │        ││
│  │  │ (Skills)    │ │ (SOPs)      │ │ (Runbooks)  │ │ (Patterns)  │        ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         CONTENT LAYER                                    ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        ││
│  │  │ Briefs      │ │Deliverables │ │ Proposals   │ │ Reports     │        ││
│  │  │ (Input)     │ │ (Output)    │ │ (Pitches)   │ │ (Analysis)  │        ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                       DELIVERY LAYER                                     ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        ││
│  │  │ Client      │ │ Approval    │ │ Versioning  │ │ Publishing  │        ││
│  │  │ Portal      │ │ Workflows   │ │ & History   │ │ & Export    │        ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        AGENT LAYER                                       ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        ││
│  │  │ Skills      │ │ Triggers    │ │ Context     │ │ Actions     │        ││
│  │  │ Registry    │ │ & Events    │ │ Injection   │ │ & Mutations │        ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Knowledge Architecture

### The Document Hierarchy

All knowledge lives in a queryable, version-controlled document system:

```
/knowledge
├── /agents                      # Agent capability definitions
│   ├── /skills                  # Individual skill docs
│   │   ├── brief-creator.md
│   │   ├── time-estimator.md
│   │   ├── quality-scorer.md
│   │   ├── resource-optimizer.md
│   │   └── client-communicator.md
│   ├── /personas                # Agent personality/context
│   │   ├── project-manager.md
│   │   ├── creative-director.md
│   │   └── account-executive.md
│   └── /orchestration           # Multi-agent workflows
│       ├── brief-to-delivery.md
│       └── rfp-response.md
│
├── /procedures                  # How things are done
│   ├── /workflows               # Step-by-step processes
│   │   ├── video-production.md
│   │   ├── design-review.md
│   │   └── client-onboarding.md
│   ├── /policies                # Rules and constraints
│   │   ├── brand-guidelines.md
│   │   ├── approval-matrix.md
│   │   └── sla-definitions.md
│   └── /checklists              # Quality gates
│       ├── pre-shoot-checklist.md
│       ├── design-qa.md
│       └── delivery-prep.md
│
├── /playbooks                   # Situational guides
│   ├── /client-types            # Per-client-category strategies
│   │   ├── government.md
│   │   ├── enterprise.md
│   │   └── startup.md
│   ├── /crisis                  # Emergency procedures
│   │   ├── deadline-miss.md
│   │   ├── client-escalation.md
│   │   └── resource-shortage.md
│   └── /growth                  # Expansion playbooks
│       ├── new-client-pitch.md
│       └── service-expansion.md
│
├── /templates                   # Reusable content patterns
│   ├── /briefs                  # Brief templates by type
│   ├── /proposals               # Proposal structures
│   ├── /reports                 # Report formats
│   ├── /emails                  # Communication templates
│   └── /contracts               # Legal templates
│
├── /reference                   # Static reference material
│   ├── /clients                 # Client background docs
│   ├── /industry                # Industry knowledge
│   ├── /tools                   # Tool documentation
│   └── /glossary                # Terminology
│
└── /meta                        # System documentation
    ├── /api                     # API documentation
    ├── /schemas                 # Data schemas
    └── /changelog               # System changes
```

### Document Schema

Every knowledge document follows a structured format:

```typescript
interface KnowledgeDocument {
  // Identity
  id: string;                    // Unique identifier
  path: string;                  // Hierarchical path
  slug: string;                  // URL-friendly name

  // Metadata
  title: string;
  description: string;
  documentType: DocumentType;    // skill | procedure | playbook | template | reference

  // Categorization
  tags: string[];
  categories: string[];
  relatedDocuments: string[];    // Linked doc IDs

  // Content
  content: string;               // Markdown content
  frontmatter: Record<string, any>;  // YAML frontmatter

  // Agent metadata
  agentContext: {
    whenToUse: string;           // Conditions for agent to use this
    requiredInputs: string[];    // What the agent needs
    expectedOutputs: string[];   // What the agent produces
    permissions: string[];       // Required permissions
    examples: Example[];         // Usage examples
  };

  // Versioning
  version: number;
  versionHistory: Version[];

  // Access control
  visibility: 'public' | 'internal' | 'restricted';
  allowedRoles: PermissionLevel[];

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastEditedBy: string;

  // Status
  status: 'draft' | 'review' | 'approved' | 'published' | 'deprecated';
  effectiveDate?: Date;
  expirationDate?: Date;
}

type DocumentType =
  | 'skill'           // Agent capability
  | 'procedure'       // Step-by-step process
  | 'playbook'        // Situational guide
  | 'template'        // Reusable pattern
  | 'reference'       // Static information
  | 'policy'          // Rules/constraints
  | 'checklist'       // Quality gates
  | 'persona'         // Agent personality
  | 'orchestration';  // Multi-agent workflow
```

### Agent Skill Document Format

```markdown
---
id: skill_brief_creator
type: skill
version: 2.1
status: published
permissions:
  - brief:create
  - client:read
  - user:read
triggers:
  - event: client_request_submitted
  - event: manual_invocation
  - schedule: null
inputs:
  - client_context
  - request_details
  - available_resources
outputs:
  - draft_brief
  - resource_suggestions
  - timeline_estimate
dependencies:
  - skill_time_estimator
  - skill_resource_optimizer
---

# Brief Creator Skill

## Purpose
Transforms client requests into structured, actionable briefs with proper resource allocation and timeline estimates.

## When to Use
- Client submits a new request via portal
- Account manager initiates a new project
- RFP response requires brief breakdown

## Required Context
1. **Client Profile**: Industry, preferences, history, SLAs
2. **Request Details**: What they want, deadline, budget
3. **Resource State**: Team availability, skills, capacity

## Process

### Step 1: Analyze Request
- Extract key requirements from client input
- Identify brief type (VIDEO_SHOOT, DESIGN, etc.)
- Flag any ambiguities for human review

### Step 2: Match Resources
- Query available team members with required skills
- Consider workload and capacity
- Suggest primary and backup assignees

### Step 3: Estimate Timeline
- Use historical data for similar briefs
- Factor in client SLA requirements
- Build in review buffer time

### Step 4: Generate Brief
- Apply naming convention: `{Type}: {Client} – {Topic}`
- Populate all required fields
- Calculate quality score
- Set appropriate priority

## Output Format
```json
{
  "brief": {
    "title": "Shoot: CCAD – Annual Report",
    "type": "VIDEO_SHOOT",
    "clientId": "...",
    "formData": {...},
    "qualityScore": 85
  },
  "suggestions": {
    "assignee": { "primary": "...", "backup": "..." },
    "timeline": { "start": "...", "end": "..." },
    "warnings": []
  }
}
```

## Error Handling
- If client not found: Return error, suggest client creation
- If no resources available: Flag for manual assignment
- If deadline impossible: Suggest alternatives

## Examples

### Example 1: Standard Video Request
**Input**: Client CCAD requests "annual report video, 2 minutes, needed in 3 weeks"
**Output**: VIDEO_SHOOT brief with Sara (videographer) assigned, 15 business days timeline

### Example 2: Rush Design Request
**Input**: Client DET needs "social graphics for campaign launch tomorrow"
**Output**: DESIGN brief marked URGENT, Ahmed assigned with overtime flag

## Metrics
- Success rate: 94%
- Average processing time: 2.3 seconds
- Human override rate: 12%

## Changelog
- v2.1: Added resource optimization integration
- v2.0: Refactored for multi-agent orchestration
- v1.0: Initial release
```

---

## Part 2: Content Architecture

### Content as Work Product

Unlike traditional CMS where content is for publishing, here **content IS the work**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT LIFECYCLE                             │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  INPUT   │───▶│ PROCESS  │───▶│  OUTPUT  │───▶│ DELIVERY │  │
│  │          │    │          │    │          │    │          │  │
│  │ - Brief  │    │ - Create │    │ - Draft  │    │ - Review │  │
│  │ - Request│    │ - Edit   │    │ - Final  │    │ - Approve│  │
│  │ - Idea   │    │ - Refine │    │ - Export │    │ - Publish│  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │               │               │               │         │
│       ▼               ▼               ▼               ▼         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   VERSION CONTROL                            ││
│  │  Every state captured, diffable, restorable                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Content Types Matrix

| Category | Type | Purpose | Workflow | Client Visible |
|----------|------|---------|----------|----------------|
| **Work Input** | Brief | What needs to be done | Draft→Approved→Active | Via Portal |
| **Work Input** | ClientRequest | Raw client ask | Submitted→Converted | Yes |
| **Work Output** | Deliverable | The actual work | Draft→Review→Final | Yes |
| **Work Output** | Revision | Iteration on work | Created→Applied | Yes |
| **Business** | Proposal | Pitch/RFP response | Draft→Review→Sent | Yes |
| **Business** | Report | Analytics/insights | Generated→Reviewed | Yes |
| **Business** | Contract | Legal agreements | Draft→Legal→Signed | Yes |
| **Internal** | Procedure | How to do things | Draft→Approved→Active | No |
| **Internal** | Playbook | Situational guides | Draft→Approved→Active | No |
| **Internal** | Template | Reusable patterns | Draft→Approved→Active | No |
| **Agent** | Skill | Agent capabilities | Draft→Tested→Active | No |
| **Agent** | Persona | Agent context | Draft→Approved→Active | No |

### Deliverable Architecture

Deliverables are the core work product:

```typescript
interface Deliverable {
  id: string;
  organizationId: string;

  // Relationship to brief
  briefId: string;
  brief: Brief;

  // Identity
  title: string;
  type: DeliverableType;
  version: number;

  // Content (polymorphic based on type)
  content: DeliverableContent;

  // Files
  files: DeliverableFile[];
  primaryFile?: File;  // The main asset
  supportingFiles: File[];  // Source files, extras

  // Status
  status: DeliverableStatus;

  // Review & Approval
  internalReviewStatus: ReviewStatus;
  internalReviewedBy?: User;
  internalReviewedAt?: Date;
  internalFeedback?: string;

  clientReviewStatus: ReviewStatus;
  clientReviewedBy?: ClientPortalUser;
  clientReviewedAt?: Date;
  clientFeedback?: string;

  // Revisions
  revisionNumber: number;
  parentDeliverableId?: string;  // If this is a revision
  revisions: Deliverable[];      // Child revisions

  // Metadata
  createdAt: Date;
  createdBy: User;
  submittedAt?: Date;
  approvedAt?: Date;

  // AI metadata
  aiGenerated: boolean;
  aiAssisted: boolean;
  aiMetadata?: {
    model: string;
    prompt?: string;
    confidence?: number;
  };
}

type DeliverableType =
  | 'video'
  | 'image'
  | 'document'
  | 'presentation'
  | 'design_file'
  | 'copy'
  | 'report'
  | 'code'
  | 'other';

type DeliverableStatus =
  | 'draft'
  | 'in_progress'
  | 'internal_review'
  | 'revision_needed'
  | 'ready_for_client'
  | 'client_review'
  | 'client_revision'
  | 'approved'
  | 'delivered'
  | 'archived';

interface DeliverableContent {
  // For text-based deliverables
  text?: string;
  richText?: string;  // HTML/Markdown

  // For structured deliverables
  structured?: Record<string, any>;

  // For file-based deliverables
  fileReference?: string;

  // Metadata
  wordCount?: number;
  characterCount?: number;
  pageCount?: number;
  duration?: number;  // For video/audio
  dimensions?: { width: number; height: number };
}
```

---

## Part 3: Database Schema

```prisma
// ============================================
// KNOWLEDGE MANAGEMENT
// ============================================

model KnowledgeDocument {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Identity
  path            String              // e.g., "/agents/skills/brief-creator"
  slug            String
  title           String
  description     String?

  // Type & Classification
  documentType    DocumentType
  categories      String[]
  tags            String[]

  // Content
  content         String   @db.Text    // Markdown content
  frontmatter     Json                 // Parsed YAML frontmatter

  // Agent metadata (for skill/persona/orchestration docs)
  agentMetadata   Json?               // whenToUse, inputs, outputs, etc.

  // Relationships
  parentId        String?
  parent          KnowledgeDocument?  @relation("DocumentHierarchy", fields: [parentId], references: [id])
  children        KnowledgeDocument[] @relation("DocumentHierarchy")

  relatedDocIds   String[]
  relatedDocs     KnowledgeDocument[] @relation("RelatedDocuments")
  relatedTo       KnowledgeDocument[] @relation("RelatedDocuments")

  // Versioning
  version         Int      @default(1)
  isLatest        Boolean  @default(true)
  previousVersionId String?

  // Status & Lifecycle
  status          DocumentStatus @default(DRAFT)
  effectiveDate   DateTime?
  expirationDate  DateTime?

  // Access Control
  visibility      Visibility @default(INTERNAL)
  allowedRoles    PermissionLevel[]

  // Audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdById     String
  createdBy       User     @relation("DocCreator", fields: [createdById], references: [id])
  lastEditedById  String?
  lastEditedBy    User?    @relation("DocEditor", fields: [lastEditedById], references: [id])

  // Relations
  versions        DocumentVersion[]
  embeddings      DocumentEmbedding[]
  usageLog        DocumentUsage[]

  @@unique([organizationId, path])
  @@index([organizationId, documentType])
  @@index([organizationId, status])
  @@index([tags])
}

enum DocumentType {
  SKILL
  PERSONA
  ORCHESTRATION
  PROCEDURE
  POLICY
  CHECKLIST
  PLAYBOOK
  TEMPLATE
  REFERENCE
  META
}

enum DocumentStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  PUBLISHED
  DEPRECATED
  ARCHIVED
}

enum Visibility {
  PUBLIC      // Visible to clients via portal
  INTERNAL    // All org members
  RESTRICTED  // Specific roles only
  PRIVATE     // Owner only
}

// Version history with full content snapshot
model DocumentVersion {
  id              String   @id @default(cuid())

  documentId      String
  document        KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  version         Int
  content         String   @db.Text
  frontmatter     Json

  changeLog       String?
  changedSections String[]

  createdAt       DateTime @default(now())
  createdById     String
  createdBy       User     @relation(fields: [createdById], references: [id])

  @@unique([documentId, version])
  @@index([documentId])
}

// Vector embeddings for semantic search & agent context
model DocumentEmbedding {
  id              String   @id @default(cuid())

  documentId      String
  document        KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  chunkIndex      Int                 // For chunked documents
  chunkText       String   @db.Text
  embedding       Float[]             // Vector embedding

  model           String              // Embedding model used
  createdAt       DateTime @default(now())

  @@unique([documentId, chunkIndex])
  @@index([documentId])
}

// Track how documents are used by agents
model DocumentUsage {
  id              String   @id @default(cuid())

  documentId      String
  document        KnowledgeDocument @relation(fields: [documentId], references: [id])

  usedAt          DateTime @default(now())
  usedBy          String              // Agent ID or user ID
  usageType       String              // 'agent_context', 'user_reference', 'api_fetch'

  // Context about usage
  sessionId       String?
  entityType      String?             // What entity triggered this
  entityId        String?

  // Feedback
  wasHelpful      Boolean?
  feedback        String?

  @@index([documentId])
  @@index([usedAt])
}

// ============================================
// DELIVERABLES & WORK OUTPUT
// ============================================

model Deliverable {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Relationship
  briefId         String
  brief           Brief    @relation(fields: [briefId], references: [id])

  projectId       String?
  project         Project? @relation(fields: [projectId], references: [id])

  // Identity
  title           String
  description     String?
  type            DeliverableType

  // Version tracking
  version         Int      @default(1)
  revisionNumber  Int      @default(0)
  parentDeliverableId String?
  parentDeliverable Deliverable? @relation("DeliverableRevisions", fields: [parentDeliverableId], references: [id])
  revisions       Deliverable[] @relation("DeliverableRevisions")

  // Content
  content         Json?               // Structured content
  textContent     String?  @db.Text   // Text-based content

  // Status & Workflow
  status          DeliverableStatus @default(DRAFT)

  // Internal Review
  internalReviewStatus ReviewStatus @default(PENDING)
  internalReviewerId   String?
  internalReviewer     User?    @relation("InternalReviewer", fields: [internalReviewerId], references: [id])
  internalReviewedAt   DateTime?
  internalFeedback     String?

  // Client Review
  clientReviewStatus   ReviewStatus @default(PENDING)
  clientReviewerId     String?
  clientReviewer       ClientPortalUser? @relation(fields: [clientReviewerId], references: [id])
  clientReviewedAt     DateTime?
  clientFeedback       String?

  // Files
  primaryFileId   String?
  primaryFile     File?    @relation("PrimaryDeliverableFile", fields: [primaryFileId], references: [id])

  // AI metadata
  aiGenerated     Boolean  @default(false)
  aiAssisted      Boolean  @default(false)
  aiMetadata      Json?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  submittedAt     DateTime?
  approvedAt      DateTime?
  deliveredAt     DateTime?

  // Audit
  createdById     String
  createdBy       User     @relation("DeliverableCreator", fields: [createdById], references: [id])

  // Relations
  files           DeliverableFile[]
  comments        DeliverableComment[]
  history         DeliverableHistory[]

  @@index([organizationId, briefId])
  @@index([status])
}

enum DeliverableType {
  VIDEO
  IMAGE
  DOCUMENT
  PRESENTATION
  DESIGN_FILE
  COPY
  REPORT
  CODE
  AUDIO
  OTHER
}

enum DeliverableStatus {
  DRAFT
  IN_PROGRESS
  INTERNAL_REVIEW
  REVISION_NEEDED
  READY_FOR_CLIENT
  CLIENT_REVIEW
  CLIENT_REVISION
  APPROVED
  DELIVERED
  ARCHIVED
}

enum ReviewStatus {
  PENDING
  IN_PROGRESS
  APPROVED
  REJECTED
  REVISION_REQUESTED
}

model DeliverableFile {
  id              String   @id @default(cuid())

  deliverableId   String
  deliverable     Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  fileId          String
  file            File     @relation(fields: [fileId], references: [id])

  role            FileRole @default(ASSET)
  order           Int      @default(0)

  @@index([deliverableId])
}

enum FileRole {
  PRIMARY         // The main deliverable file
  SOURCE          // Source/working files
  REFERENCE       // Reference material
  ASSET           // Supporting assets
  PREVIEW         // Preview/thumbnail
}

model DeliverableComment {
  id              String   @id @default(cuid())

  deliverableId   String
  deliverable     Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  content         String

  // For inline/annotation comments
  annotationType  String?             // 'text', 'region', 'timestamp'
  annotationData  Json?               // Selection/region/timestamp data

  // Resolution
  isResolved      Boolean  @default(false)
  resolvedAt      DateTime?
  resolvedById    String?

  // Author (internal or client)
  authorType      String              // 'user' or 'client'
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  clientUserId    String?
  clientUser      ClientPortalUser? @relation(fields: [clientUserId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([deliverableId])
}

model DeliverableHistory {
  id              String   @id @default(cuid())

  deliverableId   String
  deliverable     Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  action          String              // 'created', 'submitted', 'reviewed', 'revised', etc.
  fromStatus      DeliverableStatus?
  toStatus        DeliverableStatus?

  metadata        Json?

  performedAt     DateTime @default(now())
  performedById   String
  performedBy     User     @relation(fields: [performedById], references: [id])

  @@index([deliverableId])
}

// ============================================
// AGENT INFRASTRUCTURE
// ============================================

model AgentSkill {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Identity
  slug            String              // e.g., "brief-creator"
  name            String
  description     String

  // Documentation link
  documentId      String?             // Links to KnowledgeDocument
  document        KnowledgeDocument? @relation("SkillDocument", fields: [documentId], references: [id])

  // Capability definition
  category        SkillCategory
  triggers        Json                // Events/conditions that invoke this skill
  inputs          Json                // Required inputs
  outputs         Json                // Expected outputs

  // Dependencies
  dependsOn       String[]            // Other skill slugs this depends on

  // Configuration
  config          Json?               // Runtime configuration
  isEnabled       Boolean  @default(true)

  // Permissions
  requiredPermissions String[]

  // Metrics
  invocationCount Int      @default(0)
  successRate     Float?
  avgLatencyMs    Int?
  lastInvokedAt   DateTime?

  // Audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  version         String   @default("1.0.0")

  // Relations
  invocations     AgentInvocation[]

  @@unique([organizationId, slug])
  @@index([organizationId, category])
}

enum SkillCategory {
  CONTENT_CREATION    // Creates content
  CONTENT_ANALYSIS    // Analyzes content
  WORKFLOW            // Manages workflows
  COMMUNICATION       // Handles communication
  DATA_PROCESSING     // Processes data
  DECISION            // Makes decisions
  INTEGRATION         // External integrations
  UTILITY             // Helper functions
}

model AgentPersona {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  slug            String
  name            String
  description     String

  // Persona definition
  systemPrompt    String   @db.Text   // Base system prompt
  personality     Json                // Tone, style, preferences
  expertise       String[]            // Areas of expertise
  constraints     String[]            // Things this persona should NOT do

  // Skills this persona can use
  allowedSkills   String[]            // Skill slugs

  // Documentation
  documentId      String?
  document        KnowledgeDocument? @relation("PersonaDocument", fields: [documentId], references: [id])

  isEnabled       Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, slug])
}

model AgentInvocation {
  id              String   @id @default(cuid())
  organizationId  String

  // What was invoked
  skillId         String?
  skill           AgentSkill? @relation(fields: [skillId], references: [id])

  personaId       String?

  // Context
  triggeredBy     String              // 'event', 'schedule', 'manual', 'agent'
  triggerEvent    String?             // Event type if triggered by event
  sessionId       String?

  // Entity context
  entityType      String?
  entityId        String?

  // Execution
  input           Json
  output          Json?

  status          InvocationStatus @default(PENDING)
  error           String?

  // Timing
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  durationMs      Int?

  // Token usage (for LLM calls)
  inputTokens     Int?
  outputTokens    Int?

  // User attribution
  initiatedById   String?

  @@index([organizationId, skillId])
  @@index([status])
  @@index([startedAt])
}

enum InvocationStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

// ============================================
// CONTENT TEMPLATES
// ============================================

model ContentTemplate {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Identity
  slug            String
  name            String
  description     String?

  // Classification
  category        TemplateCategory
  type            String              // Sub-type within category

  // Template content
  structure       Json                // Template structure/schema
  defaultContent  Json?               // Default values
  placeholders    Json?               // Dynamic placeholders

  // Rendering
  outputFormat    String              // 'markdown', 'html', 'pdf', 'docx'
  template        String?  @db.Text   // Template string (handlebars, etc.)

  // Usage
  useCount        Int      @default(0)

  // Status
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, slug])
  @@index([organizationId, category])
}

enum TemplateCategory {
  BRIEF
  PROPOSAL
  REPORT
  EMAIL
  CONTRACT
  PRESENTATION
  SOCIAL_POST
  SCRIPT
  OTHER
}

// ============================================
// CONTENT EVENTS & TRIGGERS
// ============================================

model ContentEvent {
  id              String   @id @default(cuid())
  organizationId  String

  // Event identity
  eventType       String              // e.g., 'brief.created', 'deliverable.approved'

  // Source
  sourceType      String              // 'brief', 'deliverable', 'document', etc.
  sourceId        String

  // Event data
  payload         Json

  // Processing
  processedAt     DateTime?
  processingError String?

  // Triggers fired
  triggersExecuted Int     @default(0)

  createdAt       DateTime @default(now())

  @@index([organizationId, eventType])
  @@index([createdAt])
}

model ContentTrigger {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  name            String
  description     String?

  // Trigger condition
  eventType       String              // Event to listen for
  conditions      Json?               // Additional conditions

  // Action
  actionType      String              // 'invoke_skill', 'webhook', 'notification', 'workflow'
  actionConfig    Json                // Action-specific config

  // Status
  isEnabled       Boolean  @default(true)

  // Metrics
  executionCount  Int      @default(0)
  lastExecutedAt  DateTime?
  lastError       String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([organizationId, eventType])
}
```

---

## Part 4: Agent Integration Architecture

### Skill Registry

The skill registry is the central hub for agent capabilities:

```typescript
// /src/lib/agents/skill-registry.ts

interface SkillRegistry {
  // Load all skills from database + knowledge docs
  loadSkills(): Promise<void>;

  // Get skill by slug
  getSkill(slug: string): Skill | undefined;

  // Find skills that match a trigger
  findSkillsForTrigger(event: ContentEvent): Skill[];

  // Invoke a skill
  invoke(skillSlug: string, input: SkillInput): Promise<SkillOutput>;

  // Get context documents for a skill
  getSkillContext(skillSlug: string): Promise<KnowledgeDocument[]>;
}

interface Skill {
  slug: string;
  name: string;
  category: SkillCategory;

  // The actual implementation
  execute: (input: SkillInput, context: SkillContext) => Promise<SkillOutput>;

  // Metadata from knowledge doc
  documentation: string;
  examples: Example[];

  // Runtime config
  triggers: TriggerConfig[];
  permissions: string[];
  dependencies: string[];
}

interface SkillContext {
  organization: Organization;
  user?: User;
  session?: AgentSession;

  // Injected knowledge
  relevantDocs: KnowledgeDocument[];

  // Entity context
  entity?: {
    type: string;
    id: string;
    data: Record<string, any>;
  };

  // Services
  db: PrismaClient;
  notify: NotificationService;
  files: FileService;
}
```

### Context Injection

Agents receive contextual knowledge automatically:

```typescript
// /src/lib/agents/context-injector.ts

class ContextInjector {
  // Build context for a skill invocation
  async buildContext(
    skillSlug: string,
    entityType?: string,
    entityId?: string
  ): Promise<SkillContext> {
    // 1. Get skill's required documents
    const skillDoc = await this.getSkillDocument(skillSlug);

    // 2. Get related procedures/playbooks
    const relatedDocs = await this.getRelatedDocs(skillDoc);

    // 3. Get entity-specific context
    const entityDocs = entityType
      ? await this.getEntityDocs(entityType, entityId)
      : [];

    // 4. Semantic search for relevant knowledge
    const semanticDocs = await this.semanticSearch(
      skillDoc.agentMetadata.whenToUse,
      { limit: 5 }
    );

    // 5. Combine and deduplicate
    return {
      relevantDocs: this.rankAndDedupe([
        skillDoc,
        ...relatedDocs,
        ...entityDocs,
        ...semanticDocs
      ]),
      // ... other context
    };
  }

  // Semantic search across knowledge base
  async semanticSearch(
    query: string,
    options: { limit: number; documentTypes?: DocumentType[] }
  ): Promise<KnowledgeDocument[]> {
    // Use vector embeddings for semantic search
    const embedding = await this.embedder.embed(query);

    return db.$queryRaw`
      SELECT d.*,
             1 - (e.embedding <=> ${embedding}::vector) as similarity
      FROM "DocumentEmbedding" e
      JOIN "KnowledgeDocument" d ON d.id = e."documentId"
      WHERE d."organizationId" = ${this.orgId}
        AND d.status = 'PUBLISHED'
      ORDER BY e.embedding <=> ${embedding}::vector
      LIMIT ${options.limit}
    `;
  }
}
```

### Event-Driven Orchestration

Content events trigger agent actions:

```typescript
// /src/lib/agents/event-processor.ts

class ContentEventProcessor {
  async process(event: ContentEvent) {
    // 1. Find triggers that match this event
    const triggers = await db.contentTrigger.findMany({
      where: {
        organizationId: event.organizationId,
        eventType: event.eventType,
        isEnabled: true
      }
    });

    // 2. Evaluate conditions
    const matchingTriggers = triggers.filter(t =>
      this.evaluateConditions(t.conditions, event.payload)
    );

    // 3. Execute actions
    for (const trigger of matchingTriggers) {
      try {
        await this.executeAction(trigger, event);

        await db.contentTrigger.update({
          where: { id: trigger.id },
          data: {
            executionCount: { increment: 1 },
            lastExecutedAt: new Date()
          }
        });
      } catch (error) {
        await db.contentTrigger.update({
          where: { id: trigger.id },
          data: { lastError: error.message }
        });
      }
    }
  }

  private async executeAction(trigger: ContentTrigger, event: ContentEvent) {
    switch (trigger.actionType) {
      case 'invoke_skill':
        return this.skillRegistry.invoke(
          trigger.actionConfig.skillSlug,
          { event, ...trigger.actionConfig.input }
        );

      case 'notification':
        return this.notificationService.send(
          trigger.actionConfig.notification
        );

      case 'webhook':
        return this.webhookService.send(
          trigger.actionConfig.url,
          event
        );

      case 'workflow':
        return this.workflowEngine.start(
          trigger.actionConfig.workflowId,
          event.payload
        );
    }
  }
}
```

---

## Part 5: Module Structure

```
/src/modules/content-engine/
├── CLAUDE.md                       # Module documentation
│
├── /knowledge                      # Knowledge management
│   ├── actions/
│   │   ├── documents.ts           # CRUD for knowledge docs
│   │   ├── versions.ts            # Version management
│   │   ├── embeddings.ts          # Vector embedding management
│   │   └── search.ts              # Semantic + full-text search
│   ├── components/
│   │   ├── DocumentEditor.tsx     # Markdown editor with frontmatter
│   │   ├── DocumentTree.tsx       # Hierarchical navigation
│   │   ├── DocumentViewer.tsx     # Rendered view
│   │   └── SearchInterface.tsx    # Search UI
│   └── lib/
│       ├── parser.ts              # Frontmatter + markdown parsing
│       └── embedder.ts            # Embedding generation
│
├── /deliverables                   # Work output management
│   ├── actions/
│   │   ├── deliverables.ts        # CRUD
│   │   ├── reviews.ts             # Internal/client review
│   │   ├── revisions.ts           # Revision management
│   │   └── delivery.ts            # Final delivery actions
│   ├── components/
│   │   ├── DeliverableEditor.tsx
│   │   ├── DeliverableViewer.tsx
│   │   ├── ReviewPanel.tsx
│   │   ├── RevisionHistory.tsx
│   │   └── DeliveryConfirmation.tsx
│   └── lib/
│       └── diff.ts                # Content diffing
│
├── /templates                      # Content templates
│   ├── actions/
│   │   ├── templates.ts           # CRUD
│   │   └── render.ts              # Template rendering
│   ├── components/
│   │   ├── TemplateEditor.tsx
│   │   ├── TemplateSelector.tsx
│   │   └── TemplatePreview.tsx
│   └── lib/
│       └── renderer.ts            # Handlebars/etc rendering
│
├── /agents                         # Agent infrastructure
│   ├── registry/
│   │   ├── skill-registry.ts
│   │   └── persona-registry.ts
│   ├── context/
│   │   ├── context-injector.ts
│   │   └── context-builder.ts
│   ├── execution/
│   │   ├── skill-executor.ts
│   │   └── invocation-logger.ts
│   └── triggers/
│       ├── event-processor.ts
│       └── trigger-evaluator.ts
│
├── /events                         # Event system
│   ├── emitter.ts                 # Event emission
│   ├── handlers.ts                # Event handlers
│   └── types.ts                   # Event type definitions
│
└── types.ts                        # Shared types
```

---

## Part 6: API Design

### Knowledge API

```
/api/v1/knowledge

# Documents
GET    /documents                    # List/search documents
POST   /documents                    # Create document
GET    /documents/:path              # Get by path
PUT    /documents/:path              # Update document
DELETE /documents/:path              # Delete/archive

# Search
POST   /search                       # Full-text + semantic search
POST   /search/semantic              # Pure semantic search

# Versions
GET    /documents/:path/versions     # Version history
GET    /documents/:path/versions/:v  # Specific version
POST   /documents/:path/revert/:v    # Revert to version

# Agent context
POST   /context/build                # Build context for skill
```

### Deliverables API

```
/api/v1/deliverables

# CRUD
GET    /                             # List deliverables
POST   /                             # Create deliverable
GET    /:id                          # Get deliverable
PUT    /:id                          # Update deliverable

# Workflow
POST   /:id/submit                   # Submit for review
POST   /:id/review                   # Internal review
POST   /:id/client-submit            # Submit to client
POST   /:id/revise                   # Create revision
POST   /:id/approve                  # Final approval
POST   /:id/deliver                  # Mark delivered

# Files
POST   /:id/files                    # Add files
DELETE /:id/files/:fileId            # Remove file

# Comments
GET    /:id/comments                 # List comments
POST   /:id/comments                 # Add comment
PUT    /:id/comments/:commentId      # Update/resolve
```

### Agent API

```
/api/v1/agents

# Skills
GET    /skills                       # List skills
GET    /skills/:slug                 # Get skill details
POST   /skills/:slug/invoke          # Invoke skill

# Personas
GET    /personas                     # List personas
GET    /personas/:slug               # Get persona

# Invocations
GET    /invocations                  # List invocations
GET    /invocations/:id              # Get invocation details

# Triggers
GET    /triggers                     # List triggers
POST   /triggers                     # Create trigger
PUT    /triggers/:id                 # Update trigger
DELETE /triggers/:id                 # Delete trigger
```

---

## Part 7: Client Portal Integration

### Client-Visible Content

```typescript
// What clients can see in the portal

interface ClientContentAccess {
  // Deliverables for their briefs
  deliverables: {
    list: true,                      // See all deliverables for their briefs
    view: true,                      // View deliverable details
    comment: true,                   // Add feedback
    approve: true,                   // Approve deliverables
    requestRevision: true,           // Request changes
    download: true                   // Download files
  };

  // Knowledge (public docs only)
  knowledge: {
    publicDocs: true,                // View public knowledge docs
    search: 'public_only'            // Search public docs
  };

  // Templates (none)
  templates: false;

  // Agent interaction
  agents: {
    chatWithPortalAssistant: true,   // AI assistant in portal
    requestBrief: true               // AI-assisted brief creation
  };
}
```

### Portal Content Flow

```
Client Request (via Portal)
       │
       ▼
   ┌───────────────────────────────────────────┐
   │  AI Agent: Intake Processor               │
   │  - Analyzes request                       │
   │  - Suggests brief type                    │
   │  - Estimates timeline                     │
   └───────────────────────────────────────────┘
       │
       ▼
   Brief Created (linked to client)
       │
       ▼
   Work Happens (internal)
       │
       ▼
   Deliverable Created
       │
       ▼
   ┌───────────────────────────────────────────┐
   │  Internal Review                          │
   │  - Team lead reviews                      │
   │  - QA checks                             │
   │  - AI quality scoring                     │
   └───────────────────────────────────────────┘
       │
       ▼
   Submitted to Client Portal
       │
       ▼
   ┌───────────────────────────────────────────┐
   │  Client Review                            │
   │  - Views deliverable                      │
   │  - Downloads files                        │
   │  - Adds comments                          │
   │  - Approves OR requests revision          │
   └───────────────────────────────────────────┘
       │
       ├──────────────────────┐
       ▼                      ▼
   APPROVED              REVISION REQUESTED
       │                      │
       ▼                      ▼
   Delivered             New Revision Created
                              │
                              └──▶ (Back to work)
```

---

## Part 8: Implementation Phases

### Phase 12.1: Knowledge Foundation (2-3 weeks)
- [ ] KnowledgeDocument schema + CRUD
- [ ] Document versioning
- [ ] Hierarchical document structure
- [ ] Basic markdown editor with frontmatter
- [ ] Document status workflow

### Phase 12.2: Agent Infrastructure (2-3 weeks)
- [ ] AgentSkill schema + registry
- [ ] AgentPersona schema + registry
- [ ] Skill invocation system
- [ ] Context injection framework
- [ ] Invocation logging

### Phase 12.3: Deliverables System (2-3 weeks)
- [ ] Deliverable schema + CRUD
- [ ] Internal review workflow
- [ ] Client review workflow
- [ ] Revision management
- [ ] File attachments

### Phase 12.4: Event System (1-2 weeks)
- [ ] Content events emission
- [ ] Trigger system
- [ ] Event-to-skill routing
- [ ] Event history

### Phase 12.5: Semantic Search (1-2 weeks)
- [ ] Vector embeddings generation
- [ ] Semantic search API
- [ ] Hybrid search (semantic + full-text)
- [ ] Context-aware search

### Phase 12.6: Templates & Rendering (1-2 weeks)
- [ ] Template schema + CRUD
- [ ] Template editor
- [ ] Dynamic rendering
- [ ] Export to PDF/DOCX

### Phase 12.7: Portal Integration (1-2 weeks)
- [ ] Client deliverable views
- [ ] Client review/approval UI
- [ ] Client commenting
- [ ] Public knowledge access

### Phase 12.8: Agent Skills (Ongoing)
- [ ] Brief Creator skill
- [ ] Quality Scorer skill
- [ ] Time Estimator skill
- [ ] Resource Optimizer skill
- [ ] Client Communicator skill
- [ ] Report Generator skill
- [ ] ... (dozens more)

---

## Part 9: Success Metrics

### Knowledge System
- Document count & coverage
- Agent document usage rate
- Search relevance scores
- Time to find information

### Deliverables
- Time from brief to deliverable
- Revision rate
- Client approval rate
- First-time approval rate

### Agent Performance
- Skill invocation success rate
- Average latency
- Human override rate
- Token efficiency

### Business Impact
- Brief creation time (human vs AI-assisted)
- Resource utilization improvement
- Client satisfaction (NPS)
- Revenue per employee

---

## Summary

This Content Engine is the **nervous system** of the platform:

1. **Knowledge Layer** - The agent's brain (skills, procedures, playbooks)
2. **Content Layer** - The work itself (briefs, deliverables, proposals)
3. **Delivery Layer** - How work reaches clients (portal, approvals, exports)
4. **Agent Layer** - Intelligence that acts on content (skills, triggers, automation)

Every piece of content is:
- **Versioned** - Full history, diffable, restorable
- **Searchable** - Full-text + semantic search
- **Triggerable** - Events fire when content changes
- **Agent-Accessible** - Structured for AI consumption
- **Workflow-Driven** - Status transitions with approvals
- **Client-Deliverable** - Portal-ready when appropriate

This is the foundation for hundreds of AI skills and thousands of knowledge documents that will drive career and business-altering results.
