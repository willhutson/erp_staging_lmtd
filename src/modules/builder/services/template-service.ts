import { db } from "@/lib/db";
import type { BuilderTemplateType, TemplateStatus } from "@prisma/client";
import type { TemplateDefinitionMap } from "../types";

/**
 * Get all templates of a specific type
 */
export async function getTemplatesByType<T extends BuilderTemplateType>(
  organizationId: string,
  templateType: T,
  options?: {
    status?: TemplateStatus[];
    module?: string;
  }
): Promise<Array<{ id: string; name: string; definition: TemplateDefinitionMap[T] }>> {
  const templates = await db.builderTemplate.findMany({
    where: {
      organizationId,
      templateType,
      isLatest: true,
      ...(options?.status && { status: { in: options.status } }),
      ...(options?.module && { module: options.module }),
    },
    select: {
      id: true,
      name: true,
      definition: true,
    },
    orderBy: { name: "asc" },
  });

  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    definition: t.definition as TemplateDefinitionMap[T],
  }));
}

/**
 * Get published templates only
 */
export async function getPublishedTemplates<T extends BuilderTemplateType>(
  organizationId: string,
  templateType: T
): Promise<Array<{ id: string; name: string; definition: TemplateDefinitionMap[T] }>> {
  return getTemplatesByType(organizationId, templateType, { status: ["PUBLISHED"] });
}

/**
 * Get a single template by ID
 */
export async function getTemplateById<T extends BuilderTemplateType>(
  id: string,
  organizationId: string
): Promise<{ id: string; name: string; templateType: T; definition: TemplateDefinitionMap[T] } | null> {
  const template = await db.builderTemplate.findFirst({
    where: { id, organizationId },
    select: {
      id: true,
      name: true,
      templateType: true,
      definition: true,
    },
  });

  if (!template) return null;

  return {
    id: template.id,
    name: template.name,
    templateType: template.templateType as T,
    definition: template.definition as TemplateDefinitionMap[T],
  };
}

/**
 * Get a template by name and type
 */
export async function getTemplateByName<T extends BuilderTemplateType>(
  organizationId: string,
  templateType: T,
  name: string
): Promise<{ id: string; name: string; definition: TemplateDefinitionMap[T] } | null> {
  const template = await db.builderTemplate.findFirst({
    where: {
      organizationId,
      templateType,
      name,
      isLatest: true,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      name: true,
      definition: true,
    },
  });

  if (!template) return null;

  return {
    id: template.id,
    name: template.name,
    definition: template.definition as TemplateDefinitionMap[T],
  };
}

/**
 * Create a new version of a template
 */
export async function createTemplateVersion(
  templateId: string,
  organizationId: string,
  userId: string,
  updates: {
    name?: string;
    description?: string;
    definition?: Record<string, unknown>;
  }
): Promise<string> {
  const existing = await db.builderTemplate.findFirst({
    where: { id: templateId, organizationId },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  // Mark current version as not latest
  await db.builderTemplate.update({
    where: { id: templateId },
    data: { isLatest: false },
  });

  // Create new version
  const newTemplate = await db.builderTemplate.create({
    data: {
      organizationId,
      templateType: existing.templateType,
      name: updates.name || existing.name,
      description: updates.description ?? existing.description,
      module: existing.module,
      definition: updates.definition || (existing.definition as Record<string, unknown>),
      status: "DRAFT",
      version: existing.version + 1,
      previousVersionId: templateId,
      isLatest: true,
      createdById: userId,
    },
  });

  // Create audit log
  await db.builderAuditLog.create({
    data: {
      organizationId,
      templateId: newTemplate.id,
      action: "CREATED",
      previousValue: { fromVersion: existing.version },
      newValue: { version: newTemplate.version },
      performedById: userId,
    },
  });

  return newTemplate.id;
}

/**
 * Get template version history
 */
export async function getTemplateVersionHistory(
  templateId: string,
  organizationId: string
): Promise<
  Array<{
    id: string;
    version: number;
    status: TemplateStatus;
    createdAt: Date;
    isLatest: boolean;
  }>
> {
  const template = await db.builderTemplate.findFirst({
    where: { id: templateId, organizationId },
    select: { name: true, templateType: true },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  const versions = await db.builderTemplate.findMany({
    where: {
      organizationId,
      name: template.name,
      templateType: template.templateType,
    },
    select: {
      id: true,
      version: true,
      status: true,
      createdAt: true,
      isLatest: true,
    },
    orderBy: { version: "desc" },
  });

  return versions;
}

/**
 * Validate a template definition against its schema
 */
export function validateTemplateDefinition(
  templateType: BuilderTemplateType,
  definition: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (templateType) {
    case "BRIEF_TEMPLATE":
      if (!Array.isArray(definition.sections)) {
        errors.push("sections must be an array");
      }
      if (!Array.isArray(definition.stages)) {
        errors.push("stages must be an array");
      }
      break;

    case "WORKFLOW":
      if (!definition.trigger || typeof definition.trigger !== "object") {
        errors.push("trigger must be an object");
      }
      if (!Array.isArray(definition.tasks)) {
        errors.push("tasks must be an array");
      }
      break;

    case "DASHBOARD_WIDGET":
      if (typeof definition.refreshInterval !== "number") {
        errors.push("refreshInterval must be a number");
      }
      break;

    case "AI_SKILL_CONFIG":
      if (typeof definition.systemPrompt !== "string") {
        errors.push("systemPrompt must be a string");
      }
      if (!Array.isArray(definition.triggers)) {
        errors.push("triggers must be an array");
      }
      break;

    default:
      // Basic validation for other types
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
