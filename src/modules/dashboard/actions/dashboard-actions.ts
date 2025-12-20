"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { LayoutConfig, WidgetConfig, WidgetType, defaultLayout } from "../types";
import type { Prisma } from "@prisma/client";

export async function getDashboardLayout(): Promise<LayoutConfig> {
  const session = await auth();

  if (!session?.user) {
    return defaultLayout;
  }

  const layout = await db.dashboardLayout.findFirst({
    where: {
      userId: session.user.id,
      isDefault: true,
    },
  });

  if (!layout) {
    return defaultLayout;
  }

  return layout.layout as unknown as LayoutConfig;
}

export async function saveDashboardLayout(layout: LayoutConfig) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Upsert the default layout
  await db.dashboardLayout.upsert({
    where: {
      userId_name: {
        userId: session.user.id,
        name: "My Dashboard",
      },
    },
    update: {
      layout: layout as unknown as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      name: "My Dashboard",
      isDefault: true,
      layout: layout as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard");
}

export async function resetDashboardLayout() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.dashboardLayout.deleteMany({
    where: {
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
}

export async function addWidgetToLayout(
  widgetType: WidgetType,
  position: { x: number; y: number; w: number; h: number }
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const currentLayout = await getDashboardLayout();

  const newWidget: WidgetConfig = {
    id: `widget-${Date.now()}`,
    type: widgetType,
    position,
  };

  const updatedLayout: LayoutConfig = {
    ...currentLayout,
    widgets: [...currentLayout.widgets, newWidget],
  };

  await saveDashboardLayout(updatedLayout);

  return newWidget;
}

export async function removeWidgetFromLayout(widgetId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const currentLayout = await getDashboardLayout();

  const updatedLayout: LayoutConfig = {
    ...currentLayout,
    widgets: currentLayout.widgets.filter((w) => w.id !== widgetId),
  };

  await saveDashboardLayout(updatedLayout);
}

export async function updateWidgetPosition(
  widgetId: string,
  position: { x: number; y: number; w: number; h: number }
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const currentLayout = await getDashboardLayout();

  const updatedLayout: LayoutConfig = {
    ...currentLayout,
    widgets: currentLayout.widgets.map((w) =>
      w.id === widgetId ? { ...w, position } : w
    ),
  };

  await saveDashboardLayout(updatedLayout);
}
