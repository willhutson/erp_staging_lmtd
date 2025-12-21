# Enterprise Content Engine: Unified Database Schema

**Version:** 2.0
**Date:** December 2024
**Status:** Master Technical Specification
**Depends On:** Phases 1-11 (Core Platform)

---

## Executive Summary

This is the **unified schema** for the Enterprise Content Engine - combining the operational layer (CMS, DAM, Analytics, CRM) with the agent intelligence layer (Knowledge, Skills, Personas, Triggers).

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE CONTENT ENGINE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                     AGENT INTELLIGENCE LAYER                                ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           ││
│  │  │ Knowledge   │ │ Agent       │ │ Skill       │ │ Triggers    │           ││
│  │  │ Documents   │ │ Skills      │ │ Invocations │ │ & Events    │           ││
│  │  │ (Brain)     │ │ (Abilities) │ │ (Actions)   │ │ (Routing)   │           ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                    AGENTS READ ────────────── AGENTS ACT ON                     │
│                                    │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                     OPERATIONAL LAYER                                        ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           ││
│  │  │    CMS      │ │    DAM      │ │  Analytics  │ │    CRM      │           ││
│  │  │ Publishing  │ │   Assets    │ │  Reporting  │ │  Pipeline   │           ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                    │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                     WORK OUTPUT LAYER                                        ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           ││
│  │  │ Deliverables│ │  Reviews    │ │  Revisions  │ │   Export    │           ││
│  │  │ (Output)    │ │ (Approval)  │ │ (Iteration) │ │ (Delivery)  │           ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                    │                                             │
│                    ┌───────────────┴───────────────┐                            │
│                    │      CORE PLATFORM (Existing) │                            │
│                    │  • Organizations  • Users     │                            │
│                    │  • Clients        • Projects  │                            │
│                    │  • Files          • Briefs    │                            │
│                    └───────────────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### What Makes This "Enterprise Content Engine"

| Layer | Purpose | Key Models |
|-------|---------|------------|
| **Agent Intelligence** | The brain - skills, knowledge docs, personas | `KnowledgeDocument`, `AgentSkill`, `AgentPersona` |
| **Operational** | The muscles - content, assets, analytics, relationships | `ContentEntry`, `Asset`, `MediaCampaign`, `CRMDeal` |
| **Work Output** | The deliverables - what clients receive | `Deliverable`, `DeliverableReview`, `DeliverableRevision` |
| **Core Platform** | The foundation - users, clients, projects, briefs | Existing Phase 1-11 models |

---

## Table of Contents

### Part 1: Agent Intelligence Layer (NEW)
1. [Knowledge Documents](#1-knowledge-documents)
2. [Agent Skills & Personas](#2-agent-skills--personas)
3. [Triggers & Events](#3-triggers--events)
4. [Invocation Logging](#4-invocation-logging)

### Part 2: Operational Layer (FROM YOUR SCHEMA)
5. [Content Management System (CMS)](#5-content-management-system-cms)
6. [Creative Document Store (DAM)](#6-creative-document-store-dam)
7. [Analytics Suite](#7-analytics-suite)
8. [Enhanced CRM](#8-enhanced-crm)

### Part 3: Work Output Layer (NEW)
9. [Deliverables System](#9-deliverables-system)

### Part 4: Integration
10. [Cross-System Integrations](#10-cross-system-integrations)
11. [Implementation Priority](#11-implementation-priority)

---

# PART 1: AGENT INTELLIGENCE LAYER

The brain of the platform. This is what makes the system intelligent.

---

## 1. Knowledge Documents

Structured markdown documents that agents read to understand context, procedures, and capabilities.

```prisma
// ============================================
// KNOWLEDGE MANAGEMENT
// ============================================

// The core knowledge document - what agents read
model KnowledgeDocument {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Hierarchical path: "/agents/skills/brief-creator"
  path            String
  slug            String
  title           String
  description     String?

  // Document classification
  documentType    DocumentType

  // Content (Markdown with YAML frontmatter)
  content         String   @db.Text
  frontmatter     Json     // Parsed YAML frontmatter

  // Agent-specific metadata (for SKILL, PERSONA, ORCHESTRATION types)
  agentMetadata   Json?
  // Example for SKILL:
  // {
  //   "whenToUse": "When client submits a brief request via portal",
  //   "requiredInputs": ["client_context", "request_details", "available_resources"],
  //   "expectedOutputs": ["draft_brief", "resource_suggestions", "timeline_estimate"],
  //   "permissions": ["brief:create", "client:read", "user:read"],
  //   "dependencies": ["skill_time_estimator", "skill_resource_optimizer"]
  // }

  // Hierarchy
  parentId        String?
  parent          KnowledgeDocument? @relation("DocHierarchy", fields: [parentId], references: [id])
  children        KnowledgeDocument[] @relation("DocHierarchy")

  // Related documents
  relatedDocIds   String[]

  // Versioning
  version         Int      @default(1)
  isLatest        Boolean  @default(true)
  previousVersionId String?

  // Status & lifecycle
  status          DocumentStatus @default(DRAFT)
  effectiveDate   DateTime?      // When this becomes active
  expirationDate  DateTime?      // When this expires

  // Access control
  visibility      Visibility @default(INTERNAL)
  allowedRoles    String[]       // PermissionLevel values

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

  // Linked skills/personas
  linkedSkill     AgentSkill?   @relation("SkillDocument")
  linkedPersona   AgentPersona? @relation("PersonaDocument")

  @@unique([organizationId, path])
  @@index([organizationId, documentType])
  @@index([organizationId, status])
  @@index([tags])
  @@map("knowledge_documents")
}

enum DocumentType {
  // Agent capability docs
  SKILL           // Individual agent capability
  PERSONA         // Agent personality/context definition
  ORCHESTRATION   // Multi-agent workflow definition

  // Process docs
  PROCEDURE       // Step-by-step process (SOPs)
  POLICY          // Rules and constraints
  CHECKLIST       // Quality gates

  // Reference docs
  PLAYBOOK        // Situational guides (crisis, client types)
  TEMPLATE        // Reusable content patterns
  REFERENCE       // Static information (glossary, tools)

  // Meta docs
  META            // System documentation (API, schemas)
}

enum DocumentStatus {
  DRAFT           // Being written
  IN_REVIEW       // Submitted for approval
  APPROVED        // Ready but not active
  PUBLISHED       // Active and in use
  DEPRECATED      // Being phased out
  ARCHIVED        // No longer active
}

enum Visibility {
  PUBLIC          // Visible to clients via portal
  INTERNAL        // All team members
  RESTRICTED      // Specific roles only
  PRIVATE         // Owner only
}

// Full snapshot versioning
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
  @@map("document_versions")
}

// Vector embeddings for semantic search
model DocumentEmbedding {
  id              String   @id @default(cuid())

  documentId      String
  document        KnowledgeDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  chunkIndex      Int                 // For chunked documents
  chunkText       String   @db.Text
  embedding       Unsupported("vector(1536)")  // pgvector

  model           String              // "text-embedding-3-small"
  createdAt       DateTime @default(now())

  @@unique([documentId, chunkIndex])
  @@index([documentId])
  @@map("document_embeddings")
}

// Track how documents are used by agents and humans
model DocumentUsage {
  id              String   @id @default(cuid())

  documentId      String
  document        KnowledgeDocument @relation(fields: [documentId], references: [id])

  usedAt          DateTime @default(now())
  usedBy          String              // Agent slug or user ID
  usageType       UsageType

  // Context
  sessionId       String?
  entityType      String?             // What entity triggered this
  entityId        String?
  invocationId    String?             // If used during skill invocation

  // Feedback
  wasHelpful      Boolean?
  feedback        String?

  @@index([documentId])
  @@index([usedAt])
  @@map("document_usage")
}

enum UsageType {
  AGENT_CONTEXT   // Injected into agent context
  AGENT_RETRIEVAL // Retrieved via semantic search
  USER_REFERENCE  // Human looked it up
  API_FETCH       // Fetched via API
}
```

---

## 2. Agent Skills & Personas

Registered capabilities and personality definitions for AI agents.

```prisma
// ============================================
// AGENT SKILLS
// ============================================

// A registered agent capability
model AgentSkill {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Identity
  slug            String              // "brief-creator", "quality-scorer"
  name            String              // "Brief Creator"
  description     String

  // Link to knowledge document
  documentId      String?  @unique
  document        KnowledgeDocument? @relation("SkillDocument", fields: [documentId], references: [id])

  // Classification
  category        SkillCategory

  // Capability definition
  triggers        Json                // Events/conditions that invoke this skill
  // Example:
  // [
  //   { "type": "event", "event": "client_request.submitted" },
  //   { "type": "manual", "permission": "brief:create" },
  //   { "type": "schedule", "cron": "0 9 * * 1" }
  // ]

  inputs          Json                // Required inputs
  // Example:
  // [
  //   { "name": "client_context", "type": "object", "required": true },
  //   { "name": "request_details", "type": "string", "required": true },
  //   { "name": "priority", "type": "enum", "values": ["low", "medium", "high"], "default": "medium" }
  // ]

  outputs         Json                // Expected outputs
  // Example:
  // [
  //   { "name": "draft_brief", "type": "Brief" },
  //   { "name": "suggestions", "type": "object" },
  //   { "name": "warnings", "type": "array" }
  // ]

  // Dependencies
  dependsOn       String[]            // Other skill slugs this depends on

  // Configuration
  config          Json?               // Runtime configuration
  // Example:
  // {
  //   "model": "claude-3-opus",
  //   "maxTokens": 4096,
  //   "temperature": 0.7,
  //   "timeout": 30000
  // }

  // Permissions required to invoke
  requiredPermissions String[]

  // Status
  isEnabled       Boolean  @default(true)
  version         String   @default("1.0.0")

  // Metrics (updated on each invocation)
  invocationCount Int      @default(0)
  successCount    Int      @default(0)
  failureCount    Int      @default(0)
  successRate     Float?
  avgLatencyMs    Int?
  lastInvokedAt   DateTime?

  // Audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  invocations     AgentInvocation[]

  @@unique([organizationId, slug])
  @@index([organizationId, category])
  @@index([isEnabled])
  @@map("agent_skills")
}

enum SkillCategory {
  CONTENT_CREATION    // Creates content (briefs, copy, reports)
  CONTENT_ANALYSIS    // Analyzes content (quality scoring, sentiment)
  WORKFLOW            // Manages workflows (routing, status updates)
  COMMUNICATION       // Handles communication (notifications, emails)
  DATA_PROCESSING     // Processes data (aggregation, transformation)
  DECISION            // Makes decisions (recommendations, approvals)
  INTEGRATION         // External integrations (API calls, syncs)
  UTILITY             // Helper functions (formatting, validation)
}

// Agent personality/context definition
model AgentPersona {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Identity
  slug            String              // "project-manager", "creative-director"
  name            String              // "Project Manager"
  description     String

  // Link to knowledge document
  documentId      String?  @unique
  document        KnowledgeDocument? @relation("PersonaDocument", fields: [documentId], references: [id])

  // Persona definition
  systemPrompt    String   @db.Text   // Base system prompt

  personality     Json                // Tone, style, communication preferences
  // Example:
  // {
  //   "tone": "professional but friendly",
  //   "style": "concise and action-oriented",
  //   "formality": "business casual",
  //   "emoji": false
  // }

  expertise       String[]            // Areas of expertise
  // Example: ["project management", "client communication", "timeline estimation"]

  constraints     String[]            // Things this persona should NOT do
  // Example: ["never commit to deadlines without checking capacity", "never share pricing"]

  // Skills this persona can use
  allowedSkills   String[]            // Skill slugs

  // Context injection
  defaultContext  Json?               // Default context always included
  // Example:
  // {
  //   "timezone": "Asia/Dubai",
  //   "currency": "AED",
  //   "company": "TeamLMTD"
  // }

  // Status
  isEnabled       Boolean  @default(true)

  // Audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@map("agent_personas")
}
```

---

## 3. Triggers & Events

Event-driven system for routing content events to agent actions.

```prisma
// ============================================
// TRIGGERS & EVENTS
// ============================================

// Content event log (what happened)
model ContentEvent {
  id              String   @id @default(cuid())
  organizationId  String

  // Event identity
  eventType       String              // "brief.created", "asset.uploaded", "deal.won"

  // Source
  sourceType      String              // "brief", "asset", "deal", "content_entry"
  sourceId        String

  // Event data
  payload         Json
  // Example for brief.created:
  // {
  //   "briefId": "...",
  //   "briefType": "VIDEO_SHOOT",
  //   "clientId": "...",
  //   "createdById": "..."
  // }

  // Processing status
  processedAt     DateTime?
  processingError String?
  triggersMatched Int      @default(0)
  triggersExecuted Int     @default(0)

  createdAt       DateTime @default(now())

  @@index([organizationId, eventType])
  @@index([createdAt])
  @@index([sourceType, sourceId])
  @@map("content_events")
}

// Trigger definitions (when X happens, do Y)
model ContentTrigger {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Identity
  name            String
  description     String?

  // Trigger condition
  eventType       String              // Event to listen for
  conditions      Json?               // Additional filtering conditions
  // Example:
  // {
  //   "match": "all",
  //   "rules": [
  //     { "field": "payload.briefType", "operator": "equals", "value": "VIDEO_SHOOT" },
  //     { "field": "payload.priority", "operator": "in", "value": ["HIGH", "URGENT"] }
  //   ]
  // }

  // Action to take
  actionType      TriggerActionType
  actionConfig    Json
  // Examples by actionType:
  //
  // invoke_skill:
  // { "skillSlug": "brief-creator", "input": { "mode": "auto" } }
  //
  // notification:
  // { "type": "brief.assigned", "recipientField": "assigneeId" }
  //
  // webhook:
  // { "url": "https://...", "method": "POST", "headers": {} }
  //
  // workflow:
  // { "workflowId": "...", "action": "start" }

  // Execution settings
  isEnabled       Boolean  @default(true)
  priority        Int      @default(0)  // Higher = runs first
  debounceMs      Int?                  // Debounce rapid events
  maxRetries      Int      @default(3)

  // Metrics
  executionCount  Int      @default(0)
  successCount    Int      @default(0)
  failureCount    Int      @default(0)
  lastExecutedAt  DateTime?
  lastError       String?

  // Audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdById     String

  @@index([organizationId, eventType])
  @@index([isEnabled])
  @@map("content_triggers")
}

enum TriggerActionType {
  INVOKE_SKILL    // Call an agent skill
  NOTIFICATION    // Send a notification
  WEBHOOK         // Call external webhook
  WORKFLOW        // Start/advance a workflow
  UPDATE_ENTITY   // Update the source entity
  CREATE_ENTITY   // Create a related entity
  CUSTOM          // Custom action handler
}
```

---

## 4. Invocation Logging

Track all agent actions for debugging, metrics, and audit.

```prisma
// ============================================
// INVOCATION LOGGING
// ============================================

// Log of agent skill invocations
model AgentInvocation {
  id              String   @id @default(cuid())
  organizationId  String

  // What was invoked
  skillId         String?
  skill           AgentSkill? @relation(fields: [skillId], references: [id])
  skillSlug       String              // Denormalized for queries

  personaId       String?
  personaSlug     String?

  // Trigger context
  triggeredBy     InvocationTrigger
  triggerEventId  String?             // ContentEvent ID if triggered by event
  triggerId       String?             // ContentTrigger ID if via trigger
  sessionId       String?             // For conversational context

  // Entity context
  entityType      String?             // What entity this relates to
  entityId        String?

  // Execution
  input           Json                // Input provided to skill
  output          Json?               // Output from skill
  error           String?             // Error message if failed

  status          InvocationStatus @default(PENDING)

  // Timing
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  durationMs      Int?

  // Token usage (for LLM-based skills)
  inputTokens     Int?
  outputTokens    Int?
  totalTokens     Int?
  estimatedCost   Float?              // In USD

  // Context used
  documentsUsed   String[]            // KnowledgeDocument IDs
  contextTokens   Int?                // Tokens in context

  // Human attribution
  initiatedById   String?             // User who triggered (if manual)

  // Retry tracking
  attemptNumber   Int      @default(1)
  parentInvocationId String?          // If this is a retry

  @@index([organizationId, skillId])
  @@index([organizationId, skillSlug])
  @@index([status])
  @@index([startedAt])
  @@index([entityType, entityId])
  @@map("agent_invocations")
}

enum InvocationTrigger {
  EVENT           // Triggered by ContentEvent
  SCHEDULE        // Triggered by cron schedule
  MANUAL          // Manually invoked by user
  AGENT           // Invoked by another agent/skill
  API             // Invoked via API
  WEBHOOK         // Triggered by external webhook
}

enum InvocationStatus {
  PENDING         // Queued
  RUNNING         // In progress
  COMPLETED       // Finished successfully
  FAILED          // Finished with error
  CANCELLED       // Cancelled before completion
  TIMEOUT         // Timed out
}

// Detailed step-by-step log for complex invocations
model InvocationStep {
  id              String   @id @default(cuid())

  invocationId    String
  invocation      AgentInvocation @relation(fields: [invocationId], references: [id], onDelete: Cascade)

  stepNumber      Int
  stepName        String              // "retrieve_context", "generate_response", "validate_output"

  input           Json?
  output          Json?
  error           String?

  status          InvocationStatus
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  durationMs      Int?

  // For LLM steps
  promptTokens    Int?
  completionTokens Int?

  @@unique([invocationId, stepNumber])
  @@index([invocationId])
  @@map("invocation_steps")
}
```

---

# PART 2: OPERATIONAL LAYER

The operational backbone. These models are from your schema (with integration points added).

---

## 5. Content Management System (CMS)

> **Full schema:** See `19_Database_Schema_CMS_Analytics_CRM.md` Section 1

Key models (with agent integration points):

```prisma
// ============================================
// CMS: CORE MODELS (Summary)
// ============================================

model ContentType {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Skills can create content entries
  // Trigger: content_type.created → skill:content-template-suggester
}

model ContentEntry {
  // ... (full schema in your document)

  // AGENT INTEGRATION ADDITIONS:

  // AI assistance tracking
  aiGenerated       Boolean  @default(false)
  aiAssisted        Boolean  @default(false)
  aiMetadata        Json?
  // {
  //   "skillUsed": "content-generator",
  //   "invocationId": "...",
  //   "confidence": 0.95,
  //   "editedByHuman": true
  // }

  // Link to deliverable (if this content is a work output)
  deliverableId     String?
  deliverable       Deliverable? @relation(fields: [deliverableId], references: [id])
}

model ContentWorkflow {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Workflow transitions can trigger skills
  // Trigger: content.status_changed → skill:notification-sender
}
```

**Agent Integration Points for CMS:**

| Event | Trigger | Skill |
|-------|---------|-------|
| `content_entry.created` | When content is created | `content-quality-scorer` |
| `content_entry.submitted` | When submitted for review | `content-reviewer` |
| `content_entry.published` | When published | `social-distributor` |
| `content_revision.requested` | When changes requested | `revision-summarizer` |

---

## 6. Creative Document Store (DAM)

> **Full schema:** See `19_Database_Schema_CMS_Analytics_CRM.md` Section 2

Key models (with agent integration points):

```prisma
// ============================================
// DAM: CORE MODELS (Summary)
// ============================================

model Asset {
  // ... (full schema in your document)

  // AGENT INTEGRATION: AI tagging and analysis
  aiMetadata      Json?
  // Already in your schema - populated by agent skills:
  // {
  //   "labels": ["outdoor", "summer"],
  //   "objects": ["person", "umbrella"],
  //   "colors": ["#FF6B6B", "#4ECDC4"],
  //   "text": "SUMMER SALE",
  //   "sentiment": "positive"
  // }

  // Link to deliverable (if this asset is a work output)
  deliverableId   String?
  deliverable     Deliverable? @relation(fields: [deliverableId], references: [id])
}

model AssetLibrary {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Smart organization
  // Trigger: asset.uploaded → skill:asset-tagger
  // Trigger: asset.uploaded → skill:folder-suggester
}
```

**Agent Integration Points for DAM:**

| Event | Trigger | Skill |
|-------|---------|-------|
| `asset.uploaded` | When asset is uploaded | `asset-tagger`, `quality-analyzer` |
| `asset.processed` | After renditions complete | `similarity-detector` |
| `collection.created` | When collection created | `asset-recommender` |
| `asset.expiring` | License expiring soon | `license-renewal-reminder` |

---

## 7. Analytics Suite

> **Full schema:** See `19_Database_Schema_CMS_Analytics_CRM.md` Section 3

Key models (with agent integration points):

```prisma
// ============================================
// ANALYTICS: CORE MODELS (Summary)
// ============================================

model MediaCampaign {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Performance analysis
  // Trigger: campaign_metrics.updated → skill:performance-analyzer

  aiInsights      Json?
  // Populated by agent:
  // {
  //   "recommendations": [...],
  //   "anomalies": [...],
  //   "predictions": {...}
  // }
}

model CustomReport {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Auto-generated insights
  aiGenerated     Boolean  @default(false)
  generatedBySkill String?             // "report-builder"
  generatedAt     DateTime?
}

model SocialListeningQuery {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Sentiment analysis and alerts
  // Trigger: social_mention.detected → skill:sentiment-analyzer
  // Trigger: social_mention.negative → skill:crisis-detector
}
```

**Agent Integration Points for Analytics:**

| Event | Trigger | Skill |
|-------|---------|-------|
| `campaign_metrics.updated` | Daily/hourly metrics update | `performance-analyzer` |
| `report.scheduled` | Report generation time | `report-builder` |
| `social_mention.detected` | New social mention | `sentiment-analyzer` |
| `anomaly.detected` | Unusual metric pattern | `anomaly-reporter` |

---

## 8. Enhanced CRM

> **Full schema:** See `19_Database_Schema_CMS_Analytics_CRM.md` Section 4

Key models (with agent integration points):

```prisma
// ============================================
// CRM: CORE MODELS (Summary)
// ============================================

model CRMDeal {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Win probability, next actions
  aiScoring       Json?
  // {
  //   "winProbability": 0.72,
  //   "suggestedActions": [...],
  //   "riskFactors": [...],
  //   "similarDealsWon": [...]
  // }
}

model CRMContact {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Relationship insights
  // Trigger: contact.activity_logged → skill:relationship-scorer
}

model CRMActivity {
  // ... (full schema in your document)

  // AGENT INTEGRATION: Auto-logging, next steps
  aiSuggested     Boolean  @default(false)
  aiSuggestedActions Json?
}
```

**Agent Integration Points for CRM:**

| Event | Trigger | Skill |
|-------|---------|-------|
| `deal.created` | New deal created | `deal-scorer` |
| `deal.stage_changed` | Deal progressed | `next-action-suggester` |
| `contact.inactive` | No activity in 30 days | `re-engagement-suggester` |
| `deal.at_risk` | Probability dropped | `deal-rescue-planner` |

---

# PART 3: WORK OUTPUT LAYER

Deliverables are the actual work product - what clients receive.

---

## 9. Deliverables System

The bridge between briefs (input) and client delivery (output).

```prisma
// ============================================
// DELIVERABLES: WORK OUTPUT
// ============================================

// A piece of work output from a brief
model Deliverable {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  // Source
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

  // For revision chains
  parentId        String?
  parent          Deliverable? @relation("DeliverableRevisions", fields: [parentId], references: [id])
  revisions       Deliverable[] @relation("DeliverableRevisions")

  // Content (polymorphic based on type)
  content         Json?               // Structured content
  textContent     String?  @db.Text   // Text-based content (for search)

  // Primary file
  primaryFileId   String?
  primaryFile     File?    @relation("PrimaryDeliverableFile", fields: [primaryFileId], references: [id])

  // Or link to Asset in DAM
  primaryAssetId  String?
  primaryAsset    Asset?   @relation("PrimaryDeliverableAsset", fields: [primaryAssetId], references: [id])

  // Status
  status          DeliverableStatus @default(DRAFT)

  // Internal review
  internalReviewStatus   ReviewStatus @default(PENDING)
  internalReviewerId     String?
  internalReviewer       User?    @relation("InternalReviewer", fields: [internalReviewerId], references: [id])
  internalReviewedAt     DateTime?
  internalFeedback       String?  @db.Text

  // Client review
  clientReviewStatus     ReviewStatus @default(PENDING)
  clientReviewerId       String?
  clientReviewer         ClientPortalUser? @relation(fields: [clientReviewerId], references: [id])
  clientReviewedAt       DateTime?
  clientFeedback         String?  @db.Text

  // AI tracking
  aiGenerated     Boolean  @default(false)
  aiAssisted      Boolean  @default(false)
  aiMetadata      Json?
  // {
  //   "generatedBy": "content-generator",
  //   "invocationId": "...",
  //   "confidence": 0.92,
  //   "humanEdits": 15
  // }

  // Quality
  qualityScore    Int?                // 0-100
  qualityMetadata Json?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  submittedAt     DateTime?           // Submitted for internal review
  approvedAt      DateTime?           // Final approval
  deliveredAt     DateTime?           // Sent to client

  // Audit
  createdById     String
  createdBy       User     @relation("DeliverableCreator", fields: [createdById], references: [id])

  // Relations
  files           DeliverableFile[]
  comments        DeliverableComment[]
  history         DeliverableHistory[]

  // Linked content entry (if this became published content)
  contentEntryId  String?
  contentEntry    ContentEntry? @relation(fields: [contentEntryId], references: [id])

  @@index([organizationId, briefId])
  @@index([status])
  @@index([clientReviewStatus])
  @@map("deliverables")
}

enum DeliverableType {
  VIDEO           // Video content
  IMAGE           // Static images
  DOCUMENT        // Documents (PDF, DOCX)
  PRESENTATION    // Slide decks
  DESIGN_FILE     // Source design files
  COPY            // Written copy
  REPORT          // Reports and analysis
  CODE            // Code/technical deliverables
  AUDIO           // Audio content
  SOCIAL_PACKAGE  // Social media package
  OTHER
}

enum DeliverableStatus {
  DRAFT           // Being created
  IN_PROGRESS     // Work in progress
  INTERNAL_REVIEW // Internal review
  REVISION_NEEDED // Changes required (internal)
  READY_FOR_CLIENT // Ready to send to client
  CLIENT_REVIEW   // Client reviewing
  CLIENT_REVISION // Client requested changes
  APPROVED        // Final approval
  DELIVERED       // Sent to client
  ARCHIVED        // Archived
}

enum ReviewStatus {
  PENDING         // Not yet reviewed
  IN_PROGRESS     // Being reviewed
  APPROVED        // Approved
  REJECTED        // Rejected
  REVISION_REQUESTED // Changes requested
}

// Files attached to deliverable
model DeliverableFile {
  id              String   @id @default(cuid())

  deliverableId   String
  deliverable     Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  fileId          String
  file            File     @relation(fields: [fileId], references: [id])

  role            DeliverableFileRole @default(ASSET)
  order           Int      @default(0)
  caption         String?
  notes           String?

  @@index([deliverableId])
  @@map("deliverable_files")
}

enum DeliverableFileRole {
  PRIMARY         // The main deliverable file
  SOURCE          // Source/working files
  REFERENCE       // Reference material used
  ASSET           // Supporting assets
  PREVIEW         // Preview/thumbnail
  EXPORT          // Export versions (different formats)
}

// Comments on deliverables (internal + client)
model DeliverableComment {
  id              String   @id @default(cuid())

  deliverableId   String
  deliverable     Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  content         String   @db.Text

  // Thread support
  parentId        String?
  parent          DeliverableComment? @relation("CommentThread", fields: [parentId], references: [id])
  replies         DeliverableComment[] @relation("CommentThread")

  // Annotation (for visual feedback)
  annotationType  String?             // "text_selection", "region", "timestamp", "page"
  annotationData  Json?
  // Examples:
  // text_selection: { "start": 0, "end": 50, "text": "..." }
  // region: { "x": 100, "y": 200, "width": 50, "height": 50, "page": 1 }
  // timestamp: { "time": 15.5, "duration": 2.0 }

  // Resolution
  isResolved      Boolean  @default(false)
  resolvedAt      DateTime?
  resolvedById    String?

  // Author (internal or client)
  authorType      CommentAuthorType
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  clientUserId    String?
  clientUser      ClientPortalUser? @relation(fields: [clientUserId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([deliverableId])
  @@index([parentId])
  @@map("deliverable_comments")
}

enum CommentAuthorType {
  USER            // Internal team member
  CLIENT          // Client via portal
  AGENT           // AI agent
}

// Status history for deliverables
model DeliverableHistory {
  id              String   @id @default(cuid())

  deliverableId   String
  deliverable     Deliverable @relation(fields: [deliverableId], references: [id], onDelete: Cascade)

  action          String              // "created", "submitted", "reviewed", "approved", etc.
  fromStatus      DeliverableStatus?
  toStatus        DeliverableStatus?

  metadata        Json?               // Additional context

  performedAt     DateTime @default(now())
  performedById   String
  performedBy     User     @relation(fields: [performedById], references: [id])

  @@index([deliverableId])
  @@map("deliverable_history")
}
```

**Agent Integration Points for Deliverables:**

| Event | Trigger | Skill |
|-------|---------|-------|
| `deliverable.created` | Deliverable started | `quality-predictor` |
| `deliverable.submitted` | Internal review requested | `quality-scorer`, `reviewer-matcher` |
| `deliverable.client_submitted` | Sent to client | `client-communicator` |
| `deliverable.revision_requested` | Client wants changes | `revision-analyzer` |
| `deliverable.approved` | Final approval | `delivery-packager` |

---

# PART 4: INTEGRATION

---

## 10. Cross-System Integrations

How agents connect all the layers:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AGENT INTEGRATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CLIENT REQUEST                                                                  │
│       │                                                                          │
│       ▼                                                                          │
│  ┌─────────────┐    SKILL: intake-processor                                     │
│  │ CRM Contact │───▶ Reads: /playbooks/client-types/{type}.md                   │
│  │ Activity    │     Creates: Brief, updates CRM                                 │
│  └─────────────┘                                                                 │
│       │                                                                          │
│       ▼                                                                          │
│  ┌─────────────┐    SKILL: resource-optimizer                                   │
│  │   Brief     │───▶ Reads: /procedures/workflows/{type}.md                     │
│  │  Created    │     Assigns: User, estimates timeline                          │
│  └─────────────┘                                                                 │
│       │                                                                          │
│       ▼                                                                          │
│  ┌─────────────┐    SKILL: asset-gatherer                                       │
│  │   Work      │───▶ Reads: /reference/clients/{client}.md                      │
│  │  Begins     │     Finds: Relevant assets from DAM                            │
│  └─────────────┘                                                                 │
│       │                                                                          │
│       ▼                                                                          │
│  ┌─────────────┐    SKILL: quality-scorer                                       │
│  │ Deliverable │───▶ Reads: /checklists/{type}-qa.md                            │
│  │  Created    │     Scores: Quality, suggests improvements                     │
│  └─────────────┘                                                                 │
│       │                                                                          │
│       ▼                                                                          │
│  ┌─────────────┐    SKILL: client-communicator                                  │
│  │  Client     │───▶ Reads: /templates/emails/delivery.md                       │
│  │  Approval   │     Sends: Portal notification, email                          │
│  └─────────────┘                                                                 │
│       │                                                                          │
│       ▼                                                                          │
│  ┌─────────────┐    SKILL: report-builder                                       │
│  │  Delivered  │───▶ Reads: /templates/reports/project-summary.md               │
│  │             │     Creates: Analytics report, updates CRM                      │
│  └─────────────┘                                                                 │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Event Type Reference

```typescript
// All event types that can trigger skills

const EVENT_TYPES = {
  // Brief events
  'brief.created': 'New brief created',
  'brief.assigned': 'Brief assigned to user',
  'brief.status_changed': 'Brief status changed',
  'brief.deadline_approaching': 'Brief deadline within threshold',
  'brief.overdue': 'Brief past deadline',

  // Deliverable events
  'deliverable.created': 'New deliverable created',
  'deliverable.submitted': 'Deliverable submitted for internal review',
  'deliverable.internal_approved': 'Internal review approved',
  'deliverable.internal_rejected': 'Internal review rejected',
  'deliverable.client_submitted': 'Deliverable sent to client',
  'deliverable.client_approved': 'Client approved',
  'deliverable.client_revision': 'Client requested revision',
  'deliverable.delivered': 'Deliverable marked as delivered',

  // CMS events
  'content_entry.created': 'New content entry',
  'content_entry.updated': 'Content entry updated',
  'content_entry.submitted': 'Content submitted for review',
  'content_entry.published': 'Content published',
  'content_entry.unpublished': 'Content unpublished',

  // DAM events
  'asset.uploaded': 'New asset uploaded',
  'asset.processed': 'Asset processing complete',
  'asset.approved': 'Asset approved for use',
  'asset.expiring': 'Asset license expiring',

  // CRM events
  'deal.created': 'New deal created',
  'deal.stage_changed': 'Deal stage changed',
  'deal.won': 'Deal won',
  'deal.lost': 'Deal lost',
  'contact.created': 'New contact added',
  'contact.activity': 'Activity logged on contact',

  // Analytics events
  'campaign.created': 'New campaign created',
  'campaign.metrics_updated': 'Campaign metrics refreshed',
  'anomaly.detected': 'Unusual metric pattern detected',
  'report.scheduled': 'Report generation triggered',

  // Knowledge events
  'document.created': 'New knowledge document',
  'document.published': 'Document published',
  'document.deprecated': 'Document marked deprecated',
};
```

---

## 11. Implementation Priority

### Phase 12.1: Knowledge + Sandbox (Week 1-2)

**Infrastructure:**
- [ ] `KnowledgeDocument` model + CRUD
- [ ] `DocumentVersion` model
- [ ] `DocumentEmbedding` model (pgvector)
- [ ] Markdown editor with frontmatter
- [ ] Skill Playground UI

**Parallel Skill Work:**
- [ ] Seed skills from user stories
- [ ] Founder Session 1: Brief Creation
- [ ] `brief-creator` skill seed

### Phase 12.2: Agent Infrastructure (Week 3-4)

**Infrastructure:**
- [ ] `AgentSkill` model + registry
- [ ] `AgentPersona` model
- [ ] `AgentInvocation` model
- [ ] Skill execution engine
- [ ] Context injection

**Parallel Skill Work:**
- [ ] `brief-creator` v0.1 live
- [ ] `quality-scorer` skill seed
- [ ] Founder Session 2: Resources

### Phase 12.3: Deliverables (Week 5-6)

**Infrastructure:**
- [ ] `Deliverable` model + CRUD
- [ ] `DeliverableFile`, `DeliverableComment`
- [ ] Internal review workflow
- [ ] Client review workflow
- [ ] Link to Brief, Asset, ContentEntry

**Parallel Skill Work:**
- [ ] `quality-scorer` v0.1 live
- [ ] `revision-predictor` skill
- [ ] Founder Session 3: Quality

### Phase 12.4: Triggers & Events (Week 7-8)

**Infrastructure:**
- [ ] `ContentEvent` model + emission
- [ ] `ContentTrigger` model + evaluation
- [ ] Event → Skill routing
- [ ] Retry/error handling

**Parallel Skill Work:**
- [ ] `status-updater` skill
- [ ] `reminder-generator` skill
- [ ] Wire up all system events

### Phase 12.5: CMS Integration (Week 9-10)

**From Your Schema:**
- [ ] `ContentType`, `ContentEntry` models
- [ ] `ContentWorkflow`, `ContentRevision`
- [ ] Publishing workflows
- [ ] Link to Deliverables

**Parallel Skill Work:**
- [ ] `content-quality-scorer` skill
- [ ] `social-distributor` skill

### Phase 12.6: DAM Integration (Week 11-12)

**From Your Schema:**
- [ ] `AssetLibrary`, `Asset` models
- [ ] `AssetVersion`, `AssetRendition`
- [ ] Collections and sharing
- [ ] Link to Deliverables

**Parallel Skill Work:**
- [ ] `asset-tagger` skill
- [ ] `similarity-detector` skill

### Phase 12.7: Analytics Integration (Week 13-14)

**From Your Schema:**
- [ ] `MediaCampaign`, `CampaignMetrics`
- [ ] `SocialListeningQuery`
- [ ] `CustomReport`

**Parallel Skill Work:**
- [ ] `performance-analyzer` skill
- [ ] `report-builder` skill

### Phase 12.8: CRM Integration (Week 15-16)

**From Your Schema:**
- [ ] `CRMContact`, `CRMCompany`
- [ ] `CRMPipeline`, `CRMDeal`
- [ ] `CRMActivity`, `CRMCampaign`

**Parallel Skill Work:**
- [ ] `deal-scorer` skill
- [ ] `relationship-analyzer` skill

---

## Summary

This unified schema provides:

1. **Agent Intelligence Layer** - Knowledge docs, skills, personas, triggers
2. **Operational Layer** - CMS, DAM, Analytics, CRM (your schema)
3. **Work Output Layer** - Deliverables with dual review

Every operational action can trigger agent skills. Every skill reads knowledge documents for context. Every output is tracked and measurable.

**Related Documents:**
- [Skill Development Sandbox](./20_Skill_Development_Sandbox.md) - Parallel skill development track
- [Database Schema: CMS, Analytics, CRM](./19_Database_Schema_CMS_Analytics_CRM.md) - Full operational schemas
