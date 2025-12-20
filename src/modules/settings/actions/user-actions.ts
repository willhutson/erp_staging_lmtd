"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PermissionLevel } from "@prisma/client";

interface CreateUserData {
  email: string;
  name: string;
  role: string;
  department: string;
  permissionLevel: PermissionLevel;
  isFreelancer?: boolean;
  weeklyCapacity?: number;
  teamLeadId?: string;
}

export async function createUser(data: CreateUserData) {
  const session = await auth();
  if (!session?.user || session.user.permissionLevel !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Check for duplicate email
  const existing = await db.user.findFirst({
    where: {
      organizationId: session.user.organizationId,
      email: data.email,
    },
  });

  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const user = await db.user.create({
    data: {
      organizationId: session.user.organizationId,
      email: data.email,
      name: data.name,
      role: data.role,
      department: data.department,
      permissionLevel: data.permissionLevel,
      isFreelancer: data.isFreelancer || false,
      weeklyCapacity: data.weeklyCapacity || 40,
      teamLeadId: data.teamLeadId || null,
    },
  });

  revalidatePath("/settings/users");
  revalidatePath("/team");
  return user;
}

export async function updateUser(userId: string, data: Partial<CreateUserData> & { isActive?: boolean }) {
  const session = await auth();
  if (!session?.user || session.user.permissionLevel !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const user = await db.user.update({
    where: {
      id: userId,
      organizationId: session.user.organizationId,
    },
    data,
  });

  revalidatePath("/settings/users");
  revalidatePath("/team");
  revalidatePath(`/team/${userId}`);
  return user;
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.permissionLevel !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Don't allow deleting yourself
  if (userId === session.user.id) {
    throw new Error("Cannot delete your own account");
  }

  // Check if user has any briefs assigned
  const briefCount = await db.brief.count({
    where: { assigneeId: userId },
  });

  if (briefCount > 0) {
    throw new Error("Cannot delete user with assigned briefs. Reassign or deactivate instead.");
  }

  await db.user.delete({
    where: {
      id: userId,
      organizationId: session.user.organizationId,
    },
  });

  revalidatePath("/settings/users");
  revalidatePath("/team");
}

export async function getTeamLeads() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return db.user.findMany({
    where: {
      organizationId: session.user.organizationId,
      permissionLevel: { in: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"] },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      department: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getDepartments() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const users = await db.user.findMany({
    where: { organizationId: session.user.organizationId },
    select: { department: true },
    distinct: ["department"],
  });

  return users.map(u => u.department).sort();
}
