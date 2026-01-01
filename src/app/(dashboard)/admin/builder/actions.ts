"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { BuilderTemplateType, TemplateStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface CreateTemplateInput {
  templateType: BuilderTemplateType;
  name: string;
  description?: string;
  module: string;
}

export async function createTemplate(input: CreateTemplateInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can create templates");
  }

  const { templateType, name, description, module } = input;

  // Check for existing template with same name and type
  const existing = await db.builderTemplate.findFirst({
    where: {
      organizationId: session.user.organizationId,
      templateType,
      name,
      isLatest: true,
    },
  });

  if (existing) {
    throw new Error("A template with this name already exists");
  }

  // Create initial empty definition based on type
  const definition = getDefaultDefinition(templateType);

  const template = await db.builderTemplate.create({
    data: {
      organizationId: session.user.organizationId,
      templateType,
      name,
      description,
      module,
      definition: definition as unknown as Prisma.InputJsonValue,
      status: "DRAFT",
      createdById: session.user.id,
    },
  });

  // Create audit log
  await db.builderAuditLog.create({
    data: {
      organizationId: session.user.organizationId,
      templateId: template.id,
      action: "CREATED",
      newValue: { name, templateType, module },
      performedById: session.user.id,
    },
  });

  revalidatePath("/admin/builder");

  return template;
}

interface UpdateTemplateInput {
  id: string;
  name?: string;
  description?: string;
  definition?: Record<string, unknown>;
}

export async function updateTemplate(input: UpdateTemplateInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can update templates");
  }

  const { id, ...updates } = input;

  const existing = await db.builderTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  const previousValue = {
    name: existing.name,
    description: existing.description,
    definition: existing.definition,
  };

  const template = await db.builderTemplate.update({
    where: { id },
    data: {
      ...updates,
      definition: updates.definition
        ? (updates.definition as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  });

  // Create audit log
  await db.builderAuditLog.create({
    data: {
      organizationId: session.user.organizationId,
      templateId: template.id,
      action: "UPDATED",
      previousValue: previousValue as unknown as Prisma.InputJsonValue,
      newValue: updates as unknown as Prisma.InputJsonValue,
      performedById: session.user.id,
    },
  });

  revalidatePath("/admin/builder");
  revalidatePath(`/admin/builder/${id}`);

  return template;
}

export async function submitForApproval(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const template = await db.builderTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  if (template.status !== "DRAFT") {
    throw new Error("Only draft templates can be submitted for approval");
  }

  const updated = await db.builderTemplate.update({
    where: { id },
    data: {
      status: "PENDING_APPROVAL",
      submittedAt: new Date(),
      submittedById: session.user.id,
    },
  });

  await db.builderAuditLog.create({
    data: {
      organizationId: session.user.organizationId,
      templateId: id,
      action: "SUBMITTED",
      performedById: session.user.id,
    },
  });

  revalidatePath("/admin/builder");
  revalidatePath(`/admin/builder/${id}`);

  return updated;
}

export async function approveTemplate(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can approve templates");
  }

  const template = await db.builderTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  if (template.status !== "PENDING_APPROVAL") {
    throw new Error("Only pending templates can be approved");
  }

  const updated = await db.builderTemplate.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: session.user.id,
    },
  });

  await db.builderAuditLog.create({
    data: {
      organizationId: session.user.organizationId,
      templateId: id,
      action: "APPROVED",
      performedById: session.user.id,
    },
  });

  revalidatePath("/admin/builder");
  revalidatePath(`/admin/builder/${id}`);

  return updated;
}

export async function publishTemplate(id: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can publish templates");
  }

  const template = await db.builderTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  if (!["DRAFT", "APPROVED"].includes(template.status)) {
    throw new Error("Only draft or approved templates can be published");
  }

  const updated = await db.builderTemplate.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      approvedAt: template.approvedAt || new Date(),
      approvedById: template.approvedById || session.user.id,
    },
  });

  await db.builderAuditLog.create({
    data: {
      organizationId: session.user.organizationId,
      templateId: id,
      action: "PUBLISHED",
      performedById: session.user.id,
    },
  });

  revalidatePath("/admin/builder");
  revalidatePath(`/admin/builder/${id}`);

  return updated;
}

function getDefaultDefinition(type: BuilderTemplateType): Record<string, unknown> {
  switch (type) {
    case "BRIEF_TEMPLATE":
      return {
        sections: [],
        stages: ["SUBMITTED", "IN_PROGRESS", "INTERNAL_REVIEW", "CLIENT_REVIEW", "COMPLETED"],
        defaultAssigneeRole: null,
      };
    case "WORKFLOW":
      return {
        trigger: { type: null, conditions: [] },
        tasks: [],
        nudgeRules: [],
        stageGates: [],
      };
    case "DASHBOARD_WIDGET":
      return {
        dataSource: null,
        visualization: "card",
        refreshInterval: 300,
        permissions: [],
      };
    case "REPORT_TEMPLATE":
      return {
        dataSources: [],
        sections: [],
        filters: [],
        schedule: null,
      };
    case "AI_SKILL_CONFIG":
      return {
        model: "claude-3-opus",
        systemPrompt: "",
        triggers: [],
        outputFormat: "text",
      };
    case "FORM_TEMPLATE":
      return {
        sections: [],
        validationRules: [],
        submitAction: null,
      };
    case "NOTIFICATION_TEMPLATE":
      return {
        channels: [],
        subject: "",
        body: "",
        variables: [],
      };
    default:
      return {};
  }
}
