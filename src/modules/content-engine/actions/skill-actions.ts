"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { Skill, SkillInput, SkillOutput, SkillTrigger, SkillCategory } from "../types";

// Get all skills for the organization
export async function getSkills(): Promise<Skill[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const skills = await db.agentSkill.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: { name: "asc" },
  });

  return skills.map((skill) => ({
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    category: skill.category as SkillCategory,
    status: skill.status as Skill["status"],
    triggers: skill.triggers as SkillTrigger[],
    inputs: skill.inputs as SkillInput[],
    outputs: skill.outputs as SkillOutput[],
    dependsOn: skill.dependsOn,
    systemPrompt: skill.systemPrompt ?? undefined,
    founderKnowledge: skill.founderKnowledge ?? undefined,
    validationQuestions: skill.validationQuestions,
    invocationCount: skill.invocationCount,
    successRate: skill.successRate,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  }));
}

// Get a single skill by slug
export async function getSkill(slug: string): Promise<Skill | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const skill = await db.agentSkill.findUnique({
    where: {
      organizationId_slug: {
        organizationId: session.user.organizationId,
        slug,
      },
    },
  });

  if (!skill) return null;

  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    category: skill.category as SkillCategory,
    status: skill.status as Skill["status"],
    triggers: skill.triggers as SkillTrigger[],
    inputs: skill.inputs as SkillInput[],
    outputs: skill.outputs as SkillOutput[],
    dependsOn: skill.dependsOn,
    systemPrompt: skill.systemPrompt ?? undefined,
    founderKnowledge: skill.founderKnowledge ?? undefined,
    validationQuestions: skill.validationQuestions,
    invocationCount: skill.invocationCount,
    successRate: skill.successRate,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

// Create a new skill
interface CreateSkillInput {
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  triggers?: SkillTrigger[];
  inputs?: SkillInput[];
  outputs?: SkillOutput[];
  dependsOn?: string[];
  systemPrompt?: string;
  founderKnowledge?: string;
  validationQuestions?: string[];
}

export async function createSkill(input: CreateSkillInput): Promise<Skill> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!can(session.user as Parameters<typeof can>[0], "settings:manage")) {
    throw new Error("Only admins can create skills");
  }

  const skill = await db.agentSkill.create({
    data: {
      organizationId: session.user.organizationId,
      slug: input.slug,
      name: input.name,
      description: input.description,
      category: input.category,
      status: "DRAFT",
      triggers: input.triggers ?? [],
      inputs: input.inputs ?? [],
      outputs: input.outputs ?? [],
      dependsOn: input.dependsOn ?? [],
      systemPrompt: input.systemPrompt,
      founderKnowledge: input.founderKnowledge,
      validationQuestions: input.validationQuestions ?? [],
    },
  });

  revalidatePath("/content-engine/skills");

  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    category: skill.category as SkillCategory,
    status: skill.status as Skill["status"],
    triggers: skill.triggers as SkillTrigger[],
    inputs: skill.inputs as SkillInput[],
    outputs: skill.outputs as SkillOutput[],
    dependsOn: skill.dependsOn,
    systemPrompt: skill.systemPrompt ?? undefined,
    founderKnowledge: skill.founderKnowledge ?? undefined,
    validationQuestions: skill.validationQuestions,
    invocationCount: skill.invocationCount,
    successRate: skill.successRate,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

// Update a skill
interface UpdateSkillInput {
  name?: string;
  description?: string;
  category?: SkillCategory;
  status?: Skill["status"];
  triggers?: SkillTrigger[];
  inputs?: SkillInput[];
  outputs?: SkillOutput[];
  dependsOn?: string[];
  systemPrompt?: string;
  founderKnowledge?: string;
  validationQuestions?: string[];
}

export async function updateSkill(slug: string, input: UpdateSkillInput): Promise<Skill> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!can(session.user as Parameters<typeof can>[0], "settings:manage")) {
    throw new Error("Only admins can update skills");
  }

  const skill = await db.agentSkill.update({
    where: {
      organizationId_slug: {
        organizationId: session.user.organizationId,
        slug,
      },
    },
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      status: input.status,
      triggers: input.triggers,
      inputs: input.inputs,
      outputs: input.outputs,
      dependsOn: input.dependsOn,
      systemPrompt: input.systemPrompt,
      founderKnowledge: input.founderKnowledge,
      validationQuestions: input.validationQuestions,
    },
  });

  revalidatePath("/content-engine/skills");
  revalidatePath(`/content-engine/skills/${slug}`);

  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    category: skill.category as SkillCategory,
    status: skill.status as Skill["status"],
    triggers: skill.triggers as SkillTrigger[],
    inputs: skill.inputs as SkillInput[],
    outputs: skill.outputs as SkillOutput[],
    dependsOn: skill.dependsOn,
    systemPrompt: skill.systemPrompt ?? undefined,
    founderKnowledge: skill.founderKnowledge ?? undefined,
    validationQuestions: skill.validationQuestions,
    invocationCount: skill.invocationCount,
    successRate: skill.successRate,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

// Activate a skill (move from DRAFT to ACTIVE)
export async function activateSkill(slug: string): Promise<Skill> {
  return updateSkill(slug, { status: "ACTIVE" });
}

// Get skill categories with counts
export async function getSkillCategoryCounts(): Promise<Record<SkillCategory, number>> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const counts = await db.agentSkill.groupBy({
    by: ["category"],
    where: {
      organizationId: session.user.organizationId,
    },
    _count: true,
  });

  const result: Record<string, number> = {};
  for (const item of counts) {
    result[item.category] = item._count;
  }

  return result as Record<SkillCategory, number>;
}

// Get skill invocation stats
export async function getSkillStats(slug: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const skill = await db.agentSkill.findUnique({
    where: {
      organizationId_slug: {
        organizationId: session.user.organizationId,
        slug,
      },
    },
    include: {
      invocations: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!skill) {
    throw new Error("Skill not found");
  }

  const totalInvocations = skill.invocationCount;
  const successRate = skill.successRate ?? 0;
  const recentInvocations = skill.invocations;

  // Calculate average duration
  const completedInvocations = recentInvocations.filter(
    (inv) => inv.status === "COMPLETED" && inv.durationMs
  );
  const avgDuration = completedInvocations.length > 0
    ? completedInvocations.reduce((sum, inv) => sum + (inv.durationMs ?? 0), 0) / completedInvocations.length
    : null;

  return {
    totalInvocations,
    successRate,
    avgDurationMs: avgDuration,
    recentInvocations: recentInvocations.map((inv) => ({
      id: inv.id,
      status: inv.status,
      triggeredBy: inv.triggeredBy,
      durationMs: inv.durationMs,
      createdAt: inv.createdAt,
    })),
  };
}
