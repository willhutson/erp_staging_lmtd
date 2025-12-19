"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { OnboardingCategory, TaskStatus } from "@prisma/client";

const DEFAULT_ONBOARDING_TASKS: {
  title: string;
  category: OnboardingCategory;
  isRequired: boolean;
  sortOrder: number;
}[] = [
  // Contracts
  { title: "Sign service agreement", category: "CONTRACTS", isRequired: true, sortOrder: 1 },
  { title: "NDA signed", category: "CONTRACTS", isRequired: true, sortOrder: 2 },
  { title: "Payment terms confirmed", category: "CONTRACTS", isRequired: true, sortOrder: 3 },

  // Access
  { title: "Add to project management tools", category: "ACCESS", isRequired: true, sortOrder: 4 },
  { title: "Share credentials securely", category: "ACCESS", isRequired: false, sortOrder: 5 },
  { title: "Create shared Drive folder", category: "ACCESS", isRequired: true, sortOrder: 6 },

  // Branding
  { title: "Receive brand guidelines", category: "BRANDING", isRequired: true, sortOrder: 7 },
  { title: "Receive logo files", category: "BRANDING", isRequired: true, sortOrder: 8 },
  { title: "Receive brand assets", category: "BRANDING", isRequired: false, sortOrder: 9 },

  // Communications
  { title: "Set up Slack channel or group", category: "COMMUNICATIONS", isRequired: false, sortOrder: 10 },
  { title: "Exchange key contacts", category: "COMMUNICATIONS", isRequired: true, sortOrder: 11 },
  { title: "Define communication preferences", category: "COMMUNICATIONS", isRequired: false, sortOrder: 12 },

  // Billing
  { title: "Invoice details confirmed", category: "BILLING", isRequired: true, sortOrder: 13 },
  { title: "PO number received (if required)", category: "BILLING", isRequired: false, sortOrder: 14 },

  // Kickoff
  { title: "Schedule kickoff meeting", category: "KICKOFF", isRequired: true, sortOrder: 15 },
  { title: "Complete kickoff meeting", category: "KICKOFF", isRequired: true, sortOrder: 16 },
  { title: "Document key objectives", category: "KICKOFF", isRequired: true, sortOrder: 17 },
];

export async function initializeClientOnboarding(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Check if onboarding already exists
  const existing = await db.clientOnboarding.findUnique({
    where: { clientId },
  });

  if (existing) {
    return existing;
  }

  // Create onboarding with default tasks
  const onboarding = await db.clientOnboarding.create({
    data: {
      clientId,
      status: "NOT_STARTED",
      tasks: {
        create: DEFAULT_ONBOARDING_TASKS,
      },
    },
    include: {
      tasks: true,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  return onboarding;
}

export async function updateOnboardingTaskStatus(
  taskId: string,
  status: TaskStatus
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const task = await db.clientOnboardingTask.update({
    where: { id: taskId },
    data: {
      status,
      completedById: status === "COMPLETED" ? session.user.id : null,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
    include: {
      onboarding: {
        include: {
          tasks: true,
          client: true,
        },
      },
    },
  });

  // Update onboarding status based on tasks
  const allTasks = task.onboarding.tasks;
  const requiredTasks = allTasks.filter((t) => t.isRequired);
  const completedRequired = requiredTasks.filter(
    (t) => t.status === "COMPLETED" || t.status === "SKIPPED"
  );

  let onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" = "NOT_STARTED";

  if (completedRequired.length === requiredTasks.length) {
    onboardingStatus = "COMPLETED";
  } else if (completedRequired.length > 0) {
    onboardingStatus = "IN_PROGRESS";
  }

  await db.clientOnboarding.update({
    where: { id: task.onboardingId },
    data: {
      status: onboardingStatus,
      startedAt:
        onboardingStatus !== "NOT_STARTED" && !task.onboarding.startedAt
          ? new Date()
          : undefined,
      completedAt: onboardingStatus === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath(`/clients/${task.onboarding.client.id}`);
  return task;
}

export async function addOnboardingTask(
  onboardingId: string,
  data: {
    title: string;
    category: OnboardingCategory;
    isRequired?: boolean;
    dueDate?: Date;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Get max sort order
  const lastTask = await db.clientOnboardingTask.findFirst({
    where: { onboardingId },
    orderBy: { sortOrder: "desc" },
  });

  const task = await db.clientOnboardingTask.create({
    data: {
      onboardingId,
      title: data.title,
      category: data.category,
      isRequired: data.isRequired ?? false,
      dueDate: data.dueDate,
      sortOrder: (lastTask?.sortOrder ?? 0) + 1,
    },
    include: {
      onboarding: {
        include: { client: true },
      },
    },
  });

  revalidatePath(`/clients/${task.onboarding.client.id}`);
  return task;
}

export async function deleteOnboardingTask(taskId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const task = await db.clientOnboardingTask.delete({
    where: { id: taskId },
    include: {
      onboarding: {
        include: { client: true },
      },
    },
  });

  revalidatePath(`/clients/${task.onboarding.client.id}`);
  return task;
}
