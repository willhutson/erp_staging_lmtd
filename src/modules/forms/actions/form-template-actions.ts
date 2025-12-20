"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { FormTemplateConfig } from "../types";
import type { Prisma } from "@prisma/client";

// Get all form templates for the organization
export async function getFormTemplates() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const templates = await db.formTemplate.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: [
      { isSystem: "desc" },
      { name: "asc" },
    ],
  });

  return templates;
}

// Get a single form template
export async function getFormTemplate(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const template = await db.formTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  return template;
}

// Get form template by type (for brief creation)
export async function getFormTemplateByType(type: string) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const template = await db.formTemplate.findFirst({
    where: {
      type,
      organizationId: session.user.organizationId,
      isActive: true,
    },
  });

  return template;
}

// Create a new form template
export async function createFormTemplate(data: {
  type: string;
  name: string;
  description?: string;
  namingConvention?: string;
  namingPrefix?: string;
  icon?: string;
  config: FormTemplateConfig;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins can create form templates
  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can create form templates");
  }

  // Check if type already exists
  const existing = await db.formTemplate.findFirst({
    where: {
      organizationId: session.user.organizationId,
      type: data.type,
    },
  });

  if (existing) {
    throw new Error("A form template with this type already exists");
  }

  const template = await db.formTemplate.create({
    data: {
      organizationId: session.user.organizationId,
      type: data.type,
      name: data.name,
      description: data.description,
      namingConvention: data.namingConvention,
      namingPrefix: data.namingPrefix,
      icon: data.icon,
      config: data.config as unknown as Prisma.InputJsonValue,
      isActive: true,
      isSystem: false,
    },
  });

  revalidatePath("/settings/forms");
  return template;
}

// Update a form template
export async function updateFormTemplate(
  id: string,
  data: {
    name?: string;
    description?: string;
    namingConvention?: string;
    namingPrefix?: string;
    icon?: string;
    config?: FormTemplateConfig;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins can update form templates
  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can update form templates");
  }

  const template = await db.formTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Form template not found");
  }

  const updated = await db.formTemplate.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.namingConvention !== undefined && { namingConvention: data.namingConvention }),
      ...(data.namingPrefix !== undefined && { namingPrefix: data.namingPrefix }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.config !== undefined && { config: data.config as unknown as Prisma.InputJsonValue }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  revalidatePath("/settings/forms");
  revalidatePath(`/settings/forms/${id}`);
  return updated;
}

// Delete a form template
export async function deleteFormTemplate(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins can delete form templates
  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can delete form templates");
  }

  const template = await db.formTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Form template not found");
  }

  // Cannot delete system templates
  if (template.isSystem) {
    throw new Error("Cannot delete system form templates");
  }

  await db.formTemplate.delete({
    where: { id },
  });

  revalidatePath("/settings/forms");
}

// Duplicate a form template
export async function duplicateFormTemplate(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins can duplicate form templates
  if (session.user.permissionLevel !== "ADMIN") {
    throw new Error("Only admins can duplicate form templates");
  }

  const template = await db.formTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Form template not found");
  }

  // Generate a unique type
  const baseType = template.type + "_COPY";
  let newType = baseType;
  let counter = 1;

  while (true) {
    const existing = await db.formTemplate.findFirst({
      where: {
        organizationId: session.user.organizationId,
        type: newType,
      },
    });
    if (!existing) break;
    newType = `${baseType}_${counter}`;
    counter++;
  }

  const duplicate = await db.formTemplate.create({
    data: {
      organizationId: session.user.organizationId,
      type: newType,
      name: `${template.name} (Copy)`,
      description: template.description,
      namingConvention: template.namingConvention,
      namingPrefix: template.namingPrefix,
      icon: template.icon,
      config: template.config as Prisma.InputJsonValue,
      isActive: false, // Start as inactive
      isSystem: false,
    },
  });

  revalidatePath("/settings/forms");
  return duplicate;
}
