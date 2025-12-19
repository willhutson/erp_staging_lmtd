"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getValidAccessToken } from "./google-auth";
import type { BriefType } from "@prisma/client";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string } | { date: string };
  end: { dateTime: string; timeZone?: string } | { date: string };
  attendees?: { email: string }[];
  status?: string;
}

interface CreateEventInput {
  briefId?: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay?: boolean;
  attendees?: string[];
  calendarId?: string;
}

/**
 * Create a calendar event for a brief (e.g., video shoot)
 */
export async function createCalendarEvent(input: CreateEventInput): Promise<string> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) {
    throw new Error("Google Calendar not connected");
  }

  const calendarId = input.calendarId || "primary";

  const event: CalendarEvent = {
    summary: input.title,
    description: input.description,
    location: input.location,
    start: input.isAllDay
      ? { date: input.startTime.toISOString().split("T")[0] }
      : { dateTime: input.startTime.toISOString(), timeZone: "Asia/Dubai" },
    end: input.isAllDay
      ? { date: input.endTime.toISOString().split("T")[0] }
      : { dateTime: input.endTime.toISOString(), timeZone: "Asia/Dubai" },
    attendees: input.attendees?.map((email) => ({ email })),
  };

  const response = await fetch(`${CALENDAR_API_BASE}/calendars/${calendarId}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const createdEvent = await response.json();

  // Save to our database
  await db.googleCalendarEvent.create({
    data: {
      organizationId: session.user.organizationId,
      briefId: input.briefId,
      googleEventId: createdEvent.id,
      calendarId,
      title: input.title,
      description: input.description,
      location: input.location,
      startTime: input.startTime,
      endTime: input.endTime,
      isAllDay: input.isAllDay || false,
      attendees: input.attendees || [],
      status: "CONFIRMED",
    },
  });

  return createdEvent.id;
}

/**
 * Create calendar event from a brief (auto-generates details)
 */
export async function createEventFromBrief(briefId: string): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const brief = await db.brief.findUnique({
    where: { id: briefId },
    include: {
      client: true,
      assignee: true,
    },
  });

  if (!brief || brief.organizationId !== session.user.organizationId) {
    throw new Error("Brief not found");
  }

  // Only create events for certain brief types
  const eventTypes: BriefType[] = ["VIDEO_SHOOT"];
  if (!eventTypes.includes(brief.type)) {
    return null;
  }

  if (!brief.startDate) {
    throw new Error("Brief must have a start date to create calendar event");
  }

  const formData = brief.formData as Record<string, unknown>;
  const location = (formData.location as string) || "";
  const timing = (formData.timing as string) || "";

  const attendees: string[] = [];
  if (brief.assignee?.email) {
    attendees.push(brief.assignee.email);
  }

  return createCalendarEvent({
    briefId: brief.id,
    title: brief.title,
    description: `Brief: ${brief.briefNumber}\nClient: ${brief.client.name}\n\n${timing ? `Timing: ${timing}` : ""}`,
    location,
    startTime: brief.startDate,
    endTime: brief.endDate || brief.startDate,
    isAllDay: !timing,
    attendees,
  });
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CreateEventInput>
): Promise<void> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const calendarEvent = await db.googleCalendarEvent.findUnique({
    where: { id: eventId },
  });

  if (!calendarEvent || calendarEvent.organizationId !== session.user.organizationId) {
    throw new Error("Event not found");
  }

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) {
    throw new Error("Google Calendar not connected");
  }

  const event: Partial<CalendarEvent> = {};
  if (updates.title) event.summary = updates.title;
  if (updates.description !== undefined) event.description = updates.description;
  if (updates.location !== undefined) event.location = updates.location;
  if (updates.startTime) {
    event.start = updates.isAllDay
      ? { date: updates.startTime.toISOString().split("T")[0] }
      : { dateTime: updates.startTime.toISOString(), timeZone: "Asia/Dubai" };
  }
  if (updates.endTime) {
    event.end = updates.isAllDay
      ? { date: updates.endTime.toISOString().split("T")[0] }
      : { dateTime: updates.endTime.toISOString(), timeZone: "Asia/Dubai" };
  }
  if (updates.attendees) {
    event.attendees = updates.attendees.map((email) => ({ email }));
  }

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarEvent.calendarId}/events/${calendarEvent.googleEventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update calendar event");
  }

  // Update our database
  await db.googleCalendarEvent.update({
    where: { id: eventId },
    data: {
      title: updates.title || calendarEvent.title,
      description: updates.description ?? calendarEvent.description,
      location: updates.location ?? calendarEvent.location,
      startTime: updates.startTime || calendarEvent.startTime,
      endTime: updates.endTime || calendarEvent.endTime,
      isAllDay: updates.isAllDay ?? calendarEvent.isAllDay,
      attendees: updates.attendees || calendarEvent.attendees,
      syncedAt: new Date(),
    },
  });
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const calendarEvent = await db.googleCalendarEvent.findUnique({
    where: { id: eventId },
  });

  if (!calendarEvent || calendarEvent.organizationId !== session.user.organizationId) {
    throw new Error("Event not found");
  }

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) {
    throw new Error("Google Calendar not connected");
  }

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${calendarEvent.calendarId}/events/${calendarEvent.googleEventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete calendar event");
  }

  // Update our database
  await db.googleCalendarEvent.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });
}

/**
 * Get upcoming calendar events
 */
export async function getUpcomingEvents(days: number = 14): Promise<
  Array<{
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    location: string | null;
    briefId: string | null;
  }>
> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const events = await db.googleCalendarEvent.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: "CONFIRMED",
      startTime: {
        gte: now,
        lte: futureDate,
      },
    },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      location: true,
      briefId: true,
    },
  });

  return events;
}
