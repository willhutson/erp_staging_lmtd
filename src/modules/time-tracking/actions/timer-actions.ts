"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function startTimer(briefId?: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check for existing running timer
  const existingTimer = await db.timeEntry.findFirst({
    where: {
      userId: session.user.id,
      isRunning: true,
    },
  });

  if (existingTimer) {
    throw new Error("You already have a running timer");
  }

  const entry = await db.timeEntry.create({
    data: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      briefId: briefId || null,
      date: new Date(),
      hours: 0,
      startTime: new Date(),
      isRunning: true,
      isBillable: true,
    },
  });

  revalidatePath("/time");
  return entry;
}

export async function stopTimer(entryId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const entry = await db.timeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Timer not found");
  }

  if (!entry.isRunning || !entry.startTime) {
    throw new Error("Timer is not running");
  }

  const endTime = new Date();
  const hours = (endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);

  const updated = await db.timeEntry.update({
    where: { id: entryId },
    data: {
      endTime,
      hours: Number(hours.toFixed(2)),
      isRunning: false,
    },
  });

  revalidatePath("/time");
  return updated;
}

export async function getRunningTimer() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const timer = await db.timeEntry.findFirst({
    where: {
      userId: session.user.id,
      isRunning: true,
    },
    include: {
      brief: {
        include: {
          client: true,
        },
      },
    },
  });

  return timer;
}

export async function createTimeEntry(data: {
  briefId?: string;
  date: Date;
  hours: number;
  description?: string;
  isBillable?: boolean;
}) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const entry = await db.timeEntry.create({
    data: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      briefId: data.briefId || null,
      date: data.date,
      hours: data.hours,
      description: data.description,
      isBillable: data.isBillable ?? true,
      isRunning: false,
    },
  });

  revalidatePath("/time");
  return entry;
}

export async function updateTimeEntry(
  entryId: string,
  data: {
    briefId?: string;
    date?: Date;
    hours?: number;
    description?: string;
    isBillable?: boolean;
  }
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const entry = await db.timeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Entry not found");
  }

  const updated = await db.timeEntry.update({
    where: { id: entryId },
    data: {
      briefId: data.briefId,
      date: data.date,
      hours: data.hours,
      description: data.description,
      isBillable: data.isBillable,
    },
  });

  revalidatePath("/time");
  return updated;
}

export async function deleteTimeEntry(entryId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const entry = await db.timeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Entry not found");
  }

  await db.timeEntry.delete({
    where: { id: entryId },
  });

  revalidatePath("/time");
}
