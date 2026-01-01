"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface SendToMarketingInput {
  calendarEntryId: string;
  publishNow?: boolean;
  platforms?: string[];
}

/**
 * Send a calendar entry to the Marketing module for publishing
 * This creates a link between Studio (content creation) and Marketing (publishing)
 */
export async function sendToMarketing(input: SendToMarketingInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const { calendarEntryId, publishNow = false, platforms } = input;

  // Get the calendar entry
  const entry = await db.studioCalendarEntry.findUnique({
    where: {
      id: calendarEntryId,
      organizationId: session.user.organizationId,
    },
    include: {
      client: true,
      document: true,
    },
  });

  if (!entry) {
    throw new Error("Calendar entry not found");
  }

  // Update entry status to SCHEDULED
  const updatedEntry = await db.studioCalendarEntry.update({
    where: { id: calendarEntryId },
    data: {
      status: "SCHEDULED",
      platforms: platforms || entry.platforms,
    },
  });

  // TODO: When Marketing module exists, create a MarketingPost record
  // For now, we just update the status and log the action
  console.log("[Marketing Integration]", {
    action: publishNow ? "PUBLISH_NOW" : "SCHEDULE",
    entryId: calendarEntryId,
    title: entry.title,
    platforms: platforms || entry.platforms,
    scheduledDate: entry.scheduledDate,
    scheduledTime: entry.scheduledTime,
  });

  revalidatePath("/studio/calendar");

  return {
    success: true,
    entry: updatedEntry,
    message: publishNow
      ? "Content sent for immediate publishing"
      : "Content scheduled for publishing",
  };
}

/**
 * Get publishing status for a calendar entry
 */
export async function getPublishingStatus(calendarEntryId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const entry = await db.studioCalendarEntry.findUnique({
    where: {
      id: calendarEntryId,
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      status: true,
      platforms: true,
      scheduledDate: true,
      scheduledTime: true,
    },
  });

  if (!entry) {
    throw new Error("Calendar entry not found");
  }

  // TODO: When Marketing module exists, fetch actual publishing status
  return {
    entryId: entry.id,
    status: entry.status,
    platforms: entry.platforms,
    scheduledDate: entry.scheduledDate,
    scheduledTime: entry.scheduledTime,
    // Placeholder for future Marketing integration
    publishingJobs: [],
  };
}

/**
 * Cancel scheduled publishing
 */
export async function cancelPublishing(calendarEntryId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const entry = await db.studioCalendarEntry.findUnique({
    where: {
      id: calendarEntryId,
      organizationId: session.user.organizationId,
    },
  });

  if (!entry) {
    throw new Error("Calendar entry not found");
  }

  // Revert to READY status
  const updatedEntry = await db.studioCalendarEntry.update({
    where: { id: calendarEntryId },
    data: {
      status: "READY",
    },
  });

  revalidatePath("/studio/calendar");

  return {
    success: true,
    entry: updatedEntry,
    message: "Publishing cancelled",
  };
}
