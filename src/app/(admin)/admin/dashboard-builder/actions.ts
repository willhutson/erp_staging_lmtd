"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export interface DashboardWidgetConfig {
  widgetId: string;
  props: Record<string, unknown>;
  colSpan: number;
}

export interface DashboardLayoutConfig {
  name: string;
  columns: number;
  widgets: DashboardWidgetConfig[];
}

export interface SavedDashboard {
  id: string;
  name: string;
  isDefault: boolean;
  layout: DashboardLayoutConfig;
  createdAt: Date;
  updatedAt: Date;
}

// Get all dashboards for the current user
export async function getDashboards(): Promise<SavedDashboard[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dashboards = await db.dashboardLayout.findMany({
    where: {
      userId: session.user.id,
      organizationId: session.user.organizationId,
    },
    orderBy: { updatedAt: "desc" },
  });

  return dashboards.map((d) => ({
    id: d.id,
    name: d.name,
    isDefault: d.isDefault,
    layout: d.layout as unknown as DashboardLayoutConfig,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
}

// Get a single dashboard by ID
export async function getDashboard(id: string): Promise<SavedDashboard | null> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dashboard = await db.dashboardLayout.findFirst({
    where: {
      id,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    },
  });

  if (!dashboard) return null;

  return {
    id: dashboard.id,
    name: dashboard.name,
    isDefault: dashboard.isDefault,
    layout: dashboard.layout as unknown as DashboardLayoutConfig,
    createdAt: dashboard.createdAt,
    updatedAt: dashboard.updatedAt,
  };
}

// Save a new dashboard or update existing
export async function saveDashboard(
  config: DashboardLayoutConfig,
  dashboardId?: string
): Promise<SavedDashboard> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const organizationId = session.user.organizationId;

  if (dashboardId) {
    // Update existing dashboard
    const existing = await db.dashboardLayout.findFirst({
      where: {
        id: dashboardId,
        userId,
        organizationId,
      },
    });

    if (!existing) {
      throw new Error("Dashboard not found");
    }

    const updated = await db.dashboardLayout.update({
      where: { id: dashboardId },
      data: {
        name: config.name,
        layout: config as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/admin/builder");

    return {
      id: updated.id,
      name: updated.name,
      isDefault: updated.isDefault,
      layout: updated.layout as unknown as DashboardLayoutConfig,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  } else {
    // Create new dashboard
    const created = await db.dashboardLayout.create({
      data: {
        userId,
        organizationId,
        name: config.name,
        layout: config as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/admin/builder");

    return {
      id: created.id,
      name: created.name,
      isDefault: created.isDefault,
      layout: created.layout as unknown as DashboardLayoutConfig,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }
}

// Delete a dashboard
export async function deleteDashboard(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const existing = await db.dashboardLayout.findFirst({
    where: {
      id,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    },
  });

  if (!existing) {
    throw new Error("Dashboard not found");
  }

  await db.dashboardLayout.delete({ where: { id } });
  revalidatePath("/admin/builder");
}

// Set a dashboard as default
export async function setDefaultDashboard(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const organizationId = session.user.organizationId;

  // Remove default from all other dashboards
  await db.dashboardLayout.updateMany({
    where: { userId, organizationId },
    data: { isDefault: false },
  });

  // Set the new default
  await db.dashboardLayout.update({
    where: { id },
    data: { isDefault: true },
  });

  revalidatePath("/admin/builder");
}

// Duplicate a dashboard
export async function duplicateDashboard(id: string): Promise<SavedDashboard> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const original = await db.dashboardLayout.findFirst({
    where: {
      id,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    },
  });

  if (!original) {
    throw new Error("Dashboard not found");
  }

  const layout = original.layout as unknown as DashboardLayoutConfig;

  const duplicate = await db.dashboardLayout.create({
    data: {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      name: `${original.name} (Copy)`,
      layout: { ...layout, name: `${layout.name} (Copy)` } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/admin/builder");

  return {
    id: duplicate.id,
    name: duplicate.name,
    isDefault: duplicate.isDefault,
    layout: duplicate.layout as unknown as DashboardLayoutConfig,
    createdAt: duplicate.createdAt,
    updatedAt: duplicate.updatedAt,
  };
}
