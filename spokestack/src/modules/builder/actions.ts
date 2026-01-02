"use server";

import { getStudioUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BuilderWidgetType as PrismaBuilderWidgetType } from "@prisma/client";
import type {
  BuilderDashboardWithRelations,
  BuilderDashboardTemplateWithRelations,
  BuilderWidgetWithRelations,
  CreateDashboardInput,
  UpdateDashboardInput,
  CreateWidgetInput,
  UpdateWidgetInput,
  CreateTemplateInput,
} from "./types";

// ============================================
// Dashboard Actions
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getDashboards(): Promise<BuilderDashboardWithRelations[]> {
  const user = await getStudioUser();

  const dashboards = await prisma.builderDashboard.findMany({
    where: {
      organizationId: user.organizationId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { widgets: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return dashboards as BuilderDashboardWithRelations[];
}

export async function getDashboard(id: string): Promise<BuilderDashboardWithRelations | null> {
  const user = await getStudioUser();

  const dashboard = await prisma.builderDashboard.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      widgets: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return dashboard as BuilderDashboardWithRelations | null;
}

export async function createDashboard(input: CreateDashboardInput): Promise<BuilderDashboardWithRelations> {
  const user = await getStudioUser();

  const baseSlug = generateSlug(input.name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug
  while (true) {
    const existing = await prisma.builderDashboard.findFirst({
      where: {
        organizationId: user.organizationId,
        slug,
      },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // If creating from template, get template data
  let layout: unknown = [];
  if (input.templateId) {
    const template = await prisma.builderDashboardTemplate.findUnique({
      where: { id: input.templateId },
    });
    if (template) {
      layout = template.layout;
      // Increment usage count
      await prisma.builderDashboardTemplate.update({
        where: { id: input.templateId },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  const dashboard = await prisma.builderDashboard.create({
    data: {
      organizationId: user.organizationId,
      name: input.name,
      description: input.description,
      slug,
      visibility: input.visibility ?? "PRIVATE",
      layout: layout as object,
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      widgets: true,
    },
  });

  revalidatePath("/builder/dashboards");

  return dashboard as BuilderDashboardWithRelations;
}

export async function updateDashboard(
  id: string,
  input: UpdateDashboardInput
): Promise<BuilderDashboardWithRelations> {
  const user = await getStudioUser();

  // Verify ownership
  const existing = await prisma.builderDashboard.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    throw new Error("Dashboard not found");
  }

  const dashboard = await prisma.builderDashboard.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      visibility: input.visibility,
      isPublished: input.isPublished,
      isDefault: input.isDefault,
      thumbnail: input.thumbnail,
      layout: input.layout as object | undefined,
      settings: input.settings as object | undefined,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      widgets: true,
    },
  });

  revalidatePath("/builder/dashboards");
  revalidatePath(`/builder/dashboards/${id}/edit`);

  return dashboard as BuilderDashboardWithRelations;
}

export async function deleteDashboard(id: string): Promise<void> {
  const user = await getStudioUser();

  // Verify ownership
  const existing = await prisma.builderDashboard.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    throw new Error("Dashboard not found");
  }

  await prisma.builderDashboard.delete({
    where: { id },
  });

  revalidatePath("/builder/dashboards");
}

export async function duplicateDashboard(id: string): Promise<BuilderDashboardWithRelations> {
  const user = await getStudioUser();

  const original = await prisma.builderDashboard.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      widgets: true,
    },
  });

  if (!original) {
    throw new Error("Dashboard not found");
  }

  const baseSlug = generateSlug(`${original.name} Copy`);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.builderDashboard.findFirst({
      where: {
        organizationId: user.organizationId,
        slug,
      },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const dashboard = await prisma.builderDashboard.create({
    data: {
      organizationId: user.organizationId,
      name: `${original.name} (Copy)`,
      description: original.description,
      slug,
      visibility: "PRIVATE",
      layout: original.layout as object,
      settings: original.settings as object | undefined,
      createdById: user.id,
      widgets: {
        create: original.widgets.map((widget) => ({
          name: widget.name,
          type: widget.type,
          chartType: widget.chartType,
          size: widget.size,
          position: widget.position as object | undefined,
          dataSource: widget.dataSource,
          metric: widget.metric,
          dimensions: widget.dimensions,
          filters: widget.filters as object | undefined,
          settings: widget.settings as object | undefined,
        })),
      },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      widgets: true,
    },
  });

  revalidatePath("/builder/dashboards");

  return dashboard as BuilderDashboardWithRelations;
}

// ============================================
// Widget Actions
// ============================================

export async function createWidget(input: CreateWidgetInput): Promise<BuilderWidgetWithRelations> {
  const user = await getStudioUser();

  // Verify dashboard belongs to user's org
  const dashboard = await prisma.builderDashboard.findFirst({
    where: {
      id: input.dashboardId,
      organizationId: user.organizationId,
    },
  });

  if (!dashboard) {
    throw new Error("Dashboard not found");
  }

  const widget = await prisma.builderWidget.create({
    data: {
      dashboardId: input.dashboardId,
      name: input.name,
      type: input.type as PrismaBuilderWidgetType,
      chartType: input.chartType,
      size: input.size ?? "medium",
      position: input.position as object | undefined,
      dataSource: input.dataSource,
      metric: input.metric,
      dimensions: input.dimensions ?? [],
      filters: input.filters as object | undefined,
      settings: input.settings as object | undefined,
    },
  });

  revalidatePath(`/builder/dashboards/${input.dashboardId}/edit`);

  return widget as BuilderWidgetWithRelations;
}

export async function updateWidget(
  widgetId: string,
  input: UpdateWidgetInput
): Promise<BuilderWidgetWithRelations> {
  const user = await getStudioUser();

  // Verify widget belongs to user's org
  const existing = await prisma.builderWidget.findFirst({
    where: {
      id: widgetId,
      dashboard: {
        organizationId: user.organizationId,
      },
    },
    include: {
      dashboard: true,
    },
  });

  if (!existing) {
    throw new Error("Widget not found");
  }

  const widget = await prisma.builderWidget.update({
    where: { id: widgetId },
    data: {
      name: input.name,
      type: input.type as PrismaBuilderWidgetType | undefined,
      chartType: input.chartType,
      size: input.size,
      position: input.position as object | undefined,
      dataSource: input.dataSource,
      metric: input.metric,
      dimensions: input.dimensions,
      filters: input.filters as object | undefined,
      settings: input.settings as object | undefined,
    },
  });

  revalidatePath(`/builder/dashboards/${existing.dashboardId}/edit`);

  return widget as BuilderWidgetWithRelations;
}

export async function deleteWidget(widgetId: string): Promise<void> {
  const user = await getStudioUser();

  // Verify widget belongs to user's org
  const existing = await prisma.builderWidget.findFirst({
    where: {
      id: widgetId,
      dashboard: {
        organizationId: user.organizationId,
      },
    },
  });

  if (!existing) {
    throw new Error("Widget not found");
  }

  await prisma.builderWidget.delete({
    where: { id: widgetId },
  });

  revalidatePath(`/builder/dashboards/${existing.dashboardId}/edit`);
}

// ============================================
// Template Actions
// ============================================

export async function getTemplates(): Promise<BuilderDashboardTemplateWithRelations[]> {
  const user = await getStudioUser();

  const templates = await prisma.builderDashboardTemplate.findMany({
    where: {
      isActive: true,
      OR: [
        { organizationId: null }, // Global templates
        { organizationId: user.organizationId }, // Org-specific templates
      ],
    },
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
      organization: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ usageCount: "desc" }, { name: "asc" }],
  });

  return templates as BuilderDashboardTemplateWithRelations[];
}

export async function createTemplate(input: CreateTemplateInput): Promise<BuilderDashboardTemplateWithRelations> {
  const user = await getStudioUser();

  const template = await prisma.builderDashboardTemplate.create({
    data: {
      organizationId: user.organizationId,
      name: input.name,
      description: input.description,
      category: input.category,
      layout: (input.layout as object) ?? [],
      widgetConfigs: (input.widgetConfigs as object) ?? [],
      thumbnail: input.thumbnail,
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
      organization: {
        select: { id: true, name: true },
      },
    },
  });

  revalidatePath("/builder/templates");

  return template as BuilderDashboardTemplateWithRelations;
}

export async function deleteTemplate(id: string): Promise<void> {
  const user = await getStudioUser();

  // Verify template belongs to user's org (can't delete global templates)
  const existing = await prisma.builderDashboardTemplate.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!existing) {
    throw new Error("Template not found or cannot be deleted");
  }

  await prisma.builderDashboardTemplate.delete({
    where: { id },
  });

  revalidatePath("/builder/templates");
}

// ============================================
// Stats Actions
// ============================================

export async function getDashboardStats() {
  const user = await getStudioUser();

  const [totalDashboards, publishedDashboards, clientDashboards, totalWidgets] = await Promise.all([
    prisma.builderDashboard.count({
      where: { organizationId: user.organizationId },
    }),
    prisma.builderDashboard.count({
      where: { organizationId: user.organizationId, isPublished: true },
    }),
    prisma.builderDashboard.count({
      where: { organizationId: user.organizationId, visibility: "CLIENT" },
    }),
    prisma.builderWidget.count({
      where: {
        dashboard: { organizationId: user.organizationId },
      },
    }),
  ]);

  return {
    totalDashboards,
    publishedDashboards,
    clientDashboards,
    totalWidgets,
  };
}
