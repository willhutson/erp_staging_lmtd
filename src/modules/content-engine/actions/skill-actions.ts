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
    isEnabled: skill.isEnabled,
    triggers: skill.triggers as unknown as SkillTrigger[],
    inputs: skill.inputs as unknown as SkillInput[],
    outputs: skill.outputs as unknown as SkillOutput[],
    dependsOn: skill.dependsOn,
    version: skill.version,
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
    isEnabled: skill.isEnabled,
    triggers: skill.triggers as unknown as SkillTrigger[],
    inputs: skill.inputs as unknown as SkillInput[],
    outputs: skill.outputs as unknown as SkillOutput[],
    dependsOn: skill.dependsOn,
    version: skill.version,
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
      isEnabled: false,
      triggers: JSON.parse(JSON.stringify(input.triggers ?? [])),
      inputs: JSON.parse(JSON.stringify(input.inputs ?? [])),
      outputs: JSON.parse(JSON.stringify(input.outputs ?? [])),
      dependsOn: input.dependsOn ?? [],
    },
  });

  revalidatePath("/content-engine/skills");

  return {
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    category: skill.category as SkillCategory,
    isEnabled: skill.isEnabled,
    triggers: skill.triggers as unknown as SkillTrigger[],
    inputs: skill.inputs as unknown as SkillInput[],
    outputs: skill.outputs as unknown as SkillOutput[],
    dependsOn: skill.dependsOn,
    version: skill.version,
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
  isEnabled?: boolean;
  triggers?: SkillTrigger[];
  inputs?: SkillInput[];
  outputs?: SkillOutput[];
  dependsOn?: string[];
  version?: string;
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
      isEnabled: input.isEnabled,
      triggers: input.triggers ? JSON.parse(JSON.stringify(input.triggers)) : undefined,
      inputs: input.inputs ? JSON.parse(JSON.stringify(input.inputs)) : undefined,
      outputs: input.outputs ? JSON.parse(JSON.stringify(input.outputs)) : undefined,
      dependsOn: input.dependsOn,
      version: input.version,
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
    isEnabled: skill.isEnabled,
    triggers: skill.triggers as unknown as SkillTrigger[],
    inputs: skill.inputs as unknown as SkillInput[],
    outputs: skill.outputs as unknown as SkillOutput[],
    dependsOn: skill.dependsOn,
    version: skill.version,
    invocationCount: skill.invocationCount,
    successRate: skill.successRate,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
}

// Activate a skill (enable it)
export async function activateSkill(slug: string): Promise<Skill> {
  return updateSkill(slug, { isEnabled: true });
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
        orderBy: { startedAt: "desc" },
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
      startedAt: inv.startedAt,
    })),
  };
}
