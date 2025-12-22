"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { Prisma, KnowledgeDocumentType, KnowledgeDocumentStatus } from "@prisma/client";

// Inferred types
type AgentSkillRecord = Awaited<ReturnType<typeof db.agentSkill.findMany>>[number];

// ============================================
// KNOWLEDGE DOCUMENT CRUD
// ============================================

export async function getKnowledgeDocuments(options?: {
  documentType?: string;
  status?: string;
  search?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Prisma.KnowledgeDocumentWhereInput = {
    organizationId: session.user.organizationId,
  };

  if (options?.documentType) where.documentType = options.documentType as KnowledgeDocumentType;
  if (options?.status) where.status = options.status as KnowledgeDocumentStatus;
  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: "insensitive" } },
      { content: { contains: options.search, mode: "insensitive" } },
    ];
  }

  return db.knowledgeDocument.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: options?.limit ?? 50,
  });
}

export async function getKnowledgeDocument(slug: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.knowledgeDocument.findFirst({
    where: {
      organizationId: session.user.organizationId,
      slug,
    },
  });
}

interface CreateDocumentInput {
  slug: string;
  title: string;
  path: string;
  documentType: KnowledgeDocumentType;
  content: string;
  description?: string;
  status?: KnowledgeDocumentStatus;
}

export async function createKnowledgeDocument(input: CreateDocumentInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!can(session.user as Parameters<typeof can>[0], "settings:manage")) {
    throw new Error("Only admins can create knowledge documents");
  }

  const doc = await db.knowledgeDocument.create({
    data: {
      organizationId: session.user.organizationId,
      slug: input.slug,
      title: input.title,
      path: input.path,
      documentType: input.documentType,
      content: input.content,
      description: input.description,
      status: input.status ?? "DRAFT",
      createdById: session.user.id,
    },
  });

  revalidatePath("/content-engine/knowledge");
  return doc;
}

export async function updateKnowledgeDocument(
  slug: string,
  input: Partial<CreateDocumentInput>
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!can(session.user as Parameters<typeof can>[0], "settings:manage")) {
    throw new Error("Only admins can update knowledge documents");
  }

  const doc = await db.knowledgeDocument.updateMany({
    where: {
      organizationId: session.user.organizationId,
      slug,
    },
    data: {
      ...input,
      lastEditedById: session.user.id,
    },
  });

  revalidatePath("/content-engine/knowledge");
  revalidatePath(`/content-engine/knowledge/${slug}`);
  return doc;
}

// ============================================
// SKILL SYNC FROM FILESYSTEM
// ============================================

interface SkillFrontmatter {
  title: string;
  slug: string;
  version?: string;
  status?: string;
  category?: string;
  description?: string;
  triggers?: Array<{ type: string; [key: string]: unknown }>;
  inputs?: Array<{ name: string; type: string; required?: boolean; description?: string }>;
  outputs?: Array<{ name: string; type: string; description?: string }>;
  dependencies?: string[];
}

/**
 * Sync skill markdown files from /knowledge/agents/skills/ to the database
 * This makes skills visible in the UI and queryable
 */
export async function syncSkillsFromFilesystem() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!can(session.user as Parameters<typeof can>[0], "settings:manage")) {
    throw new Error("Only admins can sync skills");
  }

  const skillsDir = path.join(process.cwd(), "knowledge/agents/skills");

  try {
    const files = await fs.readdir(skillsDir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const results: { created: string[]; updated: string[]; errors: string[] } = {
      created: [],
      updated: [],
      errors: [],
    };

    for (const file of mdFiles) {
      try {
        const filePath = path.join(skillsDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const { data, content: body } = matter(content);
        const fm = data as SkillFrontmatter;

        const slug = fm.slug || file.replace(".md", "");

        // Check if skill exists
        const existing = await db.agentSkill.findUnique({
          where: {
            organizationId_slug: {
              organizationId: session.user.organizationId,
              slug,
            },
          },
        });

        // Map category to enum
        const categoryMap: Record<string, string> = {
          BRIEF_MANAGEMENT: "BRIEF_MANAGEMENT",
          RESOURCE_PLANNING: "RESOURCE_PLANNING",
          CLIENT_RELATIONS: "CLIENT_RELATIONS",
          CONTENT_CREATION: "CONTENT_CREATION",
          QUALITY_ASSURANCE: "QUALITY_ASSURANCE",
          ANALYTICS: "ANALYTICS",
          WORKFLOW: "WORKFLOW",
          KNOWLEDGE: "KNOWLEDGE",
        };
        const category = categoryMap[fm.category ?? "WORKFLOW"] ?? "WORKFLOW";

        const skillData = {
          name: fm.title,
          description: fm.description ?? "",
          category,
          status: fm.status === "PUBLISHED" ? "ACTIVE" : "DRAFT",
          triggers: fm.triggers ?? [],
          inputs: fm.inputs ?? [],
          outputs: fm.outputs ?? [],
          dependsOn: fm.dependencies ?? [],
          founderKnowledge: body,
          version: fm.version ?? "1.0.0",
        };

        if (existing) {
          await db.agentSkill.update({
            where: { id: existing.id },
            data: skillData,
          });
          results.updated.push(slug);
        } else {
          await db.agentSkill.create({
            data: {
              organizationId: session.user.organizationId,
              slug,
              ...skillData,
            },
          });
          results.created.push(slug);
        }
      } catch (err) {
        results.errors.push(`${file}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    revalidatePath("/content-engine");
    revalidatePath("/content-engine/skills");
    return results;
  } catch (err) {
    throw new Error(`Failed to read skills directory: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}

// ============================================
// SKILL OVERVIEW FOR LEADERSHIP
// ============================================

export interface SkillOverview {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  status: string;
  invocationCount: number;
  successRate: number | null;
  lastInvokedAt: Date | null;
  // What tasks/workflows use this skill
  usedBy: string[];
}

/**
 * Get a simplified overview of all skills for leadership
 * Shows what skills exist and basic stats
 */
export async function getSkillsOverview(): Promise<SkillOverview[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const skills = await db.agentSkill.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: [
      { status: "asc" },
      { invocationCount: "desc" },
    ],
  });

  return skills.map((skill: AgentSkillRecord) => ({
    id: skill.id,
    slug: skill.slug,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    status: skill.status,
    invocationCount: skill.invocationCount,
    successRate: skill.successRate,
    lastInvokedAt: skill.lastInvokedAt,
    // For now, determine usage based on category
    usedBy: getSkillUsageContext(skill.category),
  }));
}

function getSkillUsageContext(category: string): string[] {
  const usageMap: Record<string, string[]> = {
    BRIEF_MANAGEMENT: ["Brief Creation", "Brief Assignment", "Brief Routing"],
    RESOURCE_PLANNING: ["Team Assignment", "Capacity Planning", "Workload Balancing"],
    CLIENT_RELATIONS: ["Client Health Monitoring", "Relationship Scoring", "Churn Prediction"],
    QUALITY_ASSURANCE: ["Deliverable Review", "Quality Scoring", "Pre-delivery Checks"],
    WORKFLOW: ["Deadline Tracking", "Status Updates", "Escalations"],
    CONTENT_CREATION: ["Copy Generation", "Report Building", "Template Filling"],
    ANALYTICS: ["Performance Reports", "Trend Analysis", "Forecasting"],
    KNOWLEDGE: ["Document Retrieval", "Context Building", "Knowledge Search"],
  };
  return usageMap[category] ?? ["General Operations"];
}

/**
 * Get skills grouped by their usage context for leadership view
 */
export async function getSkillsByUsageArea() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const skills = await db.agentSkill.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: { name: "asc" },
  });

  // Group by usage area
  const areas: Record<string, { skills: SkillOverview[]; description: string }> = {
    "Brief & Project Management": {
      description: "Skills that help create, assign, and manage briefs",
      skills: [],
    },
    "Team & Resources": {
      description: "Skills that optimize team capacity and assignments",
      skills: [],
    },
    "Client Relations": {
      description: "Skills that monitor and improve client relationships",
      skills: [],
    },
    "Quality & Delivery": {
      description: "Skills that ensure work quality and timely delivery",
      skills: [],
    },
    "Reporting & Analytics": {
      description: "Skills that generate insights and reports",
      skills: [],
    },
  };

  for (const skill of skills) {
    const overview: SkillOverview = {
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      category: skill.category,
      status: skill.status,
      invocationCount: skill.invocationCount,
      successRate: skill.successRate,
      lastInvokedAt: skill.lastInvokedAt,
      usedBy: getSkillUsageContext(skill.category),
    };

    switch (skill.category) {
      case "BRIEF_MANAGEMENT":
        areas["Brief & Project Management"].skills.push(overview);
        break;
      case "RESOURCE_PLANNING":
        areas["Team & Resources"].skills.push(overview);
        break;
      case "CLIENT_RELATIONS":
        areas["Client Relations"].skills.push(overview);
        break;
      case "QUALITY_ASSURANCE":
      case "WORKFLOW":
        areas["Quality & Delivery"].skills.push(overview);
        break;
      case "ANALYTICS":
      case "CONTENT_CREATION":
      case "KNOWLEDGE":
      default:
        areas["Reporting & Analytics"].skills.push(overview);
        break;
    }
  }

  return areas;
}
