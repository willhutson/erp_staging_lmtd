"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type {
  CreateCalendarEntryInput,
  CalendarEntryWithRelations,
  CalendarFilters,
} from "../types";

/**
 * Create a new calendar entry
 */
export async function createCalendarEntry(
  input: CreateCalendarEntryInput
): Promise<CalendarEntryWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const entry = await db.studioCalendarEntry.create({
    data: {
      organizationId: session.user.organizationId,
      title: input.title,
      description: input.description,
      contentType: input.contentType,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      platforms: input.platforms,
      clientId: input.clientId,
      projectId: input.projectId,
      briefId: input.briefId,
      documentId: input.documentId,
      color: input.color,
      assigneeId: input.assigneeId,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      document: { select: { id: true, title: true } },
    },
  });

  return entry as CalendarEntryWithRelations;
}

/**
 * Get calendar entries for a date range
 */
export async function getCalendarEntries(
  filters: CalendarFilters = {}
): Promise<CalendarEntryWithRelations[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const entries = await db.studioCalendarEntry.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters.clientId && { clientId: filters.clientId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.platforms && filters.platforms.length > 0 && {
        platforms: { hasSome: filters.platforms },
      }),
      ...(filters.startDate && {
        scheduledDate: { gte: filters.startDate },
      }),
      ...(filters.endDate && {
        scheduledDate: { lte: filters.endDate },
      }),
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      document: { select: { id: true, title: true } },
    },
    orderBy: { scheduledDate: "asc" },
  });

  return entries as CalendarEntryWithRelations[];
}

/**
 * Update a calendar entry
 */
export async function updateCalendarEntry(
  entryId: string,
  input: Partial<CreateCalendarEntryInput>
): Promise<CalendarEntryWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const entry = await db.studioCalendarEntry.update({
    where: {
      id: entryId,
      organizationId: session.user.organizationId,
    },
    data: input,
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      document: { select: { id: true, title: true } },
    },
  });

  return entry as CalendarEntryWithRelations;
}

/**
 * Delete a calendar entry
 */
export async function deleteCalendarEntry(entryId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.studioCalendarEntry.delete({
    where: {
      id: entryId,
      organizationId: session.user.organizationId,
    },
  });
}

/**
 * Reschedule a calendar entry (drag and drop)
 */
export async function rescheduleEntry(
  entryId: string,
  scheduledDate: Date,
  scheduledTime?: string
): Promise<CalendarEntryWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const entry = await db.studioCalendarEntry.update({
    where: {
      id: entryId,
      organizationId: session.user.organizationId,
    },
    data: {
      scheduledDate,
      scheduledTime,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      document: { select: { id: true, title: true } },
    },
  });

  return entry as CalendarEntryWithRelations;
}
