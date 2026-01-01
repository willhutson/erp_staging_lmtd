"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

interface CreateProjectInput {
  name: string;
  clientId: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budgetHours?: number;
}

export async function createProject(input: CreateProjectInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!can(session.user as Parameters<typeof can>[0], "project:create")) {
    throw new Error("You don't have permission to create projects");
  }

  const { name, clientId, description, startDate, endDate, budgetHours } = input;

  // Verify client exists
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { code: true },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Generate project code
  const projectCount = await db.project.count({
    where: {
      organizationId: session.user.organizationId,
      clientId,
    },
  });

  const code = `${client.code}-P${(projectCount + 1).toString().padStart(2, "0")}`;

  const project = await db.project.create({
    data: {
      organizationId: session.user.organizationId,
      clientId,
      name,
      code,
      description,
      startDate,
      endDate,
      budgetHours,
      status: "ACTIVE",
    },
  });

  revalidatePath("/projects");

  return project;
}
