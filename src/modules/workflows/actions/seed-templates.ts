"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { defaultWorkflowTemplates } from "@config/workflows";

/**
 * Seeds the default workflow templates into the database.
 * Call this when setting up a new organization or resetting templates.
 */
export async function seedWorkflowTemplates() {
  const session = await auth();
  if (!session?.user?.organizationId || !session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const results = [];

  for (const template of defaultWorkflowTemplates) {
    // Check if template already exists
    const existing = await db.workflowTemplate.findFirst({
      where: {
        organizationId: session.user.organizationId,
        name: template.name,
        isLatest: true,
      },
    });

    if (existing) {
      results.push({
        name: template.name,
        status: "skipped",
        reason: "Already exists",
      });
      continue;
    }

    // Create the template
    await db.workflowTemplate.create({
      data: {
        organizationId: session.user.organizationId,
        name: template.name,
        description: template.description,
        module: template.module,
        triggerType: template.definition.trigger.type || "",
        triggerConditions: template.definition.trigger.conditions,
        taskTemplates: template.definition.tasks,
        nudgeRules: template.definition.nudgeRules,
        stageGates: template.definition.stageGates,
        aiSkills: template.definition.aiSkills || [],
        status: "PUBLISHED",
        publishedAt: new Date(),
        version: 1,
        isLatest: true,
        createdById: session.user.id,
      },
    });

    results.push({
      name: template.name,
      status: "created",
    });
  }

  return { success: true, results };
}

/**
 * Gets the list of available default templates that can be imported
 */
export async function getAvailableDefaultTemplates() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  // Get existing templates to check which ones are already imported
  const existing = await db.workflowTemplate.findMany({
    where: {
      organizationId: session.user.organizationId,
      isLatest: true,
    },
    select: { name: true },
  });

  const existingNames = new Set(existing.map((t) => t.name));

  return defaultWorkflowTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    module: template.module,
    taskCount: template.definition.tasks.length,
    alreadyImported: existingNames.has(template.name),
    triggerType: template.definition.trigger.type,
  }));
}
