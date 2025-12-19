"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBlackoutPeriod(data: {
  name: string;
  reason?: string;
  startDate: Date;
  endDate: Date;
  clientId?: string;
  isRecurring?: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    throw new Error("Only admins can create blackout periods");
  }

  const blackout = await db.blackoutPeriod.create({
    data: {
      organizationId: session.user.organizationId,
      name: data.name,
      reason: data.reason,
      startDate: data.startDate,
      endDate: data.endDate,
      clientId: data.clientId,
      isRecurring: data.isRecurring ?? false,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
  });

  revalidatePath("/leave");
  revalidatePath("/leave/blackouts");
  return blackout;
}

export async function updateBlackoutPeriod(
  id: string,
  data: {
    name?: string;
    reason?: string;
    startDate?: Date;
    endDate?: Date;
    clientId?: string | null;
    isRecurring?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    throw new Error("Only admins can update blackout periods");
  }

  const blackout = await db.blackoutPeriod.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
  });

  revalidatePath("/leave");
  revalidatePath("/leave/blackouts");
  return blackout;
}

export async function deleteBlackoutPeriod(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    throw new Error("Only admins can delete blackout periods");
  }

  await db.blackoutPeriod.delete({ where: { id } });

  revalidatePath("/leave");
  revalidatePath("/leave/blackouts");
}

export async function getBlackoutPeriods(year?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const currentYear = year ?? new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  return db.blackoutPeriod.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [
        {
          startDate: { gte: startOfYear, lte: endOfYear },
        },
        {
          endDate: { gte: startOfYear, lte: endOfYear },
        },
        {
          isRecurring: true,
        },
      ],
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function createPublicHoliday(data: {
  name: string;
  date: Date;
  isOptional?: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    throw new Error("Only admins can add public holidays");
  }

  const holiday = await db.publicHoliday.create({
    data: {
      organizationId: session.user.organizationId,
      name: data.name,
      date: data.date,
      year: new Date(data.date).getFullYear(),
      isOptional: data.isOptional ?? false,
    },
  });

  revalidatePath("/leave");
  return holiday;
}

export async function getPublicHolidays(year?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.publicHoliday.findMany({
    where: {
      organizationId: session.user.organizationId,
      year: year ?? new Date().getFullYear(),
    },
    orderBy: { date: "asc" },
  });
}
