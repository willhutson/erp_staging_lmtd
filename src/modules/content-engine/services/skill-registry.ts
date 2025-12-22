"use server";

import { db } from "@/lib/db";
import type { Skill, SkillCategory, SkillTrigger } from "../types";

// Inferred type from Prisma
type SkillRecord = Awaited<ReturnType<typeof db.agentSkill.findMany>>[number];

/**
 * Skill Registry - Central service for loading and managing skills
 *
 * Responsibilities:
 * - Load skills from database
 * - Find skills by various criteria (slug, category, trigger)
 * - Validate skill configurations
 * - Provide skill metadata for UI
 */

// ============================================
// SKILL LOADING
// ============================================

/**
 * Get all active skills for an organization
 */
export async function getActiveSkills(organizationId: string): Promise<Skill[]> {
  const skills = await db.agentSkill.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
    },
    orderBy: { name: "asc" },
  });

  return skills.map(mapSkillRecord);
}

/**
 * Get a skill by slug
 */
export async function getSkillBySlug(
  organizationId: string,
  slug: string
): Promise<Skill | null> {
  const skill = await db.agentSkill.findUnique({
    where: {
      organizationId_slug: { organizationId, slug },
    },
  });

  return skill ? mapSkillRecord(skill) : null;
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(
  organizationId: string,
  category: SkillCategory
): Promise<Skill[]> {
  const skills = await db.agentSkill.findMany({
    where: {
      organizationId,
      category,
      status: "ACTIVE",
    },
    orderBy: { name: "asc" },
  });

  return skills.map(mapSkillRecord);
}

/**
 * Get skills that match a specific trigger type
 */
export async function getSkillsByTrigger(
  organizationId: string,
  triggerType: string,
  eventType?: string
): Promise<Skill[]> {
  const skills = await db.agentSkill.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
    },
  });

  // Filter by trigger type in the JSON array
  return skills
    .filter((skill) => {
      const triggers = skill.triggers as SkillTrigger[];
      return triggers.some((t) => {
        if (t.type !== triggerType) return false;
        if (eventType && t.type === "EVENT") {
          return t.eventType === eventType;
        }
        return true;
      });
    })
    .map(mapSkillRecord);
}

/**
 * Get skills that depend on a specific skill
 */
export async function getDependentSkills(
  organizationId: string,
  skillSlug: string
): Promise<Skill[]> {
  const skills = await db.agentSkill.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      dependsOn: { has: skillSlug },
    },
  });

  return skills.map(mapSkillRecord);
}

// ============================================
// SKILL VALIDATION
// ============================================

export interface SkillValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a skill configuration
 */
export async function validateSkill(skill: Skill): Promise<SkillValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!skill.name) errors.push("Skill name is required");
  if (!skill.description) errors.push("Skill description is required");
  if (!skill.slug) errors.push("Skill slug is required");

  // Triggers
  if (!skill.triggers || skill.triggers.length === 0) {
    warnings.push("No triggers defined - skill can only be invoked manually");
  }

  // Inputs
  if (!skill.inputs || skill.inputs.length === 0) {
    warnings.push("No inputs defined - skill may not have access to context");
  }

  // Outputs
  if (!skill.outputs || skill.outputs.length === 0) {
    warnings.push("No outputs defined - skill results may not be captured");
  }

  // Dependencies
  if (skill.dependsOn && skill.dependsOn.includes(skill.slug)) {
    errors.push("Skill cannot depend on itself");
  }

  // System prompt
  if (!skill.systemPrompt && !skill.founderKnowledge) {
    warnings.push("No system prompt or founder knowledge - skill may produce generic results");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if all dependencies of a skill are satisfied
 */
export async function checkDependencies(
  organizationId: string,
  skill: Skill
): Promise<{ satisfied: boolean; missing: string[] }> {
  if (!skill.dependsOn || skill.dependsOn.length === 0) {
    return { satisfied: true, missing: [] };
  }

  const missing: string[] = [];

  for (const dep of skill.dependsOn) {
    const depSkill = await getSkillBySlug(organizationId, dep);
    if (!depSkill || depSkill.status !== "ACTIVE") {
      missing.push(dep);
    }
  }

  return {
    satisfied: missing.length === 0,
    missing,
  };
}

// ============================================
// SKILL DISCOVERY
// ============================================

/**
 * Find skills that can handle a specific scenario
 * Used for automatic skill selection
 */
export async function discoverSkillsForScenario(
  organizationId: string,
  scenario: {
    entityType?: string; // "brief", "client", "rfp", etc.
    action?: string; // "create", "update", "analyze", etc.
    context?: Record<string, unknown>;
  }
): Promise<Skill[]> {
  const allSkills = await getActiveSkills(organizationId);

  // Score skills based on how well they match the scenario
  const scored = allSkills.map((skill) => {
    let score = 0;

    // Check if skill inputs match scenario context
    if (scenario.context && skill.inputs) {
      for (const input of skill.inputs) {
        if (scenario.context[input.name] !== undefined) {
          score += input.required ? 2 : 1;
        }
      }
    }

    // Check category relevance
    if (scenario.entityType) {
      const categoryMap: Record<string, SkillCategory[]> = {
        brief: ["BRIEF_MANAGEMENT", "WORKFLOW"],
        client: ["CLIENT_RELATIONS", "ANALYTICS"],
        rfp: ["BRIEF_MANAGEMENT", "CONTENT_CREATION"],
        team: ["RESOURCE_PLANNING"],
        deliverable: ["QUALITY_ASSURANCE", "CONTENT_CREATION"],
      };
      if (categoryMap[scenario.entityType]?.includes(skill.category)) {
        score += 3;
      }
    }

    return { skill, score };
  });

  // Return skills sorted by score (highest first)
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.skill);
}

// ============================================
// HELPERS
// ============================================

function mapSkillRecord(record: SkillRecord): Skill {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    description: record.description,
    category: record.category as SkillCategory,
    status: record.status as Skill["status"],
    triggers: record.triggers as SkillTrigger[],
    inputs: record.inputs as Skill["inputs"],
    outputs: record.outputs as Skill["outputs"],
    dependsOn: record.dependsOn,
    systemPrompt: record.systemPrompt ?? undefined,
    founderKnowledge: record.founderKnowledge ?? undefined,
    validationQuestions: record.validationQuestions,
    invocationCount: record.invocationCount,
    successRate: record.successRate,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
