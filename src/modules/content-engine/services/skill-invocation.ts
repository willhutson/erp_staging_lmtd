"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Skill } from "../types";
import { getSkillBySlug, checkDependencies } from "./skill-registry";

// ============================================
// TYPES
// ============================================

export interface InvocationInput {
  skillSlug: string;
  inputs: Record<string, unknown>;
  triggeredBy: "MANUAL" | "EVENT" | "SCHEDULE" | "AGENT" | "API" | "WEBHOOK";
  entityType?: string;
  entityId?: string;
}

export interface InvocationResult {
  success: boolean;
  invocationId: string;
  outputs: Record<string, unknown>;
  duration: number;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    contextSize?: number;
  };
}

export interface SkillContext {
  skillName: string;
  skillDescription: string;
  relevantDocuments: Array<{
    path: string;
    title: string;
    content: string;
  }>;
  entityContext: Record<string, unknown>;
}

// ============================================
// SKILL INVOCATION
// ============================================

/**
 * Invoke a skill with the given inputs
 *
 * This is the main entry point for skill execution.
 * It handles:
 * - Skill validation
 * - Dependency checking
 * - Context building
 * - Execution (placeholder for LLM integration)
 * - Result logging
 */
export async function invokeSkill(input: InvocationInput): Promise<InvocationResult> {
  const startTime = Date.now();
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const organizationId = session.user.organizationId;

  // Create invocation record immediately (for tracking)
  const invocation = await db.agentInvocation.create({
    data: {
      organizationId,
      skillSlug: input.skillSlug,
      triggeredBy: input.triggeredBy,
      entityType: input.entityType,
      entityId: input.entityId,
      input: JSON.parse(JSON.stringify(input.inputs)),
      status: "PENDING",
    },
  });

  try {
    // 1. Load the skill
    const skill = await getSkillBySlug(organizationId, input.skillSlug);
    if (!skill) {
      throw new Error(`Skill not found: ${input.skillSlug}`);
    }

    if (!skill.isEnabled) {
      throw new Error(`Skill is not active: ${input.skillSlug}`);
    }

    // Update invocation with skill ID
    await db.agentInvocation.update({
      where: { id: invocation.id },
      data: { skillId: skill.id, status: "RUNNING" },
    });

    // 2. Check dependencies
    const deps = await checkDependencies(organizationId, skill);
    if (!deps.satisfied) {
      throw new Error(`Missing dependencies: ${deps.missing.join(", ")}`);
    }

    // 3. Validate inputs
    const validationErrors = validateInputs(skill, input.inputs);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid inputs: ${validationErrors.join(", ")}`);
    }

    // 4. Build context
    const context = await buildSkillContext(skill, input.inputs, organizationId);

    // 5. Execute the skill
    // NOTE: This is where LLM integration would happen
    // For now, we return a placeholder response
    const outputs = await executeSkill(skill, context, input.inputs);

    // 6. Update invocation record
    const duration = Date.now() - startTime;
    await db.agentInvocation.update({
      where: { id: invocation.id },
      data: {
        status: "COMPLETED",
        output: JSON.parse(JSON.stringify(outputs)),
        durationMs: duration,
        completedAt: new Date(),
      },
    });

    // 7. Update skill stats
    await updateSkillStats(skill.id, true);

    return {
      success: true,
      invocationId: invocation.id,
      outputs,
      duration,
      metadata: {
        contextSize: context.skillDescription.length,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Update invocation with error
    await db.agentInvocation.update({
      where: { id: invocation.id },
      data: {
        status: "FAILED",
        error: errorMessage,
        durationMs: duration,
        completedAt: new Date(),
      },
    });

    // Update skill stats
    if (invocation.skillId) {
      await updateSkillStats(invocation.skillId, false);
    }

    return {
      success: false,
      invocationId: invocation.id,
      outputs: {},
      duration,
      error: errorMessage,
    };
  }
}

// ============================================
// INPUT VALIDATION
// ============================================

function validateInputs(skill: Skill, inputs: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!skill.inputs) return errors;

  for (const inputDef of skill.inputs) {
    const value = inputs[inputDef.name];

    // Check required inputs
    if (inputDef.required && (value === undefined || value === null || value === "")) {
      errors.push(`Missing required input: ${inputDef.name}`);
      continue;
    }

    // Type validation (basic)
    if (value !== undefined && value !== null) {
      const actualType = typeof value;
      const expectedType = inputDef.type.toLowerCase();

      if (expectedType === "string" && actualType !== "string") {
        errors.push(`${inputDef.name} must be a string`);
      } else if (expectedType === "number" && actualType !== "number") {
        errors.push(`${inputDef.name} must be a number`);
      } else if (expectedType === "boolean" && actualType !== "boolean") {
        errors.push(`${inputDef.name} must be a boolean`);
      } else if (expectedType === "array" && !Array.isArray(value)) {
        errors.push(`${inputDef.name} must be an array`);
      } else if (expectedType === "object" && (actualType !== "object" || Array.isArray(value))) {
        errors.push(`${inputDef.name} must be an object`);
      }
    }
  }

  return errors;
}

// ============================================
// CONTEXT BUILDING
// ============================================

async function buildSkillContext(
  skill: Skill,
  inputs: Record<string, unknown>,
  organizationId: string
): Promise<SkillContext> {
  // Get relevant knowledge documents
  const relevantDocuments = await getRelevantDocuments(skill, organizationId);

  // Build entity context if entity ID is provided
  const entityContext = await buildEntityContext(inputs);

  return {
    skillName: skill.name,
    skillDescription: skill.description,
    relevantDocuments,
    entityContext,
  };
}

async function getRelevantDocuments(
  skill: Skill,
  organizationId: string
): Promise<SkillContext["relevantDocuments"]> {
  // For now, get documents in the same category as the skill
  // In Phase 12.5, this will use semantic search
  const documents = await db.knowledgeDocument.findMany({
    where: {
      organizationId,
      status: "PUBLISHED",
      // Match by path pattern (e.g., "/agents/skills/" for skill-related docs)
      OR: [
        { path: { startsWith: `/agents/skills/${skill.slug}` } },
        { path: { startsWith: "/procedures/" } },
        { documentType: "CHECKLIST" },
      ],
    },
    take: 5,
    orderBy: { updatedAt: "desc" },
  });

  return documents.map((doc) => ({
    path: doc.path,
    title: doc.title,
    content: doc.content,
  }));
}

async function buildEntityContext(inputs: Record<string, unknown>): Promise<Record<string, unknown>> {
  const context: Record<string, unknown> = {};

  // If briefId is provided, load brief data
  if (inputs.briefId && typeof inputs.briefId === "string") {
    const brief = await db.brief.findUnique({
      where: { id: inputs.briefId },
      include: {
        client: { select: { id: true, name: true, code: true } },
        assignee: { select: { id: true, name: true, role: true } },
      },
    });
    if (brief) {
      context.brief = brief;
    }
  }

  // If clientId is provided, load client data
  if (inputs.clientId && typeof inputs.clientId === "string") {
    const client = await db.client.findUnique({
      where: { id: inputs.clientId },
      include: {
        contacts: { where: { isPrimary: true }, take: 1 },
        accountManager: { select: { id: true, name: true } },
      },
    });
    if (client) {
      context.client = client;
    }
  }

  // If userId is provided, load user data
  if (inputs.userId && typeof inputs.userId === "string") {
    const user = await db.user.findUnique({
      where: { id: inputs.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        skills: true,
      },
    });
    if (user) {
      context.user = user;
    }
  }

  return context;
}

// ============================================
// SKILL EXECUTION
// ============================================

/**
 * Execute the skill with the built context
 *
 * NOTE: This is a placeholder implementation.
 * In a real implementation, this would:
 * 1. Call an LLM (e.g., Claude, GPT-4)
 * 2. Parse the response into structured outputs
 * 3. Validate the outputs against the skill definition
 */
async function executeSkill(
  skill: Skill,
  context: SkillContext,
  inputs: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // TODO: Implement actual skill execution with LLM
  // For now, log context and inputs to satisfy linter, will be used when LLM integration is added
  console.debug("Executing skill with context:", context.skillName, "inputs:", Object.keys(inputs));

  // Placeholder: Return mock outputs based on skill outputs definition
  const outputs: Record<string, unknown> = {};

  if (skill.outputs) {
    for (const output of skill.outputs) {
      switch (output.type.toLowerCase()) {
        case "string":
          outputs[output.name] = `[Generated ${output.name}]`;
          break;
        case "number":
          outputs[output.name] = 0;
          break;
        case "boolean":
          outputs[output.name] = true;
          break;
        case "array":
          outputs[output.name] = [];
          break;
        case "object":
          outputs[output.name] = {};
          break;
        default:
          outputs[output.name] = null;
      }
    }
  }

  // Add execution metadata
  outputs._meta = {
    executedAt: new Date().toISOString(),
    skillSlug: skill.slug,
    contextSize: context.skillDescription.length,
    relevantDocsCount: context.relevantDocuments.length,
    placeholder: true, // Indicates this is a placeholder response
  };

  return outputs;
}

// ============================================
// STATS UPDATE
// ============================================

async function updateSkillStats(
  skillId: string,
  success: boolean
): Promise<void> {
  const skill = await db.agentSkill.findUnique({
    where: { id: skillId },
  });

  if (!skill) return;

  const newCount = skill.invocationCount + 1;
  const currentSuccessRate = skill.successRate ?? 100;

  // Calculate new success rate using weighted average
  const newSuccessRate = success
    ? currentSuccessRate + (100 - currentSuccessRate) / newCount
    : currentSuccessRate - currentSuccessRate / newCount;

  await db.agentSkill.update({
    where: { id: skillId },
    data: {
      invocationCount: newCount,
      successRate: Math.round(newSuccessRate * 100) / 100,
      lastInvokedAt: new Date(),
    },
  });
}

// ============================================
// BATCH INVOCATION
// ============================================

/**
 * Invoke multiple skills in sequence (respecting dependencies)
 */
export async function invokeSkillChain(
  skillSlugs: string[],
  initialInputs: Record<string, unknown>
): Promise<InvocationResult[]> {
  const results: InvocationResult[] = [];
  let currentInputs = { ...initialInputs };

  for (const slug of skillSlugs) {
    const result = await invokeSkill({
      skillSlug: slug,
      inputs: currentInputs,
      triggeredBy: "AGENT",
    });

    results.push(result);

    if (!result.success) {
      // Stop chain on failure
      break;
    }

    // Merge outputs into inputs for next skill
    currentInputs = { ...currentInputs, ...result.outputs };
  }

  return results;
}
