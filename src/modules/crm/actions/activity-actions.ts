"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ActivityType } from "@prisma/client";

interface CreateActivityInput {
  clientId: string;
  type: ActivityType;
  title: string;
  description?: string;
  meetingDate?: Date;
  meetingDuration?: number;
  attendees?: string[];
  emailSubject?: string;
  callDuration?: number;
}

export async function createActivity(input: CreateActivityInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify client belongs to user's org
  const client = await db.client.findFirst({
    where: {
      id: input.clientId,
      organizationId: session.user.organizationId,
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  const activity = await db.clientActivity.create({
    data: {
      organizationId: session.user.organizationId,
      clientId: input.clientId,
      userId: session.user.id,
      type: input.type,
      title: input.title,
      description: input.description,
      meetingDate: input.meetingDate,
      meetingDuration: input.meetingDuration,
      attendees: input.attendees ?? [],
      emailSubject: input.emailSubject,
      callDuration: input.callDuration,
    },
  });

  revalidatePath(`/clients/${input.clientId}`);
  return activity;
}

export async function getClientActivities(clientId: string, limit = 20) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const activities = await db.clientActivity.findMany({
    where: {
      clientId,
      organizationId: session.user.organizationId,
    },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities;
}

// Auto-log activity when certain actions happen
export async function logStatusChange(
  clientId: string,
  fromStatus: string,
  toStatus: string
) {
  const session = await auth();

  if (!session?.user) {
    return;
  }

  await db.clientActivity.create({
    data: {
      organizationId: session.user.organizationId,
      clientId,
      userId: session.user.id,
      type: "STATUS_CHANGE",
      title: `Status changed from ${fromStatus} to ${toStatus}`,
    },
  });
}
