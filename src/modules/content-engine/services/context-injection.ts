"use server";

import { db } from "@/lib/db";
import type { Skill } from "../types";

// ============================================
// TYPES
// ============================================

export interface ContextDocument {
  id: string;
  path: string;
  title: string;
  content: string;
  documentType: string;
  relevanceScore?: number;
}

export interface EntityContext {
  type: string;
  id: string;
  data: Record<string, unknown>;
  related?: EntityContext[];
}

export interface SkillContext {
  // Core context
  skill: {
    name: string;
    description: string;
    systemPrompt: string | null;
    founderKnowledge: string | null;
  };

  // Knowledge base
  documents: ContextDocument[];

  // Entity data
  entities: EntityContext[];

  // Metadata
  meta: {
    builtAt: Date;
    documentCount: number;
    entityCount: number;
    totalTokensEstimate: number;
  };
}

// ============================================
// CONTEXT BUILDING
// ============================================

/**
 * Build comprehensive context for skill execution
 *
 * This assembles all relevant information:
 * - Skill instructions and founder knowledge
 * - Relevant knowledge documents (procedures, checklists, etc.)
 * - Entity data (briefs, clients, users, etc.)
 * - Historical context (past invocations, related work)
 */
export async function buildContext(
  skill: Skill,
  inputs: Record<string, unknown>,
  organizationId: string,
  options?: {
    maxDocuments?: number;
    includeHistory?: boolean;
    contextWindow?: number; // Max tokens to use
  }
): Promise<SkillContext> {
  const maxDocs = options?.maxDocuments ?? 10;
  const contextWindow = options?.contextWindow ?? 8000;

  // 1. Get relevant knowledge documents
  const documents = await getRelevantDocuments(
    skill,
    organizationId,
    inputs,
    maxDocs
  );

  // 2. Build entity context
  const entities = await buildEntityContext(inputs, organizationId);

  // 3. Optionally include historical context
  let historyContext: ContextDocument[] = [];
  if (options?.includeHistory) {
    historyContext = await getHistoricalContext(skill.id, organizationId);
  }

  // 4. Estimate tokens and trim if needed
  const allDocuments = [...documents, ...historyContext];
  const trimmedDocuments = trimToFitContext(allDocuments, contextWindow);

  // 5. Build final context
  const context: SkillContext = {
    skill: {
      name: skill.name,
      description: skill.description,
      systemPrompt: skill.systemPrompt ?? null,
      founderKnowledge: skill.founderKnowledge ?? null,
    },
    documents: trimmedDocuments,
    entities,
    meta: {
      builtAt: new Date(),
      documentCount: trimmedDocuments.length,
      entityCount: entities.length,
      totalTokensEstimate: estimateTokens(
        JSON.stringify({ skill, documents: trimmedDocuments, entities })
      ),
    },
  };

  return context;
}

// ============================================
// DOCUMENT RETRIEVAL
// ============================================

/**
 * Get relevant knowledge documents for a skill
 *
 * Uses multiple strategies:
 * 1. Direct skill documentation
 * 2. Category-based matching
 * 3. Keyword-based matching
 * 4. (Future) Semantic similarity search
 */
async function getRelevantDocuments(
  skill: Skill,
  organizationId: string,
  inputs: Record<string, unknown>,
  limit: number
): Promise<ContextDocument[]> {
  const documents: ContextDocument[] = [];
  const seen = new Set<string>();

  // Strategy 1: Direct skill documentation
  const skillDocs = await db.knowledgeDocument.findMany({
    where: {
      organizationId,
      status: "PUBLISHED",
      OR: [
        { path: { startsWith: `/agents/skills/${skill.slug}` } },
        { slug: skill.slug },
      ],
    },
    take: 3,
  });

  for (const doc of skillDocs) {
    if (!seen.has(doc.id)) {
      documents.push({
        id: doc.id,
        path: doc.path,
        title: doc.title,
        content: doc.content,
        documentType: doc.documentType,
        relevanceScore: 1.0,
      });
      seen.add(doc.id);
    }
  }

  // Strategy 2: Category-based procedures and checklists
  const categoryMap: Record<string, string[]> = {
    BRIEF_MANAGEMENT: ["PROCEDURE", "CHECKLIST", "TEMPLATE"],
    RESOURCE_PLANNING: ["PROCEDURE", "POLICY"],
    CLIENT_RELATIONS: ["PLAYBOOK", "PROCEDURE"],
    QUALITY_ASSURANCE: ["CHECKLIST", "PROCEDURE"],
    CONTENT_CREATION: ["TEMPLATE", "PLAYBOOK"],
    WORKFLOW: ["PROCEDURE", "CHECKLIST"],
    ANALYTICS: ["PROCEDURE", "REFERENCE"],
    KNOWLEDGE: ["REFERENCE", "PLAYBOOK"],
  };

  const relevantTypes = categoryMap[skill.category] ?? ["PROCEDURE"];

  const categoryDocs = await db.knowledgeDocument.findMany({
    where: {
      organizationId,
      status: "PUBLISHED",
      documentType: { in: relevantTypes },
      id: { notIn: Array.from(seen) },
    },
    take: limit - documents.length,
    orderBy: { updatedAt: "desc" },
  });

  for (const doc of categoryDocs) {
    if (documents.length >= limit) break;
    if (!seen.has(doc.id)) {
      documents.push({
        id: doc.id,
        path: doc.path,
        title: doc.title,
        content: doc.content,
        documentType: doc.documentType,
        relevanceScore: 0.7,
      });
      seen.add(doc.id);
    }
  }

  // Strategy 3: Keyword matching from inputs
  const keywords = extractKeywords(inputs);
  if (keywords.length > 0 && documents.length < limit) {
    const keywordDocs = await db.knowledgeDocument.findMany({
      where: {
        organizationId,
        status: "PUBLISHED",
        id: { notIn: Array.from(seen) },
        OR: keywords.map((kw) => ({
          OR: [
            { title: { contains: kw, mode: "insensitive" as const } },
            { content: { contains: kw, mode: "insensitive" as const } },
          ],
        })),
      },
      take: limit - documents.length,
    });

    for (const doc of keywordDocs) {
      if (documents.length >= limit) break;
      documents.push({
        id: doc.id,
        path: doc.path,
        title: doc.title,
        content: doc.content,
        documentType: doc.documentType,
        relevanceScore: 0.5,
      });
    }
  }

  return documents;
}

/**
 * Extract keywords from inputs for document matching
 */
function extractKeywords(inputs: Record<string, unknown>): string[] {
  const keywords: string[] = [];

  for (const [key, value] of Object.entries(inputs)) {
    // Skip internal fields
    if (key.startsWith("_")) continue;

    if (typeof value === "string" && value.length > 3 && value.length < 100) {
      // Split camelCase and extract words
      const words = value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .split(/[\s_-]+/)
        .filter((w) => w.length > 3);
      keywords.push(...words);
    }
  }

  // Deduplicate and limit
  return [...new Set(keywords)].slice(0, 5);
}

// ============================================
// ENTITY CONTEXT
// ============================================

/**
 * Build context from referenced entities
 */
async function buildEntityContext(
  inputs: Record<string, unknown>,
  organizationId: string
): Promise<EntityContext[]> {
  const entities: EntityContext[] = [];

  // Brief context
  if (inputs.briefId && typeof inputs.briefId === "string") {
    const brief = await db.brief.findUnique({
      where: { id: inputs.briefId },
      include: {
        client: { select: { id: true, name: true, code: true, industry: true } },
        assignee: { select: { id: true, name: true, role: true, department: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (brief && brief.organizationId === organizationId) {
      entities.push({
        type: "brief",
        id: brief.id,
        data: {
          title: brief.title,
          type: brief.type,
          status: brief.status,
          priority: brief.priority,
          deadline: brief.deadline,
          formData: brief.formData,
          client: brief.client,
          assignee: brief.assignee,
          createdBy: brief.createdBy,
        },
      });
    }
  }

  // Client context
  if (inputs.clientId && typeof inputs.clientId === "string") {
    const client = await db.client.findUnique({
      where: { id: inputs.clientId },
      include: {
        contacts: { where: { isActive: true }, take: 5 },
        accountManager: { select: { id: true, name: true, email: true } },
        _count: { select: { briefs: true } },
      },
    });

    if (client && client.organizationId === organizationId) {
      entities.push({
        type: "client",
        id: client.id,
        data: {
          name: client.name,
          code: client.code,
          industry: client.industry,
          companySize: client.companySize,
          relationshipStatus: client.relationshipStatus,
          healthScore: client.healthScore,
          contacts: client.contacts,
          accountManager: client.accountManager,
          briefCount: client._count.briefs,
        },
      });
    }
  }

  // User context
  if (inputs.userId && typeof inputs.userId === "string") {
    const user = await db.user.findUnique({
      where: { id: inputs.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        permissionLevel: true,
        skills: true,
        weeklyCapacity: true,
        _count: { select: { briefsAssigned: true, managedClients: true } },
      },
    });

    if (user) {
      entities.push({
        type: "user",
        id: user.id,
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          permissionLevel: user.permissionLevel,
          skills: user.skills,
          weeklyCapacity: user.weeklyCapacity,
          assignedBriefs: user._count.briefsAssigned,
          managedClients: user._count.managedClients,
        },
      });
    }
  }

  // RFP context
  if (inputs.rfpId && typeof inputs.rfpId === "string") {
    const rfp = await db.rFP.findUnique({
      where: { id: inputs.rfpId },
      include: {
        leadOwner: { select: { id: true, name: true } },
        subitems: true,
      },
    });

    if (rfp && rfp.organizationId === organizationId) {
      entities.push({
        type: "rfp",
        id: rfp.id,
        data: {
          title: rfp.title,
          entity: rfp.entity,
          status: rfp.status,
          submissionDeadline: rfp.submissionDeadline,
          estimatedValue: rfp.estimatedValue,
          probability: rfp.probability,
          leadOwner: rfp.leadOwner,
          subitems: rfp.subitems,
        },
      });
    }
  }

  return entities;
}

// ============================================
// HISTORICAL CONTEXT
// ============================================

/**
 * Get context from past skill invocations
 */
async function getHistoricalContext(
  skillId: string,
  organizationId: string
): Promise<ContextDocument[]> {
  // Get recent successful invocations
  const recentInvocations = await db.agentInvocation.findMany({
    where: {
      organizationId,
      skillId,
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      inputData: true,
      outputData: true,
      createdAt: true,
    },
  });

  return recentInvocations.map((inv) => ({
    id: inv.id,
    path: `/history/${skillId}/${inv.id}`,
    title: `Previous invocation from ${inv.createdAt.toISOString()}`,
    content: JSON.stringify({
      inputs: inv.inputData,
      outputs: inv.outputData,
    }, null, 2),
    documentType: "HISTORY",
    relevanceScore: 0.3,
  }));
}

// ============================================
// CONTEXT OPTIMIZATION
// ============================================

/**
 * Trim documents to fit within context window
 */
function trimToFitContext(
  documents: ContextDocument[],
  maxTokens: number
): ContextDocument[] {
  // Sort by relevance score
  const sorted = [...documents].sort(
    (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
  );

  const result: ContextDocument[] = [];
  let currentTokens = 0;

  for (const doc of sorted) {
    const docTokens = estimateTokens(doc.content);

    if (currentTokens + docTokens <= maxTokens) {
      result.push(doc);
      currentTokens += docTokens;
    } else if (currentTokens < maxTokens * 0.8) {
      // Try to fit a truncated version
      const remainingTokens = maxTokens - currentTokens;
      const truncatedContent = truncateToTokens(doc.content, remainingTokens);
      result.push({ ...doc, content: truncatedContent });
      break;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Estimate token count (rough approximation)
 * ~4 characters per token for English text
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to approximately fit within token limit
 */
function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;

  // Try to truncate at a sentence boundary
  const truncated = text.slice(0, maxChars);
  const lastSentence = truncated.lastIndexOf(". ");

  if (lastSentence > maxChars * 0.5) {
    return truncated.slice(0, lastSentence + 1) + " [truncated]";
  }

  return truncated + "... [truncated]";
}

// ============================================
// CONTEXT SERIALIZATION
// ============================================

/**
 * Serialize context into a prompt-ready format
 */
export async function serializeContextForPrompt(context: SkillContext): Promise<string> {
  const parts: string[] = [];

  // Skill instructions
  parts.push("## Skill: " + context.skill.name);
  parts.push(context.skill.description);
  parts.push("");

  if (context.skill.systemPrompt) {
    parts.push("## Instructions");
    parts.push(context.skill.systemPrompt);
    parts.push("");
  }

  if (context.skill.founderKnowledge) {
    parts.push("## Expert Knowledge");
    parts.push(context.skill.founderKnowledge);
    parts.push("");
  }

  // Entity context
  if (context.entities.length > 0) {
    parts.push("## Context Data");
    for (const entity of context.entities) {
      parts.push(`### ${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}`);
      parts.push(JSON.stringify(entity.data, null, 2));
      parts.push("");
    }
  }

  // Knowledge documents
  if (context.documents.length > 0) {
    parts.push("## Reference Documents");
    for (const doc of context.documents) {
      parts.push(`### ${doc.title}`);
      parts.push(`Type: ${doc.documentType}`);
      parts.push(doc.content);
      parts.push("");
    }
  }

  return parts.join("\n");
}
